document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("practice-app");
  if (!container) return;

  let questions = [];
  let current = 0;

  try {
    const rawData = document.getElementById("practice-data").textContent;
    questions = JSON.parse(rawData);

    // ✅ Normalize all correctIndices once at load time
    questions = questions.map(q => {
      if (q.question_type === "Single Choice" || q.question_type === "Multiple Choice") {
        const options = Array.isArray(q.options) ? q.options : [];
        const optionCount = options.length;
        q.correctIndices = normalizeCorrectIndices(q.correctIndices, optionCount, options);
      }
      return q;
    });

  } catch (e) {
    container.innerHTML = `<p class="text-red-500">Error loading questions.</p>`;
    return;
  }

  if (!questions.length) {
    container.innerHTML = `<p>No questions found.</p>`;
    return;
  }

  renderQuestion();

  // ----------------- FUNCTIONS -------------------

  function normalizeCorrectIndices(correctIndices, optionCount, options) {
    if (!correctIndices) return [];
    let normalized = [];

    // If it's a number
    if (typeof correctIndices === "number") {
      return [correctIndices];
    }

    // If it's a string
    if (typeof correctIndices === "string") {
      // Try to parse as int
      const num = parseInt(correctIndices, 10);
      if (!isNaN(num)) {
        return [num];
      }
      // Check if it's a letter (A/B/C/D)
      const letterMatch = correctIndices.trim().match(/^[A-Za-z]$/);
      if (letterMatch) {
        return [letterMatch[0].toUpperCase().charCodeAt(0) - 65];
      }
    }

    // If it's an array
    if (Array.isArray(correctIndices)) {
      correctIndices.forEach(ci => {
        if (typeof ci === "number") {
          normalized.push(ci);
        } else if (typeof ci === "string") {
          const num = parseInt(ci, 10);
          if (!isNaN(num)) {
            normalized.push(num);
          } else {
            const letterMatch = ci.trim().match(/^[A-Za-z]$/);
            if (letterMatch) {
              normalized.push(letterMatch[0].toUpperCase().charCodeAt(0) - 65);
            }
          }
        } else if (typeof ci === "object" && ci.index !== undefined) {
          normalized.push(parseInt(ci.index, 10));
        }
      });
    }

    // Filter invalid indices
    normalized = normalized.filter(n => !isNaN(n) && n >= 0 && n < optionCount);
    return normalized;
  }

  function renderQuestion() {
    const q = questions[current];
    const normalized = q.correctIndices || [];

    let html = `
      <div class="p-4 border rounded shadow mb-4 bg-white">
        <div class="mb-3 font-medium">${q.question}</div>
    `;

    if (q.question_type === "Single Choice" || q.question_type === "Multiple Choice") {
      html += `<div class="space-y-2">`;
      q.options.forEach((opt, idx) => {
        html += `
          <button data-idx="${idx}" class="w-full text-left px-3 py-2 border rounded hover:bg-gray-50">
            ${opt}
          </button>`;
      });
      html += `</div>`;
    } else if (q.question_type === "Integer Type") {
      html += `
        <input type="text" id="answer-input" class="border px-2 py-1 rounded w-32" placeholder="Your answer">
        <button id="submit-answer" class="ml-2 px-3 py-1 bg-blue-500 text-white rounded">Submit</button>
      `;
    }

    html += `
      <div id="solution" class="hidden mt-3 p-2 border-t">${q.solution}</div>
      <div class="flex justify-between mt-4">
        <button id="prev" class="px-3 py-1 bg-gray-200 rounded">Prev</button>
        <button id="next" class="px-3 py-1 bg-gray-200 rounded">Next</button>
      </div>
    </div>
    `;

    container.innerHTML = html;

    // Option click handler
    if (q.question_type === "Single Choice" || q.question_type === "Multiple Choice") {
      const buttons = container.querySelectorAll("button[data-idx]");
      buttons.forEach(btn => {
        btn.addEventListener("click", () => {
          const idx = parseInt(btn.dataset.idx, 10);
          if (q.question_type === "Single Choice") {
            const correctIndex = normalized[0];
            buttons.forEach((optEl, i) => {
              optEl.disabled = true;
              if (i === correctIndex) {
                optEl.classList.add("border-green-400", "bg-green-100");
              } else if (i === idx) {
                optEl.classList.add("border-red-400", "bg-red-100");
              }
            });
          } else {
            // Multiple Choice
            btn.classList.toggle("ring-2");
            const selected = Array.from(buttons)
              .filter(b => b.classList.contains("ring-2"))
              .map(b => parseInt(b.dataset.idx, 10));
            if (arraysEqual(new Set(selected), new Set(normalized))) {
              buttons.forEach((optEl, i) => {
                if (normalized.includes(i)) {
                  optEl.classList.add("border-green-400", "bg-green-100");
                }
              });
            }
          }
          document.getElementById("solution").classList.remove("hidden");
        });
      });
    }

    // Integer type handler
    if (q.question_type === "Integer Type") {
      document.getElementById("submit-answer").addEventListener("click", () => {
        const ans = document.getElementById("answer-input").value.trim();
        if (ans === q.numerical_answer) {
          alert("Correct!");
        } else {
          alert("Incorrect.");
        }
        document.getElementById("solution").classList.remove("hidden");
      });
    }

    // Nav
    document.getElementById("prev").addEventListener("click", () => {
      if (current > 0) {
        current--;
        renderQuestion();
      }
    });
    document.getElementById("next").addEventListener("click", () => {
      if (current < questions.length - 1) {
        current++;
        renderQuestion();
      }
    });
  }

  function arraysEqual(a, b) {
    if (a.size !== b.size) return false;
    for (const val of a) if (!b.has(val)) return false;
    return true;
  }
});
