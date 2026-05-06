import { normalizeHueDegrees, oklchToHex, parseHexToOklch } from './internal-culori';
import type { HexColor } from './hex';

export const COLOR_HARMONIES = [
  'monochromatic',
  'analogous',
  'complementary',
  'triadic',
  'tetradic',
  'splitComplementary',
] as const;

export type ColorHarmony = (typeof COLOR_HARMONIES)[number];

export type GeneratedColorRole = 'primary' | 'secondary' | 'tertiary' | 'quaternary';

export interface GeneratedHarmonyRoleColor {
  role: GeneratedColorRole;
  hex: HexColor;
  hueDegrees: number;
  source: 'selected' | 'generated';
}

export interface GeneratedHarmonyRoleColors {
  harmony: ColorHarmony;
  colors: readonly GeneratedHarmonyRoleColor[];
  primary: GeneratedHarmonyRoleColor;
  secondary?: GeneratedHarmonyRoleColor;
  tertiary?: GeneratedHarmonyRoleColor;
  quaternary?: GeneratedHarmonyRoleColor;
}

const ROLE_ORDER_BY_HARMONY: Record<ColorHarmony, readonly GeneratedColorRole[]> = {
  monochromatic: ['primary'],
  complementary: ['primary', 'secondary'],
  analogous: ['primary', 'secondary', 'tertiary'],
  splitComplementary: ['primary', 'secondary', 'tertiary'],
  triadic: ['primary', 'secondary', 'tertiary'],
  tetradic: ['primary', 'secondary', 'tertiary', 'quaternary'],
};

const OFFSETS_BY_HARMONY: Record<ColorHarmony, readonly number[]> = {
  monochromatic: [0],
  analogous: [0, -30, 30],
  complementary: [0, 180],
  splitComplementary: [0, 150, 210],
  triadic: [0, 120, 240],
  tetradic: [0, 90, 180, 270],
};

export function generateHarmonyRoleColors(
  primaryColor: HexColor,
  harmony: ColorHarmony,
): GeneratedHarmonyRoleColors {
  const base = parseHexToOklch(primaryColor);
  const roles = ROLE_ORDER_BY_HARMONY[harmony];
  const offsets = OFFSETS_BY_HARMONY[harmony];
  const baseHue = normalizeHueDegrees(base.h);

  const colors: GeneratedHarmonyRoleColor[] = [];

  for (let index = 0; index < roles.length; index++) {
    const role = roles[index];
    if (!role) continue;

    const hueDegrees = normalizeHueDegrees(baseHue + (offsets[index] ?? 0));
    colors.push({
      role,
      hex: role === 'primary' ? primaryColor : oklchToHex({ ...base, h: hueDegrees }),
      hueDegrees,
      source: role === 'primary' ? 'selected' : 'generated',
    });
  }

  const primary = colors.find((color) => color.role === 'primary');
  if (!primary) {
    throw new Error('[color-theory] Expected generated harmony role colors to include primary.');
  }

  const secondary = colors.find((color) => color.role === 'secondary');
  const tertiary = colors.find((color) => color.role === 'tertiary');
  const quaternary = colors.find((color) => color.role === 'quaternary');

  return {
    harmony,
    colors,
    primary,
    ...(secondary ? { secondary } : {}),
    ...(tertiary ? { tertiary } : {}),
    ...(quaternary ? { quaternary } : {}),
  };
}
