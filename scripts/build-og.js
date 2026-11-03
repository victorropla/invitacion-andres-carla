// Genera public/og.jpg (vista previa al compartir en WhatsApp / redes) con el diseño de la portada.
// Hace una captura de scripts/og.html con Chrome. Uso: npm run og
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const sharp = require('sharp');

const CHROME = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
].find((p) => p && fs.existsSync(p));
if (!CHROME) {
  console.error('No se encuentra Chrome. Indica la ruta con CHROME_PATH.');
  process.exit(1);
}

const plantilla = path.join(__dirname, 'og.html');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'og-'));
const png = path.join(tmp, 'og.png');

execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files',
  `--user-data-dir=${path.join(tmp, 'perfil')}`, '--window-size=1200,630', '--virtual-time-budget=4000',
  `--screenshot=${png}`, 'file:///' + plantilla.replace(/\\/g, '/')], { stdio: 'ignore' });

(async () => {
  const salida = path.join(__dirname, '..', 'public', 'og.jpg');
  await sharp(png).resize(1200, 630).jpeg({ quality: 82, mozjpeg: true }).toFile(salida);
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(`public/og.jpg  ${(fs.statSync(salida).size / 1024).toFixed(1)} KB`);
  require('./versionar')();
})();
