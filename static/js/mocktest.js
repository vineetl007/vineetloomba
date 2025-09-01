// =============================
// Mock Test App
// =============================

// Parse Hugo-injected data
const mockData = JSON.parse(document.getElementById("mocktest-data").textContent);

// Question store grouped by subject
const qStore = {
  maths: mockData.maths || [],
  physics: mockData.physics || [],
  chemistry: mockData.chemistry || []
};

let currentSubjectKey = 'maths';
let currentIndex = 0;
let answers = {};
let timerInterval = null;
let timeRemaining = 3 * 60 * 60; // 3 hours in seconds

// DOM refs
const sectionsEl = document.getElementById('sections');
const timerEl = document.getElementById('timer');
const questionContainer = document.getElementById('question-container');
const navEl = document.getElementById('nav');
const submitBtn = document.getElementById('submit-test');

// Render top subject tabs
function renderTabs() {
  sectionsEl.innerHTML = '';
  ['maths', 'physics', 'chemistry'].forEach(k => {
    if (!qStore[k] || qStore[k].length === 0) return;
    const btn = document.createElement('button');
    btn.textContent = k.charAt(0).toUpperCase() + k.slice(1);
    btn.className = `px-3 py-1 rounded font-concert ${k === currentSubjectKey ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white'}`;
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

// Render current question
function renderQuestion() {
  const qs = qStore[currentSubjectKey];
  if (!qs || qs.length === 0) {
    questionContainer.innerHTML = '<p class="text-center text-gray-400">No questions in this section.</p>';
    return;
  }

  const q = qs[currentIndex];
  questionContainer.innerHTML = `
    <div class="mb-4">${q.HTML}</div>
  `;

  // MathJax render if needed
  if (window.MathJax) MathJax.typesetPromise();
}

// Render navigation palette
function renderPalette() {
  const qs = qStore[currentSubjectKey];
  navEl.innerHTML = '';
  qs.forEach((q, i) => {
    const btn = document.createElement('button');
    btn.textContent = i + 1;
    btn.className = `w-8 h-8 m-1 rounded ${i === currentIndex ? 'bg-yellow-400 text-black' : 'bg-gray-600 text-white'}`;
    btn.onclick = () => {
      currentIndex = i;
      renderQuestion();
      renderPalette();
    };
    navEl.appendChild(btn);
  });
}

// Timer
function startTimer() {
  timerInterval = setInterval(() => {
    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      submitTest();
      return;
    }
    timeRemaining--;
    const h = Math.floor(timeRemaining / 3600);
    const m = Math.floor((timeRemaining % 3600) / 60);
    const s = timeRemaining % 60;
    timerEl.textContent = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }, 1000);
}

// Submit test (basic result)
function submitTest() {
  alert("Test submitted! (Evaluation logic pending)");
}

// Init app
function init() {
  console.log("Loaded questions:", qStore);
  renderTabs();
  renderQuestion();
  renderPalette();
  startTimer();
}

submitBtn.onclick = submitTest;
init();
