# Art refinement validation — 2026-10-12

- Baseline 16b9b3941069f53412858290d9d6807b45c5f7ed: all 291 existing tracked files unchanged.
- Tactical/card/input logic: 43 checks passed.
- Each refined scene has 19 core modules byte-identical to the existing hybrid: same movement, attack, card, AI, HP, input, sprite/effect and camera logic/configuration.
- Each scene matches 1,450 fixed-step battle snapshots through victory, including 4 pauses and 10 skips, followed by identical retry reset.
- Six forest texture assets and placement metadata unchanged; cave scene plane dimensions/positions/parallax manifest unchanged.
- Local Chromium runtime: 16 checks passed across both scenes. Backgrounds fully rendered before capture; same camera/initial state; light variation bounds; moving leaves/static stone; environment OFF; drawing settings preserve battle; movement/technique/card/AI-time freeze; card resize/skip/retry; actual CDP joystick/cancel/swipe; 844x390 and 667x375 views; portrait guidance; zero application/WebGL/network errors.

Detailed runtime values are in tests/forest-action-art-refinement/browser-local-results.json. The guide snapshot and final imagegen edit prompt set are in the same directory.

## Public deployment verification

Implementation commit: 3f74708cddd2544c39d251c7a619f3d78d7c0dee. GitHub Pages run 38212404861 completed successfully.

Both actual public URLs were opened in Chromium:
- https://tishiyama1.github.io/prototype/forest-action-forest-refined/
- https://tishiyama1.github.io/prototype/forest-action-cave-refined/

**17 public browser checks passed**: both scene startup and actual rendered backgrounds, matching camera/initial battle state, bounded environmental lighting, drifting leaves/static rock plates, environment OFF, drawing settings preserve battle state, approach/technique/cards/AI freeze, card resize/skip/normal resume/retry, CDP touch joystick/cancel/swipe, landscape sizes/portrait guidance, comparison page's 8 images and 4 version links, zero application/WebGL/network errors. See browser-public-results.json.

**71 public static files** matched HTTP 200 and SHA256: 68 new runtime/art/comparison files, top index and original forest/cave indexes. Other existing files are protected by the 291-file baseline and the additive Git tree. See public-files.json; its recorded commit identifies the checked implementation before documentation/screenshot updates.

media/after.jpg and media/mobile.jpg are screenshots captured from the actual public refined URLs. media/before.jpg comes from the respective original scene at the same initial PC camera/positions. Final screenshot publication and documentation do not change runtime/game logic.

## Limits

Physical iPhone Safari and hardware GPU FPS are untested. Runtime browser tests use Chromium with SwiftShader software GPU; landscape dimensions and touch events do not certify native Safari performance. The baseline cameras/actors/cards are retained; detailed cave illustration style was simplified rather than low-resolution processed or globally blurred. Fine glow, leaf/dust motion is intentionally subtle. Painted lighting remains when added environment effects are OFF. Fixed-view layered imagery is unsuitable for free camera rotation or destructible scenery. The 70% quiet-area guideline is an art composition target, not a measured area claim for these images.
