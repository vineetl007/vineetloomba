document.addEventListener("DOMContentLoaded", () => {
  // DOM refs
  const sectionsEl = document.getElementById("sections");
  const timerEl = document.getElementById("timer");
  const questionContainer = document.getElementById("question-container");
  const navEl = document.getElementById("nav");
  const submitBtn = document.getElementById("submit-test");
  const appRoot = document.getElementById("mocktest-app");

  let currentSubjectKey = "maths";
  let currentIndex = 0;

  // Build qStore from frontmatter lists
  const qStore = {
    maths: window.dummyTest?.maths_questions || [],
    physics: window.dummyTest?.physics_questions || [],
    chemistry: window.dummyTest?.chemistry_questions || []
  };

  function loadQuestion(path) {
    const el = document.querySelector(`script[data-question-path="${path}"]`);
    if (!el) return null;
    return JSON.parse(el.textContent);
  }

  function renderTabs() {
    sectionsEl.innerHTML = '';
    ["maths", "physics", "chemistry"].forEach(k => {
      if (!qStore[k] || qStore[k].length === 0) return;
      const btn = document.createElement("button");
      btn.textContent = k.charAt(0).toUpperCase() + k.slice(1);
      btn.className = `px-3 py-1 rounded font-concert ${k === currentSubjectKey ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white'}`;
      btn.onclick = () => {
        currentSubjectKey = k;
        currentIndex = 0;
        renderQuestion();
      };
      sectionsEl.appendChild(btn);
    });
  }

  function renderQuestion() {
    const path = qStore[currentSubjectKey][currentIndex];
    const q = loadQuestion(path);
    if (!q) {
      appRoot.innerHTML = `<p class="text-red-400">No question found at path: ${path}</p>`;
      return;
    }

    // Parse tags robustly (copied from practice.js)
    const tags = (() => {
      if (Array.isArray(q.tags)) return q.tags.map(t => String(t).trim()).filter(Boolean);
      if (typeof q.tags === "string" && q.tags.trim()) {
        try {
          const parsed = JSON.parse(q.tags);
          if (Array.isArray(parsed)) return parsed.map(t => String(t).trim()).filter(Boolean);
        } catch {}
        return q.tags.replace(/^\[|\]$/g, "").split(",").map(t => String(t).trim()).filter(Boolean);
      }
      if (q.tags && typeof q.tags === "object") {
        try { return Object.values(q.tags).flat().map(t => String(t).trim()).filter(Boolean); } catch {}
      }
      return [];
    })();

    const isMulti = q.question_type === "Multiple Choice";
    const isInteger = q.question_type === "Integer Type";
    let selectedIndices = [];

    // Question HTML
    const rawQ = String(q.question || "");
    const questionHtml = rawQ.split(/\n\s*\n/).map(p => `<p>${p.replace(/\n/g,'<br>')}</p>`).join("");

    appRoot.innerHTML = `
      <div class="question border rounded-lg p-4 shadow mb-4">
        <h2 class="font-normal mb-3">Q${currentIndex+1}.</h2>
        <div class="question-text mb-3">${questionHtml}</div>
        <div class="mb-4 flex flex-wrap gap-2">
          ${tags.length ? tags.map(tag => `<a href="/tags/${encodeURIComponent(tag.toLowerCase())}/" class="bg-yellow-400 text-black font-concert text-sm px-3 py-1 rounded-full hover:bg-yellow-300 transition">${tag}</a>`).join('') : ''}
          ${q.difficulty ? `<a href="/difficulty/${q.difficulty}/" class="bg-blue-500 text-white font-concert text-sm px-3 py-1 rounded-full hover:bg-blue-400 transition">Difficulty: ${q.difficulty}</a>` : ''}
          ${q.question_type ? `<a href="/question-type/${q.question_type}/" class="bg-purple-500 text-white font-concert text-sm px-3 py-1 rounded-full hover:bg-purple-400 transition">Type: ${q.question_type}</a>` : ''}
        </div>
        ${
          isInteger
            ? `<div class="flex items-center space-x-2">
                <input id="int-answer" type="text" class="border rounded p-2 w-32 bg-gray-800 text-white font-concert placeholder-gray-400" placeholder="Enter answer" />
                <button id="check-btn" class="px-4 py-2 font-concert bg-blue-500 text-white rounded">Submit</button>
              </div>`
            : `<ul class="space-y-2">${Array.isArray(q.options) ? q.options.map((opt,i)=>`<li class="option cursor-pointer border rounded p-2 hover:bg-gray-100/10" data-index="${i}" data-correct="${q.correctIndices.includes(i)}"><span class="latex-option">${opt}</span></li>`).join('') : ''}</ul>`
        }
        <div class="solution mt-4 hidden"><strong>Solution:</strong> ${q.solution || ''}</div>
        <div class="flex justify-between mt-6">
          <button id="prev-btn" class="px-4 py-2 bg-blue-500 font-concert rounded" ${currentIndex === 0 ? 'style="display:none"' : ''}>Previous</button>
          <button id="next-btn" class="px-4 py-2 bg-blue-500 font-concert text-white rounded" ${currentIndex === qStore[currentSubjectKey].length - 1 ? 'style="display:none"' : ''}>Next</button>
        </div>
      </div>
    `;

    // Integer type handler
    if (isInteger) {
      const input = appRoot.querySelector("#int-answer");
      const checkBtn = appRoot.querySelector("#check-btn");
      const solution = appRoot.querySelector(".solution");
      checkBtn.addEventListener("click", () => {
        input.classList[input.value.trim() === (q.numerical_answer || '').trim() ? 'add' : 'add']("border-green-400");
        solution.classList.remove("hidden");
        input.disabled = true; checkBtn.disabled = true;
      });
    }

    // Option click
    if (!isInteger) {
      appRoot.querySelectorAll(".option").forEach(opt => {
        opt.addEventListener("click", () => {
          const questionDiv = opt.closest(".question");
          const solution = questionDiv.querySelector(".solution");
          const correct = opt.dataset.correct === "true";
          const optionIndex = parseInt(opt.dataset.index);

          if (!isMulti) {
            questionDiv.querySelectorAll(".option").forEach(o => o.classList.remove("border-green-400","border-red-400"));
            if (correct) opt.classList.add("border-green-400");
            else { opt.classList.add("border-red-400"); questionDiv.querySelectorAll(".option").forEach(o=>{if(o.dataset.correct==="true")o.classList.add("border-green-400")}); }
            solution.classList.remove("hidden");
            questionDiv.querySelectorAll(".option").forEach(o=>o.style.pointerEvents="none");
          } else {
            if (!selectedIndices.includes(optionIndex)) { selectedIndices.push(optionIndex); opt.classList.add("border-green-400"); }
            const allCorrect = Array.from(questionDiv.querySelectorAll(".option")).filter(o=>o.dataset.correct==="true").every(o=>selectedIndices.includes(parseInt(o.dataset.index)));
            if(allCorrect){ solution.classList.remove("hidden"); questionDiv.querySelectorAll(".option").forEach(o=>o.style.pointerEvents="none"); }
          }
        });
      });
    }

    // Navigation buttons
    appRoot.querySelector("#prev-btn")?.addEventListener("click",()=>{if(currentIndex>0){currentIndex--;renderQuestion();}});
    appRoot.querySelector("#next-btn")?.addEventListener("click",()=>{if(currentIndex<qStore[currentSubjectKey].length-1){currentIndex++;renderQuestion();}});
    if(window.MathJax) MathJax.typesetPromise();
  }

  renderTabs();
  renderQuestion();
});
