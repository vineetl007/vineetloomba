document.addEventListener("DOMContentLoaded", () => {
  const dataEl = document.getElementById("practice-data");
  if (!dataEl) return;

  const questions = JSON.parse(dataEl.textContent);
  let currentIndex = 0;
  const app = document.getElementById("practice-app");

  function renderQuestion(index) {
    const q = questions[index];
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
// -------------------
// Single Choice (new behavior + lock)
// -------------------
if (q.question_type === "Single Choice") {
  const questionDiv = app.querySelector(".question");
  const solution = questionDiv.querySelector(".solution");
  // make set of correct indices (handle strings/numbers)
  const correctSet = new Set((q.correctIndices || []).map(Number));
  // mark unlocked initially
  questionDiv.dataset.locked = "false";

  app.querySelectorAll(".option").forEach(opt => {
    opt.addEventListener("click", () => {
      // if already answered, ignore
      if (questionDiv.dataset.locked === "true") return;

      const idx = Number(opt.dataset.index);

      // clear previous borders
      questionDiv.querySelectorAll(".option").forEach(o => {
        o.classList.remove("border-green-400", "border-red-400");
      });

      if (correctSet.has(idx)) {
        // correct -> highlight it immediately
        opt.classList.add("border-green-400");
      } else {
        // wrong -> mark wrong, reveal ALL correct options
        opt.classList.add("border-red-400");
        correctSet.forEach(ci => {
          const correctOpt = questionDiv.querySelector(`.option[data-index="${ci}"]`);
          if (correctOpt) correctOpt.classList.add("border-green-400");
        });
      }

      // show solution and lock
      solution.classList.remove("hidden");
      questionDiv.dataset.locked = "true";

      // re-typeset any LaTeX if present
      if (window.MathJax) MathJax.typesetPromise();
    });
  });
}
// -------------------
// Multiple Choice (aggregate-correct until wrong OR all chosen, then lock)
// -------------------
if (q.question_type === "Multiple Choice") {
  const questionDiv = app.querySelector(".question");
  const solution = questionDiv.querySelector(".solution");
  const correctSet = new Set((q.correctIndices || []).map(Number));
  const selectedCorrect = new Set();
  questionDiv.dataset.locked = "false";

  app.querySelectorAll(".option").forEach(opt => {
    opt.addEventListener("click", () => {
      // if already answered, ignore
      if (questionDiv.dataset.locked === "true") return;

      const idx = Number(opt.dataset.index);

      // if user picks a wrong option -> reveal all correct answers & solution immediately
      if (!correctSet.has(idx)) {
        opt.classList.add("border-red-400");
        correctSet.forEach(ci => {
          const correctOpt = questionDiv.querySelector(`.option[data-index="${ci}"]`);
          if (correctOpt) correctOpt.classList.add("border-green-400");
        });
        solution.classList.remove("hidden");
        questionDiv.dataset.locked = "true";
        if (window.MathJax) MathJax.typesetPromise();
        return;
      }

      // picking a correct option: idempotent add (no deselect)
      if (!selectedCorrect.has(idx)) {
        selectedCorrect.add(idx);
        opt.classList.add("border-green-400");
      }

      // check whether all correct options are picked
      let allPicked = true;
      correctSet.forEach(ci => {
        if (!selectedCorrect.has(ci)) allPicked = false;
      });

      if (allPicked) {
        solution.classList.remove("hidden");
        questionDiv.dataset.locked = "true";
        if (window.MathJax) MathJax.typesetPromise();
      }
    });
  });
}

    // -------------------
    // Integer Type
    // -------------------
    if (q.question_type === "Integer Type") {
      const solution = app.querySelector(".solution");
      app.querySelector(".check-int").addEventListener("click", () => {
        const val = app.querySelector(".integer-input").value.trim();
        if (val === q.numerical_answer) {
          app.querySelector(".integer-input").classList.add("border-green-400");
        } else {
          app.querySelector(".integer-input").classList.add("border-red-400");
        }
        solution.classList.remove("hidden");
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
