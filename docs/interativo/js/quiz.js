let currentQuestion = 0;
let answers = [];
let answered = false;

function initQuiz() {
  answers = new Array(QUIZ_QUESTIONS.length).fill(null);
  currentQuestion = 0;
  renderQuestion();
}

function renderQuestion() {
  const q = QUIZ_QUESTIONS[currentQuestion];
  const total = QUIZ_QUESTIONS.length;
  const progress = ((currentQuestion) / total) * 100;

  document.getElementById("quiz-progress-bar").style.width = `${progress}%`;
  document.getElementById("quiz-container").innerHTML = `
    <div class="quiz-card">
      <div class="quiz-question-number">Questão ${currentQuestion + 1} de ${total}</div>
      <div class="quiz-question-text">${q.question}</div>

      ${q.snippet ? `
        <div class="quiz-snippet">
          <pre>${escapeHtml(q.snippet)}</pre>
        </div>
      ` : ""}

      <div class="quiz-options" id="quiz-options">
        ${renderOptions(q)}
      </div>

      <div id="quiz-feedback"></div>
      <div class="quiz-actions" id="quiz-actions"></div>
    </div>
  `;

  bindOptionHandlers(q);
  answered = answers[currentQuestion] !== null;

  if (answered) {
    showFeedback(q, answers[currentQuestion]);
  }
}

function renderOptions(q) {
  const letters = ["A", "B", "C", "D"];

  if (q.type === "code-choice") {
    return q.options.map((opt, i) => `
      <button class="quiz-option" data-index="${i}" type="button">
        <span class="quiz-option-letter">${letters[i]}</span>
        <span>
          <strong>${opt.label}</strong>
          <div class="quiz-snippet" style="margin-top:0.5rem;margin-bottom:0">
            <pre>${escapeHtml(opt.code)}</pre>
          </div>
        </span>
      </button>
    `).join("");
  }

  return q.options.map((opt, i) => `
    <button class="quiz-option" data-index="${i}" type="button">
      <span class="quiz-option-letter">${letters[i]}</span>
      <span>${escapeHtml(opt.text)}</span>
    </button>
  `).join("");
}

function bindOptionHandlers(q) {
  document.querySelectorAll(".quiz-option").forEach(btn => {
    btn.addEventListener("click", () => {
      if (answered) return;

      const index = parseInt(btn.dataset.index, 10);
      answers[currentQuestion] = index;
      answered = true;
      showFeedback(q, index);
    });
  });
}

function showFeedback(q, selectedIndex) {
  const correctIndex = q.options.findIndex(o => o.correct);
  const isCorrect = selectedIndex === correctIndex;

  document.querySelectorAll(".quiz-option").forEach((btn, i) => {
    btn.disabled = true;
    if (i === correctIndex) btn.classList.add("correct");
    else if (i === selectedIndex && !isCorrect) btn.classList.add("wrong");
  });

  const feedback = document.getElementById("quiz-feedback");
  feedback.className = `quiz-feedback ${isCorrect ? "correct" : "wrong"}`;
  feedback.innerHTML = isCorrect
    ? `✓ Correto! ${q.explanation}`
    : `✗ Incorreto. ${q.explanation}`;

  const actions = document.getElementById("quiz-actions");
  const isLast = currentQuestion === QUIZ_QUESTIONS.length - 1;

  actions.innerHTML = isLast
    ? `<button class="btn btn-success" id="finish-btn">Ver resultado final</button>`
    : `<button class="btn btn-primary" id="next-btn">Próxima questão →</button>`;

  if (isLast) {
    document.getElementById("finish-btn").addEventListener("click", showResults);
  } else {
    document.getElementById("next-btn").addEventListener("click", () => {
      currentQuestion++;
      answered = false;
      renderQuestion();
    });
  }
}

function showResults() {
  const total = QUIZ_QUESTIONS.length;
  let score = 0;

  QUIZ_QUESTIONS.forEach((q, i) => {
    const correctIndex = q.options.findIndex(o => o.correct);
    if (answers[i] === correctIndex) score++;
  });

  const pct = Math.round((score / total) * 100);
  let message = "Continue estudando os comparativos!";
  if (pct >= 90) message = "Excelente! Domínio sólido de refatoração.";
  else if (pct >= 70) message = "Bom trabalho! Revise os smells que errou.";
  else if (pct >= 50) message = "Razoável. Releia a seção de code smells.";

  document.getElementById("quiz-progress-bar").style.width = "100%";

  document.getElementById("quiz-container").innerHTML = `
    <div class="quiz-card quiz-result">
      <h3>Resultado final</h3>
      <div class="quiz-result-score">${score}/${total}</div>
      <div class="quiz-result-message">${message}</div>
      <div class="quiz-result-detail">${pct}% de acertos</div>

      <button class="btn btn-primary" id="retry-btn">Tentar novamente</button>
      <a class="btn btn-secondary" href="comparativo.html" style="margin-left:0.5rem">Revisar comparativos</a>

      <div class="quiz-review">
        <h4 style="margin-bottom:1rem">Revisão das questões</h4>
        ${QUIZ_QUESTIONS.map((q, i) => {
          const correctIndex = q.options.findIndex(o => o.correct);
          const ok = answers[i] === correctIndex;
          const letter = ["A","B","C","D"][answers[i]] ?? "—";
          const correctLetter = ["A","B","C","D"][correctIndex];
          return `
            <div class="quiz-review-item ${ok ? "correct-item" : "wrong-item"}">
              <strong>Q${i + 1}:</strong> ${q.question}<br>
              Sua resposta: ${letter} ${ok ? "✓" : `(correta: ${correctLetter})`}
            </div>
          `;
        }).join("")}
      </div>
    </div>
  `;

  document.getElementById("retry-btn").addEventListener("click", initQuiz);
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

document.addEventListener("DOMContentLoaded", initQuiz);
