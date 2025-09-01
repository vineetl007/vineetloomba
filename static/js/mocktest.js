// ================= MOCKTEST.JS =================

// Global state
let questions = { maths: [], physics: [], chemistry: [] };
let currentSubject = "maths";
let currentIndex = 0;
let answers = {};
let timer;
let remainingTime;

// ------------ Timer ------------
function startTimer(subjectCount) {
  let totalMinutes = subjectCount === 1 ? 60 : subjectCount === 2 ? 120 : 180;
  remainingTime = totalMinutes * 60; // in seconds

  timer = setInterval(() => {
    remainingTime--;
    renderTimer();
    if (remainingTime <= 0) {
      clearInterval(timer);
      submitTest();
    }
  }, 1000);
}

function renderTimer() {
  const mins = Math.floor(remainingTime / 60);
  const secs = remainingTime % 60;
  document.getElementById("timer").innerText =
    `${mins}:${secs.toString().padStart(2, "0")}`;
}

// ------------ Load Questions ------------
async function loadMockTest(testData) {
  // testData comes from Hugo frontmatter
  // testData.maths_questions, physics_questions, chemistry_questions

  questions.maths = await loadQuestions(testData.maths_questions || []);
  questions.physics = await loadQuestions(testData.physics_questions || []);
  questions.chemistry = await loadQuestions(testData.chemistry_questions || []);

  // start timer
  const subjectCount = ["maths", "physics", "chemistry"]
    .filter(s => questions[s].length > 0).length;
  startTimer(subjectCount);

  renderSectionTabs();
  renderQuestion();
}

async function loadQuestions(paths) {
  const results = [];
  for (let path of paths) {
    try {
      let res = await fetch(`/${path}/index.json`);
      let q = await res.json();
      results.push(q);
    } catch (err) {
      console.error("Error loading question:", path, err);
    }
  }
  return results;
}

// ------------ Render Section Tabs ------------
function renderSectionTabs() {
  const container = document.getElementById("sections");
  container.innerHTML = "";

  ["maths", "physics", "chemistry"].forEach(sub => {
    if (questions[sub].length > 0) {
      const btn = document.createElement("button");
      btn.innerText = sub.toUpperCase();
      btn.className = "px-4 py-2 m-2 bg-gray-700 text-white rounded";
      btn.onclick = () => {
        currentSubject = sub;
        currentIndex = 0;
        renderQuestion();
      };
      container.appendChild(btn);
    }
  });
}

// ------------ Render Current Question ------------
function renderQuestion() {
  const qSet = questions[currentSubject];
  if (!qSet || qSet.length === 0) return;

  const q = qSet[currentIndex];
  const container = document.getElementById("question-container");

  container.innerHTML = `
    <div class="mb-4 font-bold">
      Q${currentIndex + 1}. ${q.statement}
    </div>
    <div>
      ${q.options.map((opt, i) => `
        <label class="block">
          <input type="radio" name="option" value="${i}"
            ${answers[`${currentSubject}-${currentIndex}`] == i ? "checked" : ""}>
          ${opt}
        </label>
      `).join("")}
    </div>
  `;

  // navigation
  document.getElementById("nav").innerHTML = `
    <button onclick="prevQ()">Prev</button>
    <button onclick="nextQ()">Next</button>
  `;

  // save answer
  document.querySelectorAll("input[name=option]").forEach(el => {
    el.onchange = () => {
      answers[`${currentSubject}-${currentIndex}`] = el.value;
    };
  });
}

function prevQ() {
  if (currentIndex > 0) {
    currentIndex--;
    renderQuestion();
  }
}

function nextQ() {
  if (currentIndex < questions[currentSubject].length - 1) {
    currentIndex++;
    renderQuestion();
  }
}

// ------------ Submit Test ------------
function submitTest() {
  clearInterval(timer);

  let score = 0;
  let attempted = 0, total = 0;

  ["maths", "physics", "chemistry"].forEach(sub => {
    questions[sub].forEach((q, idx) => {
      total++;
      const key = `${sub}-${idx}`;
      if (answers[key] != null) {
        attempted++;
        if (parseInt(answers[key]) === q.correctIndex) {
          score += 4;
        } else {
          score -= 1;
        }
      }
    });
  });

  // Rank mapping
  let estimatedRank = "N/A";
  if (window.testRankPreset) {
    for (let r of window.testRankPreset) {
      if (score >= r.marks) {
        estimatedRank = r.rank;
        break;
      }
    }
  }

  document.getElementById("mocktest").innerHTML = `
    <h2 class="text-xl font-bold">Test Submitted</h2>
    <p>Score: ${score}</p>
    <p>Attempted: ${attempted}/${total}</p>
    <p>Estimated Rank: ${estimatedRank}</p>
  `;
}
