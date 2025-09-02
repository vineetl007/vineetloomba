document.addEventListener("DOMContentLoaded", () => {
  const dataEl = document.getElementById("mocktest-data");
  if (!dataEl) return;

  const questions = JSON.parse(dataEl.textContent);
  let currentIndex = 0;
  let answers = {}; // store selected answers
  let startTime = Date.now();
  const durationMinutes = 180; // 3 hr mock test (configurable)
  const endTime = startTime + durationMinutes * 60 * 1000;

  const app = document.getElementById("mocktest-app");
  const palette = document.getElementById("question-palette");
  const timerEl = document.getElementById("timer");

  // ---- TIMER ----
  function updateTimer() {
    const now = Date.now();
    const remaining = Math.max(0, endTime - now);
    const hrs = String(Math.floor(remaining / 3600000)).padStart(2, "0");
    const mins = String(Math.floor((remaining % 3600000) / 60000)).padStart(2, "0");
    const secs = String(Math.floor((remaining % 60000) / 1000)).padStart(2, "0");
    timerEl.textContent = `${hrs}:${mins}:${secs}`;

    if (remaining <= 0) {
      submitTest();
    } else {
      requestAnimationFrame(updateTimer);
    }
  }
  updateTimer();

  // ---- PALETTE ----
  function renderPalette() {
    palette.innerHTML = questions
      .map((q, i) => `
        <button data-index="${i}" 
          class="palette-btn w-10 h-10 rounded-full bg-gray-700 text-white hover:bg-blue-500 transition">
          ${i + 1}
        </button>
      `)
      .join("");

    palette.querySelectorAll(".palette-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        currentIndex = parseInt(btn.dataset.index);
        renderQuestion(currentIndex);
      });
    });
  }

  // ---- QUESTION RENDER ---- (reuse practice.js logic)
  function renderQuestion(index) {
    const q = questions[index];

    // Mark selected in palette
    palette.querySelectorAll(".palette-btn").forEach((btn, i) => {
      btn.classList.toggle("bg-yellow-500", i === index);
    });

    // Render using same logic as practice.js (only slightly trimmed)
    const rawQ = String(q.question || "");
    const questionHtml = rawQ
      .split(/\n\s*\n/)
      .map(p => `<p>${p.replace(/\n/g, "<br>")}</p>`)
      .join("");

    app.innerHTML = `
      <div class="question border rounded-lg p-4 shadow mb-4">
        <div class="flex justify-between items-center mb-3">
          <h2 class="font-bold">Q${index + 1} <span class="text-sm text-yellow-300 ml-2">[${q.subject}]</span></h2>
        </div>
        <div class="question-text mb-3">${questionHtml}</div>
      </div>
    `;

    // TODO: reuse options, integer input, solution logic from practice.js
    // (You can copy the same rendering block you already have)

    if (window.MathJax) MathJax.typesetPromise();
  }

  function submitTest() {
    alert("Time's up! Submitting test...");
    // TODO: Evaluate answers, show result popup with score/rank
  }

  document.getElementById("submit-test").addEventListener("click", submitTest);

  renderPalette();
  renderQuestion(currentIndex);
});
