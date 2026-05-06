import type { ColorHarmony, GeneratedHarmonyRoleColors } from './harmony';
import type { HexColor } from './hex';
import { normalizeHueDegrees, oklchToHex, parseHexToOklch } from './internal-culori';
import { type ColorSwatch, type ColorSwatchDiagnostics, generateColorSwatch } from './swatches';

export const MIN_HUEFUL_CHROMA = 0.015;

export interface NeutralSwatchResult {
  neutralKeyColor: HexColor;
  neutral: ColorSwatch;
  diagnostics: ColorSwatchDiagnostics;
}

export interface GeneratedNeutralMetadata {
  neutralKeyColor: HexColor;
  diagnostics: ColorSwatchDiagnostics;
}

/***
  Pick the harmony color that should tint the generated neutral swatch.
*/
function pickTintSourceHex(
  roleColors: GeneratedHarmonyRoleColors,
  harmony: ColorHarmony,
): HexColor {
  const byMapping: Partial<Record<ColorHarmony, HexColor | undefined>> = {
    monochromatic: roleColors.primary.hex,
    complementary: roleColors.secondary?.hex,
    analogous: roleColors.tertiary?.hex,
    splitComplementary: roleColors.tertiary?.hex,
    triadic: roleColors.tertiary?.hex,
    tetradic: roleColors.tertiary?.hex,
  };

  return (
    byMapping[harmony] ??
    roleColors.tertiary?.hex ??
    roleColors.secondary?.hex ??
    roleColors.primary.hex
  );
}

/***
  Clamp a number to a finite minimum and maximum range.
*/
function clampNumber(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

/***
  Generate a softly tinted neutral swatch from generated harmony role colors.
*/
export function generateNeutralSwatch(roleColors: GeneratedHarmonyRoleColors): NeutralSwatchResult {
  const tintSourceHex = pickTintSourceHex(roleColors, roleColors.harmony);
  const tintSource = parseHexToOklch(tintSourceHex);

  const primary = parseHexToOklch(roleColors.primary.hex);

  const preferGray = tintSource.c < MIN_HUEFUL_CHROMA;

  const hue = roleColors.harmony === 'monochromatic' ? primary.h : tintSource.h;
  const sourceChroma = roleColors.harmony === 'monochromatic' ? primary.c : tintSource.c;
  const neutralHue = preferGray ? 0 : normalizeHueDegrees(hue);
  const neutralChroma = preferGray ? 0 : clampNumber(sourceChroma * 0.06, 0.004, 0.012);

  const neutralKeyColor = oklchToHex({
    mode: 'oklch',
    l: 0.6,
    c: neutralChroma,
    h: neutralHue,
  });

  const { swatch, diagnostics } = generateColorSwatch(neutralKeyColor);

  return { neutralKeyColor, neutral: swatch, diagnostics };
}
