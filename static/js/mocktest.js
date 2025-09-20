// Time tracking per subject
let timeSpent = { Maths: 0, Physics: 0, Chemistry: 0 };
let lastTimestamp = null;
let currentSubject = null;

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("instruction-modal");
  const startBtn = document.getElementById("start-test");
  const nameInput = document.getElementById("student-name");
  const emailInput = document.getElementById("student-email");

  let userName = "";
  let userEmail = "";

  // ----- Read payload early so we can compute storageKey and decide whether to show modal -----
  const dataEl = document.getElementById("mocktest-data");
  let payload = {};
  let testUID = 'mocktest';
  let storageKey = `mocktest:${testUID}`;

  try {
    if (dataEl && dataEl.textContent) {
      payload = JSON.parse(dataEl.textContent);
      testUID = payload.uid || (payload.title ? String(payload.title).replace(/\s+/g,'_') : 'mocktest');
      storageKey = `mocktest:${testUID}`;
    }
  } catch (e) {
    console.warn("Unable to parse mocktest-data; continuing without saved progress:", e);
  }

  // Safe loader: if parse of saved data fails, clear it (prevents broken JSON causing errors)
  function safeLoadRawSaved() {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn("Saved progress corrupted (JSON.parse failed). Clearing saved progress:", storageKey, e);
      try { localStorage.removeItem(storageKey); } catch (er) {}
      return null;
    }
  }

  const initialSaved = safeLoadRawSaved();

  // If saved progress exists for this test, skip the instruction modal and auto-resume
  if (initialSaved) {
    modal.classList.add("hidden");
    userName = initialSaved.userName || "";
    userEmail = initialSaved.userEmail || "";
    if (userName || userEmail) {
      const ui = document.getElementById("user-info");
      if (ui) ui.textContent = `Name: ${userName} | Email: ${userEmail}`;
    }
    // beginTest is a function declaration later in the file — safe to call on next tick
    setTimeout(beginTest, 0);
  } else {
    modal.classList.remove("hidden");
  }

  startBtn.addEventListener("click", function () {
    if (!nameInput.value || !emailInput.value) {
      alert("Please enter both name and email to get personalised In-Depth Test Analysis.");
      return;
    }

    if (!/^[^@]+@[^@]+\.[^@]+$/.test(emailInput.value)) {
      alert("Please enter a valid email address to get personalised In-Depth Test Analysis");
      return;
    }

    userName = nameInput.value;
    userEmail = emailInput.value;
    modal.classList.add("hidden");
    const ui = document.getElementById("user-info");
    if (ui) ui.textContent = `Name: ${userName} | Email: ${userEmail}`;

    // send to Google Sheet (existing code)
    const url = `https://script.google.com/macros/s/AKfycby5agHYNtb8MG1LCGK30mJmCjuCVTsFIMnrSHlCZc9IAw5wRZJ4eitWmA3x6KVZBvOR/exec?name=${encodeURIComponent(userName)}&email=${encodeURIComponent(userEmail)}&token=f9X7bQ2vR8sLpT4zY1wM`;
    fetch(url)
      .then(() => console.log("User info sent"))
      .catch(err => console.log("Failed to send user info:", err));

    beginTest();
  });

  function beginTest() {

    //old code
  
  const dataEl = document.getElementById("mocktest-data");
  if (!dataEl) return;

  const payload = JSON.parse(dataEl.textContent);
  const questions = payload.questions || [];
  console.log("RAW_FROM_HUGO:", questions.map((q,i)=>({
  i: i+1,
  question_type: q.question_type,
  correctIndices: q.correctIndices,
  optionsLen: Array.isArray(q.options) ? q.options.length : 0
})));

const rankPreset = payload.rankPreset || [];

  const durationMinutes = Number(payload.durationMinutes || 180);

   // persistence key for this test (comes from Hugo JSON)
const testUID = payload.uid || (payload.title ? String(payload.title).replace(/\s+/g,'_') : 'mocktest');
const storageKey = `mocktest:${testUID}`;
let _savedRestore = null; // temp holder used by restore step


// ---------- Normalize question data (robust) ----------
// ---------- Normalize question data (robust) ----------
questions.forEach((q, i) => {
  q.question_type = (String(q.question_type || "").trim() || "Single Choice");
  if (!Array.isArray(q.options)) q.options = [];

  if (q.question_type.toLowerCase() === "integer type") {
    // For integer type we only care about numerical_answer
    q.numerical_answer = String(q.numerical_answer ?? "").trim();
    console.log("NORMALIZED INTEGER:", {
      i: i + 1,
      type: q.question_type,
      numerical_answer: q.numerical_answer,
      optionsLen: q.options.length
    });
    return;
  }

  // ✅ Normalize correctIndices
  if (typeof q.correctIndices === "string") {
    try {
      q.correctIndices = JSON.parse(q.correctIndices);
    } catch (e) {
      console.error("JSON parse failed for correctIndices:", q.correctIndices, e);
      q.correctIndices = [];
    }
  }

  if (!Array.isArray(q.correctIndices)) {
    q.correctIndices = [];
  }

  // ✅ Ensure all numbers
  q.correctIndices = q.correctIndices.map(x => Number(x)).filter(x => Number.isInteger(x));

  console.log("NORMALIZED:", {
    i: i + 1,
    type: q.question_type,
    correctIndices: q.correctIndices,
    optionsLen: q.options.length
  });
});

                    
  // State
  let currentIndex = 0;                // 0-based global index
  const state = questions.map(() => ({
    visited: false,
    marked: false,
    selected: [],                      // for integer: [string]; for single: [idx]; 
  }));
  let submitted = false;

   // --------- persistence helpers ----------
function saveProgress() {
  try {
    const toSave = {
      timeSpent,
      state,
      currentIndex,
      currentSubject,
      lastTimestamp,
      submitted,
      endTime, // may be undefined; ok
      userName: userName || "",
      userEmail: userEmail || ""
    };
    localStorage.setItem(storageKey, JSON.stringify(toSave));
  } catch (e) {
    console.warn("saveProgress failed", e);
  }
}



function loadProgress() {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn("loadProgress failed", e);
    return null;
  }
}

// attempt restore (apply onto freshly created `state` safely)
// attempt restore (apply onto freshly created `state` safely)
const _saved = loadProgress();
if (_saved) {
  // Basic validation: ensure minimal structure exists. If it fails, clear storage and continue fresh.
  const looksValid = (
    typeof _saved === 'object' &&
    Array.isArray(_saved.state) &&
    typeof _saved.currentIndex === 'number' &&
    _saved.timeSpent && typeof _saved.timeSpent === 'object'
  );

  if (!looksValid) {
    console.warn("Saved data appears corrupted — clearing storage for test:", storageKey, _saved);
    try { localStorage.removeItem(storageKey); } catch(e) {}
  } else {
    _savedRestore = _saved; // keep reference for timer initialization

    // restore timeSpent safely
    if (_saved.timeSpent) {
      Object.keys(timeSpent).forEach(k => { timeSpent[k] = Number(_saved.timeSpent[k] || 0); });
    }

    if (Array.isArray(_saved.state)) {
      for (let i = 0; i < Math.min(state.length, _saved.state.length); i++) {
        state[i].visited = !!_saved.state[i].visited;
        state[i].marked = !!_saved.state[i].marked;
        state[i].selected = Array.isArray(_saved.state[i].selected) ? _saved.state[i].selected : [];
      }
    }
    currentIndex = (typeof _saved.currentIndex === "number") ? _saved.currentIndex : currentIndex;
    currentSubject = _saved.currentSubject || currentSubject;
    lastTimestamp = _saved.lastTimestamp || lastTimestamp;
    submitted = !!_saved.submitted;

    // restore user info if saved
    userName = _saved.userName || userName;
    userEmail = _saved.userEmail || userEmail;
    if (userName || userEmail) {
      const ui = document.getElementById("user-info");
      if (ui) ui.textContent = `Name: ${userName} | Email: ${userEmail}`;
    }
  }
}

  // Elements
  const app = document.getElementById("mocktest-app");
  const palette = document.getElementById("question-palette");
  const timerEl = document.getElementById("timer");
const timerValueEl = document.getElementById("time-value");
  
  // ---------- TIMER ----------
//  const endTime = Date.now() + durationMinutes * 60 * 1000;
   // ---------- TIMER ----------
let endTime = ( _savedRestore && _savedRestore.endTime ) ? Number(_savedRestore.endTime) : Date.now() + durationMinutes * 60 * 1000;

  function formatTime(ms) {
    const hrs = String(Math.floor(ms / 3600000)).padStart(2, "0");
    const mins = String(Math.floor((ms % 3600000) / 60000)).padStart(2, "0");
    const secs = String(Math.floor((ms % 60000) / 1000)).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  }
  function updateTimer() {
    if (submitted) return;
    const remaining = Math.max(0, endTime - Date.now());
    timerValueEl.textContent = formatTime(remaining);
    if (remaining <= 0) {
      submitTest();
    } else {
      requestAnimationFrame(updateTimer);
    }
  }
  updateTimer();
// persist initial endTime so reload keeps remaining time
saveProgress();

  // ---------- HELPERS ----------
  function isAnswered(qIdx) {
    const q = questions[qIdx];
    const s = state[qIdx];
    if (q.question_type === "Integer Type") return (s.selected[0] || "").trim().length > 0;
    return s.selected.length > 0;
  }


  // ---------- PALETTE ----------
  function paletteBtnClass(qIdx) {
    // After submit → show result colors
    if (submitted) {
      if (!isAnswered(qIdx)) return "bg-gray-500 text-white";
      return isCorrect(qIdx) ? "bg-green-600 text-white" : "bg-red-600 text-white";
    }

    // During test
    const s = state[qIdx];
    if (s.marked) return "bg-purple-600 text-white";
    if (isAnswered(qIdx)) return "bg-green-600 text-white";
    if (s.visited) return "bg-white text-black";
    return "bg-gray-700 text-white";
  }

  function renderPalette() {
  let html = "";
 let currentSubject = null;

  questions.forEach((q, i) => {
    if (q.subject !== currentSubject) {
      currentSubject = q.subject;
      html += `<div class="col-span-full text-center font-bold text-yellow-400 my-1">${currentSubject}</div>`;
    }

    const base = `palette-btn w-10 h-10 rounded-full ${paletteBtnClass(i)} hover:opacity-90 transition`;
    const ring = i === currentIndex ? " outline outline-2 outline-yellow-400" : "";
    // build buttons (include subject)
  html += `<button data-index="${i}" data-subject="${q.subject}" class="${base}${ring}">${i + 1}</button>`;
  });

  palette.innerHTML = html;

  palette.querySelectorAll(".palette-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.dataset.index);

      if (!submitted) {
        currentIndex = idx;
        renderQuestion(currentIndex);
        renderPalette();
        return;
      }

      // Analysis mode: ensure correct subject tab is opened, then scroll
      const subj = btn.dataset.subject;
      if (subj) {
        const tab = document.querySelector(`.subject-tab[data-subject="${subj}"]`);
        if (tab) tab.click();
      }

      const card = document.getElementById(`analysis-q-${idx + 1}`);
      if (card) card.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}


  // ---------- RENDER QUESTION (TEST MODE) ----------
  function renderQuestion(idx) {
    if (submitted) return;  // 👈 prevents showing question view after submission
   currentIndex = idx;     // keep global index in sync (important for palette ring)
    const q = questions[idx];
    const st = state[idx];
    st.visited = true;

    // ----- TIME TRACKING -----
const now = Date.now();
if (currentSubject && lastTimestamp) {
  timeSpent[currentSubject] += (now - lastTimestamp);
}
currentSubject = q.subject;
lastTimestamp = now;
console.log("DEBUG_TIME_TRACK:", timeSpent);


    const rawQ = String(q.question || "");
    const questionHtml = rawQ
      .split(/\n\s*\n/)
      .map(p => `<p>${p.replace(/\n/g, "<br>")}</p>`)
      .join("");

   
    const isInteger = q.question_type === "Integer Type";

app.innerHTML = `
  <div class="border rounded-lg p-4 shadow mb-4">
 <div class="flex items-center mb-1">
  <div class="flex items-center gap-2">
    <span class="px-2 py-1 font-concert rounded-full bg-blue-600 text-white">
      ${q.subject}
    </span>
    <span class="px-2 py-1 rounded-full 
      ${q.question_type === "Single Choice" ? "bg-blue-600" : 
        q.question_type === "Multiple Choice" ? "bg-red-700" : 
        "bg-purple-600"} 
      text-white font-concert">
      ${q.question_type}
    </span>
  </div>




</div>

<!-- Second row: question number -->
<h2 class="mt-2">
  Q${idx + 1}
</h2>
    
        <div class="question-text mb-4">${questionHtml}</div>

        ${
          isInteger
            ? `
              <div class="flex items-center gap-2">
                <input id="int-answer" type="text"
                  class="border rounded p-2 w-32 bg-gray-800 text-white placeholder-gray-400"
                  placeholder="Enter answer" value="${(st.selected[0] || "").replace(/"/g,'&quot;')}"/>
              </div>
            `
            : `
              <ul class="space-y-2">
               ${q.options.map((opt, i) => `
 <li class="option cursor-pointer border rounded p-2 ${(st.selected || []).map(Number).includes(i) 
      ? 'bg-blue-600' 
      : 'hover:bg-gray-100/10'}" 
    data-index="${i}">
  <span class="latex-option">${opt}</span>
</li>
`).join("")}
              </ul>
            `
        }

<div class="mt-6 grid grid-cols-2 gap-2 sm:flex sm:justify-between sm:items-center">
  <!-- Row 1 / Column 1 -->
  <button id="prev-btn" class="px-4 py-2 font-concert bg-blue-600 text-white rounded sm:ml-0" ${idx === 0 ? 'style="visibility:hidden"' : ""}>
    Previous
  </button>

  <!-- Row 1 / Column 2 -->
  <button id="next-btn" class="px-4 py-2 bg-blue-600 font-concert text-white rounded sm:ml-2" ${idx === questions.length - 1 ? 'style="visibility:hidden"' : ""}>
    Save & Next
  </button>

  <!-- Row 2 / Column 1 -->
  <button id="clear-btn" class="px-3 py-2 bg-gray-700 font-concert text-white rounded sm:ml-0">
    Clear Response
  </button>

  <!-- Row 2 / Column 2 -->
<button id="mark-btn" 
        class="px-3 py-2 rounded ${st.marked ? 'bg-purple-600' : 'bg-gray-700'} font-concert text-white text-base">
  ${st.marked ? 'Unmark' : 'Mark for Review'}
</button>
</div>


      </div>
    `;

    // Option selection (no feedback)
   if (!isInteger) {
  app.querySelectorAll(".option").forEach(opt => {
    opt.addEventListener("click", () => {
      const i = parseInt(opt.dataset.index);

      if (q.question_type === "Single Choice") {
        // overwrite with single index
        state[idx].selected = [i];
      } else if (q.question_type === "Multiple Choice") {
        // toggle presence of index
        const sel = new Set(state[idx].selected.map(Number));
        if (sel.has(i)) sel.delete(i);
        else sel.add(i);
        state[idx].selected = Array.from(sel);
      }

      renderQuestion(idx);
      renderPalette();
     saveProgress();

    });
  });
}else {
      app.querySelector("#int-answer").addEventListener("input", e => {
        state[idx].selected = [e.target.value.trim()];
        renderPalette();
       saveProgress();

      });
    }

    // Mark for Review
    app.querySelector("#mark-btn").addEventListener("click", () => {
      state[idx].marked = !state[idx].marked;
      renderQuestion(idx);
      renderPalette();
     saveProgress();

    });

    // Clear
    app.querySelector("#clear-btn").addEventListener("click", () => {
      state[idx].selected = [];
      renderQuestion(idx);
      renderPalette();
     saveProgress();

    });

    // Nav
    app.querySelector("#prev-btn")?.addEventListener("click", () => {
      if (idx > 0) {
        currentIndex = idx - 1;
        renderQuestion(currentIndex);
        renderPalette();
      }
    });
    app.querySelector("#next-btn")?.addEventListener("click", () => {
      if (idx < questions.length - 1) {
        currentIndex = idx + 1;
        renderQuestion(currentIndex);
        renderPalette();
      }
    });
/*
   if (window.MathJax) {
  if (typeof MathJax.typesetPromise === "function") {
    MathJax.typesetPromise().catch(() => { /* ignore / });
  } else if (MathJax.Hub && typeof MathJax.Hub.Queue === "function") {
    MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
  }
}; */

    //Katex Replacement code 
    if (typeof renderMathInElement === "function") {
  // ✅ Render all questions and options once
  const testElements = document.querySelectorAll(".question, .option"); // adjust selectors if needed
  testElements.forEach(el => {
    renderMathInElement(el, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "\\[", right: "\\]", display: true },
        { left: "$", right: "$", display: false },
        { left: "\\(", right: "\\)", display: false }
      ],
      throwOnError: false
    });
  });
}

  }

  // ---------- SUBMIT / ANALYSIS ----------
  function calculateScore() {
    let correct = 0, wrong = 0, unattempted = 0;
    questions.forEach((_, i) => {
      if (!isAnswered(i)) unattempted++;
      else if (isCorrect(i)) correct++;
      else wrong++;
    });
    // Default JEE Main-style: +4 / -1
    const score = correct * 4 - wrong * 1;
    return { correct, wrong, unattempted, score, total: questions.length };
  }

  // DEBUG: show score + rankPreset after calculation
const debugResult = calculateScore();
console.log("DEBUG_SCORE:", debugResult.score);
console.log("DEBUG_RANK_PRESET:", rankPreset);


 function mapRank(score) {
  if (!Array.isArray(rankPreset) || rankPreset.length === 0) return null;

  // Sort presets descending by marks
  const sorted = [...rankPreset].sort((a, b) => b.marks - a.marks);

  for (let i = 0; i < sorted.length; i++) {
    const curr = sorted[i];
    const next = sorted[i + 1];

    if (score >= Number(curr.marks)) {
      return Number(curr.rank); // exact or above threshold → take this rank
    }

    if (next && score < curr.marks && score >= next.marks) {
      // interpolate between curr and next
      const m1 = Number(curr.marks), r1 = Number(curr.rank);
      const m2 = Number(next.marks), r2 = Number(next.rank);

      const fraction = (score - m2) / (m1 - m2);
      return Math.round(r2 + (r1 - r2) * fraction);
    }
  }

  // If below all thresholds, take the last one's rank
  return Number(sorted[sorted.length - 1].rank);
}


// ---------- HELPERS ----------
// ---------- HELPERS ----------
function isCorrect(qIdx) {
  const q = questions[qIdx];
  const s = state[qIdx];

  if (q.question_type === "Integer Type") {
    return (s.selected[0] || "").trim() === String(q.numerical_answer || "").trim();
  }

  // For single & multi: compare sets
  const user = (s.selected || []).map(Number).sort();
  const correct = (q.correctIndices || []).map(Number).sort();
  return JSON.stringify(user) === JSON.stringify(correct);
}


// ---------- RENDER ANALYSIS ----------
function renderAnalysis() {
  const { correct, wrong, unattempted, score, total } = calculateScore();
  const rank = mapRank(score);
// subject tabs for analysis
const subjects = [...new Set(questions.map(q => q.subject))];
let tabsHtml = `
  <div class="flex gap-2 mb-4 justify-center">
    ${subjects.map((subj, i) => `
      <button 
        class="subject-tab px-4 py-2 rounded ${i === 0 ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}"
        data-subject="${subj}">
        ${subj}
      </button>
    `).join("")}
  </div>
`;

  // Summary
  const summaryHtml = `
    <div class="border rounded-xl p-4 mb-4 bg-gray-900">
      <div class="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
        <div><div class="text-2xl font-bold">${total}</div><div class="text-xs text-gray-300">Total</div></div>
        <div><div class="text-2xl font-bold text-green-500">${correct}</div><div class="text-xs text-gray-300">Correct</div></div>
        <div><div class="text-2xl font-bold text-red-400">${wrong}</div><div class="text-xs text-gray-300">Wrong</div></div>
        <div><div class="text-2xl font-bold">${unattempted}</div><div class="text-xs text-gray-300">Unattempted</div></div>
        <div><div class="text-2xl font-bold text-yellow-300">${score}</div><div class="text-xs text-gray-300">Score</div></div>
      </div>
      ${rank ? `<div class="mt-3 text-center text-lg">Estimated Rank: <span class="font-bold">${rank}</span></div>` : ``}
    </div>
  `;

  // Score analysis Bar graphs 
   const scoreHtml = `
  <div class="mt-6 mb-6 flex flex-col items-center gap-4">
    <!-- Heading -->
    <h2 class="text-xl font-concert text-yellow-400 underline mb-4 text-center">Score Analysis</h2>

    <div class="flex flex-col md:flex-row items-center md:items-start gap-6 w-full">
      <!-- Bar chart -->
      <div class="flex-shrink-0 w-full md:w-1/2" style="max-width:400px; height:300px;">
        <canvas id="score-bar-chart"></canvas>
      </div>
      <!-- Table -->
      <div class="flex-1 w-full md:w-auto">
        <table class="w-full text-sm border border-gray-700 rounded-lg mx-auto">
          <thead>
            <tr class="bg-gray-800 text-center">
              <th class="px-3 py-2 border border-gray-700">Subject</th>
              <th class="px-3 py-2 border border-gray-700">Total</th>
              <th class="px-3 py-2 border border-gray-700">Negative</th>
              <th class="px-3 py-2 border border-gray-700">Final Score</th>
            </tr>
          </thead>
          <tbody id="score-table-body"></tbody>
        </table>
      </div>
    </div>
  </div>
`;


  // Compare arrays ignoring order
  function compareArrays(a, b) {
    const A = Array.isArray(a) ? a.map(Number) : [];
    const B = Array.isArray(b) ? b.map(Number) : [];
    if (A.length !== B.length) return false;
    const setB = new Set(B);
    for (const v of A) if (!setB.has(v)) return false;
    return true;
  }

  // Build question cards
  const cards = questions.map((q, i) => {
    const st = state[i];
    const isInt = q.question_type === "Integer Type";

    // User answers
    const userInt = isInt ? String(st.selected?.[0] ?? "").trim() : "";
    // numeric-safe arrays for comparison
const correctIdxs = !isInt && Array.isArray(q.correctIndices) ? q.correctIndices.map(Number) : [];
const userMCQ = !isInt && Array.isArray(st.selected) ? st.selected.map(Number) : [];

    // Determine correctness
    const gotIt = isInt ? (userInt !== "" && userInt === q.numerical_answer) : compareArrays(userMCQ, correctIdxs);

    // Question HTML
    const qHtml = String(q.question || "").split(/\n\s*\n/).map(p => `<p>${p.replace(/\n/g, "<br>")}</p>`).join("");

    // User answer display
    const userAnsHtml = isInt
      ? (userInt ? `<span class="${gotIt ? 'text-green-400' : 'text-red-400'}">Your answer: ${userInt}</span>` : `<span class="text-gray-400">Your answer: —</span>`)
      : (userMCQ.length ? `<span class="${gotIt ? 'text-green-400' : 'text-red-400'}">Your answer: ${userMCQ.map(x => String.fromCharCode(65 + Number(x))).join(", ")}</span>` : `<span class="text-gray-400">Your answer: —</span>`);

   // Correct answer display
let correctAnsHtml;
if (isInt) {
  correctAnsHtml = `Correct answer: <span class="text-green-400">${q.numerical_answer}</span>`;
} else if (q.question_type === "Single Choice") {
  correctAnsHtml = `Correct answer: <span class="text-green-400">${q.options[correctIdxs[0]]}</span>`;
} else if (q.question_type === "Multiple Choice") {
  const labels = correctIdxs.map(i => String.fromCharCode(65 + i)).join(", ");
  const texts = correctIdxs.map(i => q.options[i]).join("<br>");
  correctAnsHtml = `
    Correct answer: 
    <span class="text-green-400">${labels}</span>
    <div class="mt-1 text-sm text-gray-300">${texts}</div>
  `;
} else {
  correctAnsHtml = "Correct answer: —";
}


    // Options HTML 
let optionsHtml = '';
if (!isInt) {
  if (q.question_type === "Single Choice") {
    optionsHtml = `
      <ul class="space-y-2">
        ${q.options.map((opt, oi) => {
          const oiNum = Number(oi);
          const cls = (oiNum === (correctIdxs[0] ?? -1))
            ? 'border-green-500'
            : (userMCQ.includes(oiNum) ? 'border-red-500' : 'border-gray-700');
          return `<li class="border ${cls} rounded p-2"><span class="latex-option">${opt}</span></li>`;
        }).join("")}
      </ul>
    `;
  } else if (q.question_type === "Multiple Choice") {
    optionsHtml = `
      <ul class="space-y-2">
        ${q.options.map((opt, oi) => {
          const oiNum = Number(oi);
          const isCorrect = correctIdxs.includes(oiNum);
          const isUser = userMCQ.includes(oiNum);
          const cls = isCorrect
            ? 'border-green-500'
            : (isUser ? 'border-red-500' : 'border-gray-700');
          return `<li class="border ${cls} rounded p-2"><span class="latex-option">${opt}</span></li>`;
        }).join("")}
      </ul>
    `;
  }
}



    // Final card
    return `
  <div id="analysis-q-${i + 1}" 
       class="border rounded-lg p-4 mb-4
              ${gotIt 
                ? 'bg-green-950/30 border-green-500' 
                : (isAnswered(i) 
                    ? 'bg-red-950/30 border-red-500' 
                    : 'bg-gray-900/40 border-gray-700')}"> <!-- Controls the colour of boxes and borders in analysis -->

        <div class="flex justify-between items-center mb-2">
          <div class="font-bold">Q${i + 1} <span class="text-sm text-yellow-300 ml-2">[${q.subject}]</span></div>
          
          ${q.difficulty ? `
  <span class="ml-2 inline-block px-2 py-0.5 text-sm rounded-full font-concert bg-blue-600 text-white">
    Difficulty: ${q.difficulty}
  </span>
` : ``}

          <div class="text-xs ${st.marked ? 'text-purple-300' : 'text-transparent'}">${st.marked ? 'Marked for Review' : '.'}</div>
        </div>
        <div class="mb-3">${qHtml}</div>
        <div class="mt-3 text-sm space-y-1">
          <div>${userAnsHtml}</div>
          <div>${correctAnsHtml}</div>
        </div>
        
      <div class="solution mt-3">
  <button class="toggle-solution px-3 py-1 bg-gray-700 text-white rounded text-sm">
    Show / Hide Solution
  </button>
  <div class="solution-content hidden mt-2">
    ${!isInt ? optionsHtml : ""}
    <div class="mt-3 text-sm space-y-1">
      <div>${userAnsHtml}</div>
      <div>${correctAnsHtml}</div>
    </div>
    <div class="text-sm font-semibold mt-3 mb-1">Solution:</div>
    <div>${q.solution}</div>
    ${q.video_url ? `
    <div class="mt-3 font-bold text-lg flex items-center gap-2">
    <span>🎬 Video Solution</span>
    </div>
      <div class="mt-3 flex justify-center">
        <div style="width:100%; max-width:720px; aspect-ratio:16/9; overflow:hidden; border-radius:12px;">
          <iframe src="${q.video_url}" style="width:100%; height:100%; border:0;" allowfullscreen></iframe>
        </div>
      </div>` : ""}
  </div>
</div>

</div>
    `;
  });


  // Group cards by subject
const grouped = {};
cards.forEach((cardHtml, idx) => {
  const subj = questions[idx].subject || "General";
  if (!grouped[subj]) grouped[subj] = [];
  grouped[subj].push(cardHtml);
});
const groupedHtml = Object.entries(grouped).map(([subj, arr], idx) => `
  <div class="subject-group mt-8 ${idx === 0 ? "" : "hidden"}" data-subject="${subj}">
    <h2 class="text-xl font-bold text-yellow-400 mb-4">${subj}</h2>
    ${arr.join("")}
  </div>
`).join("");

/*
const stickySummary = `
  <div id="sticky-summary" class="bg-gray-900 border border-gray-700 rounded-lg p-3 text-xs mb-4">
    <div>Total: ${total}</div>
    <div class="text-green-400">Correct: ${correct}</div>
    <div class="text-red-400">Wrong: ${wrong}</div>
    <div>Unattempted: ${unattempted}</div>
    <div class="text-yellow-300">Score: ${score}</div>
    ${rank ? `<div class="mt-1">Rank: <span class="font-bold">${rank}</span></div>` : ``}
  </div>
`;
*/

// ---- Difficulty Analysis ----
const difficultyHtml = `
  <div class="mt-6 mb-6">
    <h2 class="text-xl font-concert text-yellow-400 underline mb-4 text-center">Difficulty Analysis</h2>
    <div class="overflow-x-auto">
      <table class="w-full text-sm border border-gray-700 rounded-lg mx-auto">
        <thead>
          <tr class="bg-gray-800 text-center">
            <th class="px-3 py-2 border border-gray-700">Subject</th>
            <th class="px-3 py-2 border border-gray-700">Difficulty</th>
            <th class="px-3 py-2 border border-gray-700">Correct</th>
            <th class="px-3 py-2 border border-gray-700">Incorrect</th>
            <th class="px-3 py-2 border border-gray-700">Unattempted</th>
            <th class="px-3 py-2 border border-gray-700">Total</th>
          </tr>
        </thead>
        <tbody id="difficulty-table-body"></tbody>
      </table>
    </div>
  </div>
`;

 
  // Difficulty Analysis Charts
const difficultyChartsHtml = `
  <div class="mt-6">
    <h2 class="text-xl font-concert text-yellow-400 underline mb-4 text-center">Difficulty Analysis (Accuracy %)</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-gray-900 p-4 rounded-xl shadow">
        <h3 class="text-center mb-2 text-white">Maths</h3>
        <canvas id="mathsPie"></canvas>
      </div>
      <div class="bg-gray-900 p-4 rounded-xl shadow">
        <h3 class="text-center mb-2 text-white">Physics</h3>
        <canvas id="physicsPie"></canvas>
      </div>
      <div class="bg-gray-900 p-4 rounded-xl shadow">
        <h3 class="text-center mb-2 text-white">Chemistry</h3>
        <canvas id="chemistryPie"></canvas>
      </div>
    </div>
  </div>
`;

  // ✅ Helper to compute accuracy by difficulty
function computeDifficultyAccuracy(subject) {
  const levels = { Easy: { correct: 0, total: 0 }, Medium: { correct: 0, total: 0 }, Hard: { correct: 0, total: 0 } };
  questions.forEach((q, i) => {
    if (q.subject !== subject) return;
    const diff = q.difficulty || "Medium"; // default if missing
    levels[diff].total++;
    if (isCorrect(i)) levels[diff].correct++;
  });

  return ["Easy", "Medium", "Hard"].map(lvl => {
    const { correct, total } = levels[lvl];
    return total > 0 ? Math.round((correct / total) * 100) : 0;
  });
}



// compute minutes from the restored `timeSpent` (ms) as a fallback
const computedTimeSpentMinutes = Object.fromEntries(
  Object.entries(timeSpent).map(([subj, ms]) => [subj, Math.round((Number(ms) || 0) / 60000)])
);

// prefer explicit window.analysisData.timeSpent (if set from submit), otherwise use computed
const analysisTimeSpent = (window.analysisData && window.analysisData.timeSpent) ? window.analysisData.timeSpent : computedTimeSpentMinutes;

// ensure window.analysisData.timeSpent exists for later chart code
window.analysisData = window.analysisData || {};
window.analysisData.timeSpent = analysisTimeSpent;

const chartHtml = `
  <div class="mt-4 mb-6 flex flex-col items-center gap-4">
    <!-- Heading -->
    <h2 class="text-xl font-concert underline text-yellow-400 mb-4 text-center">Time Analysis</h2>
    
    <div class="flex flex-col md:flex-row items-center md:items-start gap-6 w-full">
      <!-- Pie chart -->
      <div class="flex-shrink-0" style="width:250px;">
        <canvas id="time-subject-chart" width="250" height="250"></canvas>
      </div>
      <!-- Table -->
      <div class="flex-1 w-full md:w-auto">
        <table class="w-full text-sm border border-gray-700 rounded-lg mx-auto">
          <thead>
            <tr class="bg-gray-800 text-center">
              <th class="px-3 py-2 border border-gray-700">Subject</th>
              <th class="px-3 py-2 border border-gray-700">Time Spent (min)</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(analysisTimeSpent).map(([subj, mins]) => `
              <tr class="border border-gray-700 font-concert text-center">
                <td class="border border-gray-700 px-3 py-1">${subj}</td>
                <td class="border border-gray-700 px-3 py-1">${mins}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  </div>
`;



app.innerHTML = summaryHtml + scoreHtml + difficultyHtml + difficultyChartsHtml + chartHtml + tabsHtml + groupedHtml;

//app.innerHTML = summaryHtml + stickySummary + chartHtml + tabsHtml + groupedHtml;

 // add reattempt button to the summary block and wire it
const reattemptHTML = `<div class="mt-3 text-center"><button id="reattempt-btn" class="bg-yellow-400 text-black px-4 py-2 rounded font-bold">Reattempt</button></div>`;
const summaryBlock = app.querySelector('div.border.rounded-xl.p-4.mb-4.bg-gray-900');
if (summaryBlock) summaryBlock.insertAdjacentHTML('beforeend', reattemptHTML);

  /*
const reBtn = document.getElementById('reattempt-btn');
if (reBtn) {
  reBtn.addEventListener('click', () => {
    if (!confirm('Want to Give it one more try? This analysis will be Erased !!')) return;
    localStorage.removeItem(storageKey);
    location.reload();
  });
}
*/

  
    // --- Score chart setup ---
const ctxScore = document.getElementById("score-bar-chart")?.getContext("2d");
if (ctxScore) {
  const subjectScores = subjects.map(subj => {
    const subjQs = questions.filter(q => q.subject === subj);
    let correct = 0, wrong = 0;
    subjQs.forEach(q => {
      const idx = questions.indexOf(q);
      if (isAnswered(idx)) {
        if (isCorrect(idx)) correct++;
        else wrong++;
      }
    });
    const total = correct * 4;
    const negative = wrong * -1;
    const final = total + negative;
    return { subj, total, negative, final };
  });

  new Chart(ctxScore, {
    type: "bar",
    data: {
      labels: subjectScores.map(s => s.subj),
      datasets: [
        {
          label: "Total",
          data: subjectScores.map(s => s.total),
          backgroundColor: "rgba(34,197,94,0.7)" // green
        },
        {
          label: "Negative",
          data: subjectScores.map(s => s.negative),
          backgroundColor: "rgba(239,68,68,0.7)" // red
        },
        {
          label: "Final Score",
          data: subjectScores.map(s => s.final),
          backgroundColor: "rgba(59,130,246,0.7)" // blue
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: "#fff" } } },
      scales: {
        x: { ticks: { color: "#fff" } },
        y: { ticks: { color: "#fff" }, beginAtZero: true }
      }
    }
  });

  // --- Table rows ---
  const tbody = document.getElementById("score-table-body");
  tbody.innerHTML = subjectScores.map(s => `
    <tr class="border border-gray-700 font-concert text-center">
      <td class="px-3 py-2 border border-gray-700">${s.subj}</td>
      <td class="px-3 py-2 border border-gray-700 text-green-400">${s.total}</td>
      <td class="px-3 py-2 border border-gray-700 text-red-400">${s.negative}</td>
      <td class="px-3 py-2 border border-gray-700 text-blue-400">${s.final}</td>
    </tr>
  `).join("");
}


  // difficulty analysis table 
  // ---- Difficulty table population ----
const diffStats = {}; 
questions.forEach((q, i) => {
  const subj = q.subject || "General";
  const diff = q.difficulty || "Unspecified";
  if (!diffStats[subj]) diffStats[subj] = {};
  if (!diffStats[subj][diff]) diffStats[subj][diff] = { correct: 0, wrong: 0, unattempted: 0 };

  if (!isAnswered(i)) diffStats[subj][diff].unattempted++;
  else if (isCorrect(i)) diffStats[subj][diff].correct++;
  else diffStats[subj][diff].wrong++;
});

const tbody = document.getElementById("difficulty-table-body");
tbody.innerHTML = Object.entries(diffStats).map(([subj, diffs]) => {
  const levels = Object.entries(diffs);
  return levels.map(([level, stats], idx) => {
    const total = stats.correct + stats.wrong + stats.unattempted;
    return `
      <tr class="border border-gray-700 font-concert text-center">
        ${idx === 0 ? `<td class="px-3 py-1 border border-gray-700" rowspan="${levels.length}">${subj}</td>` : ""}
        <td class="px-3 py-1 border border-gray-700">${level}</td>
        <td class="px-3 py-1 border border-gray-700 text-green-400">${stats.correct}</td>
        <td class="px-3 py-1 border border-gray-700 text-red-400">${stats.wrong}</td>
        <td class="px-3 py-1 border border-gray-700 text-gray-400">${stats.unattempted}</td>
        <td class="px-3 py-1 border border-gray-700">${total}</td>
      </tr>
    `;
  }).join("");
}).join("");

// ✅ Chart helper
function makePieChart(ctxId, data) {
  new Chart(document.getElementById(ctxId), {
    type: "pie",
    data: {
      labels: ["Easy", "Medium", "Hard"],
      datasets: [{
        data: data,
        backgroundColor: ["#22c55e", "#eab308", "#ef4444"],
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom", labels: { color: "#fff" } },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.raw || 0;
              return `${label}: ${value}%`; // Add % sign
            }
          }
        }
      }
    }
  });
}


// ✅ Render charts for each subject
makePieChart("mathsPie", computeDifficultyAccuracy("Maths"));
makePieChart("physicsPie", computeDifficultyAccuracy("Physics"));
makePieChart("chemistryPie", computeDifficultyAccuracy("Chemistry"));
 


//time analysis pie chart
  const ctx = document.getElementById('time-subject-chart').getContext('2d');
if (ctx && window.analysisData?.timeSpent) {
  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: Object.keys(window.analysisData.timeSpent),
      datasets: [{
        data: Object.values(window.analysisData.timeSpent),
        backgroundColor: ['#f59e0b','#10b981','#8b5cf6'] // Maths, Physics, Chemistry
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom' } }
    }
  });
}


// ✅ Add tab listeners here
app.querySelectorAll(".subject-tab").forEach(btn => {
  btn.addEventListener("click", () => {
    const subj = btn.dataset.subject;

    // reset all tabs to inactive (gray)
    app.querySelectorAll(".subject-tab").forEach(b => {
      b.classList.remove("bg-blue-600", "text-white");
      b.classList.add("bg-gray-700", "text-gray-200");
    });

    // highlight clicked tab
    btn.classList.add("bg-blue-600", "text-white");
    btn.classList.remove("bg-gray-700", "text-gray-200");

    // show only the chosen subject group
    app.querySelectorAll(".subject-group").forEach(g => {
      if (g.dataset.subject === subj) g.classList.remove("hidden");
      else g.classList.add("hidden");
    });
  });
});
  // Hook up accordion toggles

  /*
// ✅ Toggle solution visibility with simple MathJax render on reveal
app.querySelectorAll(".toggle-solution").forEach(btn => {
  btn.addEventListener("click", async () => {
    const content = btn.nextElementSibling;
    const willShow = content.classList.contains("hidden");

    if (willShow) {
      // Show the solution
      content.classList.remove("hidden");
      btn.textContent = "Hide Solution";

      // Wait a frame so the browser applies layout
      await new Promise(resolve => requestAnimationFrame(resolve));

      // ✅ Typeset this block freshly if MathJax is available
      if (window.MathJax && typeof MathJax.typesetPromise === "function") {
        try {
          await MathJax.typesetPromise([content]);
        } catch (e) {
          console.warn("MathJax typeset on reveal failed:", e);
        }
      }
    } else {
      // Hide the solution
      content.classList.add("hidden");
      btn.textContent = "Show Solution";
    }
  });
});




if (window.MathJax && typeof MathJax.typesetPromise === "function") {
  try {
    const visible = Array.from(app.querySelectorAll(".mb-3, .mt-3.text-sm.space-y-1")) // qHtml, userAns, correctAns
      .filter(el => el.offsetParent !== null); // only visible
    if (visible.length) {
      MathJax.typesetPromise(visible).catch(() => {});
    }
  } catch (e) {
    console.warn("MathJax initial typeset failed:", e);
  }
}
*/

  // New Katex LOGIC
  app.querySelectorAll(".toggle-solution").forEach(btn => {
  btn.addEventListener("click", () => {
    const content = btn.nextElementSibling;
    const willShow = content.classList.contains("hidden");

    if (willShow) {
      content.classList.remove("hidden");
      btn.textContent = "Hide Solution";
    } else {
      content.classList.add("hidden");
      btn.textContent = "Show Solution";
    }
  });
});

// ✅ Run once for whole page
if (typeof renderMathInElement === "function") {
  renderMathInElement(document.body, {
    delimiters: [
      { left: "$$", right: "$$", display: true },
      { left: "\\[", right: "\\]", display: true },
      { left: "$", right: "$", display: false },
      { left: "\\(", right: "\\)", display: false }
    ],
    throwOnError: false
  });
}


} 


function submitTest() {
  console.log("Submitting test...");
questions.forEach((q, i) => {
  const st = state[i];
  console.log(
    `Question ${i + 1} (${q.subject})`,
    "User selection:", st.selected,
    "Correct indices:", q.correctIndices,
    "Answered?", isAnswered(i),
    "Correct?", isCorrect(i)
  );
});

  if (submitted) return;
  submitted = true;

 // persist final state so analysis can be restored after reload
saveProgress();


  // ----- FINALIZE TIME TRACKING -----
const now = Date.now();
if (currentSubject && lastTimestamp) {
  timeSpent[currentSubject] += (now - lastTimestamp);
}
// Convert ms → minutes (rounded)
const timeSpentMinutes = Object.fromEntries(
  Object.entries(timeSpent).map(([subj, ms]) => [subj, Math.round(ms / 60000)])
);

console.log("FINAL_TIME_SPENT:", timeSpentMinutes);

// ✅ Save for charts
window.analysisData = window.analysisData || {};
window.analysisData.timeSpent = timeSpentMinutes;


  renderPalette();       // recolor palette to correct/wrong/blank
  renderAnalysis();      // render full analysis (answers + solutions)
  // bring the summary into view
  window.scrollTo({ top: 0, behavior: "smooth" });
}



  // Hook up submit button
document.getElementById("submit-test").addEventListener("click", () => {
  if (submitted) return; // prevent double-submit
  if (confirm("Are you sure you want to submit the test?")) {
    submitTest();
  }
});

// hook for during test reattempt button
    document.addEventListener("click", e => {
  if (e.target && e.target.id === "reattempt-btn") {
    if (!confirm("Clear saved progress and start this test again?")) return;
    localStorage.removeItem(storageKey); // ✅ clears only this test
    location.reload();
  }
});



  // ---------- INITIAL RENDER ----------
  renderPalette();
  renderQuestion(currentIndex);

   // if this load restored a submitted attempt show analysis directly
if (submitted) {
  renderPalette();
  renderAnalysis();
  window.scrollTo({ top: 0, behavior: "smooth" });
}


}
}); //-----> DOM Closes
