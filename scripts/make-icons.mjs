// Genera el icono de la app y sus variantes a partir del arco de vidriera.
//   node scripts/make-icons.mjs
import sharp from 'sharp';

const NIGHT_TOP = '#0A1730';
const NIGHT_BOTTOM = '#1B3766';
const GOLD = '#F1C563';

/** Vidrios del arco: cuatro paños de colores de la paleta de tradiciones. */
const PANES = ['#B4324A', '#2A5FA8', '#17877F', '#6A4BA3'];

/**
 * El arco sobre un lienzo de 1024. `scale` lo encoge alrededor del centro para dejar el
 * margen de seguridad que piden los iconos adaptables de Android.
 */
function arch({ scale = 1, mono = false } = {}) {
  const pane = (index) => (mono ? '#FFFFFF' : PANES[index]);
  const lead = mono ? 'none' : GOLD;
  return `
  <g transform="translate(512 512) scale(${scale}) translate(-512 -512)">
    <defs>
      <clipPath id="arco">
        <path d="M292 820 V470 C292 310 400 205 512 150 C624 205 732 310 732 470 V820 Z"/>
      </clipPath>
    </defs>
    <g clip-path="url(#arco)">
      <rect x="292" y="150" width="220" height="370" fill="${pane(0)}"/>
      <rect x="512" y="150" width="220" height="370" fill="${pane(1)}"/>
      <rect x="292" y="520" width="220" height="300" fill="${pane(2)}"/>
      <rect x="512" y="520" width="220" height="300" fill="${pane(3)}"/>
      ${mono ? '' : '<rect x="292" y="150" width="440" height="670" fill="url(#luz)"/>'}
    </g>
    <path d="M512 150 V820 M292 520 H732" stroke="${mono ? '#000000' : GOLD}" stroke-width="${mono ? 34 : 22}" fill="none" ${mono ? 'opacity="0"' : ''}/>
    <path d="M292 820 V470 C292 310 400 205 512 150 C624 205 732 310 732 470 V820 Z"
          fill="none" stroke="${lead}" stroke-width="26" stroke-linejoin="round"/>
  </g>`;
}

const defs = `
  <defs>
    <linearGradient id="noche" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${NIGHT_TOP}"/>
      <stop offset="1" stop-color="${NIGHT_BOTTOM}"/>
    </linearGradient>
    <linearGradient id="luz" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.28"/>
      <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
    </linearGradient>
  </defs>`;

const svg = (body) =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">${defs}${body}</svg>`);

const background = '<rect width="1024" height="1024" fill="url(#noche)"/>';

const files = [
  ['icon.png', 1024, svg(background + arch()), true],
  ['android-icon-background.png', 512, svg(background), true],
  ['android-icon-foreground.png', 512, svg(arch({ scale: 0.62 })), false],
  ['android-icon-monochrome.png', 432, svg(arch({ scale: 0.62, mono: true })), false],
  ['splash-icon.png', 1024, svg(arch({ scale: 0.9 })), false],
  ['favicon.png', 48, svg(background + arch({ scale: 1.1 })), true],
];

for (const [name, size, source, opaque] of files) {
  let image = sharp(source).resize(size, size);
  if (opaque) image = image.flatten({ background: NIGHT_TOP });
  await image.png().toFile(`assets/images/${name}`);
  console.log(name, size);
}
