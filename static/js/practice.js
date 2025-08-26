document.addEventListener("DOMContentLoaded", function () {
  let container = document.getElementById("practice-container");
  let raw = document.getElementById("questions-data");

  if (!container || !raw) return;

  let questions = JSON.parse(raw.textContent);
  let index = 0;

  function renderQuestion() {
    let q = questions[index];
    container.innerHTML = `
      <div class="question border rounded-lg p-4 mb-6 shadow">
        <h2 class="font-semibold mb-4">Q${index + 1}. ${q.question}</h2>
        <ul class="space-y-2">
          ${q.options
            .map(
              (opt, i) => `
            <li class="option cursor-pointer border rounded p-2 hover:bg-gray-100"
                data-correct="${q.correctIndices.includes(i)}">
              ${opt}
            </li>`
            )
            .join("")}
        </ul>
        <div class="solution mt-4 hidden text-green-700">
          <strong>Solution:</strong> ${q.solution}
        </div>
        <div class="flex justify-between mt-6">
          <button id="prevQ" class="px-4 py-2 rounded bg-gray-200">Prev</button>
          <button id="nextQ" class="px-4 py-2 rounded bg-gray-200">Next</button>
        </div>
      </div>
    `;

    // option click handler
    container.querySelectorAll(".option").forEach((opt) => {
      opt.addEventListener("click", () => {
        let solution = container.querySelector(".solution");
        if (opt.dataset.correct === "true") {
          opt.classList.add("bg-green-100", "border-green-400");
        } else {
          opt.classList.add("bg-red-100", "border-red-400");
        }
        solution.classList.remove("hidden");
      });
    });

    // navigation buttons
    document.getElementById("prevQ").addEventListener("click", () => {
      if (index > 0) {
        index--;
        renderQuestion();
      }
    });
    document.getElementById("nextQ").addEventListener("click", () => {
      if (index < questions.length - 1) {
        index++;
        renderQuestion();
      }
    });
  }

  renderQuestion();
});
