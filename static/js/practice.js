document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("practice-app");
  if (!container) return;

  let questions = [];
  let current = 0;

  try {
    const rawData = document.getElementById("practice-data").textContent;
    console.log("Raw Data:", rawData);
    questions = JSON.parse(rawData);

    // Normalize all correctIndices
    questions = questions.map((q, idx) => {
      console.log("Before normalization Q", idx, q.correctIndices);
      if (q.question_type === "Single Choice" || q.question_type === "Multiple Choice") {
        const options = Array.isArray(q.options) ? q.options : [];
        const optionCount = options.length;
        q.correctIndices = normalizeCorrectIndices(q.correctIndices, optionCount, options);
      }
      console.log("After normalization Q", idx, q.correctIndices);
      return q;
    });

  } catch (e) {
    console.error("Error parsing questions:", e);
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

    if (typeof correctIndices === "number") return [correctIndices];

    if (typeof correctIndices === "string") {
      const num = parseInt(correctIndices, 10);
      if (!isNaN(num)) return [num];
      const letterMatch = correctIndices.trim().match(/^[A-Za-z]$/);
      if (letterMatch) return [letterMatch[0].toUpperCase().charCodeAt(0) - 65];
    }

    if (Array.isArray(correctIndices)) {
      correctIndices.forEach(ci => {
        if (typeof ci === "number") normalized.push(ci);
        else if (typeof ci === "string") {
          const num = parseInt(ci, 10);
          if (!isNaN(num)) normalized.push(num);
          else {
            const letterMatch = ci.trim().match(/^[A-Za-z]$/);
            if (letterMatch) normalized.push(letterMatch[0].toUpperCase().charCodeAt(0) - 65);
          }
        } else if (typeof ci === "object" && ci.index !== undefined) {
          normalized.push(parseInt(ci.index, 10));
        }
      });
    }

    normalized = normalized.filter(n => !isNaN(n) && n >= 0 && n < optionCount);
    return normalized;
  }

  function renderQuestion() {
    const q = questions[current];
    console.log("Rendering question:", q);
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

    // Attach button logic safely
    if (q.question_type === "Single Choice" || q.question_type === "Multiple Choice") {
      const buttons = container.querySelectorAll("button[data-idx]");
      buttons.forEach(btn => {
        btn.addEventListener("click", () => {
          console.log("Clicked:", btn.dataset.idx, "C
