document.addEventListener("DOMContentLoaded", () => {
  const sectionsEl = document.getElementById("sections");
  const timerEl = document.getElementById("timer");
  const questionContainer = document.getElementById("mocktest-app");
  const navEl = document.getElementById("nav");
  const submitBtn = document.getElementById("submit-test");

  let currentSubjectKey = Object.keys(qStore).find(k => qStore[k].length > 0);
  let currentIndex = 0;
  let answers = { maths: [], physics: [], chemistry: [] };
  let totalTime = 180 * 60; // 180 minutes in seconds

  function startTimer() {
    const timerInterval = setInterval(() => {
      if (totalTime <= 0) {
        clearInterval(timerInterval);
        submitTest();
        return;
      }
      totalTime--;
      const min = Math.floor(totalTime / 60);
      const sec = totalTime % 60;
      timerEl.textContent = `Time Left: ${min}:${sec.toString().padStart(2,'0')}`;
    }, 1000);
  }

  function renderTabs() {
    sectionsEl.innerHTML = '';
    Object.keys(qStore).forEach(k => {
      if (!qStore[k] || qStore[k].length === 0) return;
      const btn = document.createElement('button');
      btn.textContent = k.charAt(0).toUpperCase() + k.slice(1);
      btn.className = `px-3 py-1 rounded font-concert ${k===currentSubjectKey?'bg-blue-600 text-white':'bg-gray-700 text-white'}`;
      btn.onclick = () => { currentSubjectKey=k; currentIndex=0; renderQuestion(); renderPalette(); renderTabs(); };
      sectionsEl.appendChild(btn);
    });
  }

  function renderPalette() {
    navEl.innerHTML = '';
    qStore[currentSubjectKey].forEach((q, i) => {
      const status = answers[currentSubjectKey][i] || 'not-visited'; // 'not-visited','answered','marked'
      const colorMap = { 'not-visited':'bg-gray-400', 'answered':'bg-green-500', 'marked':'bg-purple-500' };
      const btn = document.createElement('button');
      btn.className = `w-6 h-6 ${colorMap[status]} rounded`;
      btn.onclick = () => { currentIndex=i; renderQuestion(); };
      navEl.appendChild(btn);
    });
  }

  function renderQuestion() {
    const q = qStore[currentSubjectKey][currentIndex];
    questionContainer.innerHTML = `<div class="question border rounded-lg p-4 shadow mb-4">
      <h2 class="font-normal mb-3">Q${currentIndex+1}.</h2>
      <div class="question-text mb-3">${q.question}</div>
      <ul class="space-y-2">
        ${q.options.map((opt,i)=>`<li class="option cursor-pointer border rounded p-2 hover:bg-gray-100/10" data-index="${i}">${opt}</li>`).join('')}
      </ul>
      <div class="solution mt-4 hidden">
        <strong>Solution:</strong> ${q.solution}
        ${q.video_url?`<iframe class="w-full h-64 mt-2" src="${q.video_url}" frameborder="0" allowfullscreen></iframe>`:''}
      </div>
      <div class="flex justify-between mt-6">
        <button id="prev-btn" class="px-4 py-2 bg-blue-500 font-concert rounded" ${currentIndex===0?'style="display:none"':''}>Previous</button>
        <button id="next-btn" class="px-4 py-2 bg-blue-500 font-concert rounded" ${currentIndex===qStore[currentSubjectKey].length-1?'style="display:none"':''}>Next</button>
      </div>
    </div>`;

    // Attach option click
    questionContainer.querySelectorAll(".option").forEach(opt=>{
      opt.addEventListener("click", ()=>{
        const idx=parseInt(opt.dataset.index);
        answers[currentSubjectKey][currentIndex]= 'answered';
        renderPalette();
      });
    });

    // Navigation buttons
    questionContainer.querySelector("#prev-btn")?.addEventListener("click", ()=>{
      currentIndex--; renderQuestion(); renderPalette();
    });
    questionContainer.querySelector("#next-btn")?.addEventListener("click", ()=>{
      currentIndex++; renderQuestion(); renderPalette();
    });
  }

  function submitTest() {
    // Compute total answered and rank (using rank_preset if available)
    alert("Test submitted!"); // placeholder
  }

  renderTabs();
  renderPalette();
  renderQuestion();
  startTimer();
  submitBtn.onclick = submitTest;
});
