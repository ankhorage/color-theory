import { type GeneratedHarmonyRoleColors, generateHarmonyRoleColors } from './harmony';
import type { HexColor } from './hex';
import { parseHexColorOrThrow } from './hex';
import { type GeneratedNeutralMetadata, generateNeutralSwatch } from './neutral';
import { type ColorSwatch, generateColorSwatch } from './swatches';

export interface ThemeModeColorInput {
  primaryColor: string;
  harmony: GeneratedHarmonyRoleColors['harmony'];
}

export interface ThemeColorInput {
  light: ThemeModeColorInput;
  dark: ThemeModeColorInput;
}

export interface GeneratedThemeSwatches {
  primary: ColorSwatch;
  secondary?: ColorSwatch;
  tertiary?: ColorSwatch;
  quaternary?: ColorSwatch;
  neutral: ColorSwatch;
}

export interface GeneratedThemeModeColors {
  harmonyRoleColors: GeneratedHarmonyRoleColors;
  swatches: GeneratedThemeSwatches;
  neutral: GeneratedNeutralMetadata;
}

export function getThemeModePrimaryHex(mode: ThemeModeColorInput): HexColor {
  return parseHexColorOrThrow(mode.primaryColor);
}

export function generateThemeModeColors(mode: ThemeModeColorInput): GeneratedThemeModeColors {
  const primaryHex = getThemeModePrimaryHex(mode);
  const harmonyRoleColors = generateHarmonyRoleColors(primaryHex, mode.harmony);

  const primarySwatch = generateColorSwatch(harmonyRoleColors.primary.hex).swatch;
  const secondarySwatch = harmonyRoleColors.secondary
    ? generateColorSwatch(harmonyRoleColors.secondary.hex).swatch
    : undefined;
  const tertiarySwatch = harmonyRoleColors.tertiary
    ? generateColorSwatch(harmonyRoleColors.tertiary.hex).swatch
    : undefined;
  const quaternarySwatch = harmonyRoleColors.quaternary
    ? generateColorSwatch(harmonyRoleColors.quaternary.hex).swatch
    : undefined;

  const neutral = generateNeutralSwatch(harmonyRoleColors);
  const swatches: GeneratedThemeSwatches = {
    primary: primarySwatch,
    neutral: neutral.neutral,
    ...(secondarySwatch ? { secondary: secondarySwatch } : {}),
    ...(tertiarySwatch ? { tertiary: tertiarySwatch } : {}),
    ...(quaternarySwatch ? { quaternary: quaternarySwatch } : {}),
  };

  return {
    harmonyRoleColors,
    swatches,
    neutral: {
      neutralKeyColor: neutral.neutralKeyColor,
      diagnostics: neutral.diagnostics,
    },
  };
}

export function generateThemeColors(theme: ThemeColorInput): {
  light: GeneratedThemeModeColors;
  dark: GeneratedThemeModeColors;
} {
  return {
    light: generateThemeModeColors(theme.light),
    dark: generateThemeModeColors(theme.dark),
  };
}
