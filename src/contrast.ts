import { contrastRatio } from './internal-culori';
import type { HexColor } from './hex';
import { parseHexColorOrThrow } from './hex';

export interface ReadableForegroundResult {
  foreground: HexColor;
  contrast: number;
}

const BLACK = parseHexColorOrThrow('#000000');
const WHITE = parseHexColorOrThrow('#FFFFFF');

export function getReadableForeground(background: HexColor): ReadableForegroundResult {
  const contrastOnBlack = contrastRatio(background, BLACK);
  const contrastOnWhite = contrastRatio(background, WHITE);

  if (contrastOnBlack >= contrastOnWhite) {
    return { foreground: BLACK, contrast: contrastOnBlack };
  }

  return { foreground: WHITE, contrast: contrastOnWhite };
}
