# Public API

## assertHexColor

Kind: `function`
Module: `src/hex.ts`
Source: `src/hex.ts:34:1`

Assert that a string is a valid six-digit hex color.

### Signatures

- `(value: string)`
  - value: `string`
  - returns: `void`

## COLOR_HARMONIES

Kind: `unknown`
Module: `src/harmony.ts`
Source: `src/harmony.ts:4:14`

## COLOR_SWATCH_BASE_STEP

Kind: `unknown`
Module: `src/swatches.ts`
Source: `src/swatches.ts:7:14`

## COLOR_SWATCH_STEPS

Kind: `unknown`
Module: `src/swatches.ts`
Source: `src/swatches.ts:4:14`

## ColorHarmony

Kind: `unknown`
Module: `src/harmony.ts`
Source: `src/harmony.ts:13:1`

## ColorSwatch

Kind: `unknown`
Module: `src/swatches.ts`
Source: `src/swatches.ts:9:1`

## ColorSwatchDiagnostics

Kind: `type`
Module: `src/swatches.ts`
Source: `src/swatches.ts:23:1`

### Members

| Name | Kind | Type | Required | Description |
| --- | --- | --- | --- | --- |
| isUsable | property | `boolean` | yes |  |
| lightnessRange | property | `{ min: number; max: number; }` | yes |  |
| maxAdjacentDelta | property | `number` | yes |  |
| minAdjacentDelta | property | `number` | yes |  |
| warnings | property | `readonly ColorSwatchWarning[]` | yes |  |

## ColorSwatchStep

Kind: `unknown`
Module: `src/swatches.ts`
Source: `src/swatches.ts:5:1`

## ColorSwatchWarning

Kind: `type`
Module: `src/swatches.ts`
Source: `src/swatches.ts:16:1`

### Members

| Name | Kind | Type | Required | Description |
| --- | --- | --- | --- | --- |
| code | property | `ColorSwatchWarningCode` | yes |  |
| deltaEFromBase | property | `number \| undefined` | no |  |
| message | property | `string` | yes |  |
| step | property | `50 \| 100 \| 200 \| 300 \| 400 \| 500 \| 600 \| 700 \| 800 \| 900 \| 950 \| undefined` | no |  |

## ColorSwatchWarningCode

Kind: `unknown`
Module: `src/swatches.ts`
Source: `src/swatches.ts:11:1`

## createDefaultSemanticStatusSwatches

Kind: `function`
Module: `src/semantic-status.ts`
Source: `src/semantic-status.ts:44:1`

### Signatures

- `() => SemanticStatusSwatches<"danger" | "success" | "warning">`
  - returns: `SemanticStatusSwatches<"danger" | "success" | "warning">`

## createSemanticStatusSwatches

Kind: `function`
Module: `src/semantic-status.ts`
Source: `src/semantic-status.ts:22:1`

### Signatures

- `(seeds: Record<Role, SemanticStatusSeedInput>) => SemanticStatusSwatches<Role>`
  - seeds: `Record<Role, SemanticStatusSeedInput>`
  - returns: `SemanticStatusSwatches<Role>`

## DARK_SEMANTIC_COLOR_REFERENCES

Kind: `unknown`
Module: `src/semantics.ts`
Source: `src/semantics.ts:46:14`

## DEFAULT_SEMANTIC_STATUS_COLOR_SEEDS

Kind: `unknown`
Module: `src/semantic-status.ts`
Source: `src/semantic-status.ts:6:14`

## DefaultSemanticStatusRole

Kind: `unknown`
Module: `src/semantic-status.ts`
Source: `src/semantic-status.ts:12:1`

## generateColorSwatch

Kind: `function`
Module: `src/swatches.ts`
Source: `src/swatches.ts:73:1`

Generate a full color swatch and diagnostics from a base color.

### Signatures

- `(baseColor: HexColor) => { swatch: ColorSwatch; diagnostics: ColorSwatchDiagnostics; }`
  - baseColor: `HexColor`
  - returns: `{ swatch: ColorSwatch; diagnostics: ColorSwatchDiagnostics; }`

## GeneratedColorRole

Kind: `unknown`
Module: `src/harmony.ts`
Source: `src/harmony.ts:15:1`

## GeneratedHarmonyRoleColor

Kind: `type`
Module: `src/harmony.ts`
Source: `src/harmony.ts:17:1`

### Members

| Name | Kind | Type | Required | Description |
| --- | --- | --- | --- | --- |
| hex | property | `HexColor` | yes |  |
| hueDegrees | property | `number` | yes |  |
| role | property | `GeneratedColorRole` | yes |  |
| source | property | `"selected" \| "generated"` | yes |  |

## GeneratedHarmonyRoleColors

Kind: `type`
Module: `src/harmony.ts`
Source: `src/harmony.ts:24:1`

### Members

| Name | Kind | Type | Required | Description |
| --- | --- | --- | --- | --- |
| colors | property | `readonly GeneratedHarmonyRoleColor[]` | yes |  |
| harmony | property | `"monochromatic" \| "analogous" \| "complementary" \| "triadic" \| "tetradic" \| "splitComplementary"` | yes |  |
| primary | property | `GeneratedHarmonyRoleColor` | yes |  |
| quaternary | property | `GeneratedHarmonyRoleColor \| undefined` | no |  |
| secondary | property | `GeneratedHarmonyRoleColor \| undefined` | no |  |
| tertiary | property | `GeneratedHarmonyRoleColor \| undefined` | no |  |

## GeneratedNeutralMetadata

Kind: `type`
Module: `src/neutral.ts`
Source: `src/neutral.ts:14:1`

### Members

| Name | Kind | Type | Required | Description |
| --- | --- | --- | --- | --- |
| diagnostics | property | `ColorSwatchDiagnostics` | yes |  |
| neutralKeyColor | property | `HexColor` | yes |  |

## GeneratedThemeModeColors

Kind: `type`
Module: `src/theme-colors.ts`
Source: `src/theme-colors.ts:25:1`

### Members

| Name | Kind | Type | Required | Description |
| --- | --- | --- | --- | --- |
| harmonyRoleColors | property | `GeneratedHarmonyRoleColors` | yes |  |
| neutral | property | `GeneratedNeutralMetadata` | yes |  |
| swatches | property | `GeneratedThemeSwatches` | yes |  |

## GeneratedThemeSwatches

Kind: `type`
Module: `src/theme-colors.ts`
Source: `src/theme-colors.ts:17:1`

### Members

| Name | Kind | Type | Required | Description |
| --- | --- | --- | --- | --- |
| neutral | property | `ColorSwatch` | yes |  |
| primary | property | `ColorSwatch` | yes |  |
| quaternary | property | `ColorSwatch \| undefined` | no |  |
| secondary | property | `ColorSwatch \| undefined` | no |  |
| tertiary | property | `ColorSwatch \| undefined` | no |  |

## generateHarmonyRoleColors

Kind: `function`
Module: `src/harmony.ts`
Source: `src/harmony.ts:54:1`

Generate role-based harmony colors from a primary color and harmony strategy.

### Signatures

- `(primaryColor: HexColor, harmony: "monochromatic" | "analogous" | "complementary" | "triadic" | "tetradic" | "splitComplementary") => GeneratedHarmonyRoleColors`
  - harmony: `"monochromatic" | "analogous" | "complementary" | "triadic" | "tetradic" | "splitComplementary"`
  - primaryColor: `HexColor`
  - returns: `GeneratedHarmonyRoleColors`

## generateNeutralSwatch

Kind: `function`
Module: `src/neutral.ts`
Source: `src/neutral.ts:54:1`

Generate a softly tinted neutral swatch from generated harmony role colors.

### Signatures

- `(roleColors: GeneratedHarmonyRoleColors) => NeutralSwatchResult`
  - roleColors: `GeneratedHarmonyRoleColors`
  - returns: `NeutralSwatchResult`

## generateThemeColors

Kind: `function`
Module: `src/theme-colors.ts`
Source: `src/theme-colors.ts:78:1`

Generate light and dark theme color outputs from theme color input.

### Signatures

- `(theme: ThemeColorInput) => { light: GeneratedThemeModeColors; dark: GeneratedThemeModeColors; }`
  - theme: `ThemeColorInput`
  - returns: `{ light: GeneratedThemeModeColors; dark: GeneratedThemeModeColors; }`

## generateThemeModeColors

Kind: `function`
Module: `src/theme-colors.ts`
Source: `src/theme-colors.ts:41:1`

Generate harmony role colors, swatches, and neutral metadata for a theme mode.

### Signatures

- `(mode: ThemeModeColorInput) => GeneratedThemeModeColors`
  - mode: `ThemeModeColorInput`
  - returns: `GeneratedThemeModeColors`

## getReadableForeground

Kind: `function`
Module: `src/contrast.ts`
Source: `src/contrast.ts:16:1`

Return the readable black or white foreground color with the stronger contrast against a background color.

### Signatures

- `(background: HexColor) => ReadableForegroundResult`
  - background: `HexColor`
  - returns: `ReadableForegroundResult`

## getThemeModePrimaryHex

Kind: `function`
Module: `src/theme-colors.ts`
Source: `src/theme-colors.ts:34:1`

Parse the primary color configured for a theme mode.

### Signatures

- `(mode: ThemeModeColorInput) => HexColor`
  - mode: `ThemeModeColorInput`
  - returns: `HexColor`

## HexColor

Kind: `unknown`
Module: `src/hex.ts`
Source: `src/hex.ts:1:1`

## isHexColor

Kind: `function`
Module: `src/hex.ts`
Source: `src/hex.ts:8:1`

Check whether a string is a valid six-digit hex color.

### Signatures

- `(value: string) => boolean`
  - value: `string`
  - returns: `boolean`

## LIGHT_SEMANTIC_COLOR_REFERENCES

Kind: `unknown`
Module: `src/semantics.ts`
Source: `src/semantics.ts:30:14`

## MIN_HUEFUL_CHROMA

Kind: `unknown`
Module: `src/neutral.ts`
Source: `src/neutral.ts:6:14`

## NeutralSwatchResult

Kind: `type`
Module: `src/neutral.ts`
Source: `src/neutral.ts:8:1`

### Members

| Name | Kind | Type | Required | Description |
| --- | --- | --- | --- | --- |
| diagnostics | property | `ColorSwatchDiagnostics` | yes |  |
| neutral | property | `ColorSwatch` | yes |  |
| neutralKeyColor | property | `HexColor` | yes |  |

## parseHexColor

Kind: `function`
Module: `src/hex.ts`
Source: `src/hex.ts:15:1`

Parse a string as a six-digit hex color and return null when it is invalid.

### Signatures

- `(value: string) => HexColor | null`
  - value: `string`
  - returns: `HexColor | null`

## parseHexColorOrThrow

Kind: `function`
Module: `src/hex.ts`
Source: `src/hex.ts:23:1`

Parse a string as a six-digit hex color or throw when it is invalid.

### Signatures

- `(value: string) => HexColor`
  - value: `string`
  - returns: `HexColor`

## ReadableForegroundResult

Kind: `type`
Module: `src/contrast.ts`
Source: `src/contrast.ts:5:1`

### Members

| Name | Kind | Type | Required | Description |
| --- | --- | --- | --- | --- |
| contrast | property | `number` | yes |  |
| foreground | property | `HexColor` | yes |  |

## SemanticColorReference

Kind: `type`
Module: `src/semantics.ts`
Source: `src/semantics.ts:23:1`

### Members

| Name | Kind | Type | Required | Description |
| --- | --- | --- | --- | --- |
| role | property | `SemanticColorRole` | yes |  |
| step | property | `50 \| 100 \| 200 \| 300 \| 400 \| 500 \| 600 \| 700 \| 800 \| 900 \| 950` | yes |  |

## SemanticColorReferenceMap

Kind: `unknown`
Module: `src/semantics.ts`
Source: `src/semantics.ts:28:1`

## SemanticColorRole

Kind: `unknown`
Module: `src/semantics.ts`
Source: `src/semantics.ts:21:1`

## SemanticColorToken

Kind: `unknown`
Module: `src/semantics.ts`
Source: `src/semantics.ts:6:1`

## SemanticStatusSeedInput

Kind: `unknown`
Module: `src/semantic-status.ts`
Source: `src/semantic-status.ts:14:1`

## SemanticStatusSwatches

Kind: `type`
Module: `src/semantic-status.ts`
Source: `src/semantic-status.ts:16:1`

### Members

| Name | Kind | Type | Required | Description |
| --- | --- | --- | --- | --- |
| diagnostics | property | `Record<Role, ColorSwatchDiagnostics>` | yes |  |
| seeds | property | `Record<Role, HexColor>` | yes |  |
| swatches | property | `Record<Role, ColorSwatch>` | yes |  |

## ThemeColorInput

Kind: `type`
Module: `src/theme-colors.ts`
Source: `src/theme-colors.ts:12:1`

### Members

| Name | Kind | Type | Required | Description |
| --- | --- | --- | --- | --- |
| dark | property | `ThemeModeColorInput` | yes |  |
| light | property | `ThemeModeColorInput` | yes |  |

## ThemeColorMode

Kind: `unknown`
Module: `src/semantics.ts`
Source: `src/semantics.ts:4:1`

## ThemeModeColorInput

Kind: `type`
Module: `src/theme-colors.ts`
Source: `src/theme-colors.ts:7:1`

### Members

| Name | Kind | Type | Required | Description |
| --- | --- | --- | --- | --- |
| harmony | property | `"monochromatic" \| "analogous" \| "complementary" \| "triadic" \| "tetradic" \| "splitComplementary"` | yes |  |
| primaryColor | property | `string` | yes |  |
