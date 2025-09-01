document.addEventListener("DOMContentLoaded", () => {
  // --- DOM refs ---
  const appRoot = document.getElementById("mocktest-app");
  const sectionsEl = document.getElementById("sections");
  const timerEl = document.getElementById("timer");
  const questionContainer = document.getElementById("question-container");
  const paletteEl = document.getElementById("palette");
  const submitBtn = document.getElementById("submit-test");

  // --- Build qStore (maths/physics/chemistry) ---
  function buildQStore() {
    const store = { maths: [], physics: [], chemistry: [] };
    window.allQuestions.forEach(q => {
      const path = q.File.Path.toLowerCase();
      if (path.includes("jee-math")) store.maths.push(q);
      else if (path.includes("jee-physics")) store.physics.push(q);
      else if (path.includes("jee-chemistry")) store.chemistry.push(q);
    });
    return store;
  }
  let qStore = buildQStore();
  console.log("qStore built:", qStore);

  // --- State ---
  let currentSubjectKey = Object.keys(qStore).find(k => qStore[k].length > 0) || "maths";
  let currentIndex = 0;
  let answers = {};

  // --- Render Tabs ---
  function renderTabs() {
    sectionsEl.innerHTML = "";
    ["maths", "physics", "chemistry"].forEach(k => {
      if (!qStore[k] || qStore[k].length === 0) return;
      const btn = document.createElement("button");
      btn.textContent = k.charAt(0).toUpperCase() + k.slice(1);
      btn.className =
        `px-3 py-1 rounded ${k === currentSubjectKey ? "bg-blue-600" : "bg-gray-700"}`;
      btn.onclick = () => {
        currentSubjectKey = k;
        currentIndex = 0;
        renderQuestion();
        renderPalette();
        renderTabs();
      };
      sectionsEl.appendChild(btn);
    });
  }

  // --- Render Question ---
  function renderQuestion() {
    const q = qStore[currentSubjectKey][currentIndex];
    if (!q) {
      questionContainer.innerHTML = "<p>No questions in this section.</p>";
      return;
    }
    questionContainer.innerHTML = `
      <div class="mb-2 font-bold">Q${currentIndex + 1}</div>
      <div class="mb-4">${q.HTML}</div>
    `;
  }

  // --- Render Palette ---
  function renderPalette() {
    paletteEl.innerHTML = "";
    qStore[currentSubjectKey].forEach((q, idx) => {
      const btn = document.createElement("button");
      btn.textContent = idx + 1;
      btn.className =
        `w-8 h-8 rounded ${idx === currentIndex ? "bg-blue-600" : "bg-gray-600"}`;
      btn.onclick = () => {
        currentIndex = idx;
        renderQuestion();
        renderPalette();
      };
      paletteEl.appendChild(btn);
    });
  }

  // --- Timer ---
  let remaining = 60 * 60; // 1 hr demo
  function tick() {
    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    timerEl.textContent = `${m}:${s.toString().padStart(2, "0")}`;
    if (remaining > 0) {
      remaining--;
      setTimeout(tick, 1000);
    }
  }
  tick();

  // --- Submit ---
  submitBtn.onclick = () => {
    alert("Test submitted! (scoring logic to be added)");
  };

  // --- Init ---
  renderTabs();
  renderQuestion();
  renderPalette();
});
