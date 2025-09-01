document.addEventListener("DOMContentLoaded", () => {
  // Parse mocktest data
  const meta = JSON.parse(document.getElementById("mocktest-data").textContent);

  let qStore = { maths: [], physics: [], chemistry: [] };
  let currentSubjectKey = "maths";
  let currentIndex = 0;
  let answers = {};

  // Load questions from hidden <script id="question-data"> (practice style)
  async function loadQuestions() {
    for (const subject of ["maths", "physics", "chemistry"]) {
      for (const path of meta[subject]) {
        const res = await fetch(path);
        const text = await res.text();

        // Extract the embedded <script id="question-data"> ... </script>
        const match = text.match(
          /<script id="question-data" type="application\/json">([\s\S]*?)<\/script>/
        );
        if (match) {
          const q = JSON.parse(match[1]);
          qStore[subject].push(q);
        }
      }
    }
    console.log("qStore built:", qStore);
    renderTabs();
    renderQuestion();
    renderPalette();
    startTimer(3 * 60 * 60); // 3 hrs
  }

  // DOM refs
  const sectionsEl = document.getElementById("sections");
  const timerEl = document.getElementById("timer");
  const questionContainer = document.getElementById("question-container");
  const paletteEl = document.getElementById("palette");
  const submitBtn = document.getElementById("submit-test");

  // Tabs
  function renderTabs() {
    sectionsEl.innerHTML = "";
    ["maths", "physics", "chemistry"].forEach((k) => {
      if (!qStore[k] || qStore[k].length === 0) return;
      const btn = document.createElement("button");
      btn.textContent = k.charAt(0).toUpperCase() + k.slice(1);
      btn.className = `px-3 py-1 rounded ${
        k === currentSubjectKey
          ? "bg-blue-600 text-white"
          : "bg-gray-700 text-white"
      }`;
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

  // Render question
  function renderQuestion() {
    const qList = qStore[currentSubjectKey];
    if (!qList || qList.length === 0) {
      questionContainer.innerHTML = "<p>No questions in this section.</p>";
      return;
    }
    const q = qList[currentIndex];
    questionContainer.innerHTML = `
      <div class="mb-4 font-bold">Q${currentIndex + 1}. ${q.question}</div>
      <div class="flex flex-col gap-2">
        ${q.options
          .map(
            (opt, i) => `
          <label class="flex items-center gap-2">
            <input type="radio" name="q${currentSubjectKey}${currentIndex}" value="${i}"
              ${answers[`${currentSubjectKey}-${currentIndex}`] == i ? "checked" : ""}>
            <span>${opt}</span>
          </label>`
          )
          .join("")}
      </div>
    `;

    // Capture answer
    questionContainer
      .querySelectorAll("input[type=radio]")
      .forEach((inp) => {
        inp.onchange = () => {
          answers[`${currentSubjectKey}-${currentIndex}`] = parseInt(inp.value);
          renderPalette();
        };
      });
  }

  // Palette
  function renderPalette() {
    const qList = qStore[currentSubjectKey] || [];
    paletteEl.innerHTML = "";
    qList.forEach((_, i) => {
      const btn = document.createElement("button");
      btn.textContent = i + 1;
      btn.className =
        "w-8 h-8 rounded " +
        (i === currentIndex
          ? "bg-yellow-500"
          : answers[`${currentSubjectKey}-${i}`] !== undefined
          ? "bg-green-600"
          : "bg-gray-700");
      btn.onclick = () => {
        currentIndex = i;
        renderQuestion();
        renderPalette();
      };
      paletteEl.appendChild(btn);
    });
  }

  // Timer
  function startTimer(seconds) {
    function tick() {
      let h = String(Math.floor(seconds / 3600)).padStart(2, "0");
      let m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
      let s = String(seconds % 60).padStart(2, "0");
      timerEl.textContent = `${h}:${m}:${s}`;
      if (seconds > 0) {
        seconds--;
        setTimeout(tick, 1000);
      } else {
        alert("Time up! Submitting test.");
        submitTest();
      }
    }
    tick();
  }

  // Submit
  function submitTest() {
    alert("Test submitted! Answers: " + JSON.stringify(answers));
  }
  submitBtn.onclick = submitTest;

  loadQuestions();
});
