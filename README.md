# @ankhorage/color-theory

Standalone color theory, harmony, swatch, contrast, and theme color generation utilities.

## Semantic status colors

Generate deterministic swatches for semantic status roles like `danger`, `success`, and `warning`.

```ts
import { createDefaultSemanticStatusSwatches } from '@ankhorage/color-theory';

const status = createDefaultSemanticStatusSwatches();
status.seeds.danger; // "#ef4444"
status.swatches.danger[500]; // "#ef4444"
```

Override defaults by passing your own seeds (throws on invalid hex input):

```ts
import { createSemanticStatusSwatches } from '@ankhorage/color-theory';

const status = createSemanticStatusSwatches({
  danger: '#ef4444',
  success: '#22c55e',
  warning: '#f59e0b',
});
```
