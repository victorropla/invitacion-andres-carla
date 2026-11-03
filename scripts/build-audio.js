// Comprime la canción de fondo a public/audio/cancion.m4a (AAC 96 kbps, ~2-3 MB).
// Uso: npm run audio -- "ruta/a/la/cancion.mp3"
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('ffmpeg-static');

const entrada = process.argv[2];
if (!entrada || !fs.existsSync(entrada)) {
  console.error('Indica el archivo de la canción: npm run audio -- "C:/ruta/cancion.mp3"');
  process.exit(1);
}
const OUT = path.join(__dirname, '..', 'public', 'audio');
fs.mkdirSync(OUT, { recursive: true });
const salida = path.join(OUT, 'cancion.m4a');

execFileSync(ffmpeg, ['-y', '-hide_banner', '-loglevel', 'error', '-i', entrada, '-vn', '-map_metadata', '-1',
  '-c:a', 'aac', '-b:a', '96k', '-ac', '2', '-movflags', '+faststart', salida], { stdio: 'inherit' });
console.log(`${path.relative(process.cwd(), salida)}  ${(fs.statSync(salida).size / 1024 / 1024).toFixed(2)} MB`);
