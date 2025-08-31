document.addEventListener("DOMContentLoaded", () => {
  const dataEl = document.getElementById("mocktest-data");
  if (!dataEl) return;

  const testData = JSON.parse(dataEl.textContent);

  const subjects = testData.subjects; // e.g. ["Maths","Physics"]
  const questionsData = {}; // {Maths: [...], Physics: [...]}
  subjects.forEach(sub => {
    questionsData[sub] = testData[`${sub.toLowerCase()}_questions`].map(qTitle => {
      const questionPage = window.allQuestions.find(q => q.Params.title === qTitle);
      return questionPage ? {
        title: questionPage.Params.title,
        question: questionPage.Params.question,
        options: questionPage.Params.options || [],
        correctIndices: questionPage.Params.correctIndices || [],
        numerical_answer: questionPage.Params.numerical_answer || "",
        question_type: questionPage.Params.question_type || "",
        solution: questionPage.Params.solution || "",
        video: questionPage.Params.video || "",
        start_time: questionPage.Params.start_time || 0
      } : null;
    }).filter(Boolean);
  });

  const rankPreset = testData.rank_preset || [];

  let currentSubjectIndex = 0;
  let currentQuestionIndex = 0;

  const userAnswers = {}; // {Maths:{0:2,1:0,...}, Physics:{...}}
  const markedForReview = {};

  subjects.forEach(s => { userAnswers[s] = {}; markedForReview[s] = {}; });

  const app = document.getElementById("mocktest-app");

  // Timer per subject: 60 min
  let timer = 60 * 60;
  const topBar = document.createElement("div");
  topBar.className = "flex justify-between mb-4 p-2 bg-gray-800 text-white font-concert rounded";
  app.appendChild(topBar);

  function formatTime(sec) {
    const m = Math.floor(sec/60).toString().padStart(2,"0");
    const s = (sec%60).toString().padStart(2,"0");
    return `${m}:${s}`;
  }

  function updateTimer() {
    topBar.innerHTML = `
      <div>${subjects[currentSubjectIndex]}</div>
      <div>Time Left: ${formatTime(timer)}</div>
    `;
    if(timer>0){ timer--; setTimeout(updateTimer,1000); } 
    else { alert("Time up for this subject!"); nextSubject(); }
  }
  updateTimer();

  // Question Palette
  const palette = document.createElement("div");
  palette.className = "grid grid-cols-5 gap-2 mb-4";
  app.appendChild(palette);

  function renderPalette() {
    const qList = questionsData[subjects[currentSubjectIndex]];
    palette.innerHTML = "";
    qList.forEach((q,i)=>{
      const btn = document.createElement("button");
      btn.className = "p-2 border rounded font-concert";
      if(userAnswers[subjects[currentSubjectIndex]][i]!=null) btn.classList.add("bg-green-500","text-white");
      if(markedForReview[subjects[currentSubjectIndex]][i]) btn.classList.add("bg-yellow-400");
      btn.innerText = i+1;
      btn.addEventListener("click",()=>{ currentQuestionIndex=i; renderQuestion(); });
      palette.appendChild(btn);
    });
  }

  // Main question render
  const questionContainer = document.createElement("div");
  app.appendChild(questionContainer);

  function renderQuestion() {
    const sub = subjects[currentSubjectIndex];
    const qData = questionsData[sub][currentQuestionIndex];
    const rawQ = qData.question || "";
    const questionHtml = rawQ.split(/\n\s*\n/).map(p=>`<p>${p.replace(/\n/g,'<br>')}</p>`).join("");
    
    let optionsHtml = "";
    if(qData.question_type==="Multiple Choice"){
      optionsHtml = qData.options.map((opt,i)=>`
        <li class="option cursor-pointer border rounded p-2 hover:bg-gray-100/10"
            data-index="${i}">
          ${opt}
        </li>`).join("");
      optionsHtml = `<ul>${optionsHtml}</ul>`;
    } else if(qData.question_type==="Integer Type"){
      optionsHtml = `
        <input type="text" id="int-answer" class="border p-2 w-32 bg-gray-800 text-white font-concert placeholder-gray-400" 
          placeholder="Enter answer" value="${userAnswers[sub][currentQuestionIndex] || ''}"/>
      `;
    }

    questionContainer.innerHTML = `
      <h2 class="text-lg font-semibold mb-2">${sub} Q${currentQuestionIndex+1}</h2>
      <div class="mb-3">${questionHtml}</div>
      ${optionsHtml}
      <div class="flex gap-2 mt-4">
        <button id="prev-btn" class="px-4 py-2 bg-blue-500 text-white font-concert rounded">Previous</button>
        <button id="next-btn" class="px-4 py-2 bg-blue-500 text-white font-concert rounded">Next</button>
        <button id="mark-btn" class="px-4 py-2 bg-yellow-400 font-concert rounded">Mark for Review</button>
      </div>
    `;

    // Option selection
    if(qData.question_type==="Multiple Choice"){
      questionContainer.querySelectorAll(".option").forEach(opt=>{
        opt.addEventListener("click",()=>{
          userAnswers[sub][currentQuestionIndex] = parseInt(opt.dataset.index);
          renderPalette();
        });
      });
    } else if(qData.question_type==="Integer Type"){
      const input = questionContainer.querySelector("#int-answer");
      input.addEventListener("input",()=>{ userAnswers[sub][currentQuestionIndex] = input.value.trim(); renderPalette(); });
    }

    // Buttons
    questionContainer.querySelector("#prev-btn").addEventListener("click",()=>{
      if(currentQuestionIndex>0){ currentQuestionIndex--; renderQuestion(); }
    });
    questionContainer.querySelector("#next-btn").addEventListener("click",()=>{
      if(currentQuestionIndex<questionsData[sub].length-1){ currentQuestionIndex++; renderQuestion(); }
    });
    questionContainer.querySelector("#mark-btn").addEventListener("click",()=>{
      markedForReview[sub][currentQuestionIndex] = !markedForReview[sub][currentQuestionIndex];
      renderPalette();
    });

    if(window.MathJax) MathJax.typesetPromise();
  }

  renderPalette();
  renderQuestion();

  function nextSubject(){
    if(currentSubjectIndex<subjects.length-1){
      currentSubjectIndex++;
      currentQuestionIndex=0;
      timer=60*60;
      renderPalette();
      renderQuestion();
      updateTimer();
    } else { calculateResult(); }
  }

  function calculateResult(){
    app.innerHTML = `<h2 class="text-xl font-bold mb-4">Test Submitted</h2>`;
    let totalScore=0;
    subjects.forEach(sub=>{
      let score=0;
      const qList = questionsData[sub];
      qList.forEach((q,i)=>{
        if(q.question_type==="Multiple Choice" && userAnswers[sub][i]!=null && q.correctIndices.includes(userAnswers[sub][i])) score++;
        if(q.question_type==="Integer Type" && userAnswers[sub][i]!=null && userAnswers[sub][i]==q.numerical_answer) score++;
      });
      totalScore+=score;
      app.innerHTML+=`<div class="mb-2 font-concert">${sub}: ${score}/${qList.length}</div>`;
    });
    app.innerHTML+=`<div class="mb-4 font-concert">Total Score: ${totalScore}</div>`;

    // Estimated rank
    let estRank = rankPreset.reduce((acc,p)=> totalScore>=p.marks?p.rank:acc, null);
    if(estRank) app.innerHTML+=`<div class="mb-4 font-concert">Estimated Rank: ${estRank}</div>`;
  }

});
