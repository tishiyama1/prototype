# Forest Action — Full-screen pixel impact study

Independent comparison path: `/forest-action-card-impact/`. Base: the published forest environment edition at commit e1843c56a7599719ff9357d9936b0160921f01d2. All existing versions and top-page links remain untouched. Existing forest image assets are read from the unchanged sibling directory; this is not a new renderer or background art revision.

## Play / preview
- `index.html`: normal 1v1 combat. IMPACT OFF / NORMAL / OVER controls only the added card overlay. NORMAL is default.
- `preview.html`: select slash / thrust / heavy, strength and HIT / CRITICAL, then Replay. Changing a selection also replays. Pause can freeze the effect; viewport changes keep it sized across the entire screen.
- `?impact=off|normal|over` chooses the initial added-effect mode. Existing card normal/fast/detail modes, tap/Space skip, movement, touch swipe and retry remain available.
- Preview CRITICAL is explicitly labelled as presentation-only. The current resolver returns `critical:false`; no chance, critical damage, new move or outcome was introduced.

## Real-combat eligibility
| Existing outcome | Added overlay |
| --- | --- |
| ordinary slash / thrust HIT | none |
| heavy STRONG HIT | heavy shock |
| heavy guard-breaking BREAK | heavy shock; no extra damage |
| any successful COUNTER | selected move's effect |
| MISS / GUARD / EVADE / INTERRUPTED | none |
| future already-resolved `critical:true` success | stronger presentation; current combat does not produce it |

The isolated preview can display all three HIT effects, including light techniques that stay quiet on ordinary real hits. This lets future prominent techniques be evaluated without making every normal attack flashy.

## Timing and rendering
The overlay starts from the existing `cinematic.impact` flag, set at action progress >= 0.54 — the same event as the field hit/sound/swing. It does not create another stop, extend the phase, or modify combat. Slash/thrust last 0.22s, heavy 0.28s in both NORMAL and OVER. Pause freezes their existing presentation clock; skip may truncate them; retry clears the canvas.

For eligible attacks, the existing factor row remains as a visual surface during the existing action/return phases. The canvas is fixed across the complete viewport, separate from the card row. Slash sweeps diagonally between opposite screen edges, thrust pierces horizontally with speed lines, and heavy radiates from the screen center. It is pointer-transparent, below pause/debug panels, and resizes to the visible viewport. The NORMAL slash/thrust geometry extends past both horizontal edges, verified at desktop and two landscape sizes. It rasterizes integer squares/lines on a 3-CSS-pixel grid with nearest scaling; card text remains full resolution. Result text stays separate below the impact.

`impact-spec.js` contains immutable technique definitions, pure eligibility and deterministic pixel samples. `card-impact.js` handles Canvas/DOM only. Add new effect definitions without changing the resolver. OVER increases scale, trails and fragment count, not duration. Preview CRITICAL increases scale/count and uses a gold palette.

## Motion evidence
`media/card-impact-wide.mp4` is an actual browser recording. It compares the three techniques in NORMAL/OVER, heavy CRITICAL in the isolated preview. Real combat is separately verified with guarded/recovering/windup enemy fixtures in browser.cjs. Original frame timing is preserved; frames are duplicated for 30fps H264 delivery, not motion-interpolated. The test fixtures are not shipped as game features.

## Limits
Physical iPhone Safari and device FPS/thermal behavior are untested. Chromium landscape/touch verification is not an iPhone-device test. Extremely fast/skipped presentation can truncate the effect, intentionally preserving combat tempo. Ordinary light HITs remain quiet by design. CRITICAL is not a gameplay result. No full-screen flash or camera movie is added.

## Wide revision
Updated from the original card-local study in response to the full-screen direction. Durations, eligibility, damage and the tactical clock stay unchanged. Original card-local recording and screenshots remain under their old filenames; the current preview uses the new wide recording. Versioned render-module and CSS references prevent a mixed cached render graph. `record.cjs` captures real compositor frames; `encode-recording.py` encodes/validates every segment after browser exit.
