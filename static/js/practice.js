document.addEventListener("DOMContentLoaded", () => {
  const dataEl = document.getElementById("practice-data");
  if (!dataEl) return;

  const questions = JSON.parse(dataEl.textContent);
  let currentIndex = 0;
  const app = document.getElementById("practice-app");

  function renderQuestion(index) {
    const q = questions[index];
    // normalize correctIndices to an array of numbers (works if it's a single number/string or an array)
let correctIndicesRaw = q.correctIndices;
if (correctIndicesRaw === undefined || correctIndicesRaw === null) {
  correctIndicesRaw = [];
} else if (!Array.isArray(correctIndicesRaw)) {
  correctIndicesRaw = [correctIndicesRaw];
}
const correctIndices = correctIndicesRaw.map(Number);

    app.innerHTML = `
      <div class="question border rounded-lg p-4 shadow mb-4">
        <h2 class="font-normal mb-3">Q${index + 1}. ${q.question}</h2>

        ${q.question_type === "Single Choice" || q.question_type === "Multiple Choice" ? `
          <ul class="space-y-2">
            ${q.options.map((opt, i) => `
              <li class="option cursor-pointer border rounded p-2 hover:bg-gray-100/10"
                  data-index="${i}">
                <span class="latex-option">${opt}</span>
              </li>
            `).join("")}
          </ul>
        ` : ""}

        ${q.question_type === "Integer Type" ? `
          <div class="mt-3">
            <input type="text" class="integer-input border rounded p-2 w-32" placeholder="Enter answer" />
            <button class="check-int bg-blue-500 text-white px-3 py-1 rounded ml-2">Check</button>
          </div>
        ` : ""}

        <div class="solution mt-4 hidden">
          <strong>Solution:</strong> ${q.solution}
        </div>
      </div>

      <div class="flex justify-between mt-6">
        <button id="prev-btn" class="px-4 py-2 bg-gray-200 rounded" ${index === 0 ? "disabled" : ""}>Previous</button>
        <button id="next-btn" class="px-4 py-2 bg-blue-500 text-white rounded" ${index === questions.length - 1 ? "disabled" : ""}>Next</button>
      </div>
    `;

  // -------------------
// Single Choice
// -------------------
if (q.question_type === "Single Choice") {
  const questionDiv = app.querySelector(".question");
  const solution = questionDiv.querySelector(".solution");
  const correctIndex = Number((q.correctIndices || [])[0]);
  let locked = false;

  questionDiv.addEventListener("click", (e) => {
    const opt = e.target.closest(".option");
    if (!opt || locked) return;

    const idx = Number(opt.dataset.index);

    if (idx === correctIndex) {
      opt.classList.add("border-green-400", "bg-green-100");
    } else {
      opt.classList.add("border-red-400", "bg-red-100");
      const correctOpt = questionDiv.querySelector(`.option[data-index="${correctIndex}"]`);
      if (correctOpt) correctOpt.classList.add("border-green-400", "bg-green-100");
    }

    solution.classList.remove("hidden");
    locked = true;
  });
}

// -------------------
// Multiple Choice
// -------------------
if (q.question_type === "Multiple Choice") {
  const questionDiv = app.querySelector(".question");
  const solution = questionDiv.querySelector(".solution");
  const correctSet = new Set(Array.isArray(q.correctIndices) ? q.correctIndices.map(Number) : []);
  const selectedCorrect = new Set();
  let locked = false;

  questionDiv.addEventListener("click", (e) => {
    const opt = e.target.closest(".option");
    if (!opt || locked) return;

    const idx = Number(opt.dataset.index);

    if (!correctSet.has(idx)) {
      // Wrong choice → mark wrong + reveal all corrects
      opt.classList.add("border-red-400", "bg-red-100");
      correctSet.forEach(ci => {
        const correctOpt = questionDiv.querySelector(`.option[data-index="${ci}"]`);
        if (correctOpt) correctOpt.classList.add("border-green-400", "bg-green-100");
      });
      solution.classList.remove("hidden");
      locked = true;
      return;
    }

    // Correct choice → mark green
    if (!selectedCorrect.has(idx)) {
      selectedCorrect.add(idx);
      opt.classList.add("border-green-400", "bg-green-100");
    }

    // If all corrects are selected → reveal solution & lock
    let allPicked = true;
    correctSet.forEach(ci => {
      if (!selectedCorrect.has(ci)) allPicked = false;
    });

    if (allPicked) {
      solution.classList.remove("hidden");
      locked = true;
    }
  });
}


    // -------------------
    // Integer Type
    // -------------------
    if (q.question_type === "Integer Type") {
      const solution = app.querySelector(".solution");
      const inputEl = app.querySelector(".integer-input");
      const btn = app.querySelector(".check-int");

      btn?.addEventListener("click", () => {
        if (!solution.classList.contains("hidden")) return;

        const val = (inputEl.value || "").trim();
        inputEl.classList.remove("border-green-400", "border-red-400");

        if (val === (q.numerical_answer || "").toString()) {
          inputEl.classList.add("border-green-400");
        } else {
          inputEl.classList.add("border-red-400");
        }

        solution.classList.remove("hidden");
        inputEl.disabled = true;
        btn.disabled = true;

        if (window.MathJax) MathJax.typesetPromise();
      });
    }

    // -------------------
    // Navigation buttons
    // -------------------
    app.querySelector("#prev-btn")?.addEventListener("click", () => {
      if (currentIndex > 0) {
        currentIndex--;
        renderQuestion(currentIndex);
      }
    });

    app.querySelector("#next-btn")?.addEventListener("click", () => {
      if (currentIndex < questions.length - 1) {
        currentIndex++;
        renderQuestion(currentIndex);
      }
    });

    // Render LaTeX
    if (window.MathJax) {
      MathJax.typesetPromise();
    }
  }

  // Initial render
  renderQuestion(currentIndex);
});
