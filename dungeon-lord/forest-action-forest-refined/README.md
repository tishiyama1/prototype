# Forest Action — restrained forest/cave art comparison

New independent URLs:
- https://tishiyama1.github.io/prototype/dungeon-lord/forest-action-forest-refined/
- https://tishiyama1.github.io/prototype/dungeon-lord/forest-action-cave-refined/

Original forest-action-layered/ and forest-action-cave/ remain untouched. Existing Pages publishing from main/root and pinned Three.js 0.180.0 are retained. No build tool, dependency or deploy setting was introduced.

## Guideline implementation
- Rules 2/6: keep original forest surfaces; cave central floor uses broad quiet dust/rock planes instead of dense cracks, stone outlines and pebbles.
- Rules 3/4: new cave rock art uses fewer larger masses, soft restrained shading and fewer sharp light edges.
- Rule 5: muted slate/olive-gray/taupe surfaces with modest localized amber lighting.
- Rule 7: the original orthographic camera, scene dimensions, initial character positions, parallax and foreground alpha-aware fade remain intact. Stone imagery no longer inherits forest foreground plate sway.
- Rule 8: forest sunlight opacity .055 with +/-7% slow modulation, six tiny side-drifting leaves and four motes; cave lantern + two faint wall bounce layers and two floor pools use slow +/-6.5% modulation, ten small dust points. Environment OFF hides added effects while static painted lighting remains.

Forest's six background WebP images and placement manifest are byte-identical. Cave's four new 2D edit assets total 339,434 bytes versus original 1,306,620 bytes. File size reduction is not a direct quality or FPS measurement. Alpha and source dimensions/crops are preserved; PNGs whose maximum alpha is 254 remain as supplied. No global blur/filter was used to substitute for artwork simplification.

Both scenes remain pseudo-3D textured image layers. Existing pixel characters/effects, cards, input, target movement, damage and enemy AI are unchanged. No added terrain collision or environmental combat modifier.

## Production files and checks
The guideline snapshot, final built-in imagegen prompts, original file hash baseline, runtime test and result records are in tests/forest-action-art-refinement/.

- 43 tactical/card/input unit cases.
- Each scene: 19 core modules byte-identical; 1,450 equal fixed-step snapshots through victory, pause, skip and retry.
- 291 pre-existing tracked files protected by SHA256 baseline.
- Same-state PC/mobile/card screenshots and runtime lighting/leaf/static-rock checks.

See VALIDATION.md for observed results. Chromium software GPU/mobile-size/CDP-touch tests are separate from physical iPhone Safari, which is unavailable here. 60FPS on iPhone has not been verified.
