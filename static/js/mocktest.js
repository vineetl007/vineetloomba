// Time tracking per subject
let timeSpent = { Maths: 0, Physics: 0, Chemistry: 0 };
let lastTimestamp = null;
let currentSubject = null;

document.addEventListener("DOMContentLoaded", () => {
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

  // Elements
  const app = document.getElementById("mocktest-app");
  const palette = document.getElementById("question-palette");
  const timerEl = document.getElementById("timer");
const timerValueEl = document.getElementById("time-value");
  
  // ---------- TIMER ----------
  const endTime = Date.now() + durationMinutes * 60 * 1000;
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
    html += `<button data-index="${i}" class="${base}${ring}">${i + 1}</button>`;
  });

  palette.innerHTML = html;

  palette.querySelectorAll(".palette-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.dataset.index);
      if (!submitted) {
        currentIndex = idx;
        renderQuestion(currentIndex);
        renderPalette();
      } else {
        const card = document.getElementById(`analysis-q-${idx + 1}`);
        if (card) card.scrollIntoView({ behavior: "smooth", block: "start" });
      }
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
    });
  });
}else {
      app.querySelector("#int-answer").addEventListener("input", e => {
        state[idx].selected = [e.target.value.trim()];
        renderPalette();
      });
    }

    // Mark for Review
    app.querySelector("#mark-btn").addEventListener("click", () => {
      state[idx].marked = !state[idx].marked;
      renderQuestion(idx);
      renderPalette();
    });

    // Clear
    app.querySelector("#clear-btn").addEventListener("click", () => {
      state[idx].selected = [];
      renderQuestion(idx);
      renderPalette();
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

   if (window.MathJax) {
  if (typeof MathJax.typesetPromise === "function") {
    MathJax.typesetPromise().catch(() => { /* ignore */ });
  } else if (MathJax.Hub && typeof MathJax.Hub.Queue === "function") {
    MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
  }
};
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
    for (const r of sorted) {
      if (score >= Number(r.marks)) return Number(r.rank);
    }
    // If below all thresholds, take the last one's rank (worst)
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


const stickySummary = `
  <div id="sticky-summary" class="fixed top-20 right-4 bg-gray-900/90 border border-gray-700 rounded-lg p-3 shadow-lg text-xs z-50">
    <div>Total: ${total}</div>
    <div class="text-green-400">Correct: ${correct}</div>
    <div class="text-red-400">Wrong: ${wrong}</div>
    <div>Unattempted: ${unattempted}</div>
    <div class="text-yellow-300">Score: ${score}</div>
    ${rank ? `<div class="mt-1">Rank: <span class="font-bold">${rank}</span></div>` : ``}
  </div>
`;

app.innerHTML = summaryHtml + stickySummary + tabsHtml + groupedHtml;

// ✅ Add tab listeners here
app.querySelectorAll(".subject-tab").forEach(btn => {
  btn.addEventListener("click", () => {
    const subj = btn.dataset.subject;

    // highlight active button
    app.querySelectorAll(".subject-tab").forEach(b => 
      b.classList.remove("bg-blue-600","text-white"));
    btn.classList.add("bg-blue-600","text-white");

    // show only the chosen subject group
    app.querySelectorAll(".subject-group").forEach(g => {
      if (g.dataset.subject === subj) g.classList.remove("hidden");
      else g.classList.add("hidden");
    });
  });
});
  // Hook up accordion toggles
app.querySelectorAll(".toggle-solution").forEach(btn => {
  btn.addEventListener("click", () => {
    const content = btn.nextElementSibling;
    if (content.classList.contains("hidden")) {
      content.classList.remove("hidden");
      btn.textContent = "Hide Solution";
    } else {
      content.classList.add("hidden");
      btn.textContent = "Show Solution";
    }
  });
});


  // Safe MathJax typeset
  if (window.MathJax) {
    if (typeof MathJax.typesetPromise === "function") MathJax.typesetPromise().catch(() => {});
    else if (MathJax.Hub && typeof MathJax.Hub.Queue === "function") MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
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

  // ----- FINALIZE TIME TRACKING -----
const now = Date.now();
if (currentSubject && lastTimestamp) {
  timeSpent[currentSubject] += (now - lastTimestamp);
}
console.log("FINAL_TIME_SPENT:", timeSpent);

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



  // ---------- INITIAL RENDER ----------
  renderPalette();
  renderQuestion(currentIndex);
});
