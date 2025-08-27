// /js/practice.js
document.addEventListener("DOMContentLoaded", () => {
  const dataEl = document.getElementById("practice-data");
  if (!dataEl) return;

  let questions = [];
  try {
    questions = JSON.parse(dataEl.textContent || "[]");
  } catch (err) {
    console.error("Failed to parse practice-data JSON:", err);
    questions = [];
  }

  const app = document.getElementById("practice-app");
  if (!app) return;

  let currentIndex = 0;

  // Normalize correctIndices into zero-based numeric indices
  function normalizeCorrectIndices(raw, optionCount) {
    if (raw == null) return [];
    const arr = Array.isArray(raw) ? raw.slice() : [raw];

    const mapped = arr.map(v => {
      if (typeof v === "number" && Number.isFinite(v)) return v;
      if (typeof v === "string") {
        const s = v.trim();
        // Single letter like "A", "b" -> 0-based index
        if (/^[A-Za-z]$/.test(s)) {
          return s.toUpperCase().charCodeAt(0) - "A".charCodeAt(0);
        }
        const n = Number(s);
        if (Number.isFinite(n)) return n;
      }
      return NaN;
    }).filter(n => Number.isFinite(n));

    if (mapped.length === 0) return [];

    const allWithinOneBased = mapped.every(n => n >= 1 && n <= optionCount);
    const allWithinZeroBased = mapped.every(n => n >= 0 && n < optionCount);
    const hasZero = mapped.some(n => n === 0);

    let indices = mapped.slice();
    // If values look 1-based (1..optionCount) and there is no 0 value, shift down
    if (!hasZero && allWithinOneBased && !allWithinZeroBased) {
      indices = indices.map(n => n - 1);
    }

    // Keep only valid indices and dedupe
    return Array.from(new Set(indices.filter(n => n >= 0 && n < optionCount)));
  }

  function renderQuestion(index) {
    const q = questions[index];
    if (!q) {
      app.innerHTML = `<p>No question found.</p>`;
      return;
    }

    const optionCount = Array.isArray(q.options) ? q.options.length : 0;
    const correctIndices = normalizeCorrectIndices(q.correctIndices, optionCount);

    // Render HTML
    app.innerHTML = `
      <div class="question border rounded-lg p-4 shadow mb-4" data-qtype="${q.question_type || ""}">
        <h2 class="font-normal mb-3">Q${index + 1}. ${q.question || ""}</h2>

        ${q.question_type === "Single Choice" || q.question_type === "Multiple Choice" ? `
          <ul class="space-y-2">
            ${(q.options || []).map((opt, i) => `
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
          <strong>Solution:</strong> ${q.solution || ""}
        </div>
      </div>

      <div class="flex justify-between mt-6">
        <button id="prev-btn" class="px-4 py-2 bg-gray-200 rounded" ${index === 0 ? "disabled" : ""}>Previous</button>
        <button id="next-btn" class="px-4 py-2 bg-blue-500 text-white rounded" ${index === questions.length - 1 ? "disabled" : ""}>Next</button>
      </div>
    `;

    const questionDiv = app.querySelector(".question");
    const solutionEl = questionDiv.querySelector(".solution");
    const optionEls = Array.from(questionDiv.querySelectorAll(".option"));

    // Small debug log — remove if you don't want console messages
    // console.log("Rendering Q", index, "correctIndices(normalized) =", correctIndices);

    // Helper to reveal all correct options (marks green)
    function revealAllCorrect() {
      correctIndices.forEach(ci => {
        const co = questionDiv.querySelector(`.option[data-index="${ci}"]`);
        if (co) co.classList.add("border-green-400", "bg-green-100");
      });
    }

    // ---------- Single Choice ----------
    if (q.question_type === "Single Choice") {
      let locked = false;
      const correctIndex = correctIndices[0]; // may be undefined if not provided

      optionEls.forEach(optEl => {
        optEl.addEventListener("click", () => {
          if (locked) return;
          const idx = Number(optEl.dataset.index);

          // If there is no correctIndex, treat any click as "wrong" (but reveal nothing)
          if (typeof correctIndex === "number") {
            if (idx === correctIndex) {
              optEl.classList.add("border-green-400", "bg-green-100");
            } else {
              optEl.classList.add("border-red-400", "bg-red-100");
              revealAllCorrect();
            }
          } else {
            // no correct provided: mark clicked as red and show solution
            optEl.classList.add("border-red-400", "bg-red-100");
          }

          solutionEl.classList.remove("hidden");
          locked = true;
        });
      });
    }

    // ---------- Multiple Choice ----------
    if (q.question_type === "Multiple Choice") {
      let locked = false;
      const correctSet = new Set(correctIndices);
      const selectedCorrect = new Set();

      optionEls.forEach(optEl => {
        optEl.addEventListener("click", () => {
          if (locked) return;
          const idx = Number(optEl.dataset.index);

          // Wrong choice clicked -> mark wrong, reveal all corrects, show solution, lock
          if (!correctSet.has(idx)) {
            optEl.classList.add("border-red-400", "bg-red-100");
            revealAllCorrect();
            solutionEl.classList.remove("hidden");
            locked = true;
            return;
          }

          // Correct choice -> mark green and allow continuing
          if (!selectedCorrect.has(idx)) {
            selectedCorrect.add(idx);
            optEl.classList.add("border-green-400", "bg-green-100");
          }

          // If all correct picked -> reveal solution & lock
          if (selectedCorrect.size === correctSet.size && correctSet.size > 0) {
            solutionEl.classList.remove("hidden");
            locked = true;
          }
        });
      });
    }

    // ---------- Integer Type ----------
    if (q.question_type === "Integer Type") {
      const inputEl = questionDiv.querySelector(".integer-input");
      const btn = questionDiv.querySelector(".check-int");
      btn?.addEventListener("click", () => {
        if (!solutionEl.classList.contains("hidden")) return;

        const val = (inputEl.value || "").trim();
        inputEl.classList.remove("border-green-400", "border-red-400");

        const expected = (q.numerical_answer || "").toString().trim();
        if (expected !== "" && val === expected) {
          inputEl.classList.add("border-green-400");
        } else {
          inputEl.classList.add("border-red-400");
        }

        solutionEl.classList.remove("hidden");
        inputEl.disabled = true;
        btn.disabled = true;

        if (window.MathJax && MathJax.typesetPromise) {
          MathJax.typesetPromise().catch(() => {});
        }
      });
    }

    // ---------- Navigation ----------
    const prevBtn = app.querySelector("#prev-btn");
    const nextBtn = app.querySelector("#next-btn");

    prevBtn?.addEventListener("click", () => {
      if (currentIndex > 0) {
        currentIndex--;
        renderQuestion(currentIndex);
      }
    });

    nextBtn?.addEventListener("click", () => {
      if (currentIndex < questions.length - 1) {
        currentIndex++;
        renderQuestion(currentIndex);
      }
    });

    // Re-render LaTeX if MathJax is present
    if (window.MathJax && MathJax.typesetPromise) {
      MathJax.typesetPromise().catch(() => {});
    }
  }

  // initial render
  renderQuestion(currentIndex);
});
