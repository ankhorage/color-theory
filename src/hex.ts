export type HexColor = string & { readonly __hexColorBrand: unique symbol };

const HEX6_CASE_INSENSITIVE_REGEX = /^#[0-9a-fA-F]{6}$/;

export function isHexColor(value: string): value is HexColor {
  return HEX6_CASE_INSENSITIVE_REGEX.test(value);
}

export function parseHexColor(value: string): HexColor | null {
  if (!HEX6_CASE_INSENSITIVE_REGEX.test(value)) return null;
  return value as HexColor;
}

export function parseHexColorOrThrow(value: string): HexColor {
  const parsed = parseHexColor(value);
  if (!parsed) {
    throw new Error(`Invalid hex color (expected #RRGGBB or #rrggbb): ${JSON.stringify(value)}`);
  }
  return parsed;
}

export const normalizeHexColor = parseHexColor;
export const normalizeHexColorOrThrow = parseHexColorOrThrow;

export function assertHexColor(value: string): asserts value is HexColor {
  if (!isHexColor(value)) {
    throw new Error(`Invalid hex color (expected #RRGGBB or #rrggbb): ${JSON.stringify(value)}`);
  }
}
