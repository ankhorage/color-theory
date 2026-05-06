import type { HexColor } from './hex';
import { parseHexColorOrThrow } from './hex';
import { contrastRatio } from './internal-culori';

export interface ReadableForegroundResult {
  foreground: HexColor;
  contrast: number;
}

const BLACK = parseHexColorOrThrow('#000000');
const WHITE = parseHexColorOrThrow('#FFFFFF');

/***
  Return the readable black or white foreground color with the stronger contrast against a background color.
*/
export function getReadableForeground(background: HexColor): ReadableForegroundResult {
  const contrastOnBlack = contrastRatio(background, BLACK);
  const contrastOnWhite = contrastRatio(background, WHITE);

  if (contrastOnBlack >= contrastOnWhite) {
    return { foreground: BLACK, contrast: contrastOnBlack };
  }

  return { foreground: WHITE, contrast: contrastOnWhite };
}
