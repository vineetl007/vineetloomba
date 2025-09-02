document.addEventListener("DOMContentLoaded", () => {
  const dataEl = document.getElementById("mocktest-data");
  if (!dataEl) return;

  const allQuestions = JSON.parse(dataEl.textContent);
  let currentIndex = 0;
  let selectedSubject = "ALL"; // default
  let answers = {};
  let startTime = Date.now();
  const durationMinutes = 180;
  const endTime = startTime + durationMinutes * 60 * 1000;

  const app = document.getElementById("mocktest-app");
  const palette = document.getElementById("question-palette");
  const timerEl = document.getElementById("timer");

  // ---- SUBJECT TABS ----
  const subjects = Array.from(new Set(allQuestions.map(q => q.subject)));
  const tabContainer = document.createElement("div");
  tabContainer.className = "flex gap-4 mb-4 justify-center";
  tabContainer.innerHTML = `
    <button data-subject="ALL" class="subject-tab bg-blue-700 text-white px-4 py-2 rounded">All</button>
    ${subjects.map(s => `
      <button data-subject="${s}" class="subject-tab bg-gray-700 text-white px-4 py-2 rounded">${s}</button>
    `).join("")}
  `;
  app.parentElement.insertBefore(tabContainer, app);

  // ---- FILTER FUNCTION ----
  function getFilteredQuestions() {
    return selectedSubject === "ALL"
      ? allQuestions
      : allQuestions.filter(q => q.subject === selectedSubject);
  }

  // ---- TIMER ----
  function updateTimer() {
    const now = Date.now();
    const remaining = Math.max(0, endTime - now);
    const hrs = String(Math.floor(remaining / 3600000)).padStart(2, "0");
    const mins = String(Math.floor((remaining % 3600000) / 60000)).padStart(2, "0");
    const secs = String(Math.floor((remaining % 60000) / 1000)).padStart(2, "0");
    timerEl.textContent = `${hrs}:${mins}:${secs}`;
    if (remaining <= 0) submitTest();
    else requestAnimationFrame(updateTimer);
  }
  updateTimer();

  // ---- PALETTE ----
  function renderPalette() {
    const questions = getFilteredQuestions();
    palette.innerHTML = questions
      .map((q, i) => `
        <button data-index="${i}" 
          class="palette-btn w-10 h-10 rounded-full bg-gray-700 text-white hover:bg-blue-500 transition">
          ${i + 1}
        </button>
      `).join("");

    palette.querySelectorAll(".palette-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        currentIndex = parseInt(btn.dataset.index);
        renderQuestion(currentIndex);
      });
    });
  }

  // ---- QUESTION RENDER ----
  function renderQuestion(index) {
    const questions = getFilteredQuestions();
    const q = questions[index];
    if (!q) return;

    palette.querySelectorAll(".palette-btn").forEach((btn, i) => {
      btn.classList.toggle("bg-yellow-500", i === index);
    });

    const rawQ = String(q.question || "");
    const questionHtml = rawQ
      .split(/\n\s*\n/)
      .map(p => `<p>${p.replace(/\n/g, "<br>")}</p>`)
      .join("");

    const isMulti = q.question_type === "Multiple Choice";
    const isInteger = q.question_type === "Integer Type";
    let selectedIndices = [];

    app.innerHTML = `
      <div class="question border rounded-lg p-4 shadow mb-4">
        <div class="flex justify-between items-center mb-3">
          <h2 class="font-bold">Q${index + 1} 
            <span class="text-sm text-yellow-300 ml-2">[${q.subject}]</span>
          </h2>
        </div>
        <div class="question-text mb-3">${questionHtml}</div>

        ${
          isInteger
            ? `
              <div class="flex items-center space-x-2">
                <input id="int-answer" type="text" 
                       class="border rounded p-2 w-32 bg-gray-800 text-white" 
                       placeholder="Enter answer" />
                <button id="check-btn" class="px-4 py-2 bg-blue-500 text-white rounded">
                  Submit
                </button>
              </div>
            `
            : `
              <ul class="space-y-2">
                ${q.options.map((opt, i) => `
                  <li class="option cursor-pointer border rounded p-2 hover:bg-gray-100/10"
                      data-index="${i}" data-correct="${q.correctIndices.includes(i)}">
                    <span class="latex-option">${opt}</span>
                  </li>
                `).join("")}
              </ul>
            `
        }

        <div class="solution mt-4 hidden">
          <strong>Solution:</strong> ${q.solution}
        </div>

        <div class="flex justify-between mt-6">
          <button id="prev-btn" class="px-4 py-2 bg-blue-500 rounded" ${index === 0 ? 'style="display:none"' : ""}>Previous</button>
          <button id="next-btn" class="px-4 py-2 bg-blue-500 rounded" ${index === questions.length - 1 ? 'style="display:none"' : ""}>Next</button>
        </div>
      </div>
    `;

    // Options behavior
    if (!isInteger) {
      app.querySelectorAll(".option").forEach(opt => {
        opt.addEventListener("click", () => {
          const solution = app.querySelector(".solution");
          const correct = opt.dataset.correct === "true";
          const optionIndex = parseInt(opt.dataset.index);

          if (!isMulti) {
            app.querySelectorAll(".option").forEach(o => {
              o.classList.remove("border-green-400", "border-red-400");
            });
            if (correct) opt.classList.add("border-green-400");
            else {
              opt.classList.add("border-red-400");
              const correctOption = Array.from(app.querySelectorAll(".option"))
                .find(o => o.dataset.correct === "true");
              if (correctOption) correctOption.classList.add("border-green-400");
            }
            solution.classList.remove("hidden");
          } else {
            if (!correct) {
              opt.classList.add("border-red-400");
              app.querySelectorAll(".option").forEach(o => {
                if (o.dataset.correct === "true") o.classList.add("border-green-400");
              });
              solution.classList.remove("hidden");
            } else {
              if (!selectedIndices.includes(optionIndex)) {
                selectedIndices.push(optionIndex);
                opt.classList.add("border-green-400");
              }
              const allCorrect = Array.from(app.querySelectorAll(".option"))
                .filter(o => o.dataset.correct === "true")
                .every(o => selectedIndices.includes(parseInt(o.dataset.index)));
              if (allCorrect) solution.classList.remove("hidden");
            }
          }
        });
      });
    }

    if (isInteger) {
      const input = app.querySelector("#int-answer");
      const checkBtn = app.querySelector("#check-btn");
      const solution = app.querySelector(".solution");
      checkBtn.addEventListener("click", () => {
        if (input.value.trim() === (q.numerical_answer || "").trim()) {
          input.classList.add("border-green-400");
        } else {
          input.classList.add("border-red-400");
        }
        solution.classList.remove("hidden");
        input.disabled = true;
        checkBtn.disabled = true;
      });
    }

    // Navigation
    app.querySelector("#prev-btn")?.addEventListener("click", () => {
      if (currentIndex > 0) {
        currentIndex--;
        renderQuestion(currentIndex);
      }
    });
    app.querySelector("#next-btn")?.addEventListener("click", () => {
      const questions = getFilteredQuestions();
      if (currentIndex < questions.length - 1) {
        currentIndex++;
        renderQuestion(currentIndex);
      }
    });

    if (window.MathJax) MathJax.typesetPromise();
  }

  function submitTest() {
    alert("Test submitted! (Scoring logic will be added here)");
  }

  document.getElementById("submit-test").addEventListener("click", submitTest);

  // Event for subject tabs
  tabContainer.querySelectorAll(".subject-tab").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedSubject = btn.dataset.subject;
      currentIndex = 0;
      renderPalette();
      renderQuestion(currentIndex);
      tabContainer.querySelectorAll(".subject-tab").forEach(b =>
        b.classList.remove("bg-blue-700"));
      btn.classList.add("bg-blue-700");
    });
  });

  renderPalette();
  renderQuestion(currentIndex);
});
