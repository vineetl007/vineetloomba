document.addEventListener("DOMContentLoaded", () => {
  const dataEl = document.getElementById("practice-data");
  if (!dataEl) return;

  const questions = JSON.parse(dataEl.textContent);
  let currentIndex = 0;
  const app = document.getElementById("practice-app");

  function renderQuestion(index) {
    const q = questions[index];
    const isMulti = q.question_type === "Multiple Choice";
    let selectedIndices = [];

    app.innerHTML = `
      <div class="question border rounded-lg p-4 shadow mb-4">
        <h2 class="font-normal mb-3">Q${index + 1}. ${q.question}</h2>
        <ul class="space-y-2">
          ${q.options.map((opt, i) => `
            <li class="option cursor-pointer border rounded p-2 hover:bg-gray-100/10"
                data-index="${i}" data-correct="${q.correctIndices.includes(i)}">
              <span class="latex-option">${opt}</span>
            </li>
          `).join("")}
        </ul>
        <div class="solution mt-4 hidden text-green-700">
          <strong>Solution:</strong> ${q.solution}
        </div>
      </div>

      <div class="flex justify-between mt-6">
        <button id="prev-btn" class="px-4 py-2 bg-gray-200 rounded" ${index === 0 ? "disabled" : ""}>Previous</button>
        <button id="next-btn" class="px-4 py-2 bg-blue-500 text-white rounded" ${index === questions.length - 1 ? "disabled" : ""}>Next</button>
      </div>
    `;

    // ✅ Option click behavior (updated)
    app.querySelectorAll(".option").forEach(opt => {
      opt.addEventListener("click", () => {
        const questionDiv = opt.closest(".question");
        const solution = questionDiv.querySelector(".solution");
        const correct = opt.dataset.correct === "true";
        const optionIndex = parseInt(opt.dataset.index);

        if (!isMulti) {
          // ----- SINGLE CHOICE -----
          // Clear old highlights
          questionDiv.querySelectorAll(".option").forEach(o => {
            o.classList.remove("border-green-400", "border-red-400");
          });

          if (correct) {
            opt.classList.add("border-green-400");
          } else {
            opt.classList.add("border-red-400");
            const correctOption = Array.from(questionDiv.querySelectorAll(".option"))
              .find(o => o.dataset.correct === "true");
            if (correctOption) correctOption.classList.add("border-green-400");
          }

          solution.classList.remove("hidden");
          // Lock question
          questionDiv.querySelectorAll(".option").forEach(o => o.style.pointerEvents = "none");

        } else {
          // ----- MULTIPLE CHOICE -----
          if (!correct) {
            // wrong clicked → mark wrong + show all correct
            opt.classList.add("border-red-400");
            questionDiv.querySelectorAll(".option").forEach(o => {
              if (o.dataset.correct === "true") o.classList.add("border-green-400");
            });
            solution.classList.remove("hidden");
            questionDiv.querySelectorAll(".option").forEach(o => o.style.pointerEvents = "none");
          } else {
            // correct clicked
            if (!selectedIndices.includes(optionIndex)) {
              selectedIndices.push(optionIndex);
              opt.classList.add("border-green-400");
            }
            // check if all correct are chosen
            const allCorrect = Array.from(questionDiv.querySelectorAll(".option"))
              .filter(o => o.dataset.correct === "true")
              .every(o => selectedIndices.includes(parseInt(o.dataset.index)));

            if (allCorrect) {
              solution.classList.remove("hidden");
              questionDiv.querySelectorAll(".option").forEach(o => o.style.pointerEvents = "none");
            }
          }
        }
      });
    });

    // Navigation buttons
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

    // Render LaTeX after HTML is added
    if (window.MathJax) {
      MathJax.typesetPromise();
    }
  }

  // Render first question
  renderQuestion(currentIndex);
});
