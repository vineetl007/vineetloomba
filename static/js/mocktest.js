document.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("mocktest-app");
  if (!app || !window.mockQuestions) return;

  let questions = window.mockQuestions;
  let currentIndex = 0;

  function renderQuestion(index) {
    const q = questions[index];
    if (!q) return;

    const rawQ = String(q.question || "");
    const questionHtml = rawQ
      .split(/\n\s*\n/)
      .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
      .join("");

    app.innerHTML = `
      <div class="question border rounded-lg p-4 shadow mb-4">
        <h2 class="font-normal mb-3">Q${index+1}.</h2>
        <div class="question-text mb-3">${questionHtml}</div>
      </div>
    `;

    // MathJax render
    if (window.MathJax) MathJax.typesetPromise();
  }

  renderQuestion(currentIndex);
});
