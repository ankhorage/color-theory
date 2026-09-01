import { describe, expect, it } from 'bun:test';

import type { ColorSwatch } from './index';
import { generateColorSwatch, parseHexColorOrThrow, selectColorSwatchStep } from './index';

const WHITE = parseHexColorOrThrow('#FFFFFF');

describe('color swatch target selection', () => {
  it('selects deterministically from a generated ramp with measured evidence', () => {
    const { swatch } = generateColorSwatch(parseHexColorOrThrow('#3366FF'));
    const input = {
      lightness: 0.55,
      chroma: 0.2,
      hueDegrees: 265,
    };
    const contexts = [{ id: 'on-canvas', against: WHITE, minimumContrast: 4.5 }];
    const first = selectColorSwatchStep(swatch, input, contexts, 'lower-step');
    const second = selectColorSwatchStep(swatch, input, contexts, 'lower-step');

    expect(first).toEqual(second);
    expect(first.selected).not.toBeNull();
    expect(first.selected?.contrasts[0]?.passes).toBe(true);
    expect(first.selected?.rejectionReasons).toEqual([]);
    expect(first.candidates).toHaveLength(11);
    expect(first.rejectedCandidates).toHaveLength(10);
  });

  it('ignores hue distance unless a hue target is intentionally supplied', () => {
    const swatch = createAlternatingHueSwatch();
    const withoutHue = selectColorSwatchStep(
      swatch,
      { lightness: 0.628, chroma: 0.258 },
      [{ id: 'minimum', against: WHITE, minimumContrast: 1 }],
      'lower-step',
    );
    const withHue = selectColorSwatchStep(
      swatch,
      { lightness: 0.628, chroma: 0.258, hueDegrees: 142 },
      [{ id: 'minimum', against: WHITE, minimumContrast: 1 }],
      'lower-step',
    );

    expect(withoutHue.selected?.hex).toBe('#FF0000');
    expect(withHue.selected?.hex).toBe('#00FF00');
  });
});

describe('color swatch selection diagnostics', () => {
  it('uses the explicit swatch-step tie policy', () => {
    const swatch = createConstantSwatch('#000000');
    const contexts = [{ id: 'on-white', against: WHITE, minimumContrast: 4.5 }];
    const target = { lightness: 0, chroma: 0 };
    const lower = selectColorSwatchStep(swatch, target, contexts, 'lower-step');
    const higher = selectColorSwatchStep(swatch, target, contexts, 'higher-step');

    expect(lower.selected?.step).toBe(50);
    expect(higher.selected?.step).toBe(950);
    expect(lower.tieBreak).toEqual({
      policy: 'lower-step',
      applied: true,
      candidateSteps: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
    });
    expect(lower.candidates.at(-1)?.rejectionReasons).toEqual(['tie-break']);
  });

  it('returns all threshold failures instead of selecting an invalid step', () => {
    const { swatch } = generateColorSwatch(parseHexColorOrThrow('#3366FF'));
    const result = selectColorSwatchStep(
      swatch,
      { lightness: 0.5, chroma: 0.2 },
      [{ id: 'impossible-on-gray', against: parseHexColorOrThrow('#777777'), minimumContrast: 21 }],
      'lower-step',
    );

    expect(result.selected).toBeNull();
    expect(result.rejectedCandidates).toHaveLength(11);
    expect(
      result.rejectedCandidates.every(({ rejectionReasons }) =>
        rejectionReasons.includes('contrast'),
      ),
    ).toBe(true);
  });

  it('handles extreme black and white ramps deterministically', () => {
    const dark = selectColorSwatchStep(
      generateColorSwatch(parseHexColorOrThrow('#000000')).swatch,
      { lightness: 0, chroma: 0 },
      [{ id: 'on-white', against: WHITE, minimumContrast: 7 }],
      'higher-step',
    );
    const light = selectColorSwatchStep(
      generateColorSwatch(WHITE).swatch,
      { lightness: 1, chroma: 0 },
      [{ id: 'on-black', against: parseHexColorOrThrow('#000000'), minimumContrast: 7 }],
      'lower-step',
    );

    expect(dark.selected?.contrasts[0]?.passes).toBe(true);
    expect(light.selected?.contrasts[0]?.passes).toBe(true);
  });
});

describe('color swatch selection input validation', () => {
  it('rejects invalid targets and contrast contexts', () => {
    const swatch = createConstantSwatch('#000000');

    expect(() =>
      selectColorSwatchStep(
        swatch,
        { lightness: 2, chroma: 0 },
        [{ id: 'on-white', against: WHITE, minimumContrast: 4.5 }],
        'lower-step',
      ),
    ).toThrow('Target lightness');
    expect(() =>
      selectColorSwatchStep(swatch, { lightness: 0, chroma: 0 }, [], 'lower-step'),
    ).toThrow('must not be empty');
    expect(() =>
      selectColorSwatchStep(
        swatch,
        { lightness: 0, chroma: 0 },
        [
          { id: 'duplicate', against: WHITE, minimumContrast: 4.5 },
          { id: 'duplicate', against: WHITE, minimumContrast: 4.5 },
        ],
        'lower-step',
      ),
    ).toThrow('Duplicate');
  });
});

/***
  Create a complete swatch that alternates two equal-lightness high-chroma colors.
*/
function createAlternatingHueSwatch(): ColorSwatch {
  const red = parseHexColorOrThrow('#FF0000');
  const green = parseHexColorOrThrow('#00FF00');
  return {
    50: green,
    100: red,
    200: green,
    300: red,
    400: green,
    500: red,
    600: green,
    700: red,
    800: green,
    900: red,
    950: green,
  };
}

/***
  Create a complete swatch containing one repeated color.
*/
function createConstantSwatch(hex: string): ColorSwatch {
  const color = parseHexColorOrThrow(hex);
  return {
    50: color,
    100: color,
    200: color,
    300: color,
    400: color,
    500: color,
    600: color,
    700: color,
    800: color,
    900: color,
    950: color,
  };
}
