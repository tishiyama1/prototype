# Card impact validation — 2026-10-12

## Preserved baseline
Commit e1843c56a7599719ff9357d9936b0160921f01d2. All 469 existing tracked files are SHA256-verified unchanged. Existing published scenes and top page are not edited. The new forest imports only unmodified source forest bitmaps from its sibling page.

17 core battle/input/character/camera modules are byte-identical. Only the new copy's Cards/UI rendering bridge, scene image references and main rendering bridge change. Move damage, range, startup, stepping, AI, scores, timings and card assessments are unchanged. 1,450 identical fixed-step snapshots through victory, four pauses, ten skips and retry passed.

## Automated checks
- 43 tactical/card logic cases passed.
- 11 impact eligibility/raster/data-isolation cases passed.
- 24 local browser checks passed: all three preview moves at NORMAL/OVER, preview CRITICAL, OFF, pause, resize, mobile viewports, transparent canvas, nine real battle resolver cases, the same committed damage/counts/presentation time across all three strengths, skip, killing hit, retry, movement, CDP touch swipe, portrait guidance and actual MP4 playback.
- During successful battle impacts, action progress was >= 0.54, enemy/gameplay time was frozen by the original cinematic, and the card effect advanced on the presentation clock. Result text was below the factor row after the layout fix.
- No app JavaScript/WebGL/failed-request errors in the successful local run.

## Eligibility and critical status
Heavy STRONG HIT/BREAK and all successful COUNTER results use their selected technique's effect. Ordinary slash/thrust HIT, MISS/GUARD/EVADE/INTERRUPTED are quiet. CRITICAL is explicitly preview-only because the unmodified real resolver does not produce it. Preview has no real HP or damage commit. Future already-resolved critical metadata can be rendered without adding an outcome roll.

## Actual motion evidence
media/card-impact.mp4 is a real 960x540 browser capture, 11.03 seconds, H264/yuv420p/30fps. It contains slash NORMAL/OVER, thrust NORMAL/OVER, heavy NORMAL/OVER and heavy preview CRITICAL. Each recording segment asserted a visible live pixel overlay before completion. Original compositor-frame arrival intervals are retained; frames are duplicated to the output rate, not interpolated. It is a preview recording; actual combat integration is separately verified by browser test fixtures and media/break.jpg.

## Limits
Physical iPhone Safari, on-device FPS/thermal behavior and subjective responsiveness are untested. Chromium/SwiftShader, 844x390/667x375 and CDP touch are browser checks only. Very fast/skipped phases may truncate the overlay rather than prolong battle time. No extra WebGL pass is introduced; a small 2D canvas is drawn only during the impact. No 60FPS claim is made.

## Published verification
Implementation e3c540ccb471f2f140583a339c3ca684172d9490, GitHub Pages run 38234353618: completed/success. The real public index and preview URLs were opened. All 24 public browser checks passed, including all nine arranged combat outcomes, impact/pose event synchronization, identical commit/presentation time for OFF/NORMAL/OVER, layout without result/card overlap, mobile resize/touch, victory/retry and actual H264 playback (960x540, 11.033333s).

All 37 fetched files returned HTTP 200 and SHA256 matched the deployed code/assets: 34 new published files, unchanged top page, original forest environment entry and cave environment entry. Existing baseline protection still covers all 469 original tracked files. No app JavaScript, WebGL or unhandled failed-request errors remained. Browser-cancelled video streams, if any, are logged separately after successful metadata/playback verification. See browser-public-results.json and public-files.json. Physical iPhone limitations remain unchanged.
