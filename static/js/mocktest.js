document.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("mocktest-app");
  if (!app) return;

  let currentSubject = Object.keys(window.mockTestData)[0];
  let questions = window.mockTestData[currentSubject];
  let currentIndex = 0;
  let userAnswers = [];

  function renderTabs() {
    const tabsHtml = Object.keys(window.mockTestData).map(sub => `
      <button class="subject-tab px-4 py-2 rounded-lg font-medium ${sub === currentSubject ? 'bg-blue-500 text-white' : 'bg-gray-700 text-white'}"
              data-subject="${sub}">
        ${sub}
      </button>
    `).join('');
    app.innerHTML = `<div class="flex gap-2 mb-4">${tabsHtml}</div><div id="mock-question-container"></div>`;
    document.querySelectorAll(".subject-tab").forEach(btn => {
      btn.addEventListener("click", () => {
        currentSubject = btn.dataset.subject;
        questions = window.mockTestData[currentSubject];
        currentIndex = 0;
        userAnswers = [];
        renderQuestion();
        renderTabs();
      });
    });
  }

  function renderQuestion() {
    if (!questions || questions.length === 0) {
      document.getElementById("mock-question-container").innerHTML = "<p>No questions available.</p>";
      return;
    }

    const q = questions[currentIndex];
    const tagsHtml = q.tags.map(tag => `<span class="px-2 py-1 bg-yellow-400 text-black rounded-full text-sm">${tag}</span>`).join(' ');
    const optionsHtml = q.options.map((opt, i) => `<li class="option border rounded p-2 cursor-pointer" data-index="${i}">${opt}</li>`).join('');

    const questionHtml = `
      <div class="border rounded-lg p-4 shadow">
        <h2 class="font-medium mb-2">Q${currentIndex + 1}.</h2>
        <div class="mb-2">${q.question.replace(/\n/g, '<br>')}</div>
        <div class="mb-2">${tagsHtml}</div>
        ${q.question_type === "Integer Type" ? `
          <input type="text" id="int-answer" class="border rounded p-2 w-32 mb-2" placeholder="Enter answer">
          <button id="check-btn" class="px-4 py-2 bg-blue-500 text-white rounded">Submit</button>
        ` : `<ul class="space-y-2">${optionsHtml}</ul>`}
        <div class="solution mt-2 hidden"><strong>Solution:</strong> ${q.solution}</div>
        <div class="flex justify-between mt-4">
          <button id="prev-btn" class="px-4 py-2 bg-gray-600 text-white rounded" ${currentIndex === 0 ? 'style="display:none"' : ''}>Previous</button>
          <button id="next-btn" class="px-4 py-2 bg-gray-600 text-white rounded" ${currentIndex === questions.length - 1 ? 'style="display:none"' : ''}>Next</button>
        </div>
      </div>
    `;
    document.getElementById("mock-question-container").innerHTML = questionHtml;

    // Option click
    if (q.question_type !== "Integer Type") {
      document.querySelectorAll(".option").forEach(opt => {
        opt.addEventListener("click", () => {
          const selectedIndex = parseInt(opt.dataset.index);
          userAnswers[currentIndex] = selectedIndex;
          showSolution();
        });
      });
    } else {
      document.getElementById("check-btn").addEventListener("click", () => {
        const val = document.getElementById("int-answer").value.trim();
        userAnswers[currentIndex] = val;
        showSolution();
      });
    }

    // Navigation
    document.getElementById("prev-btn")?.addEventListener("click", () => {
      currentIndex--;
      renderQuestion();
    });
    document.getElementById("next-btn")?.addEventListener("click", () => {
      currentIndex++;
      renderQuestion();
    });

    function showSolution() {
      document.querySelector(".solution").classList.remove("hidden");
    }
  }

  renderTabs();
  renderQuestion();
});
