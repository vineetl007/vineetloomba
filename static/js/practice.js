document.addEventListener("DOMContentLoaded", () => {
  const dataEl = document.getElementById("practice-data");
  if (!dataEl) return;

  const questions = JSON.parse(dataEl.textContent);
  let currentIndex = 0;
  const app = document.getElementById("practice-app");

  function renderQuestion(index) {
    const q = questions[index];
 /*const tags = Array.isArray(q.tags)
  ? q.tags
  : (typeof q.tags === "string" && q.tags.trim())
    ? q.tags.split(",").map(s => s.trim()).filter(Boolean)
    : [];*/
  //  const tags = Array.isArray(q.tags) ? q.tags : [];
    // ---------- REPLACE YOUR old `const tags = ...` WITH THIS BLOCK ----------
const tags = (() => {
  // case 1: already an array (normal Hugo/jsonify output)
  if (Array.isArray(q.tags)) return q.tags.map(t => String(t).trim()).filter(Boolean);

  // case 2: a string — could be JSON-stringified array '["jeemain"]' or comma-separated "a, b"
  if (typeof q.tags === "string" && q.tags.trim()) {
    const s = q.tags.trim();

    // try JSON.parse first (handles '["jeemain"]' or '["a","b"]')
    try {
      const parsed = JSON.parse(s);
      if (Array.isArray(parsed)) return parsed.map(t => String(t).trim()).filter(Boolean);
    } catch (e) { /* not JSON */ }

    // fallback: remove surrounding brackets if present and split by comma
    const cleaned = s.replace(/^\[|\]$/g, "");
    return cleaned.split(",").map(t => String(t).trim()).filter(Boolean);
  }

  // case 3: sometimes CMS gives an object-like structure — try to extract values
  if (q.tags && typeof q.tags === "object") {
    try {
      return Object.values(q.tags)
        .flat()
        .map(t => String(t).trim())
        .filter(Boolean);
    } catch (e) { /* ignore */ }
  }

  // default: empty array
  return [];
})();
    const isMulti = q.question_type === "Multiple Choice";
    const isInteger = q.question_type === "Integer Type";  // ✅ added
    let selectedIndices = [];
    
// difficulty and tags and question type pulled dynamically 

// ✅ First: prepare questionHtml OUTSIDE the template string
function renderImages(mdText) {
  return mdText.replace(
    /!\[.*?\]\((.*?)\)/g,
    `<img src="$1" class="w-full max-w-sm mx-auto my-4" style="height:auto;" />`
  );
}


const rawQ = String(q.question || "");
const questionHtml = rawQ
  .split(/\n\s*\n/)                       // split paragraphs on blank lines
  .map(p => `<p>${renderImages(p).replace(/\n/g, '<br>')}</p>`) // convert single newlines to <br>
  .join("");


// ✅ Then build the HTML normally
app.innerHTML = `
  <div class="question border rounded-lg p-4 shadow mb-4">
    
  <div class="mb-4 flex flex-wrap gap-2">
${tags.length ? tags.map(tag => `
  <a href="/tags/${encodeURIComponent(tag.toLowerCase())}/"
     class="bg-yellow-400 text-black font-concert text-sm px-3 py-1 rounded-full hover:bg-yellow-300 transition">
    ${tag}
  </a>
`).join('') : ''}


  ${q.difficulty ? `
    <a href="/difficulty/${q.difficulty}/" 
       class="bg-blue-500 text-white font-concert text-sm px-3 py-1 rounded-full hover:bg-blue-400 transition">
      Difficulty: ${q.difficulty}
    </a>
  ` : ''}

  ${q.question_type ? `
    <a href="/question-type/${q.question_type}/" 
       class="bg-purple-500 text-white font-concert text-sm px-3 py-1 rounded-full hover:bg-purple-400 transition">
      Type: ${q.question_type}
    </a>
  ` : ''}
</div>

    <h2 class="font-normal mb-3">Q${index + 1}.</h2>
    <div class="question-text mb-3">${questionHtml}</div>

        ${
          isInteger
            ? `
              <div class="flex items-center space-x-2">
                <input id="int-answer" type="text" 
                       class="border rounded p-2 w-32 bg-gray-800 text-white font-concert placeholder-gray-400" 
                       placeholder="Enter answer" />
                <button id="check-btn" class="px-4 py-2 font-concert bg-blue-500 text-white rounded">
                  Submit
                </button>
              </div>
            `
            : `
              <ul class="space-y-2">
                ${q.options.map((opt, i) => `
                  <li class="option cursor-pointer border rounded p-2 hover:bg-gray-100/10"
                      data-index="${i}" data-correct="${q.correctIndices.includes(i)}">
                    <span class="latex-option">${opt}</span>
                  </li>
                `).join("")}
              </ul>
            `
        }

 
<div class="solution mt-4 hidden">
  <strong>Solution:</strong> ${q.solution}

${q.video_url ? `
  <div class="mt-6">
    <p class="text-lg font-semibold mb-2">🎥 Video Solution</p>
<div style="display:flex;justify-content:center;">
  <div style="width:100%; max-width:720px; aspect-ratio:16/9; overflow:hidden; border-radius:12px;">
  <iframe
    src="${q.video_url}"
    style="width:100%; height:100%; border:0; display:block;"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen
    referrerpolicy="strict-origin-when-cross-origin"
    title="Video Solution"></iframe>
</div>
  </div>
` : ""}
</div>




      <div class="flex justify-between mt-6">
        <button id="prev-btn" class="px-4 py-2 bg-blue-500 font-concert rounded" ${index === 0 ? 'style="display:none"' : ""}>Previous</button>
        <button id="next-btn" class="px-4 py-2 bg-blue-500 font-concert text-white rounded" ${index === questions.length - 1 ? 'style="display:none"' : ""}>Next</button>
      </div>
    `;

    // ✅ Option click behavior (unchanged, but only runs if NOT integer type)
    if (!isInteger) {
      app.querySelectorAll(".option").forEach(opt => {
        opt.addEventListener("click", () => {
          const questionDiv = opt.closest(".question");
          const solution = questionDiv.querySelector(".solution");
          const correct = opt.dataset.correct === "true";
          const optionIndex = parseInt(opt.dataset.index);

          if (!isMulti) {
            // ----- SINGLE CHOICE -----
            questionDiv.querySelectorAll(".option").forEach(o => {
              o.classList.remove("border-green-400", "border-red-400");
            });

            if (correct) {
              opt.classList.add("border-green-400");
            } else {
              opt.classList.add("border-red-400");
              const correctOption = Array.from(questionDiv.querySelectorAll(".option"))
                .find(o => o.dataset.correct === "true");
              if (correctOption) correctOption.classList.add("border-green-400");
            }

            solution.classList.remove("hidden");
            questionDiv.querySelectorAll(".option").forEach(o => o.style.pointerEvents = "none");

          } else {
            // ----- MULTIPLE CHOICE -----
            if (!correct) {
              opt.classList.add("border-red-400");
              questionDiv.querySelectorAll(".option").forEach(o => {
                if (o.dataset.correct === "true") o.classList.add("border-green-400");
              });
              solution.classList.remove("hidden");
              questionDiv.querySelectorAll(".option").forEach(o => o.style.pointerEvents = "none");
            } else {
              if (!selectedIndices.includes(optionIndex)) {
                selectedIndices.push(optionIndex);
                opt.classList.add("border-green-400");
              }
              const allCorrect = Array.from(questionDiv.querySelectorAll(".option"))
                .filter(o => o.dataset.correct === "true")
                .every(o => selectedIndices.includes(parseInt(o.dataset.index)));

              if (allCorrect) {
                solution.classList.remove("hidden");
                questionDiv.querySelectorAll(".option").forEach(o => o.style.pointerEvents = "none");
              }
            }
          }
        });
      });
    }

    // ✅ Integer Type handler
    if (isInteger) {
      const input = app.querySelector("#int-answer");
      const checkBtn = app.querySelector("#check-btn");
      const solution = app.querySelector(".solution");

      checkBtn.addEventListener("click", () => {
        const userAns = input.value.trim();
        const correctAns = (q.numerical_answer || "").trim();

        if (userAns === correctAns) {
          input.classList.add("border-green-400");
        } else {
          input.classList.add("border-red-400");
        }

        solution.classList.remove("hidden");
        input.disabled = true;
        checkBtn.disabled = true;
      });
    }

    // Navigation buttons
    app.querySelector("#prev-btn")?.addEventListener("click", () => {
      if (currentIndex > 0) {
        currentIndex--;
        renderQuestion(currentIndex);
      }
    });

    app.querySelector("#next-btn")?.addEventListener("click", () => {
      if (currentIndex < questions.length - 1) {
        currentIndex++;
        renderQuestion(currentIndex);
      }
    });

  /*  // Render LaTeX after HTML is added
    if (window.MathJax) {
      MathJax.typesetPromise();
    } */

    // Render KaTeX after HTML is added
// Render KaTeX in all newly added content
if (typeof renderMathInElement === "function") {
  const container = document.getElementById("practice-app") || document.body; // container of all practice content
  renderMathInElement(container, {
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

  // Render first question
  renderQuestion(currentIndex);
});
