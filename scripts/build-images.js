// Genera las imágenes optimizadas (WebP) de /public/img a partir de "Fotos invitación".
// Uso: npm run images
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', '..', 'Fotos invitación');
const OUT = path.join(__dirname, '..', 'public', 'img');
const GRANATE = [0x64, 0x1c, 0x30];

fs.mkdirSync(OUT, { recursive: true });

// Fotos: [origen, destino, ancho, alto]
const fotos = [
  ['Portada/WhatsApp Image 2026-11-02 at 12.13.41 (2).jpeg', 'portada-1', 360, 450],
  ['Portada/WhatsApp Image 2026-11-02 at 12.29.17 (1).jpeg', 'portada-2', 360, 450],
  ['Portada/WhatsApp Image 2026-11-02 at 16.22.54 (1).jpeg', 'portada-3', 360, 450],
  ['Portada/WhatsApp Image 2026-11-02 at 16.22.54.jpeg', 'portada-4', 360, 450],
  ['Segunda diapositiva/WhatsApp Image 2026-11-02 at 12.13.38 (1).jpeg', 'momento-1', 640, 800],
  ['Segunda diapositiva/WhatsApp Image 2026-11-02 at 12.25.01.jpeg', 'momento-2', 640, 800],
];

// Polaroids de la última página: se leen de la carpeta numerada (1.jpg, 2.jpeg, 3.png…).
// Si hay dos archivos con el mismo número se usa el más reciente. El texto de cada una está en index.html.
const NUMERADAS = 'Fotos última página. Van numeradas en orden';
const ENCUADRE = { 4: 'south', 6: 'north' }; // 'north' | 'south' | 'east' | 'west'; por defecto, automático
const numeradas = {};
for (const f of fs.readdirSync(path.join(SRC, NUMERADAS))) {
  const m = f.match(/^(\d+)\.(jpe?g|png|webp)$/i);
  if (!m) continue;
  const t = fs.statSync(path.join(SRC, NUMERADAS, f)).mtimeMs;
  if (!numeradas[m[1]] || t > numeradas[m[1]].t) numeradas[m[1]] = { f, t };
}
for (const [n, { f }] of Object.entries(numeradas)) {
  fotos.push([`${NUMERADAS}/${f}`, `polaroid-${n}`, 720, 720, ENCUADRE[n]]);
}

// Dibujos: se quita el fondo de papel y se recolorean en granate.
// [origen, destino, ancho, umbral fondo, umbral trazo, recorte superior %]
const dibujos = [
  ['Dibujos invitación/descarga.jpg', 'corazones', 360, 238, 80, 0],
  ['Dibujos invitación/descarga (2).jpg', 'coche', 480, 222, 85, 0],
  ['Dibujos invitación/Elegant, Romantic Wedding Planner Showit Web Design + Custom Illustration.jpg', 'iglesia', 360, 228, 40, 0],
  ['Dibujos invitación/descarga (1).jpg', 'mesa', 420, 206, 60, 0.12],
];

async function foto([src, name, w, h, pos = sharp.strategy.attention]) {
  await sharp(path.join(SRC, src))
    .rotate()
    .resize(w, h, { fit: 'cover', position: pos })
    .webp({ quality: 74, effort: 6 })
    .toFile(path.join(OUT, name + '.webp'));
}

async function dibujo([src, name, w, hi, lo, cropTop]) {
  let img = sharp(path.join(SRC, src));
  const meta = await img.metadata();
  if (cropTop) {
    const top = Math.round(meta.height * cropTop);
    img = img.extract({ left: 0, top, width: meta.width, height: meta.height - top });
  }
  const { data, info } = await img.greyscale().raw().toBuffer({ resolveWithObject: true });
  const rgba = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0; i < data.length; i++) {
    const a = Math.max(0, Math.min(1, (hi - data[i]) / (hi - lo)));
    rgba[i * 4] = GRANATE[0];
    rgba[i * 4 + 1] = GRANATE[1];
    rgba[i * 4 + 2] = GRANATE[2];
    rgba[i * 4 + 3] = Math.round(Math.pow(a, 0.8) * 255);
  }
  await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } })
    .trim({ threshold: 10 })
    .resize({ width: w, withoutEnlargement: true })
    .webp({ quality: 80, alphaQuality: 70, effort: 6 })
    .toFile(path.join(OUT, name + '.webp'));
}

async function papel() {
  // Textura de papel sutil y repetible (ruido suave).
  const S = 192;
  const base = [247, 244, 240];
  const px = Buffer.alloc(S * S * 3);
  let semilla = 42; // ruido con semilla fija: el archivo sale igual en cada ejecución
  const rnd = () => ((semilla = (semilla * 1103515245 + 12345) % 2147483648) / 2147483648);
  for (let i = 0; i < S * S; i++) {
    const n = Math.round((rnd() - 0.5) * 10);
    for (let c = 0; c < 3; c++) px[i * 3 + c] = base[c] + n;
  }
  await sharp(px, { raw: { width: S, height: S, channels: 3 } })
    .blur(0.7)
    .webp({ quality: 60 })
    .toFile(path.join(OUT, 'papel.webp'));
}

async function og() {
  // Imagen de vista previa para WhatsApp / redes (1200x630).
  await sharp(path.join(SRC, 'Portada/WhatsApp Image 2026-11-02 at 12.29.17 (1).jpeg'))
    .rotate()
    .resize(1200, 630, { fit: 'cover', position: sharp.strategy.attention })
    .jpeg({ quality: 78, mozjpeg: true })
    .toFile(path.join(OUT, '..', 'og.jpg'));
}

(async () => {
  await Promise.all([...fotos.map(foto), ...dibujos.map(dibujo), papel(), og()]);
  for (const f of fs.readdirSync(OUT)) {
    console.log(f.padEnd(20), (fs.statSync(path.join(OUT, f)).size / 1024).toFixed(1) + ' KB');
  }
  require('./versionar')();
})();
