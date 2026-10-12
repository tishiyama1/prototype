# Forest Action — environment motion comparison

New independent scene URLs:
- https://tishiyama1.github.io/prototype/forest-action-forest-environment/?demo=1
- https://tishiyama1.github.io/prototype/forest-action-cave-environment/?demo=1

Base: the forest/cave refined scenes at 745886395542ab603cf63d0031f37c660f626f6b. Existing versions and top/deploy configuration are unchanged. Pinned Three.js 0.180.0 and static build-free ES modules remain.

## Controls
OFF / NORMAL / OVER buttons switch immediately without resetting the battle. NORMAL is the default. Query env=off|normal|over selects startup mode; demo=1 opens character-frozen environment playback. Environment pause freezes only this visual clock in inspection mode. The battle button restores the existing play controls. The debug gain slider is 0-150%; 0 hides added FX. Original painted lighting/shadows remain in OFF. Retry preserves the selected environment mode; debug reset restores NORMAL/100%.

## Visual structure
Every original background bitmap, plane dimension/position/parallax manifest, character sprite and 19 core combat/card/input/camera/effect modules are byte-identical. Background layouts/rocks/tree plates are not animated. Environmental clock uses bounded real delta separately from the unchanged fixed-step gameplay and character animation clocks. Hidden tabs stop both.

Pure environment-profile.js holds shared OFF/NORMAL/OVER/gain rules. EnvironmentEffects owns only simple textured quads, two instanced meshes (leaf/grass) and one point draw. No models, image edits, new asset dependency, physics or attack imports. Canvas-generated leaf/grass/soft-shadow/flame masks are small procedural effect textures, not replacement background art. Forest's prior weak added environment and cave's prior overlay glows are hidden to avoid stacking effects.

Forest: sunlight patches, moving leaf shadow patches, six drifting leaves and four peripheral grass clusters, eight motes in NORMAL. OVER uses 24 leaves, 40 motes, larger/faster motion and stronger light/shadow variation. Cave: two floor bounce patches, two wall patches, lamp/far-lamp flame and glow/shading, 14 dust points and moving soft support/rock-shadow approximation; OVER uses 56 dust points and stronger modulation. Lantern bodies remain baked into the images and do not swing; only the visual flame/light/shadow overlays move. Shadows are artistic overlays, not recomputed physical shadow maps.

Point sizes are specified in screen pixels for the retained orthographic camera. NORMAL sunlight modulation is bounded +/-14%; cave +/-28%; OVER +/-52% and +/-55%. These are added-effect modulation bounds, not changes of the whole screen's luminance. Leaf/grass are instanced; NORMAL/OVER keep the same draw-call count even when count changes. OFF removes those calls. No additional background render pass was added.

## Validation/recording
Tests and detailed records are in tests/forest-action-environment/. Local and public browser checks are recorded in VALIDATION.md. Pure logic: 43 tactical/card/input cases; each scene 19 unchanged modules and 1,450 equal fixed-step snapshots through victory/pause/skip/retry; 374 pre-existing file hashes protected.

media/environment.mp4 is a real Chrome compositor capture with frozen characters and camera, OFF->NORMAL->OVER. Original arrival timing was retained with duplicated frames for 24fps H.264 playback; no synthesized/interpolated movement. H.264/yuv420p/faststart supports browser/Safari playback. The screen recording is not a phone performance benchmark. Physical iPhone Safari and hardware GPU FPS remain untested.
