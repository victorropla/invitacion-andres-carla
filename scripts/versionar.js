// Añade ?v=<hash> a las rutas de img/ y audio/ en index.html para que, al cambiar un archivo,
// los navegadores descarguen la versión nueva en vez de usar la guardada en caché.
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const PUBLIC = path.join(__dirname, '..', 'public');
const HTML = path.join(PUBLIC, 'index.html');

module.exports = function versionar() {
  let html = fs.readFileSync(HTML, 'utf8');
  for (const dir of ['img', 'audio']) {
    const carpeta = path.join(PUBLIC, dir);
    if (!fs.existsSync(carpeta)) continue;
    for (const f of fs.readdirSync(carpeta)) {
      const hash = crypto.createHash('md5').update(fs.readFileSync(path.join(carpeta, f))).digest('hex').slice(0, 8);
      const ruta = `${dir}/${f}`.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      html = html.replace(new RegExp(`${ruta}(\\?v=[0-9a-f]+)?(?=["')])`, 'g'), `${dir}/${f}?v=${hash}`);
    }
  }
  fs.writeFileSync(HTML, html);
  console.log('index.html: rutas de img/ y audio/ versionadas');
};

if (require.main === module) module.exports();
