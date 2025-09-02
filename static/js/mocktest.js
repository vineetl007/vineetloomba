document.addEventListener("DOMContentLoaded", () => {
  const dataEl = document.getElementById("mocktest-data");
  if (!dataEl) return;

  const allQuestions = JSON.parse(dataEl.textContent);
  let currentIndex = 0;
  let selectedSubject = "ALL";
  let answers = {};  // {index: {selected:[], marked:false, visited:true}}
  let submitted = false;

  const app = document.getElementById("mocktest-app");
  const palette = document.getElementById("question-palette");
  const timerEl = document.getElementById("timer");

  const subjects = Array.from(new Set(allQuestions.map(q => q.subject)));

  // Add Subject Tabs
  const tabContainer = document.createElement("div");
  tabContainer.className = "flex gap-4 mb-4 justify-center";
  tabContainer.innerHTML = `
    <button data-subject="ALL" class="subject-tab bg-blue-700 text-white px-4 py-2 rounded">All</button>
    ${subjects.map(s => `<button data-subject="${s}" class="subject-tab bg-gray-700 text-white px-4 py-2 rounded">${s}</button>`).join("")}
  `;
  app.parentElement.insertBefore(tabContainer, app);

  // Helpers
  function getFilteredQuestions() {
    return selectedSubject === "ALL" ? allQuestions : allQuestions.filter(q => q.subject === selectedSubject);
  }

  function getAnswerState(index) {
    return answers[index] || { visited: false, selected: [], marked: false };
  }

  // Timer
  const durationMinutes = 180;
  const endTime = Date.now() + durationMinutes * 60 * 1000;
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

  // Palette
  function renderPalette() {
    const questions = getFilteredQuestions();
    palette.innerHTML = questions.map((q, i) => {
      const globalIndex = allQuestions.indexOf(q);
      const state = getAnswerState(globalIndex);
      let color = "bg-gray-700"; // not visited
      if (state.marked) color = "bg-purple-600";
      else if (state.selected.length > 0) color = "bg-green-600";
      else if (state.visited) color = "bg-white text-black";

      return `<button data-global="${globalIndex}" class="palette-btn w-10 h-10 rounded-full ${color} hover:bg-blue-500">${i + 1}</button>`;
    }).join("");

    palette.querySelectorAll(".palette-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        currentIndex = parseInt(btn.dataset.global);
        renderQuestion(currentIndex);
      });
    });
  }

  // Render Question
  function renderQuestion(globalIndex) {
    const q = allQuestions[globalIndex];
    if (!q) return;

    // update visited state
    answers[globalIndex] = {
      ...getAnswerState(globalIndex),
      visited: true
    };

    const state = getAnswerState(globalIndex);
    const rawQ = String(q.question || "");
    const questionHtml = rawQ.split(/\n\s*\n/).map(p => `<p>${p.replace(/\n/g, "<br>")}</p>`).join("");

    const isMulti = q.question_type === "Multiple Choice";
    const isInteger = q.question_type === "Integer Type";

    app.innerHTML = `
      <div class="question border rounded-lg p-4 shadow mb-4">
        <div class="flex justify-between items-center mb-3">
          <h2 class="font-bold">Q${globalIndex + 1} <span class="text-sm text-yellow-300 ml-2">[${q.subject}]</span></h2>
          <button id="mark-btn" class="px-3 py-1 rounded ${state.marked ? 'bg-purple-600' : 'bg-gray-700'} text-white">Mark for Review</button>
        </div>
        <div class="question-text mb-3">${questionHtml}</div>
        ${
          isInteger
            ? `<input id="int-answer" type="text" class="border rounded p-2 w-32 bg-gray-800 text-white" value="${state.selected[0] || ''}" />`
            : `<ul class="space-y-2">
                ${q.options.map((opt, i) => `
                  <li class="option cursor-pointer border rounded p-2 hover:bg-gray-100/10 ${state.selected.includes(i) ? 'bg-blue-600' : ''}" data-index="${i}">
                    ${opt}
                  </li>`).join("")}
              </ul>`
        }

        <div class="solution mt-4 hidden">${q.solution}</div>

        <div class="flex justify-between mt-6">
          <button id="prev-btn" class="px-4 py-2 bg-blue-500 rounded" ${globalIndex === 0 ? 'style="display:none"' : ""}>Previous</button>
          <button id="next-btn" class="px-4 py-2 bg-blue-500 rounded" ${globalIndex === allQuestions.length - 1 ? 'style="display:none"' : ""}>Next</button>
        </div>
      </div>
    `;

    // Selection
    if (!isInteger) {
      app.querySelectorAll(".option").forEach(opt => {
        opt.addEventListener("click", () => {
          const idx = parseInt(opt.dataset.index);
          let selected = [...state.selected];
          if (isMulti) {
            selected = selected.includes(idx) ? selected.filter(i => i !== idx) : [...selected, idx];
          } else {
            selected = [idx];
          }
          answers[globalIndex] = { ...state, selected };
          renderQuestion(globalIndex); // re-render to update UI
          renderPalette();
        });
      });
    } else {
      app.querySelector("#int-answer").addEventListener("input", e => {
        answers[globalIndex] = { ...state, selected: [e.target.value.trim()] };
        renderPalette();
      });
    }

    // Mark for Review toggle
    app.querySelector("#mark-btn").addEventListener("click", () => {
      answers[globalIndex] = { ...state, marked: !state.marked };
      renderQuestion(globalIndex);
      renderPalette();
    });

    app.querySelector("#prev-btn")?.addEventListener("click", () => {
      if (globalIndex > 0) {
        currentIndex = globalIndex - 1;
        renderQuestion(currentIndex);
      }
    });
    app.querySelector("#next-btn")?.addEventListener("click", () => {
      if (globalIndex < allQuestions.length - 1) {
        currentIndex = globalIndex + 1;
        renderQuestion(currentIndex);
      }
    });

    if (window.MathJax) MathJax.typesetPromise();
    renderPalette();
  }

  function submitTest() {
    submitted = true;
    alert("Test Submitted! Now show analysis page here.");
    // In analysis mode: re-render all questions with correct/incorrect colors
    // You can redirect to a new page or re-render with solution visible.
  }

  document.getElementById("submit-test").addEventListener("click", submitTest);

  // Subject Tab Clicks
  tabContainer.querySelectorAll(".subject-tab").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedSubject = btn.dataset.subject;
      renderPalette();
      renderQuestion(allQuestions.findIndex(q => selectedSubject === "ALL" || q.subject === selectedSubject));
      tabContainer.querySelectorAll(".subject-tab").forEach(b => b.classList.remove("bg-blue-700"));
      btn.classList.add("bg-blue-700");
    });
  });

  renderPalette();
  renderQuestion(currentIndex);
});
