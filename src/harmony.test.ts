import { describe, expect, it } from 'bun:test';

import {
  COLOR_HARMONIES,
  COLOR_HARMONY_CATALOG,
  generateHarmonyRoleColors,
  generateThemeColors,
  MIN_HUEFUL_CHROMA,
  parseHexColorOrThrow,
} from './index';

function normalizeHue(hueDegrees: number): number {
  return ((hueDegrees % 360) + 360) % 360;
}

describe('canonical color harmony catalog', () => {
  it('publishes every identifier and exact hue geometry from one enumerable catalog', () => {
    expect(COLOR_HARMONY_CATALOG.map(({ id }) => id)).toEqual([
      'monochromatic',
      'analogous',
      'complementary',
      'splitComplementary',
      'triadic',
      'tetradic',
      'square',
    ]);
    expect(COLOR_HARMONIES).toEqual(COLOR_HARMONY_CATALOG.map(({ id }) => id));
    expect(COLOR_HARMONY_CATALOG.map(({ offsets }) => offsets)).toEqual([
      [0],
      [0, -30, 30],
      [0, 180],
      [0, 150, 210],
      [0, 120, 240],
      [0, 60, 180, 240],
      [0, 90, 180, 270],
    ]);
  });

  it('provides display metadata and role counts without a consumer-owned table', () => {
    for (const definition of COLOR_HARMONY_CATALOG) {
      expect(definition.label.length).toBeGreaterThan(0);
      expect(definition.description.length).toBeGreaterThan(0);
      expect(definition.roleCount).toBe(definition.roles.length);
      expect(definition.offsets.length).toBe(definition.roleCount);
    }
  });
});

describe('harmony geometry generation', () => {
  it('exhaustively generates the catalog with exact normalized offsets and role counts', () => {
    const primary = parseHexColorOrThrow('#ff0011');

    for (const definition of COLOR_HARMONY_CATALOG) {
      const generated = generateHarmonyRoleColors(primary, definition.id);
      const primaryHue = generated.primary.hueDegrees;

      expect(generated.colors.map(({ role }) => role)).toEqual(definition.roles);
      expect(generated.colors.length).toBe(definition.roleCount);
      expect(generated.colors.map(({ hueDegrees }) => hueDegrees)).toEqual(
        definition.offsets.map((offset) => normalizeHue(primaryHue + offset)),
      );
      expect(generated.primary.hex).toBe(primary);
      expect(generated.primary.source).toBe('selected');
      expect(generated.diagnostics.isHueReliable).toBe(true);
      expect(generated.diagnostics.warnings).toEqual([]);
    }
  });

  it('distinguishes rectangular tetradic geometry from square geometry', () => {
    const primary = parseHexColorOrThrow('#3366ff');
    const tetradic = generateHarmonyRoleColors(primary, 'tetradic');
    const square = generateHarmonyRoleColors(primary, 'square');

    expect(tetradic.colors.map(({ hueDegrees }) => hueDegrees)).not.toEqual(
      square.colors.map(({ hueDegrees }) => hueDegrees),
    );
    expect(tetradic.quaternary).toBeDefined();
    expect(square.quaternary).toBeDefined();
  });

  it('normalizes negative and overflowing offsets through hue wrap-around', () => {
    const primary = parseHexColorOrThrow('#ff0011');
    const analogous = generateHarmonyRoleColors(primary, 'analogous');
    const square = generateHarmonyRoleColors(parseHexColorOrThrow('#ff00ff'), 'square');

    expect(analogous.secondary?.hueDegrees).toBeGreaterThan(analogous.primary.hueDegrees);
    expect(analogous.secondary?.hueDegrees).toBe(normalizeHue(analogous.primary.hueDegrees - 30));
    expect(analogous.colors.every(({ hueDegrees }) => hueDegrees >= 0 && hueDegrees < 360)).toBe(
      true,
    );
    expect(square.colors.every(({ hueDegrees }) => hueDegrees >= 0 && hueDegrees < 360)).toBe(true);
    expect(square.quaternary?.hueDegrees).toBeLessThan(square.primary.hueDegrees);
    expect(square.quaternary?.hueDegrees).toBe(normalizeHue(square.primary.hueDegrees + 270));
  });
});

describe('harmony generation diagnostics and modes', () => {
  it('preserves achromatic generation while diagnosing an unreliable hue', () => {
    const generated = generateHarmonyRoleColors(parseHexColorOrThrow('#808080'), 'square');

    expect(generated.primary.hex).toBe('#808080');
    expect(generated.diagnostics.primaryChroma).toBe(0);
    expect(generated.diagnostics.isHueReliable).toBe(false);
    expect(generated.diagnostics.warnings.map(({ code }) => code)).toEqual(['achromatic_primary']);
  });

  it('diagnoses a low-chroma hue separately from an achromatic primary', () => {
    const generated = generateHarmonyRoleColors(parseHexColorOrThrow('#7f8080'), 'triadic');

    expect(generated.diagnostics.primaryChroma).toBeGreaterThan(0);
    expect(generated.diagnostics.primaryChroma).toBeLessThan(MIN_HUEFUL_CHROMA);
    expect(generated.diagnostics.isHueReliable).toBe(false);
    expect(generated.diagnostics.warnings.map(({ code }) => code)).toEqual(['low_chroma_primary']);
  });

  it('compiles every harmony through light and dark theme modes', () => {
    for (const harmony of COLOR_HARMONIES) {
      const generated = generateThemeColors({
        light: { primaryColor: '#3366ff', harmony },
        dark: { primaryColor: '#ff4d8d', harmony },
      });

      expect(generated.light.harmonyRoleColors.harmony).toBe(harmony);
      expect(generated.dark.harmonyRoleColors.harmony).toBe(harmony);
    }
  });
});
