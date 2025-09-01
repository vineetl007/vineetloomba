document.addEventListener("DOMContentLoaded", () => {
  const dataEl = document.getElementById("mocktest-data");
  if (!dataEl) return;
  const data = JSON.parse(dataEl.textContent);

  // qStore per subject (arrays in order)
  const qStore = {
    maths: data.maths || [],
    physics: data.physics || [],
    chemistry: data.chemistry || []
  };

  // DOM refs
  const sectionsEl = document.getElementById("sections");
  const timerEl = document.getElementById("timer");
  const questionContainer = document.getElementById("question-container");
  const navEl = document.getElementById("nav");
  const submitBtn = document.getElementById("submit-test");
  const summaryEl = document.getElementById("summary");
  const appRoot = document.getElementById("mocktest-app");

  // state
  let currentSubject = Object.keys(qStore).find(k => qStore[k].length > 0) || "maths";
  let currentIndex = 0;
  const answers = { maths: {}, physics: {}, chemistry: {} }; // answers[sub][idx] = value(s)
  const visited = { maths: {}, physics: {}, chemistry: {} };
  const marked = { maths: {}, physics: {}, chemistry: {} };

  // timer
  const activeSubjects = ["maths","physics","chemistry"].filter(k => qStore[k].length>0).length || 1;
  let remaining = activeSubjects * 60 * 60; // seconds
  let timerId = null;

  // utilities
  const qCount = sub => (qStore[sub] || []).length;
  const fmtTime = s => {
    const h = Math.floor(s/3600); const m = Math.floor((s%3600)/60); const sec = s%60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  };

  function parseCorrectIndices(raw) {
    if (raw == null) return [];
    if (Array.isArray(raw)) return raw.map(String);
    if (typeof raw === "string" && raw.trim()) {
      try { const p = JSON.parse(raw); if (Array.isArray(p)) return p.map(String); } catch(e){}
      return raw.split(",").map(s => s.trim()).filter(Boolean).map(String);
    }
    return [String(raw)];
  }

  function renderTabs() {
    sectionsEl.innerHTML = "";
    ["maths","physics","chemistry"].forEach(k=>{
      if (!qStore[k] || qStore[k].length===0) return;
      const btn = document.createElement("button");
      btn.textContent = k.toUpperCase();
      btn.className = `px-3 py-1 rounded font-concert ${k===currentSubject ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white'}`;
      btn.onclick = () => { currentSubject = k; currentIndex = 0; renderQuestion(); renderPalette(); renderTabs(); };
      sectionsEl.appendChild(btn);
    });
    summaryEl.textContent = `Sections: ${activeSubjects} • Total Qs: ${qCount("maths")+qCount("physics")+qCount("chemistry")}`;
  }

  function renderPalette() {
    navEl.innerHTML = "";
    const list = qStore[currentSubject] || [];
    list.forEach((q, idx) => {
      const btn = document.createElement("button");
      btn.textContent = idx+1;
      btn.className = "w-10 h-10 m-1 rounded text-sm font-concert";
      // status priority: marked -> answered -> visited -> not visited
      if (marked[currentSubject][idx]) {
        btn.classList.add("bg-purple-600","text-white");
      } else if (answers[currentSubject][idx] != null && !(Array.isArray(answers[currentSubject][idx]) && answers[currentSubject][idx].length===0) && answers[currentSubject][idx] !== "") {
        btn.classList.add("bg-green-600","text-white");
      } else if (visited[currentSubject][idx]) {
        btn.classList.add("bg-red-600","text-white");
      } else {
        btn.classList.add("bg-gray-700","text-white");
      }
      if (idx === currentIndex) btn.classList.add("ring-2","ring-yellow-300");
      btn.onclick = () => { currentIndex = idx; renderQuestion(); renderPalette(); };
      navEl.appendChild(btn);
    });
  }

  function buildQuestionHtml(qObj, idx) {
    // qObj.question is markdown string. Convert newlines to <p>/<br> same as practice.js
    const raw = String(qObj.question || "");
    const questionHtml = raw.split(/\n\s*\n/).map(p => `<p>${p.replace(/\n/g,'<br>')}</p>`).join("");
    return questionHtml;
  }

  function renderQuestion() {
    const list = qStore[currentSubject] || [];
    if (!list || list.length === 0) {
      questionContainer.innerHTML = '<p class="text-center text-gray-400">No questions in this section.</p>';
      return;
    }
    visited[currentSubject][currentIndex] = true;
    const q = list[currentIndex];
    const qHtml = buildQuestionHtml(q);
    const saved = answers[currentSubject][currentIndex];
    // options UI
    let inputHtml = "";
    const qt = (q.question_type || "").toString();
    if (qt === "Integer Type") {
      inputHtml = `<div class="mt-3"><input id="int-answer" class="border p-2 bg-gray-800 text-white font-concert" value="${saved || ''}" placeholder="Enter answer"/></div>`;
    } else if (qt === "Multiple Choice") {
      inputHtml = '<div class="mt-3">';
      (q.options || []).forEach((opt,i)=>{
        const checked = Array.isArray(saved) && saved.includes(String(i)) ? 'checked' : '';
        inputHtml += `<label class="block"><input type="checkbox" name="opt" data-i="${i}" ${checked}/> <span class="inline-block ml-2">${opt}</span></label>`;
      });
      inputHtml += '</div>';
    } else { // Single Choice
      inputHtml = '<div class="mt-3">';
      (q.options || []).forEach((opt,i)=>{
        const checked = (String(saved) === String(i)) ? 'checked' : '';
        inputHtml += `<label class="block"><input type="radio" name="opt" data-i="${i}" ${checked}/> <span class="inline-block ml-2">${opt}</span></label>`;
      });
      inputHtml += '</div>';
    }

    // controls
    const prevDisabled = currentIndex === 0 ? 'disabled' : '';
    const nextDisabled = currentIndex === list.length - 1 ? 'disabled' : '';

    questionContainer.innerHTML = `
      <div class="p-4 bg-[#0D163D] rounded-lg border border-gray-700">
        <div class="mb-2 text-sm text-gray-300">Section: <strong>${currentSubject.toUpperCase()}</strong> • Q ${currentIndex+1} of ${list.length}</div>
        <div class="prose prose-invert question-body">${qHtml}</div>
        ${inputHtml}
        <div class="flex gap-2 mt-4">
          <button id="prev-btn" class="px-3 py-1 bg-blue-600 text-white rounded" ${prevDisabled}>Previous</button>
          <button id="next-btn" class="px-3 py-1 bg-blue-600 text-white rounded" ${nextDisabled}>Next</button>
          <button id="mark-btn" class="px-3 py-1 ${marked[currentSubject][currentIndex] ? 'bg-yellow-400 text-black' : 'bg-purple-600 text-white'} rounded">${marked[currentSubject][currentIndex] ? 'Unmark' : 'Mark'}</button>
          <button id="goto-submit" class="ml-auto px-3 py-1 bg-green-600 text-white rounded">Submit Test</button>
        </div>
      </div>
    `;

    // attach handlers
    if (qt === "Integer Type") {
      const inp = document.getElementById("int-answer");
      inp.addEventListener("input", () => {
        answers[currentSubject][currentIndex] = inp.value.trim();
        renderPalette();
      });
    } else if (qt === "Multiple Choice") {
      questionContainer.querySelectorAll('input[name=opt]').forEach(chk=>{
        chk.addEventListener('change', ()=>{
          const chosen = Array.from(questionContainer.querySelectorAll('input[name=opt]'))
            .filter(c => c.checked).map(c => String(c.dataset.i));
          answers[currentSubject][currentIndex] = chosen;
          renderPalette();
        });
      });
    } else {
      questionContainer.querySelectorAll('input[name=opt]').forEach(r=>{
        r.addEventListener('change', ()=>{
          answers[currentSubject][currentIndex] = String(r.dataset.i);
          renderPalette();
        });
      });
    }

    document.getElementById("prev-btn").onclick = () => { if (currentIndex>0) { currentIndex--; renderQuestion(); renderPalette(); } };
    document.getElementById("next-btn").onclick = () => { if (currentIndex < list.length-1) { currentIndex++; renderQuestion(); renderPalette(); } };
    document.getElementById("mark-btn").onclick = () => { marked[currentSubject][currentIndex] = !marked[currentSubject][currentIndex]; renderPalette(); };
    document.getElementById("goto-submit").onclick = confirmSubmit;

    if (window.MathJax) MathJax.typesetPromise();
  }

  function renderTimer() { timerEl.textContent = fmtTime(remaining); }

  function startTimer() {
    renderTimer();
    timerId = setInterval(()=>{
      remaining--;
      if (remaining <= 0) {
        clearInterval(timerId);
        autoSubmit();
      } else renderTimer();
    },1000);
  }

  function confirmSubmit() {
    if (!confirm("Submit test now? You cannot change answers after submission.")) return;
    doSubmit();
  }
  function autoSubmit() { alert("Time's up. Submitting test."); doSubmit(); }

  function doSubmit() {
    if (timerId) clearInterval(timerId);
    // scoring
    let totalScore = 0;
    let totalAttempted = 0, totalQuestions = 0;
    const subjects = ["maths","physics","chemistry"];
    const breakdown = {};
    subjects.forEach(sub => {
      const list = qStore[sub] || [];
      let correct=0, wrong=0, attempted=0;
      list.forEach((q, idx) => {
        totalQuestions++;
        const keyAns = answers[sub][idx];
        if (keyAns == null || keyAns === "" || (Array.isArray(keyAns) && keyAns.length===0)) {
          // unattempted
          return;
        }
        attempted++; totalAttempted++;
        const correctIdx = parseCorrectIndices(q.correctIndices);
        if (q.question_type === "Integer Type") {
          if (String(keyAns).trim() === String(q.numerical_answer).trim()) { correct++; totalScore += 4; }
          else { wrong++; totalScore -= 1; }
        } else if (q.question_type === "Multiple Choice") {
          const sel = (Array.isArray(keyAns) ? keyAns.map(String).sort() : [String(keyAns)]);
          if (JSON.stringify(sel) === JSON.stringify(correctIdx.map(String).sort())) { correct++; totalScore +=4; }
          else { wrong++; totalScore -=1; }
        } else {
          if (correctIdx.includes(String(keyAns))) { correct++; totalScore +=4; }
          else { wrong++; totalScore -=1; }
        }
      });
      breakdown[sub] = { correct, wrong, attempted, total: list.length };
    });

    // rank lookup: rank_preset sorted descending marks
    let estRank = "N/A";
    const presets = Array.isArray(data.rank_preset) ? data.rank_preset.slice().sort((a,b)=>b.marks-a.marks) : [];
    for (const p of presets) { if (totalScore >= p.marks) { estRank = p.rank; break; } }

    // render results + per-question review
    let resultHtml = `
      <div class="p-6 bg-[#0D163D] rounded-lg text-white">
        <h2 class="text-2xl mb-4">Test Result</h2>
        <div class="mb-2"><strong>Total Score:</strong> ${totalScore}</div>
        <div class="mb-2"><strong>Estimated Rank:</strong> ${estRank}</div>
        <div class="mb-2"><strong>Attempted:</strong> ${totalAttempted}/${totalQuestions}</div>
        ${Object.keys(breakdown).map(s=>{
          const b = breakdown[s];
          return `<div class="mb-1"><strong>${s.toUpperCase()}:</strong> ${b.correct} correct, ${b.wrong} wrong, ${b.attempted}/${b.total} attempted</div>`;
        }).join('')}
        <hr class="my-4 border-gray-600"/>
        <div>
    `;

    // per-question review (show question, your answer, correct answers, solution)
    ["maths","physics","chemistry"].forEach(sub=>{
      const list = qStore[sub] || [];
      if (!list.length) return;
      resultHtml += `<h3 class="text-xl mt-4 mb-2">${sub.toUpperCase()}</h3>`;
      list.forEach((q, idx)=>{
        const your = answers[sub][idx];
        const correctIdx = parseCorrectIndices(q.correctIndices).map(String);
        const optHtml = (q.options || []).map((opt,i)=>{
          const isCorrect = correctIdx.includes(String(i));
          const youPicked = (Array.isArray(your) ? your.map(String).includes(String(i)) : String(your) === String(i));
          const cls = isCorrect ? 'bg-green-100 text-green-800' : (youPicked ? 'bg-red-100 text-red-800' : '');
          return `<li class="p-2 rounded ${cls}">${opt}${isCorrect ? ' ✅' : ''}${youPicked && !isCorrect ? ' ✖' : ''}</li>`;
        }).join("");
        resultHtml += `
          <div class="mb-4 p-3 bg-gray-900 rounded">
            <div class="prose prose-invert mb-2">${buildQuestionHtml(q)}</div>
            ${ (q.options && q.options.length) ? `<ul class="list-inside space-y-1">${optHtml}</ul>` : '' }
            ${ q.question_type === 'Integer Type' ? `<div class="mt-2"><strong>Your answer:</strong> ${your || '—'} <br><strong>Correct:</strong> ${q.numerical_answer || '—'}</div>` : '' }
            <div class="mt-3 bg-gray-800 p-3 rounded"><strong>Solution:</strong> ${q.solution || 'No solution provided.'}</div>
            ${ q.video ? `<div class="mt-3"><iframe src="https://www.youtube.com/embed/${q.video}?start=0&rel=0" style="width:100%;height:300px;border:0;" allowfullscreen></iframe></div>` : '' }
          </div>
        `;
      });
    });

    resultHtml += `</div></div>`;
    appRoot.innerHTML = resultHtml;
    if (window.MathJax) MathJax.typesetPromise();
  }

  // init
  (function init(){
    // ensure default objects
    ["maths","physics","chemistry"].forEach(k => { answers[k] = answers[k] || {}; visited[k] = visited[k] || {}; marked[k] = marked[k] || {}; });

    renderTabs();
    renderPalette();
    renderQuestion();
    startTimer();
    // hook submit
    if (submitBtn) submitBtn.addEventListener("click", confirmSubmit);
    console.log("Mocktest loaded. Subjects:", { maths: qCount("maths"), physics: qCount("physics"), chemistry: qCount("chemistry")});
  })();

});
