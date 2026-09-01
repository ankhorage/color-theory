import { describe, expect, it } from 'bun:test';

import {
  COLOR_SWATCH_BASE_LIGHTNESS,
  COLOR_SWATCH_BASE_STEP,
  COLOR_SWATCH_STEPS,
  createDefaultSemanticStatusSwatches,
  createSemanticStatusSwatches,
  DEFAULT_SEMANTIC_STATUS_COLOR_SEEDS,
  generateColorSwatch,
  generateHarmonyRoleColors,
  generateNeutralSwatch,
  generateThemeModeColors,
  getReadableForeground,
  parseHexColor,
  parseHexColorOrThrow,
} from './index';
import { parseHexToOklch } from './internal-culori';

function readRecordValue<Key extends PropertyKey, Value>(
  record: Readonly<Record<Key, Value>>,
  key: Key,
): Value {
  return Reflect.get(record, key);
}

describe('color parsing', () => {
  it('parses valid hex colors and rejects invalid values', () => {
    expect(parseHexColor('#3366ff')).toBe('#3366ff');
    expect(parseHexColor('#3366FF')).toBe('#3366FF');
    expect(parseHexColor('3366ff')).toBeNull();
    expect(() => parseHexColorOrThrow('#12345')).toThrow();
  });
});

describe('color swatches and theme modes', () => {
  it('generates 11-step swatches that preserve the base color at step 500', () => {
    const base = parseHexColorOrThrow('#3366ff');
    const { swatch, diagnostics } = generateColorSwatch(base);

    expect(Object.keys(swatch).length).toBe(COLOR_SWATCH_STEPS.length);
    expect(readRecordValue(swatch, COLOR_SWATCH_BASE_STEP)).toBe(base);
    expect(diagnostics.lightnessRange.max).toBeGreaterThanOrEqual(diagnostics.lightnessRange.min);
  });

  it('generates required neutral swatches from harmony role colors', () => {
    const primary = parseHexColorOrThrow('#3366ff');
    const roleColors = generateHarmonyRoleColors(primary, 'triadic');
    const neutral = generateNeutralSwatch(roleColors);

    expect(readRecordValue(neutral.neutral, COLOR_SWATCH_BASE_STEP)).toBe(neutral.neutralKeyColor);
    expect(parseHexToOklch(neutral.neutralKeyColor).l).toBeCloseTo(COLOR_SWATCH_BASE_LIGHTNESS, 2);
    expect(readRecordValue(neutral.neutral, 50)).not.toBe(readRecordValue(neutral.neutral, 100));
    expect(readRecordValue(neutral.neutral, 100)).not.toBe(readRecordValue(neutral.neutral, 200));
    expect(neutral.diagnostics.isUsable).toBe(true);
    expect(neutral.diagnostics.lightnessRange.max).toBeGreaterThanOrEqual(
      neutral.diagnostics.lightnessRange.min,
    );
  });

  it('generates theme mode colors with one canonical swatch container', () => {
    const generated = generateThemeModeColors({ primaryColor: '#3366ff', harmony: 'tetradic' });

    expect(generated.harmonyRoleColors.primary.hex).toBe('#3366ff');
    expect(readRecordValue(generated.swatches.primary, COLOR_SWATCH_BASE_STEP)).toBe('#3366ff');
    expect(
      generated.swatches.secondary &&
        readRecordValue(generated.swatches.secondary, COLOR_SWATCH_BASE_STEP),
    ).toBe(generated.harmonyRoleColors.secondary?.hex);
    expect(
      generated.swatches.tertiary &&
        readRecordValue(generated.swatches.tertiary, COLOR_SWATCH_BASE_STEP),
    ).toBe(generated.harmonyRoleColors.tertiary?.hex);
    expect(
      generated.swatches.quaternary &&
        readRecordValue(generated.swatches.quaternary, COLOR_SWATCH_BASE_STEP),
    ).toBe(generated.harmonyRoleColors.quaternary?.hex);
    expect(readRecordValue(generated.swatches.neutral, COLOR_SWATCH_BASE_STEP)).toBe(
      generated.neutral.neutralKeyColor,
    );
    expect(Object.hasOwn(generated, 'primary')).toBe(false);
    expect(Object.hasOwn(generated, 'secondary')).toBe(false);
  });
});

describe('readability and semantic statuses', () => {
  it('returns black or white readable foreground colors', () => {
    const white = parseHexColorOrThrow('#FFFFFF');
    const foreground = getReadableForeground(white);

    expect(['#000000', '#FFFFFF']).toContain(foreground.foreground);
    expect(foreground.contrast).toBeGreaterThan(0);
  });

  it('ships stable default semantic status color seeds', () => {
    expect(DEFAULT_SEMANTIC_STATUS_COLOR_SEEDS.danger).toBe('#ef4444');
    expect(DEFAULT_SEMANTIC_STATUS_COLOR_SEEDS.success).toBe('#22c55e');
    expect(DEFAULT_SEMANTIC_STATUS_COLOR_SEEDS.warning).toBe('#f59e0b');
  });

  it('generates deterministic semantic status swatches from default seeds', () => {
    const first = createDefaultSemanticStatusSwatches();
    const second = createDefaultSemanticStatusSwatches();

    expect(first).toEqual(second);

    for (const role of ['danger', 'success', 'warning'] as const) {
      const seed = readRecordValue(first.seeds, role);
      expect(seed).toBe(readRecordValue(DEFAULT_SEMANTIC_STATUS_COLOR_SEEDS, role));
      expect(readRecordValue(readRecordValue(first.swatches, role), COLOR_SWATCH_BASE_STEP)).toBe(
        seed,
      );
      expect(readRecordValue(first.diagnostics, role).warnings).toBeDefined();
    }
  });

  it('throws deterministically on invalid semantic status seed input', () => {
    expect(() => createSemanticStatusSwatches({ danger: 'not-a-hex-color' })).toThrow();
  });
});
