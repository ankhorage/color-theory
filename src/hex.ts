export type HexColor = string & { readonly __hexColorBrand: unique symbol };

const HEX6_CASE_INSENSITIVE_REGEX = /^#[0-9a-fA-F]{6}$/;

/***
  Check whether a string is a valid six-digit hex color.
*/
export function isHexColor(value: string): value is HexColor {
  return HEX6_CASE_INSENSITIVE_REGEX.test(value);
}

/***
  Parse a string as a six-digit hex color and return null when it is invalid.
*/
export function parseHexColor(value: string): HexColor | null {
  if (!HEX6_CASE_INSENSITIVE_REGEX.test(value)) return null;
  return value as HexColor;
}

/***
  Parse a string as a six-digit hex color or throw when it is invalid.
*/
export function parseHexColorOrThrow(value: string): HexColor {
  const parsed = parseHexColor(value);
  if (!parsed) {
    throw new Error(`Invalid hex color (expected #RRGGBB or #rrggbb): ${JSON.stringify(value)}`);
  }
  return parsed;
}

/***
  Assert that a string is a valid six-digit hex color.
*/
export function assertHexColor(value: string): asserts value is HexColor {
  if (!isHexColor(value)) {
    throw new Error(`Invalid hex color (expected #RRGGBB or #rrggbb): ${JSON.stringify(value)}`);
  }
}
