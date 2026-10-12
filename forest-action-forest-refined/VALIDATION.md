# Art refinement validation — 2026-10-12

- Baseline 16b9b3941069f53412858290d9d6807b45c5f7ed: all 291 existing tracked files unchanged.
- Tactical/card/input logic: 43 checks passed.
- Each refined scene has 19 core modules byte-identical to the existing hybrid: same movement, attack, card, AI, HP, input, sprite/effect and camera logic/configuration.
- Each scene matches 1,450 fixed-step battle snapshots through victory, including 4 pauses and 10 skips, followed by identical retry reset.
- Six forest texture assets and placement metadata unchanged; cave scene plane dimensions/positions/parallax manifest unchanged.
- Local Chromium runtime: 16 checks passed across both scenes. Backgrounds fully rendered before capture; same camera/initial state; light variation bounds; moving leaves/static stone; environment OFF; drawing settings preserve battle; movement/technique/card/AI-time freeze; card resize/skip/retry; actual CDP joystick/cancel/swipe; 844x390 and 667x375 views; portrait guidance; zero application/WebGL/network errors.

Detailed runtime values are in tests/forest-action-art-refinement/browser-local-results.json. The guide snapshot and final imagegen edit prompt set are in the same directory.

Public deployment verification is pending and will be recorded after accessing both live URLs.

## Limits

Physical iPhone Safari and hardware GPU FPS are untested. Runtime browser tests use Chromium with SwiftShader software GPU; landscape dimensions and touch events do not certify native Safari performance. The baseline cameras/actors/cards are retained; detailed cave illustration style was simplified rather than low-resolution processed or globally blurred. Fine glow, leaf/dust motion is intentionally subtle. Painted lighting remains when added environment effects are OFF. Fixed-view layered imagery is unsuitable for free camera rotation or destructible scenery. The 70% quiet-area guideline is an art composition target, not a measured area claim for these images.
