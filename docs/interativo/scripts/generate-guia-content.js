const fs = require("fs");
const path = require("path");

const mdPath = path.join(__dirname, "..", "..", "CASO-PRATICO-REFATORACAO.md");
const outPath = path.join(__dirname, "..", "js", "guia-content.js");

function stripQuizAnswers(md) {
  let content = md;

  content = content.replace(
    /\nAbaixo está o gabarito em texto[\s\S]*?(?=\n## Smells extras)/,
    "\n\n> **Quiz:** as questões e a validação de conhecimento devem ser feitas exclusivamente no módulo interativo (`quiz.html`). As respostas não fazem parte deste guia.\n"
  );

  content = content.replace(
    /\| 4\.1 \| Quiz em Google Forms ou Kahoot \|[\r\n]*/,
    "| 4.1 | Quiz interativo (`quiz.html`) + comprovante em PDF |\n"
  );

  return content;
}

const md = fs.readFileSync(mdPath, "utf8");
const studentGuide = stripQuizAnswers(md);
fs.writeFileSync(outPath, `const GUIDE_MARKDOWN = ${JSON.stringify(studentGuide)};\n`);

console.log("guia-content.js gerado (sem respostas do quiz).");
