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

interface GeneratedSemanticStatus<Role extends string> {
  readonly diagnostics: ColorSwatchDiagnostics;
  readonly role: Role;
  readonly seed: HexColor;
  readonly swatch: ColorSwatch;
}

/***
  Convert typed entries into a role-keyed immutable result record.
*/
function createRoleRecord<Role extends string, Value>(
  entries: readonly (readonly [Role, Value])[],
): Record<Role, Value> {
  return Object.fromEntries(entries) as Record<Role, Value>;
}

/***
  Normalize and generate one semantic status role.
*/
function generateSemanticStatus<Role extends string>(
  role: Role,
  seed: SemanticStatusSeedInput,
): GeneratedSemanticStatus<Role> {
  const seedHex = typeof seed === 'string' ? parseHexColorOrThrow(seed) : seed;
  const generated = generateColorSwatch(seedHex);
  return {
    role,
    seed: seedHex,
    swatch: generated.swatch,
    diagnostics: generated.diagnostics,
  };
}

/***
  Generate semantic status swatches from a role-to-seed record.
*/
export function createSemanticStatusSwatches<Role extends string>(
  seeds: Record<Role, SemanticStatusSeedInput>,
): SemanticStatusSwatches<Role> {
  const generated = Object.entries(seeds).map(([role, seed]) =>
    generateSemanticStatus(role as Role, seed as SemanticStatusSeedInput),
  );
  return {
    seeds: createRoleRecord(generated.map(({ role, seed }) => [role, seed])),
    swatches: createRoleRecord(generated.map(({ role, swatch }) => [role, swatch])),
    diagnostics: createRoleRecord(generated.map(({ diagnostics, role }) => [role, diagnostics])),
  };
}

/***
  Generate the canonical default semantic status swatches.
*/
export function createDefaultSemanticStatusSwatches(): SemanticStatusSwatches<DefaultSemanticStatusRole> {
  return createSemanticStatusSwatches(DEFAULT_SEMANTIC_STATUS_COLOR_SEEDS);
}
