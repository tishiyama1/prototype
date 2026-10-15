# Cave scene validation — 2026-10-12

## Recorded checks

- Tactical/card/input unit checks: **43 passed**.
- Protected baseline `ada828136ba2e7eb42e6b4e2777571e9120d0518`: **245 existing files unchanged**. Only `forest-action-cave/` and `tests/forest-action-cave/` are added.
- **19 combat/card/input/presentation modules byte-identical** to the hybrid base; movement, camera, attack and card defaults unchanged.
- **1,450 equal fixed-step snapshots**, including victory, 4 pauses and 10 skips. Retry resets both versions to identical states.
- Desktop Chromium local play: **15 checks passed**, including approach, retreat, orbit, dash, move selection, four judgment cards, AI/time freeze, cinema skip/OFF, victory in 8 attack commands, zero damage and retry.

- Mobile landscape/touch Chromium: **14 checks passed**, including multi-touch movement + attack, card resize/skip/modes, swipe dash, touch cancellation, debug scrolling and portrait pause/resume. This is emulation, not physical Safari.

## Deployed URL verification

Implementation commit: `fa11c614f514e0371e561e57504b236d453afac6`. GitHub Pages run `38202658686` completed successfully.

- **Public browser 7 checks passed** at https://tishiyama1.github.io/prototype/dungeon-lord/forest-action-cave/: WebGL startup, 4-layer readiness, characters, approach, technique selection, attack, paused AI/time, skip, resume, retry, landscape viewport, actual CDP touch swipe, comparison page and zero JavaScript/network errors.
- **40 public static files**: HTTP 200 and SHA256 match (34 new files, top page and 5 prior versions' index files). Existing content was not replaced.
- **12 final visual checks passed**: same camera/initial battle state versus the layered forest; 4 image loads and no original 3D forest modules; plane-only imagery; parallax ON/OFF; 17 foreground-fade samples; lantern flicker/static rocks; inspection freeze; drawing settings preserve game state; moving-camera parallax; 844×390 and 667×375 views; comparison images/links; no JavaScript/WebGL/network errors.
- Screenshots `media/after.jpg` and `media/mobile.jpg` were captured from the actual public cave URL. `media/before.jpg` is the layered-forest scene at the same 1280×720 size and initial battle/camera state.
- Final SwiftShader samples: desktop **4.39 FPS**, landscape viewport **5.78 FPS**; p95 frame intervals about **583/600 ms**. These are software GPU figures, not phone performance. **60FPS has not been verified.**

Logs are in `tests/forest-action-cave/tactical-local-results.json`, `visual-local-results.json`, `public-smoke-results.json` and `public-files.json`. Early automated browser runs timed out in this single-process software-GPU environment; the final run used a shared browser page and allowed additional startup time. Final tests passed without application errors.

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
