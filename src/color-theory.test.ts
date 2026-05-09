import { describe, expect, it } from 'bun:test';

import {
  COLOR_HARMONIES,
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

describe('color theory', () => {
  it('parses valid hex colors and rejects invalid values', () => {
    expect(parseHexColor('#3366ff')).toBe('#3366ff');
    expect(parseHexColor('#3366FF')).toBe('#3366FF');
    expect(parseHexColor('3366ff')).toBeNull();
    expect(() => parseHexColorOrThrow('#12345')).toThrow();
  });

  it('generates harmony role colors with expected role counts', () => {
    const primary = parseHexColorOrThrow('#3366ff');
    const expectedRoleCount: Record<(typeof COLOR_HARMONIES)[number], number> = {
      monochromatic: 1,
      complementary: 2,
      analogous: 3,
      splitComplementary: 3,
      triadic: 3,
      tetradic: 4,
    };

    for (const harmony of COLOR_HARMONIES) {
      const roleColors = generateHarmonyRoleColors(primary, harmony);
      expect(roleColors.colors.length).toBe(expectedRoleCount[harmony]);
      expect(roleColors.primary.hex).toBe(primary);
      expect(roleColors.primary.source).toBe('selected');
    }
  });

  it('generates 11-step swatches that preserve the base color at step 500', () => {
    const base = parseHexColorOrThrow('#3366ff');
    const { swatch, diagnostics } = generateColorSwatch(base);

    expect(Object.keys(swatch).length).toBe(COLOR_SWATCH_STEPS.length);
    expect(swatch[COLOR_SWATCH_BASE_STEP]).toBe(base);
    expect(diagnostics.lightnessRange.max).toBeGreaterThanOrEqual(diagnostics.lightnessRange.min);
  });

  it('generates required neutral swatches from harmony role colors', () => {
    const primary = parseHexColorOrThrow('#3366ff');
    const roleColors = generateHarmonyRoleColors(primary, 'triadic');
    const neutral = generateNeutralSwatch(roleColors);

    expect(neutral.neutral[COLOR_SWATCH_BASE_STEP]).toBe(neutral.neutralKeyColor);
    expect(neutral.diagnostics.lightnessRange.max).toBeGreaterThanOrEqual(
      neutral.diagnostics.lightnessRange.min,
    );
  });

  it('generates theme mode colors with one canonical swatch container', () => {
    const generated = generateThemeModeColors({ primaryColor: '#3366ff', harmony: 'tetradic' });

    expect(generated.harmonyRoleColors.primary.hex).toBe('#3366ff');
    expect(generated.swatches.primary[COLOR_SWATCH_BASE_STEP]).toBe('#3366ff');
    expect(generated.swatches.secondary?.[COLOR_SWATCH_BASE_STEP]).toBe(
      generated.harmonyRoleColors.secondary?.hex,
    );
    expect(generated.swatches.tertiary?.[COLOR_SWATCH_BASE_STEP]).toBe(
      generated.harmonyRoleColors.tertiary?.hex,
    );
    expect(generated.swatches.quaternary?.[COLOR_SWATCH_BASE_STEP]).toBe(
      generated.harmonyRoleColors.quaternary?.hex,
    );
    expect(generated.swatches.neutral[COLOR_SWATCH_BASE_STEP]).toBe(
      generated.neutral.neutralKeyColor,
    );
    expect(Object.hasOwn(generated, 'primary')).toBe(false);
    expect(Object.hasOwn(generated, 'secondary')).toBe(false);
  });

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
      expect(first.seeds[role]).toBe(DEFAULT_SEMANTIC_STATUS_COLOR_SEEDS[role]);
      expect(first.swatches[role][COLOR_SWATCH_BASE_STEP]).toBe(first.seeds[role]);
      expect(first.diagnostics[role].warnings).toBeDefined();
    }
  });

  it('throws deterministically on invalid semantic status seed input', () => {
    expect(() => createSemanticStatusSwatches({ danger: 'not-a-hex-color' })).toThrow();
  });
});
