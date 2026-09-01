import { getContrastRatio } from './contrast';
import type { HexColor } from './hex';
import { parseHexColorOrThrow } from './hex';
import { deltaEoklch, normalizeHueDegrees, parseHexToOklch } from './internal-culori';
import { COLOR_SWATCH_STEPS, type ColorSwatch, type ColorSwatchStep } from './swatches';

export type ColorSwatchTiePolicy = 'lower-step' | 'higher-step';

export interface ColorSelectionTarget {
  lightness: number;
  chroma: number;
  hueDegrees?: number;
}

export interface ColorContrastContext {
  id: string;
  against: HexColor;
  minimumContrast: number;
}

export interface ColorContrastMeasurement extends ColorContrastContext {
  contrast: number;
  passes: boolean;
}

export type ColorSwatchCandidateRejectionReason = 'contrast' | 'target-distance' | 'tie-break';

export interface ColorSwatchSelectionCandidate {
  step: ColorSwatchStep;
  hex: HexColor;
  targetDistance: number;
  contrasts: readonly ColorContrastMeasurement[];
  selected: boolean;
  rejectionReasons: readonly ColorSwatchCandidateRejectionReason[];
}

export interface ColorSwatchSelectionResult {
  selected: ColorSwatchSelectionCandidate | null;
  candidates: readonly ColorSwatchSelectionCandidate[];
  rejectedCandidates: readonly ColorSwatchSelectionCandidate[];
  target: ColorSelectionTarget;
  tieBreak: {
    policy: ColorSwatchTiePolicy;
    applied: boolean;
    candidateSteps: readonly ColorSwatchStep[];
  };
}

interface MeasuredColorSwatchCandidate {
  readonly step: ColorSwatchStep;
  readonly hex: HexColor;
  readonly targetDistance: number;
  readonly contrasts: readonly ColorContrastMeasurement[];
  readonly passesContrast: boolean;
}

const DISTANCE_TIE_TOLERANCE = Number.EPSILON * 16;

/***
  Select the swatch step nearest a perceptual target that passes every required contrast context.
*/
export function selectColorSwatchStep(
  swatch: ColorSwatch,
  target: ColorSelectionTarget,
  contexts: readonly ColorContrastContext[],
  tiePolicy: ColorSwatchTiePolicy,
): ColorSwatchSelectionResult {
  const normalizedTarget = normalizeTarget(target);
  const normalizedContexts = normalizeContexts(contexts);
  const measured = COLOR_SWATCH_STEPS.map((step) =>
    measureCandidate(swatch, step, normalizedTarget, normalizedContexts),
  );
  const eligible = measured.filter(({ passesContrast }) => passesContrast);
  const nearestDistance = Math.min(...eligible.map(({ targetDistance }) => targetDistance));
  const nearest = eligible.filter(
    ({ targetDistance }) => Math.abs(targetDistance - nearestDistance) <= DISTANCE_TIE_TOLERANCE,
  );
  const selectedMeasured = tiePolicy === 'lower-step' ? nearest.at(0) : nearest.at(-1);
  const tieCandidateSteps = nearest.map(({ step }) => step);
  const candidates = measured.map((candidate) =>
    createSelectionCandidate(candidate, selectedMeasured, nearestDistance, tieCandidateSteps),
  );
  const selected = candidates.find((candidate) => candidate.selected) ?? null;

  return {
    selected,
    candidates,
    rejectedCandidates: candidates.filter((candidate) => !candidate.selected),
    target: normalizedTarget,
    tieBreak: {
      policy: tiePolicy,
      applied: nearest.length > 1,
      candidateSteps: tieCandidateSteps,
    },
  };
}

/***
  Convert a measured candidate into its public selection diagnostic.
*/
function createSelectionCandidate(
  candidate: MeasuredColorSwatchCandidate,
  selected: MeasuredColorSwatchCandidate | undefined,
  nearestDistance: number,
  tieCandidateSteps: readonly ColorSwatchStep[],
): ColorSwatchSelectionCandidate {
  const isSelected = selected?.step === candidate.step;
  return {
    step: candidate.step,
    hex: candidate.hex,
    targetDistance: candidate.targetDistance,
    contrasts: candidate.contrasts,
    selected: isSelected,
    rejectionReasons: getCandidateRejectionReasons(
      candidate,
      isSelected,
      nearestDistance,
      tieCandidateSteps,
    ),
  };
}

/***
  Explain every reason a candidate was not selected.
*/
function getCandidateRejectionReasons(
  candidate: MeasuredColorSwatchCandidate,
  selected: boolean,
  nearestDistance: number,
  tieCandidateSteps: readonly ColorSwatchStep[],
): readonly ColorSwatchCandidateRejectionReason[] {
  if (selected) return [];
  if (!candidate.passesContrast) return ['contrast'];
  if (candidate.targetDistance > nearestDistance + DISTANCE_TIE_TOLERANCE) {
    return ['target-distance'];
  }
  if (tieCandidateSteps.includes(candidate.step)) return ['tie-break'];
  return ['target-distance'];
}

/***
  Measure a swatch candidate against the target and required contrast contexts.
*/
function measureCandidate(
  swatch: ColorSwatch,
  step: ColorSwatchStep,
  target: ColorSelectionTarget,
  contexts: readonly ColorContrastContext[],
): MeasuredColorSwatchCandidate {
  const value = Reflect.get(swatch, step);
  if (typeof value !== 'string') {
    throw new Error(`[color-theory] Missing color swatch step: ${step}.`);
  }
  const hex = parseHexColorOrThrow(value);
  const contrasts = contexts.map((context) => {
    const contrast = getContrastRatio(hex, context.against);
    return { ...context, contrast, passes: contrast >= context.minimumContrast };
  });
  return {
    step,
    hex,
    targetDistance: measureTargetDistance(hex, target),
    contrasts,
    passesContrast: contrasts.every(({ passes }) => passes),
  };
}

/***
  Measure target distance with hue included only when the caller supplied it.
*/
function measureTargetDistance(hex: HexColor, target: ColorSelectionTarget): number {
  const candidate = parseHexToOklch(hex);
  if (target.hueDegrees === undefined) {
    return Math.hypot(candidate.l - target.lightness, candidate.c - target.chroma);
  }
  return deltaEoklch(candidate, {
    mode: 'oklch',
    l: target.lightness,
    c: target.chroma,
    h: target.hueDegrees,
  });
}

/***
  Validate and normalize contrast contexts for deterministic measurement.
*/
function normalizeContexts(
  contexts: readonly ColorContrastContext[],
): readonly ColorContrastContext[] {
  if (contexts.length === 0) {
    throw new Error('[color-theory] Color contrast contexts must not be empty.');
  }
  const ids = new Set<string>();
  return contexts.map((context) => {
    const id = context.id.trim();
    if (!id) throw new Error('[color-theory] Color contrast context id must not be empty.');
    if (ids.has(id)) {
      throw new Error(`[color-theory] Duplicate color contrast context id: ${JSON.stringify(id)}.`);
    }
    ids.add(id);
    if (
      !Number.isFinite(context.minimumContrast) ||
      context.minimumContrast < 1 ||
      context.minimumContrast > 21
    ) {
      throw new Error(
        `[color-theory] Minimum contrast must be a finite ratio from 1 through 21: ${context.minimumContrast}.`,
      );
    }
    return {
      id,
      against: parseHexColorOrThrow(context.against),
      minimumContrast: context.minimumContrast,
    };
  });
}

/***
  Validate and normalize a perceptual color-selection target.
*/
function normalizeTarget(target: ColorSelectionTarget): ColorSelectionTarget {
  if (!Number.isFinite(target.lightness) || target.lightness < 0 || target.lightness > 1) {
    throw new Error(
      `[color-theory] Target lightness must be finite and within 0 through 1: ${target.lightness}.`,
    );
  }
  if (!Number.isFinite(target.chroma) || target.chroma < 0 || target.chroma > 0.4) {
    throw new Error(
      `[color-theory] Target chroma must be finite and within 0 through 0.4: ${target.chroma}.`,
    );
  }
  if (target.hueDegrees !== undefined && !Number.isFinite(target.hueDegrees)) {
    throw new Error(`[color-theory] Target hue must be finite: ${target.hueDegrees}.`);
  }
  return {
    lightness: target.lightness,
    chroma: target.chroma,
    ...(target.hueDegrees !== undefined
      ? { hueDegrees: normalizeHueDegrees(target.hueDegrees) }
      : {}),
  };
}
