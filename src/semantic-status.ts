import type { HexColor } from './hex';
import { parseHexColorOrThrow } from './hex';
import type { ColorSwatch, ColorSwatchDiagnostics } from './swatches';
import { generateColorSwatch } from './swatches';

export const DEFAULT_SEMANTIC_STATUS_COLOR_SEEDS = {
  danger: '#ef4444',
  success: '#22c55e',
  warning: '#f59e0b',
} as const satisfies Record<string, string>;

export type DefaultSemanticStatusRole = keyof typeof DEFAULT_SEMANTIC_STATUS_COLOR_SEEDS;

export type SemanticStatusSeedInput = string | HexColor;

export interface SemanticStatusSwatches<Role extends string> {
  seeds: Record<Role, HexColor>;
  swatches: Record<Role, ColorSwatch>;
  diagnostics: Record<Role, ColorSwatchDiagnostics>;
}

export function createSemanticStatusSwatches<Role extends string>(
  seeds: Record<Role, SemanticStatusSeedInput>,
): SemanticStatusSwatches<Role> {
  const roles = Object.keys(seeds) as Role[];

  const normalizedSeeds = {} as Record<Role, HexColor>;
  const swatches = {} as Record<Role, ColorSwatch>;
  const diagnostics = {} as Record<Role, ColorSwatchDiagnostics>;

  for (const role of roles) {
    const seed = seeds[role];
    const seedHex = typeof seed === 'string' ? parseHexColorOrThrow(seed) : seed;
    normalizedSeeds[role] = seedHex;

    const generated = generateColorSwatch(seedHex);
    swatches[role] = generated.swatch;
    diagnostics[role] = generated.diagnostics;
  }

  return { seeds: normalizedSeeds, swatches, diagnostics };
}

export function createDefaultSemanticStatusSwatches(): SemanticStatusSwatches<DefaultSemanticStatusRole> {
  return createSemanticStatusSwatches(DEFAULT_SEMANTIC_STATUS_COLOR_SEEDS);
}
