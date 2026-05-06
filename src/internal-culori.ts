import {
  converter,
  differenceEuclidean,
  formatHex,
  toGamut,
  wcagContrast,
} from 'culori';

import type { HexColor } from './hex';
import { parseHexColorOrThrow } from './hex';

interface OklchColor {
  mode: 'oklch';
  l: number;
  c: number;
  h: number;
  alpha?: number;
}

interface RgbColor {
  mode: 'rgb';
  r: number;
  g: number;
  b: number;
  alpha?: number;
}

const toOklch = converter('oklch');
const toRgbGamut = toGamut('rgb', 'oklch');
const deltaE = differenceEuclidean('oklch');

/***
  Clamp a number to a finite minimum and maximum range.
*/
function clampNumber(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

/***
  Normalize hue degrees into the zero-to-three-sixty range.
*/
export function normalizeHueDegrees(hueDegrees: number): number {
  const hue = ((hueDegrees % 360) + 360) % 360;
  return hue === 360 ? 0 : hue;
}

/***
  Convert a hex color into a normalized OKLCH color object.
*/
export function parseHexToOklch(hex: HexColor): OklchColor {
  const color = toOklch(hex) as unknown as OklchColor | undefined;
  if (color?.mode !== 'oklch') {
    throw new Error(`Failed to convert hex to OKLCH: ${hex}`);
  }

  const l = clampNumber(color.l, 0, 1);
  const c = clampNumber(color.c, 0, 0.4);
  const h = normalizeHueDegrees(Number.isFinite(color.h) ? color.h : 0);

  return { mode: 'oklch', l, c, h, alpha: color.alpha };
}

/***
  Convert an OKLCH color object into an in-gamut hex color.
*/
export function oklchToHex(oklch: OklchColor): HexColor {
  const gamutRgb = toRgbGamut(oklch) as unknown as RgbColor | undefined;
  const hex = formatHex(gamutRgb ?? oklch);
  return parseHexColorOrThrow(hex);
}

/***
  Calculate the perceptual OKLCH distance between two OKLCH colors.
*/
export function deltaEoklch(a: OklchColor, b: OklchColor): number {
  return deltaE(a, b);
}

/***
  Calculate the WCAG contrast ratio between two color inputs.
*/
export function contrastRatio(colorA: string | object, colorB: string | object): number {
  return wcagContrast(colorA as never, colorB as never);
}
