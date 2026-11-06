import fs from 'fs';
import path from 'path';

const srcHtml = path.resolve('football-manager/football.html');
const destHtml = path.resolve('football-manager/index.html');

let fileToProcess = destHtml;
if (fs.existsSync(srcHtml)) {
  fs.renameSync(srcHtml, destHtml);
  fileToProcess = destHtml;
}

if (fs.existsSync(fileToProcess)) {
  let content = fs.readFileSync(fileToProcess, 'utf-8');

  // Strip type="module" and crossorigin
  content = content.replace(/<script type="module" crossorigin>/g, '<script>');
  content = content.replace(/<script type="module">/g, '<script>');

  // Safely locate <script>...</script> without String.prototype.replace dollar-interpolation
  const scriptStartTag = '<script>';
  const scriptEndTag = '</script>';
  const startIdx = content.indexOf(scriptStartTag);
  const endIdx = content.indexOf(scriptEndTag);

  if (startIdx !== -1 && endIdx !== -1) {
    const fullScriptTag = content.slice(startIdx, endIdx + scriptEndTag.length);
    // Remove script from its current location in <head>
    content = content.slice(0, startIdx) + content.slice(endIdx + scriptEndTag.length);
    // Insert script right before </body>
    const bodyEndIdx = content.lastIndexOf('</body>');
    if (bodyEndIdx !== -1) {
      content = content.slice(0, bodyEndIdx) + fullScriptTag + '\n' + content.slice(bodyEndIdx);
    } else {
      content = content + '\n' + fullScriptTag;
    }
  }

  fs.writeFileSync(fileToProcess, content, 'utf-8');
  console.log('✅ PitchCore postbuild: safely relocated script to <body> with zero byte corruption!');
} else {
  console.error('❌ Could not find football-manager HTML output to process.');
  process.exit(1);
}
