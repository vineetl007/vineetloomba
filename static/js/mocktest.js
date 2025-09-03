document.addEventListener("DOMContentLoaded", () => {
  const dataEl = document.getElementById("mocktest-data");
  if (!dataEl) return;

  const payload = JSON.parse(dataEl.textContent);
// ✅ Normalize question data
const questions = (payload.questions || []).map(q => {
  // Make sure correctIndices is always an array of numbers
  q.correctIndices = Array.isArray(q.correctIndices)
    ? q.correctIndices.map(i => Number(i))
    : [];

  // For integer type, normalize answer string
  if (q.question_type === "Integer Type" && typeof q.numerical_answer === "string") {
    q.numerical_answer = q.numerical_answer.trim();
  }

  return q;
});
  const rankPreset = payload.rankPreset || [];
  const durationMinutes = Number(payload.durationMinutes || 180);

// ---------- Normalize question data (robust) ----------
questions.forEach(q => {
  // normalize type string
  q.question_type = String(q.question_type || "Single Choice").trim();

  // Ensure options exists (helps later checks)
  if (!Array.isArray(q.options)) q.options = [];

  if (q.question_type === "Integer Type") {
    q.numerical_answer = String(q.numerical_answer ?? "").trim();
    // Integer questions don't use correctIndices as MCQ does
    q.correctIndices = [];
    return;
  }

  // Normalize correctIndices into a clean numeric array
  let correctIndicesArray = [];
  if (Array.isArray(q.correctIndices)) {
    correctIndicesArray = q.correctIndices;
  } else if (q.correctIndices !== undefined && q.correctIndices !== null) {
    correctIndicesArray = [q.correctIndices];
  }

  // Filter out non-numeric values and ensure they are 0-based
  q.correctIndices = correctIndicesArray
    .map(ci => Number(ci))
    .filter(ci => !isNaN(ci) && ci >= 0 && ci < q.options.length);
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
    timerEl.textContent = formatTime(remaining);
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

    const rawQ = String(q.question || "");
    const questionHtml = rawQ
      .split(/\n\s*\n/)
      .map(p => `<p>${p.replace(/\n/g, "<br>")}</p>`)
      .join("");

   
    const isInteger = q.question_type === "Integer Type";

    app.innerHTML = `
      <div class="border rounded-lg p-4 shadow mb-4">
        <div class="flex justify-between items-center mb-3">
          <h2 class="font-bold">Q${idx + 1} <span class="text-sm text-yellow-300 ml-2">[${q.subject}]</span></h2>
          <button id="mark-btn" class="px-3 py-1 rounded ${st.marked ? 'bg-purple-600' : 'bg-gray-700'} text-white">
            ${st.marked ? 'Unmark' : 'Mark for Review'}
          </button>
        </div>

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
  <li class="option cursor-pointer border rounded p-2 hover:bg-gray-100/10 ${(st.selected || []).map(Number).includes(i) ? 'bg-blue-600' : ''}"
      data-index="${i}">
    <span class="latex-option">${opt}</span>
  </li>
`).join("")}
              </ul>
            `
        }

        <div class="flex justify-between mt-6">
          <button id="prev-btn" class="px-4 py-2 bg-blue-500 text-white rounded" ${idx === 0 ? 'style="visibility:hidden"' : ""}>Previous</button>
          <div class="flex items-center gap-2">
            <button id="clear-btn" class="px-3 py-2 bg-gray-700 text-white rounded">Clear Response</button>
            <button id="next-btn" class="px-4 py-2 bg-blue-500 text-white rounded" ${idx === questions.length - 1 ? 'style="visibility:hidden"' : ""}>Save & Next</button>
          </div>
        </div>
      </div>
    `;

    // Option selection (no feedback)
    if (!isInteger) {
      app.querySelectorAll(".option").forEach(opt => {
        opt.addEventListener("click", () => {
          const i = parseInt(opt.dataset.index);
      state[idx].selected = [Number(i)]; // ✅ ensure numeric          
          renderQuestion(idx);
          renderPalette();
        });
      });
    } else {
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

  // Integer Type → compare string
  if (q.question_type === "Integer Type") {
    const user = String(s.selected?.[0] ?? "").trim();
    const correct = String(q.numerical_answer ?? "").trim();
    return user !== "" && user === correct;
  }

  // Single / Multiple Choice → compare arrays
  if (Array.isArray(q.correctIndices) && q.correctIndices.length > 0) {
    const correctSet = new Set(q.correctIndices.map(Number));
    const selectedSet = new Set((s.selected || []).map(Number));

    // Must match exactly (no extra selections, no missing ones)
    if (selectedSet.size !== correctSet.size) return false;
    for (const val of selectedSet) if (!correctSet.has(val)) return false;
    return true;
  }

  // If no correctIndices → mark incorrect
  return false;
}


// ---------- RENDER ANALYSIS ----------
function renderAnalysis() {
  const { correct, wrong, unattempted, score, total } = calculateScore();
  const rank = mapRank(score);

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
const userMCQ = !isInt && q.question_type === "Single Choice" && st.selected?.[0] !== undefined
  ? [Number(st.selected[0])]
  : [];



    // Determine correctness
    const gotIt = isInt ? (userInt !== "" && userInt === q.numerical_answer) : compareArrays(userMCQ, correctIdxs);

    // Question HTML
    const qHtml = String(q.question || "").split(/\n\s*\n/).map(p => `<p>${p.replace(/\n/g, "<br>")}</p>`).join("");

    // User answer display
    const userAnsHtml = isInt
      ? (userInt ? `<span class="${gotIt ? 'text-green-400' : 'text-red-400'}">Your answer: ${userInt}</span>` : `<span class="text-gray-400">Your answer: —</span>`)
      : (userMCQ.length ? `<span class="${gotIt ? 'text-green-400' : 'text-red-400'}">Your answer: ${userMCQ.map(x => String.fromCharCode(65 + Number(x))).join(", ")}</span>` : `<span class="text-gray-400">Your answer: —</span>`);

    // Correct answer display
    const correctAnsHtml = isInt
      ? `Correct answer: <span class="text-green-400">${q.numerical_answer}</span>`
      : (q.question_type === "Single Choice" ? `Correct answer: <span class="text-green-400">${q.options[correctIdxs[0]]}</span>` : "Correct answer: —");

    // Options HTML for Single Choice
const optionsHtml = !isInt && q.question_type === "Single Choice" ? `
  <ul class="space-y-2">
    ${q.options.map((opt, oi) => {
      const oiNum = Number(oi);
      const cls = (oiNum === (correctIdxs[0] ?? -1))
        ? 'border-green-500'
        : (userMCQ.includes(oiNum) ? 'border-red-500' : 'border-gray-700');
      return `<li class="border ${cls} rounded p-2"><span class="latex-option">${opt}</span></li>`;
    }).join("")}
  </ul>
` : '';


    // Final card
    return `
      <div id="analysis-q-${i + 1}" class="border rounded-lg p-4 mb-4 ${gotIt ? 'bg-green-950/30' : (isAnswered(i) ? 'bg-red-950/30' : 'bg-gray-900/40')}">
        <div class="flex justify-between items-center mb-2">
          <div class="font-bold">Q${i + 1} <span class="text-sm text-yellow-300 ml-2">[${q.subject}]</span></div>
          <div class="text-xs ${st.marked ? 'text-purple-300' : 'text-transparent'}">${st.marked ? 'Marked for Review' : '.'}</div>
        </div>
        <div class="mb-3">${qHtml}</div>
        ${!isInt ? optionsHtml : ''}
        <div class="mt-3 text-sm space-y-1">
          <div>${userAnsHtml}</div>
          <div>${correctAnsHtml}</div>
        </div>
        <div class="solution mt-3">
          <div class="text-sm font-semibold mb-1">Solution:</div>
          <div>${q.solution}</div>
          ${q.video_url ? `
            <div class="mt-3 flex justify-center">
              <div style="width:100%; max-width:720px; aspect-ratio:16/9; overflow:hidden; border-radius:12px;">
                <iframe
                  src="${q.video_url}"
                  style="width:100%; height:100%; border:0; display:block;"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowfullscreen
                  referrerpolicy="strict-origin-when-cross-origin"
                  title="Video Solution"></iframe>
              </div>
            </div>` : ''}
        </div>
      </div>
    `;
  }).join("");

  app.innerHTML = summaryHtml + cards;

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
