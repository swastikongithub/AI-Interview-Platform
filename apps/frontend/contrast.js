// WCAG contrast check for the design tokens in src/index.css.
// Run: node contrast.js   (AA requires 4.5:1 for body text, 3:1 for large text / UI)

const light = {
  canvas: [243, 244, 246], surface: [255, 255, 255], sunken: [236, 238, 241],
  fg: [12, 14, 19], fgSecondary: [55, 60, 71], fgMuted: [99, 105, 118],
  signal: [200, 240, 90], signalFg: [12, 14, 19], signalText: [77, 110, 10], signalSoft: [238, 249, 206],
  positive: [20, 112, 54], positiveSoft: [220, 245, 228], caution: [164, 72, 8], cautionSoft: [254, 240, 220],
  negative: [185, 28, 28], negativeSoft: [254, 226, 226], info: [29, 78, 216], infoSoft: [224, 233, 255],
};

const night = {
  canvas: [11, 13, 18], surface: [20, 23, 30], sunken: [15, 17, 23],
  fg: [238, 240, 244], fgSecondary: [186, 191, 201], fgMuted: [142, 148, 160],
  signalText: [200, 240, 90], positive: [74, 222, 128], positiveSoft: [16, 46, 29],
  caution: [251, 191, 36], cautionSoft: [54, 40, 10], negative: [248, 113, 113], negativeSoft: [58, 20, 22],
};

const luminance = ([r, g, b]) => {
  const [R, G, B] = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
};

const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// [foreground, background, minimum ratio]
const pairs = [
  ['light fg on canvas', light.fg, light.canvas, 4.5],
  ['light fgSecondary on canvas', light.fgSecondary, light.canvas, 4.5],
  ['light fgMuted on canvas', light.fgMuted, light.canvas, 4.5],
  ['light fgMuted on surface', light.fgMuted, light.surface, 4.5],
  ['light fgMuted on sunken', light.fgMuted, light.sunken, 4.5],
  ['light signalFg on signal (buttons)', light.signalFg, light.signal, 4.5],
  ['light signalText on surface', light.signalText, light.surface, 4.5],
  ['light signalText on signalSoft', light.signalText, light.signalSoft, 4.5],
  ['light positive on positiveSoft', light.positive, light.positiveSoft, 4.5],
  ['light caution on cautionSoft', light.caution, light.cautionSoft, 4.5],
  ['light negative on negativeSoft', light.negative, light.negativeSoft, 4.5],
  ['light info on infoSoft', light.info, light.infoSoft, 4.5],
  ['night fg on canvas', night.fg, night.canvas, 4.5],
  ['night fgSecondary on surface', night.fgSecondary, night.surface, 4.5],
  ['night fgMuted on canvas', night.fgMuted, night.canvas, 4.5],
  ['night fgMuted on surface', night.fgMuted, night.surface, 4.5],
  ['night signalText on canvas', night.signalText, night.canvas, 4.5],
  ['night positive on positiveSoft', night.positive, night.positiveSoft, 4.5],
  ['night caution on cautionSoft', night.caution, night.cautionSoft, 4.5],
  ['night negative on negativeSoft', night.negative, night.negativeSoft, 4.5],
];

let failed = 0;
for (const [label, fgc, bg, min] of pairs) {
  const ratio = contrast(fgc, bg);
  const ok = ratio >= min;
  if (!ok) failed++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${ratio.toFixed(2)}:1  ${label}`);
}
process.exitCode = failed ? 1 : 0;
