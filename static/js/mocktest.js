// mocktest.js — NTA-style mock test frontend
// Expects:
// - <script type="application/json" id="mocktest-data"> with { "maths": [...paths], "physics":[...], "chemistry":[...], "rank_preset":[{marks,rank}, ...] }
// - window.allQuestions: array of page objects produced by Hugo with at least File.Path and either HTML/content or Params
// - HTML shell IDs: #sections, #timer, #question-container, #nav, #submit-test, #mocktest-app

(function () {
  // small helpers
  const $ = id => document.getElementById(id);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // read test data
  const dataEl = $('mocktest-data');
  if (!dataEl) return;
  const testData = JSON.parse(dataEl.textContent || "{}");
  const rankPreset = Array.isArray(testData.rank_preset) ? testData.rank_preset.slice().sort((a,b)=>b.marks-a.marks) : [];

  // subjects and question paths (in order)
  const subjects = {
    maths: Array.isArray(testData.maths) ? testData.maths : (Array.isArray(testData.maths_questions) ? testData.maths_questions : []),
    physics: Array.isArray(testData.physics) ? testData.physics : (Array.isArray(testData.physics_questions) ? testData.physics_questions : []),
    chemistry: Array.isArray(testData.chemistry) ? testData.chemistry : (Array.isArray(testData.chemistry_questions) ? testData.chemistry_questions : [])
  };

  // global state
  let currentSubjectKey = Object.keys(subjects).find(k => subjects[k].length>0) || 'maths';
  let currentIndex = 0;
  const answers = { maths:{}, physics:{}, chemistry:{} }; // answers[subject][idx] = number or [nums] or string
  const visited = { maths:{}, physics:{}, chemistry:{} };
  const marked = { maths:{}, physics:{}, chemistry:{} };

  // build question objects by resolving Hugo pages from window.allQuestions
  const allQ = window.allQuestions || []; // must be provided by your template
  function resolvePage(path) {
    if (!path) return null;
    // normalize: ensure leading slash lookup match against File.Path shown earlier
    const candidates = [
      path,
      path.replace(/^\//, ''),
      '/' + path.replace(/^\//, '')
    ];
    for (const p of candidates) {
      // match File.Path or .Path or RelPermalink without trailing slash
      const found = allQ.find(page => {
        if (!page) return false;
        const fp = (page.File && page.File.Path) || page.FilePath || page.filePath || page.path || page.Path || page.Pathname;
        const rp = (page.RelPermalink || page.relPermalink || page.relpermalink || page.permalink || page.url);
        if (fp && (fp === p || fp === p + '.md' || fp === p + '.markdown')) return true;
        if (rp) {
          const rpTrim = rp.replace(/^\/|\/$/g, '');
          if (rpTrim === p.replace(/^\/|\/$/g,'')) return true;
        }
        return false;
      });
      if (found) return found;
    }
    return null;
  }

  function buildQuestionsFor(subjectKey) {
    const paths = subjects[subjectKey] || [];
    const out = [];
    for (let i=0;i<paths.length;i++) {
      const raw = paths[i];
      const page = resolvePage(raw);
      const q = {
        path: raw,
        pageObj: page,
        // html content fallback order:
        html: (page && (page.HTML || page.html || page.Content || page.content || page.Body || page.body)) || null,
        // fallback build from Params if no pre-rendered html
        questionText: page && page.Params && page.Params.question ? page.Params.question : (page && page.question) || "",
        options: page && page.Params && page.Params.options ? page.Params.options : (page && page.options) || [],
        correctIndices: page && page.Params && page.Params.correctIndices ? page.Params.correctIndices : (page && page.correctIndices) || [],
        numerical_answer: page && page.Params && page.Params.numerical_answer ? page.Params.numerical_answer : (page && page.numerical_answer) || "",
        question_type: page && page.Params && page.Params.question_type ? page.Params.question_type : (page && page.question_type) || ""
      };
      // if html missing, synthesize minimal html containing question and options (used for display only)
      if (!q.html) {
        const questionHtml = (q.questionText || "").split(/\n\s*\n/).map(p=>`<p>${p.replace(/\n/g,'<br>')}</p>`).join('');
        let optsHtml = '';
        if (Array.isArray(q.options) && q.options.length) {
          optsHtml = '<ul class="mock-options">' + q.options.map(o=>`<li>${o}</li>`).join('') + '</ul>';
        }
        q.html = `<div class="mock-q-content">${questionHtml}${optsHtml}</div>`;
      }
      out.push(q);
    }
    return out;
  }

  const qStore = {
    maths: buildQuestionsFor('maths'),
    physics: buildQuestionsFor('physics'),
    chemistry: buildQuestionsFor('chemistry')
  };

  // compute timer based on number of subjects with >0 questions
  const activeSubjectsCount = ['maths','physics','chemistry'].filter(k=>qStore[k] && qStore[k].length>0).length || 1;
  let remainingSeconds = activeSubjectsCount * 60 * 60; // 60 min per subject

  // DOM refs
  const sectionsEl = $('sections');
  const timerEl = $('timer');
  const questionContainer = $('question-container');
  const navEl = $('nav');
  const submitBtn = $('submit-test');
  const appRoot = $('mocktest-app');

  // render top tabs
  function renderTabs() {
    sectionsEl.innerHTML = '';
    ['maths','physics','chemistry'].forEach(k=>{
      if (!qStore[k] || qStore[k].length===0) return;
      const btn = document.createElement('button');
      btn.textContent = k.charAt(0).toUpperCase()+k.slice(1);
      btn.className = `px-3 py-1 rounded font-concert ${k===currentSubjectKey ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white'}`;
      btn.onclick = () => {
        currentSubjectKey = k;
        currentIndex = 0;
        renderQuestion();
        renderPalette();
      };
      sectionsEl.appendChild(btn);
    });
  }

  // palette rendering
  function renderPalette() {
    navEl.innerHTML = '';
    const list = qStore[currentSubjectKey] || [];
    list.forEach((q, idx) => {
      const btn = document.createElement('button');
      btn.className = 'p-2 rounded font-concert text-sm border';
      // status
      if (marked[currentSubjectKey][idx]) {
        btn.classList.add('bg-purple-600','text-white');
      } else if (answers[currentSubjectKey][idx] != null && answers[currentSubjectKey][idx] !== '') {
        btn.classList.add('bg-green-600','text-white');
      } else if (visited[currentSubjectKey][idx]) {
        btn.classList.add('bg-red-600','text-white');
      } else {
        btn.classList.add('bg-gray-700','text-white');
      }
      btn.textContent = String(idx+1);
      btn.onclick = () => {
        currentIndex = idx;
        renderQuestion();
        renderPalette();
      };
      navEl.appendChild(btn);
    });
  }

  // render one question (no correctness feedback)
  function renderQuestion() {
    const list = qStore[currentSubjectKey];
    if (!list || !list.length) {
      questionContainer.innerHTML = '<p>No questions in this section.</p>';
      return;
    }
    visited[currentSubjectKey][currentIndex] = true;

    const q = list[currentIndex];
    const qHtml = q.html || '';
    // build input area
    let inputHtml = '';
    const key = `${currentSubjectKey}-${currentIndex}`;
    const saved = answers[currentSubjectKey][currentIndex];

    if (q.question_type === 'Integer Type') {
      inputHtml = `<div class="mt-3"><input id="mock-int" class="border p-2 bg-gray-800 text-white font-concert" value="${saved || ''}" placeholder="Enter answer"/></div>`;
    } else if (q.question_type === 'Multiple Choice') {
      // multiple choice allow checkboxes for multi-select
      inputHtml = '<div class="mt-3">';
      q.options.forEach((opt,i)=>{
        const checked = Array.isArray(saved) && saved.includes(String(i)) ? 'checked' : '';
        inputHtml += `<label class="block"><input type="checkbox" name="opt" data-i="${i}" ${checked}/> <span class="inline-block ml-2">${opt}</span></label>`;
      });
      inputHtml += '</div>';
    } else {
      // Single Choice default -> radio
      inputHtml = '<div class="mt-3">';
      q.options.forEach((opt,i)=>{
        const checked = (String(saved) === String(i)) ? 'checked' : '';
        inputHtml += `<label class="block"><input type="radio" name="opt" data-i="${i}" ${checked}/> <span class="inline-block ml-2">${opt}</span></label>`;
      });
      inputHtml += '</div>';
    }

    // action buttons
    const prevDisabled = currentIndex === 0 ? 'disabled' : '';
    const nextDisabled = currentIndex === list.length - 1 ? 'disabled' : '';

    questionContainer.innerHTML = `
      <div class="p-4 bg-[#0D163D] rounded-lg border border-gray-700">
        <div class="mb-2 text-sm text-gray-300">Section: <strong>${currentSubjectKey.toUpperCase()}</strong> &nbsp; • &nbsp; Q ${currentIndex+1} of ${list.length}</div>
        <div class="prose prose-invert question-body">${qHtml}</div>
        ${inputHtml}
        <div class="flex gap-2 mt-4">
          <button id="prev-q" class="px-3 py-1 bg-blue-600 text-white rounded" ${prevDisabled}>Previous</button>
          <button id="next-q" class="px-3 py-1 bg-blue-600 text-white rounded" ${nextDisabled}>Next</button>
          <button id="mark-q" class="px-3 py-1 bg-yellow-500 text-black rounded">${marked[currentSubjectKey][currentIndex] ? 'Unmark' : 'Mark'}</button>
          <button id="goto-submit" class="ml-auto px-3 py-1 bg-green-600 text-white rounded">Submit Test</button>
        </div>
      </div>
    `;

    // attach handlers
    if (q.question_type === 'Integer Type') {
      const inp = $('mock-int');
      inp.addEventListener('input', () => {
        answers[currentSubjectKey][currentIndex] = inp.value.trim();
        renderPalette();
      });
    } else if (q.question_type === 'Multiple Choice') {
      questionContainer.querySelectorAll('input[name=opt]').forEach(chk=>{
        chk.addEventListener('change', ()=>{
          const chosen = Array.from(questionContainer.querySelectorAll('input[name=opt]'))
            .filter(c => c.checked).map(c => c.dataset.i);
          answers[currentSubjectKey][currentIndex] = chosen;
          renderPalette();
        });
      });
    } else {
      questionContainer.querySelectorAll('input[name=opt]').forEach(r=>{
        r.addEventListener('change', ()=>{
          answers[currentSubjectKey][currentIndex] = r.dataset.i;
          renderPalette();
        });
      });
    }

    $('prev-q').onclick = () => { if (currentIndex>0) { currentIndex--; renderQuestion(); renderPalette(); } };
    $('next-q').onclick = () => { if (currentIndex < list.length-1) { currentIndex++; renderQuestion(); renderPalette(); } };
    $('mark-q').onclick = () => { marked[currentSubjectKey][currentIndex] = !marked[currentSubjectKey][currentIndex]; renderPalette(); };
    $('goto-submit').onclick = () => { confirmSubmit(); };

    // MathJax
    if (window.MathJax) MathJax.typesetPromise();
  }

  // timer loop
  function renderTimer() {
    const m = Math.floor(remainingSeconds/60);
    const s = remainingSeconds%60;
    timerEl.textContent = `${m}:${String(s).padStart(2,'0')}`;
  }
  function startClock() {
    renderTimer();
    const intv = setInterval(()=>{
      remainingSeconds--;
      if (remainingSeconds<=0) {
        clearInterval(intv);
        autoSubmit();
      } else renderTimer();
    },1000);
  }

  // submit flow
  function confirmSubmit(){
    if (!confirm("Submit test now? You cannot change answers after submission.")) return;
    doSubmit();
  }

  function autoSubmit(){
    // called when time up
    alert("Time's up. Submitting test.");
    doSubmit();
  }

  function doSubmit(){
    // evaluate
    // scoring: +4 correct, -1 wrong, 0 unattempted
    const subjectsList = ['maths','physics','chemistry'];
    let totalMarks = 0;
    const breakdown = {};
    let totalAttempted = 0, totalQuestions = 0;
    subjectsList.forEach(sub=>{
      const list = qStore[sub] || [];
      let subCorrect=0, subWrong=0, subAtt=0;
      list.forEach((q,idx)=>{
        totalQuestions++;
        const keyAns = answers[sub][idx];
        if (keyAns == null || keyAns === '' || (Array.isArray(keyAns) && keyAns.length===0)) {
          // unattempted
          return;
        }
        subAtt++;
        totalAttempted++;
        // normalize correctIndices to array of strings
        const correct = (Array.isArray(q.correctIndices) ? q.correctIndices : (q.correctIndices != null ? [q.correctIndices] : [])).map(String).sort();
        if (q.question_type === 'Integer Type') {
          if (String(keyAns).trim() === String(q.numerical_answer).trim()) {
            subCorrect++;
            totalMarks += 4;
          } else {
            subWrong++;
            totalMarks -= 1;
          }
        } else if (q.question_type === 'Multiple Choice') {
          // consider correct only if selected set equals correct set
          const sel = (Array.isArray(keyAns) ? keyAns.map(String).sort() : [String(keyAns)]);
          if (JSON.stringify(sel) === JSON.stringify(correct)) {
            subCorrect++; totalMarks += 4;
          } else {
            subWrong++; totalMarks -= 1;
          }
        } else {
          // single choice
          if (correct.includes(String(keyAns))) {
            subCorrect++; totalMarks += 4;
          } else {
            subWrong++; totalMarks -= 1;
          }
        }
      });
      breakdown[sub] = { correct: subCorrect, wrong: subWrong, attempted: subAtt, total: list.length };
    });

    // clamp negative marks not required, keep as is
    // rank lookup
    let estRank = "N/A";
    for (const r of rankPreset) {
      if (totalMarks >= r.marks) { estRank = r.rank; break; }
    }

    // show results
    appRoot.innerHTML = `
      <div class="p-6 bg-[#0D163D] rounded-lg text-white">
        <h2 class="text-2xl mb-4">Test Result</h2>
        <div class="mb-3"><strong>Total Score:</strong> ${totalMarks}</div>
        <div class="mb-3"><strong>Estimated Rank:</strong> ${estRank}</div>
        <div class="mb-4"><strong>Attempted:</strong> ${totalAttempted} / ${totalQuestions}</div>
        ${Object.keys(breakdown).map(s=>{
          const b = breakdown[s];
          return `<div class="mb-2"><strong>${s.toUpperCase()}:</strong> ${b.correct} correct, ${b.wrong} wrong, ${b.attempted}/${b.total} attempted</div>`;
        }).join('')}
        <div class="mt-4">
          <a href="/mocktest-bank/" class="inline-block bg-blue-500 text-white font-concert py-2 px-4 rounded">Back</a>
        </div>
      </div>
    `;
  }

  // initialization
  (function init(){
    // ensure answers/visited/marked default objects for each index
    ['maths','physics','chemistry'].forEach(k=>{
      answers[k] = {};
      visited[k] = {};
      marked[k] = {};
    });

    renderTabs();
    renderPalette();
    renderQuestion();
    startClock();

    // submit button hookup (if present outside app)
    if (submitBtn) submitBtn.addEventListener('click', confirmSubmit);
  })();

})();
