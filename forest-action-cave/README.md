# Forest Action — 灯りの先の岩窟

Independent comparison scene: `https://tishiyama1.github.io/prototype/forest-action-cave/`

Base game: `forest-action-diorama-pixel/`, protected at `ada828136ba2e7eb42e6b4e2777571e9120d0518`. Existing 5 published versions and top page are not changed.

## Scene production

Four **new 2D raster assets** were generated with the built-in imagegen tool from the user's cave mood reference. The cave was not modeled in 3D and no original forest models or background art are loaded. `ART_PROMPTS.md` records the final prompt set and `media/art-metadata.json` records original sizes, transparent-margin packing and delivery bytes. Generation is nondeterministic; the published WebP assets are the fixed deliverables.

| Role | Asset | Details |
|---|---|---|
| Far | `media/far.webp` | Receding arches, dark passage, distant small lamp |
| Middle | `media/middle.webp` | Two rock walls, aged timber support and the principal lantern; central transparent space |
| Ground | `media/ground.webp` | Top-down dust, cracked rock and worn paving, pebbles and broad light pools |
| Foreground | `media/foreground.webp` | Separate left/right rocky shelves; centre mostly alpha |

All scene-specific placement, scale, parallax, background colour and lamp/light positions are in `media/scene.json`. `js/scene-backdrop.js` has no game, physics, AI or attack imports; `js/cave.js` supplies the manifest URL. New fixed-view scenes can use the same renderer with different art and a manifest.

Ground, far and middle are native CSS image layers. Their affine transforms are projected from the **same orthographic camera/world planes** as the actors; the ground is not a fixed screen wallpaper. Tiny X/Z offsets produce explicit parallax (orthographic translation alone does not). Image layers stay at normal resolution with linear browser scaling. WebGL's canvas is transparent and renders the unchanged pixel sprites, actor shadows, combat effects, foreground depth and small light pools/motes. Card UI stays crisp HTML/CSS. Foreground is a textured quad with actual depth testing and alpha-aware overlap fade. Background proxies are mathematical planes, not volumetric rock models.

The lantern's added radial light and two floor light pools fluctuate subtly. Rock imagery never sways. Ten airborne motes are used. Existing hit-camera emphasis/card timing is unchanged. Environment OFF disables these additions; painted light remains in the art. Haze setting adjusts far-image tone, not physical volumetric fog. Actor shadow switch keeps contact blobs and toggles the retained silhouette shadow. No new collision, step height, environmental combat bonus or random outcome.

## Platform

Pinned Three.js 0.180.0 via CDN/import map. Static ES modules, relative paths, no npm install/build. Landscape PC/iPhone UI, safe area and controls inherited. Antialiasing is off for the WebGL sprite/effect pass; scenery images contain their own smooth raster edges. No low-resolution or pixelated processing is applied to the background.

## Checks

- `node tests/forest-action-cave/logic.mjs` — 43 tactical/card/input cases.
- `node tests/forest-action-cave/regression.mjs` — protected file hashes, 19 byte-identical modules, identical configured movement/camera/attack/card values; 1,450 fixed-step snapshots through victory, pause/skip/retry.
- `tests/forest-action-cave/browser.cjs` — desktop/mobile real-key/touch battle through victory/retry, card modes/skip, resizing and cancellation.
- `tests/forest-action-cave/visual.cjs` — five prior versions, same-state cave screenshots, 4 images/no forest model imports, parallax/fade/flicker/static rocks, landscape sizes and frame samples.

Physical iPhone Safari testing and 60FPS on-device are not available in this runtime. Chromium mobile emulation is distinct from physical Safari. See `VALIDATION.md` for recorded results and limits.

## Production assessment

This scene required four generated art assets and composition/anchoring adjustments, not modeling, meshing, materials or 3D shadow baking. The main work is consistent palette/perspective, alpha-space planning, floor-to-passage joins and keeping the lamp/actors in frame. This is promising for fixed-view chambers, cave sections, forest clearings and ruins. It is not an automatic scene factory: each scene still needs visual review, safe combat space and crop/lighting checks. Free rotation, climbable terrain, moving/destructible walls or physically changing scenery light are outside this technique. Actual future-scene production time has not been benchmarked.
