function preprocessMarkdown(md) {
  return md
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "**$1**");
}

function buildCoverHtml() {
  return `
    <div class="guia-cover">
      <div class="guia-cover-badge">Módulo Caso Prático</div>
      <h1>Refatoração no Super Mario Bros</h1>
      <p>
        Guia completo para estudantes: cenário do jogo, code smells,
        passo a passo de refatoração, comparativos e quiz.
      </p>
      <p style="margin-top:1rem;font-size:0.85rem">
        Curso de Refatoração de Código
      </p>
    </div>
  `;
}

function renderGuide() {
  const statusEl = document.getElementById("guia-status");
  const docEl = document.getElementById("guia-document");
  const downloadBtn = document.getElementById("download-pdf-btn");
  const printBtn = document.getElementById("print-btn");

  if (typeof marked === "undefined") {
    statusEl.textContent = "Erro: biblioteca de Markdown não carregada. Verifique sua conexão.";
    return;
  }

  if (typeof GUIDE_MARKDOWN === "undefined") {
    statusEl.textContent = "Erro: conteúdo do guia não encontrado.";
    return;
  }

  marked.setOptions({
    gfm: true,
    breaks: false,
    headerIds: true
  });

  const html = buildCoverHtml() + marked.parse(preprocessMarkdown(GUIDE_MARKDOWN));
  docEl.innerHTML = html;
  docEl.classList.remove("hidden");
  statusEl.classList.add("hidden");

  downloadBtn.disabled = false;
  printBtn.disabled = false;

  downloadBtn.addEventListener("click", downloadGuidePdf);
  printBtn.addEventListener("click", () => window.print());
}

function downloadGuidePdf() {
  const docEl = document.getElementById("guia-document");
  const btn = document.getElementById("download-pdf-btn");

  if (typeof html2pdf === "undefined") {
    alert("Biblioteca PDF não carregada. Use Imprimir > Salvar como PDF ou verifique sua conexão.");
    return;
  }

  btn.disabled = true;
  btn.textContent = "Gerando PDF...";
  document.body.classList.add("pdf-export-mode");

  const opt = {
    margin: [12, 14, 14, 14],
    filename: "Caso-Pratico-Refatoracao-Super-Mario-Bros.pdf",
    image: { type: "jpeg", quality: 0.95 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
      scrollY: 0
    },
    jsPDF: {
      unit: "mm",
      format: "a4",
      orientation: "portrait"
    },
    pagebreak: {
      mode: ["avoid-all", "css", "legacy"],
      before: ".guia-cover",
      after: [".guia-cover"]
    }
  };

  html2pdf()
    .set(opt)
    .from(docEl)
    .save()
    .then(() => {
      btn.textContent = "⬇ Baixar PDF";
      btn.disabled = false;
      document.body.classList.remove("pdf-export-mode");
    })
    .catch(() => {
      btn.textContent = "⬇ Baixar PDF";
      btn.disabled = false;
      document.body.classList.remove("pdf-export-mode");
      alert("Não foi possível gerar o PDF. Tente usar Imprimir > Salvar como PDF.");
    });
}

document.addEventListener("DOMContentLoaded", renderGuide);
