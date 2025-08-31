document.addEventListener("DOMContentLoaded", () => {
  const dataEl = document.getElementById("mocktest-data");
  if (!dataEl) return;

  const questions = JSON.parse(dataEl.textContent);
  const app = document.getElementById("mocktest-app");
  let currentIndex = 0;
  const userAnswers = Array(questions.length).fill(null); // store selected answers

  // Grab rank preset from frontmatter
  const rankPreset = window.rankPreset || []; // later we can inject via <script>

  function renderQuestion(index) {
    const q = questions[index];

    // handle tags
    const tags = (() => {
      if (Array.isArray(q.tags)) return q.tags.map(t => String(t).trim()).filter(Boolean);
      if (typeof q.tags === "string" && q.tags.trim()) {
        try {
          const parsed = JSON.parse(q.tags);
          if (Array.isArray(parsed)) return parsed.map(t => String(t).trim()).filter(Boolean);
        } catch(e){}
        return q.tags.replace(/^\[|\]$/g,"").split(",").map(t=>t.trim()).filter(Boolean);
      }
      return [];
    })();

    const isMulti = q.question_type === "Multiple Choice";
    const isInteger = q.question_type === "Integer Type";

    // question text
    const rawQ = String(q.question || "");
    const questionHtml = rawQ.split(/\n\s*\n/).map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join("");

    app.innerHTML = `
      <div class="question border rounded-lg p-4 shadow mb-4">
        <h2 class="font-normal mb-3">Q${index + 1}.</h2>
        <div class="question-text mb-3">${questionHtml}</div>

        <div class="mb-4 flex flex-wrap gap-2">
          ${tags.length ? tags.map(tag => `
            <a href="/tags/${encodeURIComponent(tag.toLowerCase())}/"
               class="bg-yellow-400 text-black font-concert text-sm px-3 py-1 rounded-full hover:bg-yellow-300 transition">
              ${tag}
            </a>`).join('') : ''}
          ${q.difficulty ? `<a href="#" class="bg-blue-500 text-white font-concert text-sm px-3 py-1 rounded-full">Difficulty: ${q.difficulty}</a>` : ''}
          ${q.question_type ? `<a href="#" class="bg-purple-500 text-white font-concert text-sm px-3 py-1 rounded-full">Type: ${q.question_type}</a>` : ''}
        </div>

        ${isInteger ? `
          <div class="flex items-center space-x-2">
            <input id="int-answer" type="text" class="border rounded p-2 w-32 bg-gray-800 text-white font-concert placeholder-gray-400" placeholder="Enter answer" />
            <button id="check-btn" class="px-4 py-2 font-concert bg-blue-500 text-white rounded">Submit</button>
          </div>
        ` : `
          <ul class="space-y-2">
            ${q.options.map((opt,i)=>`
              <li class="option cursor-pointer border rounded p-2 hover:bg-gray-100/10"
                  data-index="${i}" data-correct="${q.correctIndices.includes(i)}">
                <span class="latex-option">${opt}</span>
              </li>`).join('')}
          </ul>
        `}

        <div class="solution mt-4 hidden">
          <strong>Solution:</strong> ${q.solution}
          ${q.video_url ? `<div class="mt-6">
            <p class="text-lg font-semibold mb-2">🎥 Video Solution</p>
            <div style="display:flex;justify-content:center;">
              <div style="width:100%; max-width:720px; aspect-ratio:16/9; overflow:hidden; border-radius:12px;">
                <iframe src="${q.video_url}" style="width:100%; height:100%; border:0; display:block;"
                  frameborder="0" allowfullscreen title="Video Solution"></iframe>
              </div>
            </div>
          </div>` : ""}
        </div>
      </div>

      <div class="flex justify-between mt-6">
        <button id="prev-btn" class="px-4 py-2 bg-blue-500 font-concert rounded" ${index===0?'style="display:none"':''}>Previous</button>
        <button id="next-btn" class="px-4 py-2 bg-blue-500 font-concert text-white rounded">${index===questions.length-1?'Finish':'Next'}</button>
      </div>
    `;

    // Option click
    if (!isInteger) {
      app.querySelectorAll(".option").forEach(opt => {
        opt.addEventListener("click", () => {
          const idx = parseInt(opt.dataset.index);
          userAnswers[index] = idx;

          app.querySelectorAll(".option").forEach(o => o.style.pointerEvents = "none");
          if (q.correctIndices.includes(idx)) {
            opt.classList.add("border-green-400");
          } else {
            opt.classList.add("border-red-400");
            q.correctIndices.forEach(ci => {
              const correctEl = Array.from(app.querySelectorAll(".option")).find(o=>parseInt(o.dataset.index)===ci);
              if(correctEl) correctEl.classList.add("border-green-400");
            });
          }
          app.querySelector(".solution").classList.remove("hidden");
        });
      });
    }

    // Integer type
    if (isInteger) {
      const input = app.querySelector("#int-answer");
      const checkBtn = app.querySelector("#check-btn");
      const solution = app.querySelector(".solution");
      checkBtn.addEventListener("click", () => {
        userAnswers[index] = input.value.trim();
        solution.classList.remove("hidden");
        input.disabled = true;
        checkBtn.disabled = true;
      });
    }

    // Navigation
    app.querySelector("#prev-btn")?.addEventListener("click", () => {
      if(currentIndex>0){ currentIndex--; renderQuestion(currentIndex); }
    });
    app.querySelector("#next-btn")?.addEventListener("click", () => {
      if(currentIndex<questions.length-1){ 
        currentIndex++; renderQuestion(currentIndex); 
      } else {
        showResults();
      }
    });

    // MathJax render
    if(window.MathJax){ MathJax.typesetPromise(); }
  }

  function showResults() {
    let totalCorrect = 0;
    questions.forEach((q,i)=>{
      if(q.question_type==="Integer Type"){
        if(String(q.numerical_answer).trim()===String(userAnswers[i]).trim()) totalCorrect++;
      } else {
        if(Array.isArray(userAnswers[i]) && userAnswers[i].sort().join(",")===q.correctIndices.sort().join(",")) totalCorrect++;
        else if(q.correctIndices.includes(userAnswers[i])) totalCorrect++;
      }
    });

    // find estimated rank from preset
    let estimatedRank = "";
    if(Array.isArray(rankPreset)){
      for(let i=0;i<rankPreset.length;i++){
        if(totalCorrect>=rankPreset[i].marks){ estimatedRank=rankPreset[i].rank; break; }
      }
    }

    app.innerHTML = `
      <div class="text-center p-6 bg-[#0f111a] text-white rounded-lg">
        <h2 class="text-2xl mb-4">Test Completed ✅</h2>
        <p class="mb-2">Your Score: <strong>${totalCorrect} / ${questions.length}</strong></p>
        ${estimatedRank ? `<p class="mb-2">Estimated Rank: <strong>${estimatedRank}</strong></p>` : ""}
        <a href="/mocktest-bank/" class="inline-block mt-4 bg-blue-500 text-white font-concert py-2 px-4 rounded hover:bg-blue-400 transition">
          ⬅ Back to Mock Tests
        </a>
      </div>
    `;
  }

  // Render first question
  renderQuestion(currentIndex);
});
