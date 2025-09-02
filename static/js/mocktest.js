document.addEventListener("DOMContentLoaded", () => {
  const data = JSON.parse(document.getElementById("mocktest-data").textContent);
  let questions = [];
  let questionMeta = []; // {subject, path, visited, answered, selectedOption}

  // ✅ Load all questions (fetching frontmatter JSON dynamically)
  async function loadQuestions() {
    let index = 1;

    async function fetchAndPush(arr, subject) {
      for (const qPath of arr) {
        const res = await fetch(`/${qPath}.json`);
        const qData = await res.json();
        questions.push(qData);
        questionMeta.push({
          id: index,
          subject,
          visited: false,
          answered: false,
          selectedOption: null,
          correctIndices: qData.correctIndices || []
        });
        index++;
      }
    }

    await fetchAndPush(data.physics_questions, "Physics");
    await fetchAndPush(data.chemistry_questions, "Chemistry");
    await fetchAndPush(data.maths_questions, "Maths");

    renderQuestion(0);
    renderPalette();
  }

  const app = document.getElementById("mocktest-app");
  let currentIndex = 0;

  function renderPalette() {
    const palette = document.createElement("div");
    palette.className = "grid grid-cols-10 gap-2 my-4";

    // ✅ Section headings
    const grouped = {
      Physics: questionMeta.filter(q => q.subject === "Physics"),
      Chemistry: questionMeta.filter(q => q.subject === "Chemistry"),
      Maths: questionMeta.filter(q => q.subject === "Maths"),
    };

    palette.innerHTML = "";

    Object.entries(grouped).forEach(([subject, arr]) => {
      if (arr.length === 0) return;
      const header = document.createElement("div");
      header.className = "col-span-10 font-semibold mt-2";
      header.textContent = subject;
      palette.appendChild(header);

      arr.forEach(q => {
        const btn = document.createElement("button");
        btn.textContent = q.id;
        btn.className = "border rounded px-2 py-1 text-sm";
        btn.addEventListener("click", () => {
          currentIndex = q.id - 1;
          renderQuestion(currentIndex);
          renderPalette();
        });

        if (q.answered) btn.classList.add("bg-green-300");
        else if (q.visited) btn.classList.add("bg-blue-200");
        palette.appendChild(btn);
      });
    });

    app.querySelector("#question-palette")?.remove();
    palette.id = "question-palette";
    app.appendChild(palette);
  }

  function renderQuestion(index) {
    const q = questions[index];
    const meta = questionMeta[index];
    meta.visited = true;

    const container = document.createElement("div");
    container.innerHTML = `
      <div class="p-4 border rounded shadow">
        <div class="mb-4 font-bold">Q${meta.id}. (${meta.subject})</div>
        <div class="mb-4">${q.question}</div>
        <div class="space-y-2">
          ${q.options
            .map(
              (opt, i) => `
            <div>
              <input type="radio" name="q${meta.id}" value="${i}" ${meta.selectedOption === i ? "checked" : ""}>
              <label>${opt}</label>
            </div>`
            )
            .join("")}
        </div>
        <div class="flex justify-between mt-4">
          <button id="prev-btn" class="border px-4 py-2 rounded">Prev</button>
          <button id="next-btn" class="border px-4 py-2 rounded">Next</button>
          <button id="submit-btn" class="border px-4 py-2 rounded bg-red-400 text-white">Submit</button>
        </div>
      </div>
    `;

    app.querySelector("#question-container")?.remove();
    container.id = "question-container";
    app.prepend(container);

    container.querySelectorAll(`input[name="q${meta.id}"]`).forEach(radio =>
      radio.addEventListener("change", e => {
        meta.selectedOption = parseInt(e.target.value);
        meta.answered = true;
        renderPalette();
      })
    );

    container.querySelector("#prev-btn").onclick = () => {
      if (currentIndex > 0) {
        currentIndex--;
        renderQuestion(currentIndex);
        renderPalette();
      }
    };
    container.querySelector("#next-btn").onclick = () => {
      if (currentIndex < questions.length - 1) {
        currentIndex++;
        renderQuestion(currentIndex);
        renderPalette();
      }
    };

    container.querySelector("#submit-btn").onclick = showAnalysis;
  }

  function showAnalysis() {
    let correct = 0, wrong = 0, attempted = 0;

    const review = document.createElement("div");
    review.className = "space-y-6";

    questions.forEach((q, i) => {
      const meta = questionMeta[i];
      const isCorrect = meta.selectedOption !== null && meta.correctIndices.includes(meta.selectedOption);
      if (meta.selectedOption !== null) attempted++;
      if (isCorrect) correct++; else if (meta.selectedOption !== null) wrong++;

      review.innerHTML += `
        <div class="p-4 border rounded shadow">
          <div class="font-bold mb-2">Q${meta.id} (${meta.subject})</div>
          <div class="mb-2">${q.question}</div>
          <div class="space-y-1">
            ${q.options.map((opt, idx) => {
              let cls = "";
              if (meta.selectedOption === idx) cls = isCorrect ? "bg-green-200" : "bg-red-200";
              if (q.correctIndices.includes(idx)) cls = "bg-green-200 font-bold";
              return `<div class="${cls} p-1 rounded">${opt}</div>`;
            }).join("")}
          </div>
        </div>`;
    });

    const totalMarks = correct * 4 - wrong; // adjust if JEE Adv partial needed
    const nearest = data.rank_preset.reduce((prev, curr) =>
      Math.abs(curr.marks - totalMarks) < Math.abs(prev.marks - totalMarks) ? curr : prev
    );

    review.innerHTML = `
      <h2 class="text-xl font-bold">Analysis</h2>
      <p>Total: ${questions.length}, Attempted: ${attempted}, Correct: ${correct}, Wrong: ${wrong}, Marks: ${totalMarks}</p>
      <p>Predicted Rank: ${nearest.rank}</p>
    ` + review.innerHTML;

    app.innerHTML = "";
    app.appendChild(review);
  }

  loadQuestions();
});
