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
        Guia para estudantes: cenário do jogo, code smells,
        passo a passo de refatoração e orientações do quiz.
      </p>
      <p style="margin-top:1rem;font-size:0.85rem">
        Curso de Refatoração de Código
      </p>
    </div>
  `;
}

function buildGuideHtml() {
  if (typeof marked === "undefined" || typeof GUIDE_MARKDOWN === "undefined") {
    return null;
  }

  marked.setOptions({
    gfm: true,
    breaks: false,
    headerIds: true
  });

  return buildCoverHtml() + marked.parse(preprocessMarkdown(GUIDE_MARKDOWN));
}

function renderGuide() {
  const statusEl = document.getElementById("guia-status");
  const docEl = document.getElementById("guia-document");
  const downloadBtn = document.getElementById("download-pdf-btn");

  const html = buildGuideHtml();

  if (!html) {
    statusEl.textContent = "Erro ao carregar o guia. Verifique sua conexão e recarregue a página.";
    return;
  }

  docEl.innerHTML = html;
  statusEl.classList.add("hidden");
  downloadBtn.disabled = false;
  downloadBtn.addEventListener("click", downloadGuidePdf);
}

function downloadGuidePdf() {
  const docEl = document.getElementById("guia-document");
  const btn = document.getElementById("download-pdf-btn");

  if (typeof html2pdf === "undefined") {
    alert("Biblioteca PDF não carregada. Verifique sua conexão e recarregue a página.");
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
      btn.textContent = "Baixar PDF";
      btn.disabled = false;
      document.body.classList.remove("pdf-export-mode");
    })
    .catch(() => {
      btn.textContent = "Baixar PDF";
      btn.disabled = false;
      document.body.classList.remove("pdf-export-mode");
      alert("Não foi possível gerar o PDF. Tente novamente.");
    });
}

document.addEventListener("DOMContentLoaded", renderGuide);
