import type { HexColor } from './hex';
import { parseHexColorOrThrow } from './hex';
import { contrastRatio } from './internal-culori';

export interface ReadableForegroundResult {
  foreground: HexColor;
  contrast: number;
}

export type ForegroundTiePolicy = 'first' | 'last';

export interface ForegroundSelectionCandidate {
  foreground: HexColor;
  contrast: number;
  passesMinimum: boolean;
  selected: boolean;
  rejectionReason?: 'minimum-contrast' | 'weaker-contrast' | 'tie-break';
}

export interface ForegroundSelectionResult {
  selected: ForegroundSelectionCandidate | null;
  candidates: readonly ForegroundSelectionCandidate[];
  minimumContrast: number;
  tieBreak: {
    policy: ForegroundTiePolicy;
    applied: boolean;
  };
}

const BLACK = parseHexColorOrThrow('#000000');
const WHITE = parseHexColorOrThrow('#FFFFFF');

/***
  Measure the WCAG contrast ratio between two validated hex colors.
*/
export function getContrastRatio(colorA: HexColor, colorB: HexColor): number {
  return contrastRatio(colorA, colorB);
}

/***
  Select the strongest caller-provided foreground that meets a minimum WCAG contrast ratio.
*/
export function selectReadableForeground(
  background: HexColor,
  foregrounds: readonly HexColor[],
  minimumContrast: number,
  tiePolicy: ForegroundTiePolicy,
): ForegroundSelectionResult {
  assertMinimumContrast(minimumContrast);
  if (foregrounds.length === 0) {
    throw new Error('[color-theory] Foreground candidates must not be empty.');
  }

  const normalizedBackground = parseHexColorOrThrow(background);
  const measured = foregrounds.map((foreground, index) => {
    const normalizedForeground = parseHexColorOrThrow(foreground);
    return {
      foreground: normalizedForeground,
      contrast: getContrastRatio(normalizedBackground, normalizedForeground),
      index,
    };
  });
  const passing = measured.filter(({ contrast }) => contrast >= minimumContrast);
  const strongestContrast = Math.max(...passing.map(({ contrast }) => contrast));
  const strongest = passing.filter(({ contrast }) => contrast === strongestContrast);
  const selectedMeasured = tiePolicy === 'first' ? strongest.at(0) : strongest.at(-1);
  const tieBreakApplied = strongest.length > 1;

  const candidates = measured.map(({ foreground, contrast, index }) => {
    const selected = selectedMeasured?.index === index;
    return {
      foreground,
      contrast,
      passesMinimum: contrast >= minimumContrast,
      selected,
      ...(!selected
        ? {
            rejectionReason: getForegroundRejectionReason(
              contrast,
              minimumContrast,
              strongestContrast,
            ),
          }
        : {}),
    } satisfies ForegroundSelectionCandidate;
  });

  return {
    selected: candidates.find(({ selected }) => selected) ?? null,
    candidates,
    minimumContrast,
    tieBreak: { policy: tiePolicy, applied: tieBreakApplied },
  };
}

/***
  Return the readable black or white foreground color with the stronger contrast against a background color.
*/
export function getReadableForeground(background: HexColor): ReadableForegroundResult {
  const result = selectReadableForeground(background, [BLACK, WHITE], 1, 'first');
  if (!result.selected) {
    throw new Error('[color-theory] Expected black or white to be a readable foreground.');
  }

  return {
    foreground: result.selected.foreground,
    contrast: result.selected.contrast,
  };
}

/***
  Validate a WCAG contrast threshold.
*/
function assertMinimumContrast(minimumContrast: number): void {
  if (!Number.isFinite(minimumContrast) || minimumContrast < 1 || minimumContrast > 21) {
    throw new Error(
      `[color-theory] Minimum contrast must be a finite ratio from 1 through 21: ${minimumContrast}.`,
    );
  }
}

/***
  Explain why a foreground candidate was not selected.
*/
function getForegroundRejectionReason(
  contrast: number,
  minimumContrast: number,
  strongestContrast: number,
): NonNullable<ForegroundSelectionCandidate['rejectionReason']> {
  if (contrast < minimumContrast) return 'minimum-contrast';
  if (contrast < strongestContrast) return 'weaker-contrast';
  return 'tie-break';
}
