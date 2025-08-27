// /js/practice.js
document.addEventListener("DOMContentLoaded", () => {
  const dataEl = document.getElementById("practice-data");
  if (!dataEl) {
    console.warn("practice.js: #practice-data not found");
    return;
  }

  let questions = [];
  try {
    questions = JSON.parse(dataEl.textContent || "[]");
  } catch (err) {
    console.error("practice.js: JSON parse error for #practice-data:", err);
    return;
  }

  const app = document.getElementById("practice-app");
  if (!app) return;

  // Robust normalizer with fallbacks
  function normalizeCorrectIndices(raw, optionCount, options) {
    if (raw == null) return [];

    // If raw is object like {"0": true, "2": true}, prefer the keys where value truthy
    if (typeof raw === "object" && !Array.isArray(raw)) {
      const keys = Object.keys(raw || {});
      const truthyKeys = keys.filter(k => {
        const v = raw[k];
        return v === true || v === "true" || v === 1 || v === "1" || v === "on";
      });
      if (truthyKeys.length) {
        raw = truthyKeys;
      }
    }

    // Turn into token list (split strings with comma/semicolon)
    let tokens = [];
    if (Array.isArray(raw)) {
      raw.forEach(item => {
        if (typeof item === "string" && /[,;]+/.test(item)) {
          tokens.push(...item.split(/[,;]\s*/).map(s => s.trim()).filter(Boolean));
        } else tokens.push(item);
      });
    } else if (typeof raw === "string") {
      if (/[,;]+/.test(raw)) {
        tokens = raw.split(/[,;]\s*/).map(s => s.trim()).filter(Boolean);
      } else {
        tokens = [raw];
      }
    } else {
      tokens = [raw];
    }

    const candidates = [];

    tokens.forEach(tok => {
      if (tok == null) return;
      if (typeof tok === "number" && Number.isFinite(tok)) {
        candidates.push(tok);
        return;
      }
      const s = String(tok).trim();
      if (s === "") return;

      // Single letter like "A" -> 0
      if (/^[A-Za-z]$/.test(s)) {
        candidates.push(s.toUpperCase().charCodeAt(0) - 65);
        return;
      }

      // Numeric string
      const n = Number(s);
      if (!Number.isNaN(n) && Number.isFinite(n)) {
        candidates.push(n);
        return;
      }

      // Try exact option text match (case-insensitive)
      if (Array.isArray(options)) {
        const exact = options.findIndex(o => (o || "").toString().trim().toLowerCase() === s.toLowerCase());
        if (exact !== -1) {
          candidates.push(exact);
          return;
        }
        // substring match fallback
        const sub = options.findIndex(o => (o || "").toString().toLowerCase().includes(s.toLowerCase()));
        if (sub !== -1) {
          candidates.push(sub);
          return;
        }
      }

      // If nothing worked, ignore token
    });

    const numeric = candidates.filter(x => Number.isFinite(x)).map(Number);

    if (numeric.length === 0) return [];

    const allWithinOneBased = numeric.every(n => n >= 1 && n <= optionCount);
    const allWithinZeroBased = numeric.every(n => n >= 0 && n < optionCount);
    const hasZero = numeric.some(n => n === 0);

    let final = numeric.slice();
    // convert 1-based to 0-based when it's the likely case
    if (!hasZero && allWithinOneBased && !allWithinZeroBased) {
      final = final.map(n => n - 1);
    }

    final = Array.from(new Set(final.filter(n => n >= 0 && n < optionCount)));
    return final;
  }

  let currentIndex = 0;

  function renderQuestion(index) {
    const q = questions[index];
    if (!q) {
      app.innerHTML = `<p>No question found.</p>`;
      return;
    }

    const options = Array.isArray(q.options) ? q.options : [];
    const optionCount = options.length;
    const normalized = normalizeCorrectIndices(q.correctIndices, optionCount, options);

    app.innerHTML = `
      <div class="question border rounded-lg p-4 shadow mb-4" data-qtype="${q.question_type || ""}">
        <h2 class="font-normal mb-3">Q${index + 1}. ${q.question || ""}</h2>

        ${(q.question_type === "Single Choice" || q.question_type === "Multiple Choice") ? `
          <ul class="space-y-2">
            ${options.map((opt, i) => `
              <li class="option cursor-pointer border rounded p-2 hover:bg-gray-100/10"
                  data-index="${i}">
                <span class="latex-option">${opt}</span>
              </li>
            `).join("")}
          </ul>
        ` : ""}

        ${q.question_type === "Integer Type" ? `
          <div class="mt-3">
            <input type="text" class="integer-input border rounded p-2 w-32" placeholder="Enter answer" />
            <button class="check-int bg-blue-500 text-white px-3 py-1 rounded ml-2">Check</button>
          </div>
        ` : ""}

        <div class="solution mt-4 hidden">
          <strong>Solution:</strong> ${q.solution || ""}
        </div>

        <div class="debug mt-2 text-xs text-gray-400">
          <pre id="debug-info" style="white-space:pre-wrap;"></pre>
        </div>
      </div>

      <div class="flex justify-between mt-6">
        <button id="prev-btn" class="px-4 py-2 bg-gray-200 rounded" ${index === 0 ? "disabled" : ""}>Previous</button>
        <button id="next-btn" class="px-4 py-2 bg-blue-500 text-white rounded" ${index === questions.length - 1 ? "disabled" : ""}>Next</button>
      </div>
    `;

    const questionDiv = app.querySelector(".question");
    const solutionEl = questionDiv.querySelector(".solution");
    const optionEls = Array.from(questionDiv.querySelectorAll(".option"));
    const debugInfo = questionDiv.querySelector("#debug-info");

    // show debug info on page and console
    const debugObj = {
      raw_correctIndices: q.correctIndices,
      normalized_indices: normalized,
      optionCount: optionCount,
      options: options
    };
    if (debugInfo) debugInfo.textContent = JSON.stringify(debugObj, null, 2);
    console.log("practice debug:", debugObj);

    function revealAllCorrect() {
      normalized.forEach(ci => {
        const co = questionDiv.querySelector(`.option[data-index="${ci}"]`);
        if (co) co.classList.add("border-green-400", "bg-green-100");
      });
    }

    // Single Choice behaviour
    if (q.question_type === "Single Choice") {
      let locked = false;
      const correctIndex = normalized[0]; // undefined if not available

      optionEls.forEach(optEl => {
        optEl.addEventListener("click", () => {
          if (locked) return;
          const idx = Number(optEl.dataset.index);

          if (typeof correctIndex === "number") {
            if (idx === correctIndex) {
              optEl.classList.add("border-green-400", "bg-green-100");
            } else {
              optEl.classList.add("border-red-400", "bg-red-100");
              revealAllCorrect();
            }
          } else {
            // no correct found in data — mark clicked as red and reveal nothing (but show solution)
            optEl.classList.add("border-red-400", "bg-red-100");
          }

          solutionEl.classList.remove("hidden");
          locked = true;
          if (window.MathJax && MathJax.typesetPromise) MathJax.typesetPromise().catch(()=>{});
        });
      });
    }

    // Multiple Choice behaviour
    if (q.question_type === "Multiple Choice") {
      let locked = false;
      const correctSet = new Set(normalized);
      const selectedCorrect = new Set();

      optionEls.forEach(optEl => {
        optEl.addEventListener("click", () => {
          if (locked) return;
          const idx = Number(optEl.dataset.index);

          if (!correctSet.has(idx)) {
            // wrong clicked
            optEl.classList.add("border-red-400", "bg-red-100");
            revealAllCorrect();
            solutionEl.classList.remove("hidden");
            locked = true;
            if (window.MathJax && MathJax.typesetPromise) MathJax.typesetPromise().catch(()=>{});
            return;
          }

          // correct
          if (!selectedCorrect.has(idx)) {
            selectedCorrect.add(idx);
            optEl.classList.add("border-green-400", "bg-green-100");
          }

          // if all correct selected => show solution & lock
          if (selectedCorrect.size === correctSet.size && correctSet.size > 0) {
            solutionEl.classList.remove("hidden");
            locked = true;
            if (window.MathJax && MathJax.typesetPromise) MathJax.typesetPromise().catch(()=>{});
          }
        });
      });
    }

    // Integer type
    if (q.question_type === "Integer Type") {
      const inputEl = questionDiv.querySele
