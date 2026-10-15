# Environment motion validation — 2026-10-12

## Protected game/art
Baseline 745886395542ab603cf63d0031f37c660f626f6b: all 374 tracked files untouched. Existing refined/original URLs are retained. Pure tactical tests: 43 passed. Each new scene: 19 core modules byte-identical; 1,450 equal fixed-step snapshots through victory, four pauses and ten skips; retry equal. All 10 source background WebPs are byte-identical.

## Local observed checks
18 Chromium checks passed across both scenes: background loaded; character-frozen environmental playback; OFF hidden added nodes; NORMAL/OVER change actual visual state while game/camera/background planes remain fixed; NORMAL/OVER draw-call count equal; environment-only pause/resume; gain=0 hides effects; real movement, move selection, cards, AI pause, skip and retry; CDP touch swipe and independent mode buttons; 844x390 and 667x375; portrait guidance; comparison page/movie files; no app/WebGL/network errors.

Local short SwiftShader samples (19 frame intervals per mode) varied with warmup/scheduling:
- Forest OFF ~11.6 FPS / NORMAL ~10.2 / OVER ~11.0. Draw calls in actor/scenery pass 17 / 26 / 26 (forest ground pass is additional).
- Cave OFF ~20.0 FPS / NORMAL ~19.3 / OVER ~9.7. Draw calls 13 / 25 / 25.
These are software-GPU observations, not phone FPS or stable hardware comparisons. Additional FX have a rendering cost. OVER's extra particle fill/processing can cost more despite equal draw-call counts. No 60FPS or no-slowdown claim is made.

## Actual recording / motion evidence
media/environment.mp4 in each new scene is a real 960x540 Chrome capture, roughly 13 seconds, switching OFF -> NORMAL -> OVER with actors/camera/battle time fixed. The recordings retain original frame arrival timing, with duplicated frames for 24fps H264/yuv420p delivery. No fake animation, optical interpolation or illustrative substitute is used.

The decoder-extracted recordings were compared in a background ROI excluding the toolbar/footer and character regions. With a per-pixel maximum channel difference threshold of 4, different NORMAL frames changed 1,136 forest / 2,666 cave pixels; OVER frames changed 52,202 / 62,209 pixels. Intervals were 1.8 / 2.8 seconds respectively, so these are motion evidence, not an equal-time strength ratio or quality metric. See recording-motion.json. Recordings maintain characters and camera by snapshot assertion.

## Limits
Physical iPhone Safari, on-device FPS/thermal behavior are untested. Browser landscape/CDP touch and Chromium codec verification are distinct. OFF removes added FX but cannot erase painted shadows/lamplight in unchanged backgrounds. Lantern bodies, rock walls, big trees and scenery plate layouts remain fixed; flame/light/shading and soft shadow approximations animate. Leaf/grass masks are lightweight procedural sprites. OVER may distract from enemy telegraphs; NORMAL/100% is the recommended starting point.

## Published validation
Implementation commit: 7c4ea7d90d936cd95d78151518e28386a99bb3ed. GitHub Pages workflow run 38226956115 succeeded. Both real public URLs were opened in Chromium, not inferred from path names.

All 18 public browser checks passed, including combat/cards/retry, landscape touch and actual H264 video playback (960x540, 13.04s forest / 12.92s cave). Both videos returned HTTP 200. All 81 checked public files returned HTTP 200 with SHA256 matching local deployment artifacts (78 new published files, the unchanged top page and both unchanged refined scene entry pages).

Initial CDN/file fetches had transient timeouts; retries succeeded without changing the pinned library or game code. Browser-cancelled video streaming requests are recorded separately in browser-public-results.json; both videos loaded correct metadata and playback advanced. No application JavaScript, WebGL or other failed-request errors remained in the successful run. Physical iPhone limitations above still apply.

Public short software-GPU samples varied again (forest ~11.9 NORMAL / 13.3 OVER, cave ~13.3 / 15.6); scheduling/warmup noise prevents a reliable performance ranking. Treat these runs as functional verification, not evidence of phone 60FPS.
