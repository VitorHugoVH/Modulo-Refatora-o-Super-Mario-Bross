let currentIndex = 0;
let currentView = "both";

function initComparativo() {
  const counter = document.getElementById("comparison-counter");
  if (counter) {
    counter.textContent = `${COMPARISONS.length} exemplos`;
  }
  renderTabs();
  renderComparison(0);
  bindViewToggle();
  bindNavButtons();
}

function renderTabs() {
  const nav = document.getElementById("smell-nav");
  nav.innerHTML = COMPARISONS.map((item, i) =>
    `<button class="smell-tab${i === currentIndex ? " active" : ""}" data-index="${i}">${item.smell}</button>`
  ).join("");

  nav.querySelectorAll(".smell-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      currentIndex = parseInt(tab.dataset.index, 10);
      renderTabs();
      renderComparison(currentIndex);
    });
  });
}

function renderComparison(index) {
  const item = COMPARISONS[index];
  const panel = document.getElementById("comparison-panel");

  document.querySelectorAll(".smell-tab").forEach((tab, i) => {
    tab.classList.toggle("active", i === index);
  });

  panel.innerHTML = `
    <div class="comparison-header">
      <h3>${item.title}</h3>
      <div class="comparison-meta">
        <span>📁 ${item.file}</span>
        <span class="badge badge-technique">${item.technique}</span>
        <span class="badge badge-smell">${item.smell}</span>
      </div>
    </div>

    <div class="view-toggle">
      <button id="btn-smell" class="${currentView === "smell" ? "active-smell" : ""}">⚠ Com smell</button>
      <button id="btn-both" class="${currentView === "both" ? "active-both" : ""}">⇔ Lado a lado</button>
      <button id="btn-clean" class="${currentView === "clean" ? "active-clean" : ""}">✓ Refatorado</button>
    </div>

    <div class="code-views ${currentView === "both" ? "split" : ""}" id="code-views">
      ${renderCodeBlock("smell", "Com code smell", item.before, currentView !== "clean")}
      ${renderCodeBlock("clean", "Sem code smell (refatorado)", item.after, currentView !== "smell")}
    </div>

    <div class="comparison-explanation">
      <h4>Por que refatorar?</h4>
      <p>${item.explanation}</p>
      <p style="margin-top:0.5rem"><strong>Princípio:</strong> ${item.principle}</p>
      <ul>
        ${item.benefits.map(b => `<li>${b}</li>`).join("")}
      </ul>
    </div>
  `;

  bindViewToggle();
  document.getElementById("prev-btn").disabled = index === 0;
  document.getElementById("next-btn").disabled = index === COMPARISONS.length - 1;
}

function renderCodeBlock(type, label, code, visible) {
  const labelClass = type === "smell" ? "smell-label" : "clean-label";
  const badge = type === "smell"
    ? '<span class="badge badge-smell">Smell</span>'
    : '<span class="badge badge-clean">Limpo</span>';

  return `
    <div class="code-block-wrap ${visible ? "" : "hidden"}">
      <div class="code-block-label ${labelClass}">
        ${badge} ${label}
      </div>
      <pre class="code-block">${escapeHtml(code)}</pre>
    </div>
  `;
}

function bindViewToggle() {
  const btnSmell = document.getElementById("btn-smell");
  const btnBoth = document.getElementById("btn-both");
  const btnClean = document.getElementById("btn-clean");

  if (!btnSmell) return;

  btnSmell.onclick = () => { currentView = "smell"; renderComparison(currentIndex); };
  btnBoth.onclick = () => { currentView = "both"; renderComparison(currentIndex); };
  btnClean.onclick = () => { currentView = "clean"; renderComparison(currentIndex); };
}

function bindNavButtons() {
  document.getElementById("prev-btn").addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex--;
      renderComparison(currentIndex);
    }
  });

  document.getElementById("next-btn").addEventListener("click", () => {
    if (currentIndex < COMPARISONS.length - 1) {
      currentIndex++;
      renderComparison(currentIndex);
    }
  });
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

document.addEventListener("DOMContentLoaded", initComparativo);
