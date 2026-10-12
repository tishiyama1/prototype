# Cave scene validation — 2026-10-12

## Recorded checks

- Tactical/card/input unit checks: **43 passed**.
- Protected baseline `ada828136ba2e7eb42e6b4e2777571e9120d0518`: **245 existing files unchanged**. Only `forest-action-cave/` and `tests/forest-action-cave/` are added.
- **19 combat/card/input/presentation modules byte-identical** to the hybrid base; movement, camera, attack and card defaults unchanged.
- **1,450 equal fixed-step snapshots**, including victory, 4 pauses and 10 skips. Retry resets both versions to identical states.
- Desktop Chromium local play: **15 checks passed**, including approach, retreat, orbit, dash, move selection, four judgment cards, AI/time freeze, cinema skip/OFF, victory in 8 attack commands, zero damage and retry.

- Mobile landscape/touch Chromium: **14 checks passed**, including multi-touch movement + attack, card resize/skip/modes, swipe dash, touch cancellation, debug scrolling and portrait pause/resume. This is emulation, not physical Safari.

Public deployment verification is pending and will be recorded after accessing the deployed URL.

## Visual implementation

Four generated 2D WebP assets total 1,306,620 bytes. Ground/far/middle use camera-projected CSS image transforms. Foreground is a depth-tested transparent plane in the actor WebGL pass. No volumetric cave/forest scenery is rendered. Foreground uses alpha-aware fade where it overlaps a character. Rock imagery stays still; the lantern, two additional floor light pools and ten motes animate subtly. Cards and all tactical rules are unchanged.

The sample image supplied by the user is a mood/palette reference; it is not republished. The scene assets are new, generated artwork. See ART_PROMPTS.md.

## Limits

- Physical iPhone Safari and hardware GPU performance are untested. Browser landscape/touch emulation does not certify physical Safari.
- The renderer here uses SwiftShader software GPU and is much slower than a phone GPU. 60FPS is a target, not a verified result.
- Artwork is composed for the retained 43-degree orthographic view. Large pitch changes/free rotation can expose the layered construction.
- Midground is behind actors; foreground provides actual alpha/depth overlap. Walls/rocks do not add collision or environmental combat bonuses.
- Environment OFF removes added flicker/glow/motes, but painted light remains in the images. Haze is a far-layer tone adjustment, not volumetric fog.
- Scene production still needs art consistency, transparent-space planning and visual QA. No future-scene production-time saving has been measured.
