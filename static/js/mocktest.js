document.addEventListener("DOMContentLoaded", () => {

  // DOM refs
  const appRoot = document.getElementById("mocktest-app");
  const sectionsEl = document.getElementById("sections");
  const timerEl = document.getElementById("timer");
  const submitBtn = document.getElementById("submit-test");

  // Build subject-wise question store from window.allQuestions
  const qStore = { maths: [], physics: [], chemistry: [] };
  window.allQuestions.forEach(q => {
      const path = q.File.Path.toLowerCase();
      if(path.includes("jee-math")) qStore.maths.push(q);
      else if(path.includes("jee-physics")) qStore.physics.push(q);
      else if(path.includes("jee-chemistry")) qStore.chemistry.push(q);
  });
  console.log("qStore built:", qStore);

  // NTA-style palette tracking
  const palette = { maths: [], physics: [], chemistry: [] };

  let currentSubjectKey = "maths";
  let currentIndex = 0;
  let timer = 180 * 60; // 180 min in seconds
  let timerInterval;

  function startTimer() {
      timerInterval = setInterval(() => {
          const min = Math.floor(timer / 60);
          const sec = timer % 60;
          timerEl.textContent = `Time Left: ${min}m ${sec}s`;
          if(timer <= 0) clearInterval(timerInterval);
          timer--;
      }, 1000);
  }

  function renderTabs() {
      sectionsEl.innerHTML = '';
      ["maths","physics","chemistry"].forEach(k => {
          if(!qStore[k] || qStore[k].length===0) return;
          const btn = document.createElement("button");
          btn.textContent = k.charAt(0).toUpperCase() + k.slice(1);
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

  function renderPalette() {
      // simple palette display
      const palDiv = document.createElement("div");
      palDiv.className = "flex gap-1 flex-wrap mb-4";
      qStore[currentSubjectKey].forEach((q,i) => {
          const span = document.createElement("span");
          span.className = "w-6 h-6 inline-block rounded";
          const status = palette[currentSubjectKey][i];
          span.style.backgroundColor = 
              status==="answered" ? "green" :
              status==="visited" ? "red" :
              status==="marked" ? "purple" : "grey";
          palDiv.appendChild(span);
      });
      // replace old palette
      const oldPal = appRoot.querySelector(".palette");
      if(oldPal) oldPal.replaceWith(palDiv);
      palDiv.classList.add("palette");
      appRoot.prepend(palDiv);
  }

  function renderQuestion() {
      const q = qStore[currentSubjectKey][currentIndex];
      if(!q) {
          appRoot.innerHTML = "<p>No questions in this section.</p>";
          return;
      }

      // mark visited if not already
      if(!palette[currentSubjectKey][currentIndex]) palette[currentSubjectKey][currentIndex] = "visited";

      // Render question HTML (reuse practice.js logic)
      let optionsHtml = '';
      const isInteger = q.Params.question_type === "Integer Type";
      const isMulti = q.Params.question_type === "Multiple Choice";
      
      if(!isInteger) {
          optionsHtml = `<ul class="space-y-2">` + q.Params.options.map((opt,i)=>`
            <li class="option cursor-pointer border rounded p-2 hover:bg-gray-100/10" 
                data-index="${i}" data-correct="${q.Params.correctIndices.includes(i)}">
                <span class="latex-option">${opt}</span>
            </li>
          `).join('') + `</ul>`;
      } else {
          optionsHtml = `
            <div class="flex items-center space-x-2">
              <input id="int-answer" type="text" 
                     class="border rounded p-2 w-32 bg-gray-800 text-white font-concert placeholder-gray-400" 
                     placeholder="Enter answer" />
            </div>
          `;
      }

      const questionHtml = q.Params.question.split(/\n\s*\n/).map(p=>`<p>${p.replace(/\n/g,'<br>')}</p>`).join('');

      appRoot.innerHTML = `
        <div class="question border rounded-lg p-4 shadow mb-4">
          <h2 class="font-normal mb-3">Q${currentIndex+1}.</h2>
          <div class="question-text mb-3">${questionHtml}</div>
          ${optionsHtml}
          <div class="flex justify-between mt-4">
            <button id="prev-btn" class="px-4 py-2 bg-blue-500 font-concert rounded" ${currentIndex===0?'style="display:none"':''}>Previous</button>
            <button id="next-btn" class="px-4 py-2 bg-blue-500 font-concert rounded" ${currentIndex===qStore[currentSubjectKey].length-1?'style="display:none"':''}>Next</button>
          </div>
        </div>
      `;

      // Attach option click
      if(!isInteger) {
          appRoot.querySelectorAll(".option").forEach(opt=>{
              opt.addEventListener("click", ()=>{
                  const idx = parseInt(opt.dataset.index);
                  const correct = opt.dataset.correct==="true";
                  palette[currentSubjectKey][currentIndex] = "answered";
                  renderPalette();
                  if(correct) opt.classList.add("border-green-400"); else opt.classList.add("border-red-400");
                  // disable all options
                  appRoot.querySelectorAll(".option").forEach(o=>o.style.pointerEvents="none");
              });
          });
      }

      // Integer input handler
      if(isInteger){
          const input = appRoot.querySelector("#int-answer");
          input.addEventListener("change", ()=>{
              palette[currentSubjectKey][currentIndex] = "answered";
              renderPalette();
          });
      }

      // Navigation buttons
      appRoot.querySelector("#prev-btn")?.addEventListener("click", ()=>{
          if(currentIndex>0){currentIndex--; renderQuestion();}
      });
      appRoot.querySelector("#next-btn")?.addEventListener("click", ()=>{
          if(currentIndex<qStore[currentSubjectKey].length-1){currentIndex++; renderQuestion();}
      });
  }

  function submitTest(){
      clearInterval(timerInterval);
      let total = 0;
      let correct = 0;
      Object.keys(qStore).forEach(subject=>{
          qStore[subject].forEach((q,i)=>{
              const ans = palette[subject][i]==="answered";
              total++;
              if(ans) correct++;
          });
      });
      let score = correct;
      let rank = "NA";
      // use rank_preset if available
      if(window.rankPreset){
          for(let rp of window.rankPreset){
              if(score>=rp.marks){ rank=rp.rank; break;}
          }
      }
      appRoot.innerHTML = `<h2 class="text-xl mb-4">Test Submitted!</h2>
        <p>Score: ${score}/${total}</p>
        <p>Estimated Rank: ${rank}</p>
      `;
  }

  // Init
  renderTabs();
  renderQuestion();
  renderPalette();
  startTimer();
  submitBtn.addEventListener("click", submitTest);
});
