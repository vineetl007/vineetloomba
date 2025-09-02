document.addEventListener("DOMContentLoaded", () => {
  const data = JSON.parse(document.getElementById("mocktest-data").textContent);
  const questions = data.questions;
  const rankPreset = data.rank_preset || [];

  let currentQuestionIndex = 0;
  let answers = Array(questions.length).fill(null); // user answers
  let visited = Array(questions.length).fill(false);

  const app = document.getElementById("mocktest-app");

  function renderTestUI() {
    app.innerHTML = `
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
          <div id="question-container" class="mb-4"></div>
          <div class="flex justify-between">
            <button id="prev-btn" class="bg-gray-300 px-3 py-1 rounded">Prev</button>
            <button id="next-btn" class="bg-gray-300 px-3 py-1 rounded">Next</button>
            <button id="submit-btn" class="bg-green-500 text-white px-4 py-1 rounded">Submit Test</button>
          </div>
        </div>
        <div class="w-full md:w-1/3">
          <h2 class="font-bold mb-2">Question Palette</h2>
          <div id="question-palette" class="grid grid-cols-6 gap-2"></div>
        </div>
      </div>
    `;

    renderQuestion();
    renderPalette();
    attachNavEvents();
  }

  function renderQuestion() {
    const q = questions[currentQuestionIndex];
    visited[currentQuestionIndex] = true;
    const container = document.getElementById("question-container");

    container.innerHTML = `
      <div class="mb-3 font-bold">Q${currentQuestionIndex + 1}. ${q.question}</div>
      <div class="flex flex-col gap-2">
        ${q.options
          .map(
            (opt, i) => `
          <label class="border p-2 rounded cursor-pointer">
            <input type="radio" name="option" value="${i}" ${
              answers[currentQuestionIndex] === i ? "checked" : ""
            } />
            ${opt}
          </label>
        `
          )
          .join("")}
      </div>
    `;

    // Save selected answer
    container.querySelectorAll('input[name="option"]').forEach((input) => {
      input.addEventListener("change", (e) => {
        answers[currentQuestionIndex] = parseInt(e.target.value);
        renderPalette();
      });
    });
  }

  function renderPalette() {
    const palette = document.getElementById("question-palette");
    palette.innerHTML = "";

    // Group questions by subject (Physics, Chemistry, Maths)
    const subjects = ["Physics", "Chemistry", "Maths"];
    let index = 0;

    subjects.forEach((sub) => {
      const subjectQuestions = questions.filter((q) => q.subject === sub);
      if (subjectQuestions.length > 0) {
        const heading = document.createElement("div");
        heading.className = "col-span-6 font-bold mt-2";
        heading.textContent = sub;
        palette.appendChild(heading);

        subjectQuestions.forEach(() => {
          const btn = document.createElement("button");
          btn.textContent = index + 1;
          btn.className =
            "border rounded w-8 h-8 flex items-center justify-center " +
            (answers[index] !== null
              ? "bg-blue-400 text-white"
              : visited[index]
              ? "bg-yellow-300"
              : "bg-gray-200");

          btn.addEventListener("click", () => {
            currentQuestionIndex = index;
            renderQuestion();
            renderPalette();
          });

          palette.appendChild(btn);
          index++;
        });
      }
    });
  }

  function attachNavEvents() {
    document.getElementById("prev-btn").addEventListener("click", () => {
      if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        renderQuestion();
        renderPalette();
      }
    });

    document.getElementById("next-btn").addEventListener("click", () => {
      if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        renderQuestion();
        renderPalette();
      }
    });

    document.getElementById("submit-btn").addEventListener("click", () => {
      showAnalysis();
    });
  }

  function showAnalysis() {
    let correct = 0,
      attempted = 0;

    const reviewHTML = questions
      .map((q, i) => {
        const chosen = answers[i];
        const correctAns = q.correctIndices[0];
        const isCorrect = chosen === correctAns;
        if (chosen !== null) attempted++;
        if (isCorrect) correct++;

        return `
          <div class="mb-6 p-4 border rounded">
            <div class="font-bold mb-2">Q${i + 1}. ${q.question}</div>
            ${q.options
              .map(
                (opt, idx) => `
              <div class="p-2 rounded ${
                idx === correctAns
                  ? "bg-green-200"
                  : idx === chosen
                  ? "bg-red-200"
                  : ""
              }">${opt}</div>
            `
              )
              .join("")}
            <div class="mt-2 text-sm text-gray-600">
              Your Answer: ${
                chosen !== null ? q.options[chosen] : "Not Attempted"
              }<br/>
              Correct Answer: ${q.options[correctAns]}
            </div>
          </div>
        `;
      })
      .join("");

    const score = correct * 4 - (attempted - correct) * 1;
    const predictedRank = rankPreset.find((r) => score >= r.marks)?.rank || "NA";

    app.innerHTML = `
      <h2 class="text-2xl font-bold mb-4">Analysis</h2>
      <p>Total Questions: ${questions.length}</p>
      <p>Attempted: ${attempted}</p>
      <p>Correct: ${correct}</p>
      <p>Score: ${score}</p>
      <p>Predicted Rank: ${predictedRank}</p>
      <div class="mt-6">${reviewHTML}</div>
    `;
  }

  renderTestUI();
});
