let currentQuestion = 0;
let answers = [];
let answered = false;
let selectedOption = null;

function initQuiz() {
  answers = new Array(QUIZ_QUESTIONS.length).fill(null);
  currentQuestion = 0;
  selectedOption = null;
  answered = false;
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
      <div class="quiz-actions" id="quiz-actions">
        <button class="btn btn-primary" id="validate-btn" type="button" disabled>Validar resposta</button>
      </div>
    </div>
  `;

  bindOptionHandlers(q);
  answered = answers[currentQuestion] !== null;

  if (answered) {
    showFeedback(q, answers[currentQuestion]);
  } else {
    bindValidateHandler(q);
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
      selectedOption = index;

      document.querySelectorAll(".quiz-option").forEach((option, i) => {
        option.classList.toggle("selected", i === index);
      });

      const validateBtn = document.getElementById("validate-btn");
      if (validateBtn) {
        validateBtn.disabled = false;
      }
    });
  });
}

function bindValidateHandler(q) {
  const validateBtn = document.getElementById("validate-btn");
  if (!validateBtn) return;

  validateBtn.addEventListener("click", () => {
    if (answered || selectedOption === null) return;

    answers[currentQuestion] = selectedOption;
    answered = true;
    showFeedback(q, selectedOption);
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
    : `<button class="btn btn-primary" id="next-btn">Próxima questão</button>`;

  if (isLast) {
    document.getElementById("finish-btn").addEventListener("click", showResults);
  } else {
    document.getElementById("next-btn").addEventListener("click", () => {
      currentQuestion++;
      selectedOption = null;
      answered = false;
      renderQuestion();
    });
  }
}

function calculateScore() {
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

  return { score, total, pct, message };
}

function buildReviewHtml() {
  return QUIZ_QUESTIONS.map((q, i) => {
    const correctIndex = q.options.findIndex(o => o.correct);
    const ok = answers[i] === correctIndex;
    const letter = ["A", "B", "C", "D"][answers[i]] ?? "—";
    const correctLetter = ["A", "B", "C", "D"][correctIndex];
    return `
      <div class="quiz-review-item ${ok ? "correct-item" : "wrong-item"}">
        <strong>Q${i + 1}:</strong> ${escapeHtml(q.question)}<br>
        Sua resposta: ${letter} ${ok ? "✓" : `(correta: ${correctLetter})`}
      </div>
    `;
  }).join("");
}

function buildReviewText() {
  const letters = ["A", "B", "C", "D"];

  return QUIZ_QUESTIONS.map((q, i) => {
    const correctIndex = q.options.findIndex(o => o.correct);
    const ok = answers[i] === correctIndex;
    const letter = letters[answers[i]] ?? "—";
    const correctLetter = letters[correctIndex];
    return {
      number: i + 1,
      question: q.question,
      status: ok ? "Correta" : "Incorreta",
      studentAnswer: letter,
      correctAnswer: correctLetter,
      isCorrect: ok,
      explanation: q.explanation
    };
  });
}

function sanitizePdfText(text) {
  return String(text)
    .replace(/\u2192/g, "->")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u00B7/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'");
}

function generateResultPdf(studentName, enrollment, course, result) {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    throw new Error("Biblioteca PDF não carregada. Verifique sua conexão e recarregue a página.");
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const margin = 14;
  const maxWidth = 182;
  const lineHeight = 5.5;
  let y = 18;

  function ensureSpace(extra = 12) {
    if (y + extra > 285) {
      doc.addPage();
      y = 18;
    }
  }

  function addHeading(text, size = 13) {
    ensureSpace(14);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(size);
    doc.text(sanitizePdfText(text), margin, y);
    y += size === 13 ? 9 : 7;
  }

  function addLabelValue(label, value) {
    ensureSpace(8);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(`${sanitizePdfText(label)}:`, margin, y);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(sanitizePdfText(String(value)), maxWidth - 42);
    doc.text(lines, margin + 42, y);
    y += Math.max(lines.length, 1) * lineHeight + 2;
  }

  function addParagraph(text, options = {}) {
    doc.setFont("helvetica", options.bold ? "bold" : "normal");
    doc.setFontSize(options.size || 10);
    const lines = doc.splitTextToSize(sanitizePdfText(text), maxWidth);
    ensureSpace(lines.length * lineHeight + 4);
    doc.text(lines, margin, y);
    y += lines.length * lineHeight + (options.spacing ?? 4);
  }

  const dateStr = new Date().toLocaleString("pt-BR");

  doc.setFillColor(229, 37, 33);
  doc.rect(0, 0, 210, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(sanitizePdfText("Quiz — Caso Prático: Refatoração de Código"), margin, 12);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(sanitizePdfText("Super Mario Bros · Módulo Code Smells"), margin, 20);
  doc.setTextColor(0, 0, 0);
  y = 38;

  addHeading("Dados do estudante");
  addLabelValue("Nome", studentName);
  addLabelValue("Matrícula", enrollment);
  addLabelValue("Curso", course);
  addLabelValue("Data do quiz", dateStr);

  y += 2;
  addHeading("Resultado");
  addLabelValue("Pontuação", `${result.score}/${result.total}`);
  addLabelValue("Percentual", `${result.pct}%`);
  addLabelValue("Desempenho", result.message);

  y += 2;
  addHeading("Revisão das questões", 12);

  buildReviewText().forEach((item) => {
    ensureSpace(28);
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y - 2, margin + maxWidth, y - 2);
    y += 4;

    addParagraph(`Questão ${item.number}: ${item.question}`, { bold: true, spacing: 3 });
    addParagraph(`Status: ${item.status}`, {
      spacing: 2,
      bold: false
    });
    addParagraph(`Sua resposta: ${item.studentAnswer}`, { spacing: 2 });
    if (!item.isCorrect) {
      addParagraph(`Resposta correta: ${item.correctAnswer}`, { spacing: 2 });
    }
    addParagraph(`Explicação: ${item.explanation}`, { spacing: 6 });
  });

  ensureSpace(16);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(
    "Documento gerado automaticamente pelo módulo interativo do curso.",
    margin,
    y
  );

  const fileName = `quiz-refatoracao_${sanitizeFileName(studentName)}_${sanitizeFileName(enrollment)}.pdf`;
  doc.save(fileName);
}

function sanitizeFileName(name) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .substring(0, 40) || "estudante";
}

function downloadResult(result) {
  const nameInput = document.getElementById("student-name");
  const enrollmentInput = document.getElementById("student-enrollment");
  const courseInput = document.getElementById("student-course");
  const errorEl = document.getElementById("form-error");

  const studentName = nameInput.value.trim();
  const enrollment = enrollmentInput.value.trim();
  const course = courseInput.value.trim();

  [nameInput, enrollmentInput, courseInput].forEach(input => {
    input.classList.remove("input-error");
  });
  errorEl.textContent = "";

  if (!studentName || !enrollment || !course) {
    if (!studentName) nameInput.classList.add("input-error");
    if (!enrollment) enrollmentInput.classList.add("input-error");
    if (!course) courseInput.classList.add("input-error");
    errorEl.style.color = "#fca5a5";
    errorEl.textContent = "Preencha nome, matrícula e curso para baixar o resultado.";
    return;
  }

  try {
    generateResultPdf(studentName, enrollment, course, result);
    errorEl.style.color = "#86efac";
    errorEl.textContent = "PDF gerado com sucesso!";
  } catch (err) {
    errorEl.style.color = "#fca5a5";
    errorEl.textContent = err.message || "Não foi possível gerar o PDF. Tente novamente.";
  }
}

function showResults() {
  const result = calculateScore();

  document.getElementById("quiz-progress-bar").style.width = "100%";

  document.getElementById("quiz-container").innerHTML = `
    <div class="quiz-card quiz-result">
      <h3>Resultado final</h3>
      <div class="quiz-result-score">${result.score}/${result.total}</div>
      <div class="quiz-result-message">${result.message}</div>
      <div class="quiz-result-detail">${result.pct}% de acertos</div>

      <div class="quiz-download-section">
        <h4>Baixar comprovante do resultado</h4>
        <p>Preencha seus dados para gerar um arquivo PDF com a pontuação e a revisão das questões.</p>
        <form id="download-form" novalidate>
          <div class="quiz-form-grid">
            <div class="form-field">
              <label for="student-name">Nome do estudante</label>
              <input type="text" id="student-name" name="student-name" placeholder="Ex.: Maria Silva" autocomplete="name" required>
            </div>
            <div class="form-field">
              <label for="student-enrollment">Matrícula</label>
              <input type="text" id="student-enrollment" name="student-enrollment" placeholder="Ex.: 2024001234" autocomplete="off" required>
            </div>
            <div class="form-field">
              <label for="student-course">Curso</label>
              <input type="text" id="student-course" name="student-course" placeholder="Ex.: Engenharia de Software" autocomplete="organization" required>
            </div>
          </div>
          <div class="form-error" id="form-error" role="alert"></div>
          <button type="submit" class="btn btn-success" id="download-btn">⬇ Baixar PDF</button>
        </form>
      </div>

      <div class="quiz-actions" style="justify-content:center;margin-top:1.5rem">
        <button class="btn btn-primary" id="retry-btn">Tentar novamente</button>
        <a class="btn btn-secondary" href="comparativo.html">Revisar comparativos</a>
      </div>

      <div class="quiz-review">
        <h4 style="margin-bottom:1rem">Revisão das questões</h4>
        ${buildReviewHtml()}
      </div>
    </div>
  `;

  document.getElementById("retry-btn").addEventListener("click", initQuiz);
  document.getElementById("download-form").addEventListener("submit", (event) => {
    event.preventDefault();
    downloadResult(result);
  });
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

document.addEventListener("DOMContentLoaded", initQuiz);
