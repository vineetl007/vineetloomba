document.addEventListener("DOMContentLoaded", () => {
  const dataEl = document.getElementById("practice-data");
  if (!dataEl) return;

  const questions = JSON.parse(dataEl.textContent);
  let currentIndex = 0;
  const app = document.getElementById("practice-app");

  function renderQuestion(index) {
    const q = questions[index];
    app.innerHTML = `
      <div class="question border rounded-lg p-4 shadow mb-4">
        <h2 class="font-semibold mb-3">Q${index + 1}. ${q.question}</h2>
        <ul class="space-y-2">
          ${q.options.map((opt, i) => `
  <li class="option cursor-pointer border rounded p-2 hover:bg-gray-100"
      data-index="${i}" data-correct="${q.correctIndices.includes(i)}">
    ${opt}
  </li>
`).join("")}

        </ul>
        <div class="solution mt-4 hidden text-green-700">
          <strong>Solution:</strong> ${q.solution}
        </div>
      </div>

      <div class="flex justify-between mt-6">
        <button id="prev-btn" ${index === 0 ? "disabled" : ""}>Previous</button>
        <button id="next-btn" ${index === questions.length - 1 ? "disabled" : ""}>Next</button>
      </div>
    `;
  }

  renderQuestion(currentIndex);
  <script>
MathJax = {
  tex: { inlineMath: [['$', '$'], ['\\(', '\\)']] },
  svg: { fontCache: 'global' }
};
</script>
<script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"></script>

});
