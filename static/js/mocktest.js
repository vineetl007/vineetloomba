document.addEventListener("DOMContentLoaded", () => {
  const dataEl = document.getElementById("mocktest-data");
  if (!dataEl) return;

  const allQuestions = JSON.parse(dataEl.textContent);
  let currentIndex = 0;
  const app = document.getElementById("mocktest-app");

  function getTags(q) {
    if (Array.isArray(q.tags)) return q.tags;
    if (typeof q.tags === "string" && q.tags.trim()) {
      try { return JSON.parse(q.tags); } catch(e){ return q.tags.split(",").map(s => s.trim()); }
    }
    return [];
  }

  function renderQuestion(index) {
    const q = allQuestions[index];
    if (!q) return;

    const tags = getTags(q);
    const isInteger = q.question_type === "Integer Type";
    const isMulti = q.question_type === "Multiple Choice";
    let selectedIndices = [];

    const questionHtml = String(q.question || "")
      .split(/\n\s*\n/)
      .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
      .join("");

    app.innerHTML = `
      <div class="question border rounded-lg p-4 shadow mb-4">
        <h2 class="font-normal mb-3">Q${index+1}.</h2>
        <div class="question-text mb-3">${questionHtml}</div>

        <div class="mb-4 flex flex-wrap gap-2">
          ${tags.map(t => `<span class="bg-yellow-400 text-black font-concert text-sm px-3 py-1 rounded-full">${t}</span>`).join('')}
          ${q.difficulty ? `<span class="bg-blue-500 text-white font-concert text-sm px-3 py-1 rounded-full">Difficulty: ${q.difficulty}</span>` : ''}
          ${q.question_type ? `<span class="bg-purple-500 text-white font-concert text-sm px-3 py-1 rounded-full">Type: ${q.question_type}</span>` : ''}
        </div>

        ${isInteger
          ? `<div class="flex items-center space-x-2">
               <input id="int-answer" type="text" class="border rounded p-2 w-32 bg-gray-800 text-white" placeholder="Enter answer" />
               <button id="check-btn" class="px-4 py-2 bg-blue-500 text-white rounded">Submit</button>
             </div>`
          : `<ul class="space-y-2">
               ${q.options.map((opt,i) => `<li class="option cursor-pointer border rounded p-2 hover:bg-gray-100/10" data-index="${i}" data-correct="${q.correctIndices.includes(i)}">${opt}</li>`).join('')}
             </ul>`}

        <div class="solution mt-4 hidden">
          <strong>Solution:</strong> ${q.solution}
          ${q.video_url ? `<div class="mt-6"><iframe src="${q.video_url}" class="w-full h-64 rounded-lg" frameborder="0" allowfullscreen></iframe></div>` : ''}
        </div>

        <div class="flex justify-between mt-6">
          <button id="prev-btn" class="px-4 py-2 bg-blue-500 rounded" ${index === 0 ? 'style="display:none"' : ''}>Previous</button>
          <button id="next-btn" class="px-4 py-2 bg-blue-500 text-white rounded" ${index === allQuestions.length-1 ? 'style="display:none"' : ''}>Next</button>
        </div>
      </div>
    `;

    if (!isInteger) {
      app.querySelectorAll(".option").forEach(opt => {
        opt.addEventListener("click", () => {
          const correct = opt.dataset.correct === "true";
          const questionDiv = opt.closest(".question");
          const solution = questionDiv.querySelector(".solution");
          questionDiv.querySelectorAll(".option").forEach(o => o.style.pointerEvents = "none");
          opt.classList.add(correct ? "border-green-400" : "border-red-400");
          solution.classList.remove("hidden");
        });
      });
    }

    if (isInteger) {
      const input = app.querySelector("#int-answer");
      const checkBtn = app.querySelector("#check-btn");
      const solution = app.querySelector(".solution");
      checkBtn.addEventListener("click", () => {
        if (input.value.trim() === String(q.numerical_answer || "").trim()) {
          input.classList.add("border-green-400");
        } else {
          input.classList.add("border-red-400");
        }
        solution.classList.remove("hidden");
        input.disabled = true;
        checkBtn.disabled = true;
      });
    }

    app.querySelector("#prev-btn")?.addEventListener("click", () => {
      if (currentIndex > 0) { currentIndex--; renderQuestion(currentIndex); }
    });

    app.querySelector("#next-btn")?.addEventListener("click", () => {
      if (currentIndex < allQuestions.length-1) { currentIndex++; renderQuestion(currentIndex); }
    });

    if (window.MathJax) MathJax.typesetPromise();
  }

  renderQuestion(currentIndex);
});
zaxscdv 
