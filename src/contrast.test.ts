import { describe, expect, it } from 'bun:test';

import {
  getContrastRatio,
  getReadableForeground,
  parseHexColorOrThrow,
  selectReadableForeground,
} from './index';

describe('contrast measurement', () => {
  it('measures the WCAG contrast ratio for public validated colors', () => {
    const black = parseHexColorOrThrow('#000000');
    const white = parseHexColorOrThrow('#FFFFFF');

    expect(getContrastRatio(black, white)).toBe(21);
    expect(getContrastRatio(white, black)).toBe(21);
    expect(getContrastRatio(black, black)).toBe(1);
  });

  it('keeps the black-or-white convenience selector behavior', () => {
    expect(getReadableForeground(parseHexColorOrThrow('#FFFFFF'))).toEqual({
      foreground: '#000000',
      contrast: 21,
    });
  });
});

describe('foreground selection diagnostics', () => {
  it('selects the strongest caller-provided foreground that passes the threshold', () => {
    const result = selectReadableForeground(
      parseHexColorOrThrow('#FFFFFF'),
      [parseHexColorOrThrow('#767676'), parseHexColorOrThrow('#000000')],
      4.5,
      'first',
    );

    expect(result.selected?.foreground).toBe('#000000');
    expect(result.selected?.contrast).toBe(21);
    expect(result.candidates.at(0)?.rejectionReason).toBe('weaker-contrast');
  });

  it('returns complete rejection evidence when no foreground passes', () => {
    const result = selectReadableForeground(
      parseHexColorOrThrow('#777777'),
      [parseHexColorOrThrow('#888888'), parseHexColorOrThrow('#999999')],
      7,
      'first',
    );

    expect(result.selected).toBeNull();
    expect(
      result.candidates.every(({ rejectionReason }) => rejectionReason === 'minimum-contrast'),
    ).toBe(true);
  });

  it('uses the explicit candidate-order tie policy', () => {
    const background = parseHexColorOrThrow('#FFFFFF');
    const duplicate = parseHexColorOrThrow('#000000');
    const candidates = [duplicate, duplicate];

    expect(
      selectReadableForeground(background, candidates, 4.5, 'first').candidates[0]?.selected,
    ).toBe(true);
    expect(
      selectReadableForeground(background, candidates, 4.5, 'last').candidates[1]?.selected,
    ).toBe(true);
  });

  it('rejects empty candidates and invalid thresholds', () => {
    const background = parseHexColorOrThrow('#FFFFFF');

    expect(() => selectReadableForeground(background, [], 4.5, 'first')).toThrow(
      'must not be empty',
    );
    expect(() =>
      selectReadableForeground(background, [parseHexColorOrThrow('#000000')], 0, 'first'),
    ).toThrow('from 1 through 21');
  });
});
