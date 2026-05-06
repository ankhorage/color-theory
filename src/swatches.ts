import { deltaEoklch, oklchToHex, parseHexToOklch } from './internal-culori';
import type { HexColor } from './hex';

export const COLOR_SWATCH_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
export type ColorSwatchStep = (typeof COLOR_SWATCH_STEPS)[number];

export const COLOR_SWATCH_BASE_STEP = 500 as const;

export type ColorSwatch = Record<ColorSwatchStep, HexColor>;

export type ColorSwatchWarningCode =
  | 'weak_step'
  | 'weak_adjacent_delta'
  | 'limited_lightness_range';

export interface ColorSwatchWarning {
  code: ColorSwatchWarningCode;
  step?: ColorSwatchStep;
  message: string;
  deltaEFromBase?: number;
}

export interface ColorSwatchDiagnostics {
  isUsable: boolean;
  warnings: readonly ColorSwatchWarning[];
  minAdjacentDelta: number;
  maxAdjacentDelta: number;
  lightnessRange: {
    min: number;
    max: number;
  };
}

const BASELINE_LIGHTNESS_BY_STEP: Record<ColorSwatchStep, number> = {
  50: 0.985,
  100: 0.967,
  200: 0.928,
  300: 0.872,
  400: 0.707,
  500: 0.551,
  600: 0.446,
  700: 0.373,
  800: 0.278,
  900: 0.21,
  950: 0.13,
};

const MIN_USABLE_ADJACENT_DELTA = 0.012;
const MIN_USABLE_LIGHTNESS_RANGE = 0.35;

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function chromaMultiplierForStep(step: ColorSwatchStep): number {
  if (step <= 200) return 0.55;
  if (step <= 400) return 0.75;
  if (step === COLOR_SWATCH_BASE_STEP) return 1;
  if (step <= 700) return 0.9;
  return 0.8;
}

export function generateColorSwatch(baseColor: HexColor): {
  swatch: ColorSwatch;
  diagnostics: ColorSwatchDiagnostics;
} {
  const baseOklch = parseHexToOklch(baseColor);
  const baseOffset = baseOklch.l - BASELINE_LIGHTNESS_BY_STEP[COLOR_SWATCH_BASE_STEP];

  const warnings: ColorSwatchWarning[] = [];
  const swatch = {} as ColorSwatch;
  const lightnessEntries: number[] = [];
  const adjacentDeltas: number[] = [];

  for (const step of COLOR_SWATCH_STEPS) {
    if (step === COLOR_SWATCH_BASE_STEP) {
      swatch[step] = baseColor;
      lightnessEntries.push(baseOklch.l);
      continue;
    }

    const targetL = clamp01(BASELINE_LIGHTNESS_BY_STEP[step] + baseOffset);
    const targetC = clamp01(baseOklch.c * chromaMultiplierForStep(step));
    const target = { ...baseOklch, l: targetL, c: targetC };
    const hex = oklchToHex(target);
    swatch[step] = hex;

    const candidateOklch = parseHexToOklch(hex);
    lightnessEntries.push(candidateOklch.l);

    const deltaEFromBase = deltaEoklch(baseOklch, candidateOklch);
    if (deltaEFromBase < 0.02) {
      warnings.push({
        code: 'weak_step',
        step,
        deltaEFromBase,
        message: `Swatch step ${step} is visually close to the base color.`,
      });
    }
  }

  for (let index = 1; index < COLOR_SWATCH_STEPS.length; index++) {
    const previousStep = COLOR_SWATCH_STEPS[index - 1];
    const currentStep = COLOR_SWATCH_STEPS[index];
    if (previousStep === undefined || currentStep === undefined) continue;

    const previous = parseHexToOklch(swatch[previousStep]);
    const current = parseHexToOklch(swatch[currentStep]);
    const adjacentDelta = deltaEoklch(previous, current);
    adjacentDeltas.push(adjacentDelta);

    if (adjacentDelta < MIN_USABLE_ADJACENT_DELTA) {
      warnings.push({
        code: 'weak_adjacent_delta',
        step: currentStep,
        deltaEFromBase: adjacentDelta,
        message: `Swatch step ${currentStep} is visually close to adjacent step ${previousStep}.`,
      });
    }
  }

  const minAdjacentDelta = Math.min(...adjacentDeltas);
  const maxAdjacentDelta = Math.max(...adjacentDeltas);
  const minLightness = Math.min(...lightnessEntries);
  const maxLightness = Math.max(...lightnessEntries);
  const lightnessRange = maxLightness - minLightness;

  if (lightnessRange < MIN_USABLE_LIGHTNESS_RANGE) {
    warnings.push({
      code: 'limited_lightness_range',
      message: 'Generated swatch has a limited lightness range.',
    });
  }

  return {
    swatch,
    diagnostics: {
      isUsable:
        minAdjacentDelta >= MIN_USABLE_ADJACENT_DELTA &&
        lightnessRange >= MIN_USABLE_LIGHTNESS_RANGE,
      warnings,
      minAdjacentDelta,
      maxAdjacentDelta,
      lightnessRange: {
        min: minLightness,
        max: maxLightness,
      },
    },
  };
}
