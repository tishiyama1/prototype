# Forest Action — layered background study

Play: `https://tishiyama1.github.io/prototype/forest-action-layered/`
Compare: `./comparison.html`
Source: the protected `forest-action-diorama-pixel/` hybrid. No existing public files are modified.

## Runtime

Pinned Three.js 0.180.0, static ES modules, no install or build. Sprite characters, combat effects, input, camera, AI, attacks and tactical cards are preserved. Forest models are replaced entirely by **6 image planes**: a flat XZ ground and 5 alpha-cutout plates at different depths. Plate content is preprojected for the default 43° view; image lighting is baked, not computed with 3D tree/rock geometry at runtime. Per-actor contact and silhouette shadows stay dynamic. Twelve airborne motes and one low-opacity light plane are the only extra environment geometry.

The groups are far forest, rear trees, middle landmarks, ground road and left/right foreground trees. Only flat road/paving, leaf litter, small grass and understory are flattened into the ground pass. Roots, rocks, wall blocks and the western log remain in the upright depth images. This is deliberate for the fixed high-angle view: low scenery lacks true side parallax and vertical occlusion. Mid/foreground plates preserve depth ordering. Ground is rendered in a separate pass and its depth buffer is cleared before upright cutouts/actors: a baked image may geometrically cross the logical floor, and must not be sliced by it. This changes rendering only, never physical coordinates. Foreground overlaps fade to 38% opacity to protect enemy tells. Depth placement supplies ordering and occlusion. Because the camera is orthographic, translational parallax is explicitly synthesized with a small depth-specific X offset driven by camera follow. Tiny foreground sway is presentation only. Inspection freezes world time and sway for fair screenshots.

Scenery images use Linear/Mipmap filtering; characters remain NearestFilter pixel sprites. HTML/CSS card UI stays at full resolution. Background is never pixelated.

## Authoring

`tests/forest-action-layered/bake.html` imports the existing 3D source **offline only**. A local HTTP server accepts its PNG passes from `/__save/<name>`. It classifies source instances by world depth/height, bakes static light and ground shadows, and captures the upright groups with the 43° orthographic camera. `pack-assets.py` trims transparent margins, writes WebP images and `media/layers.json` with plane dimensions and local offsets. Runtime `forest.js` loads only these images, the manifest and Three.js.

The bake tool is reproducible from the protected source commit e4cfd5a. It is not an asset editor or a new 3D production tool. For future scenes the same manifest/plate convention can accept independently painted/exported layers. Authoring cost for a brand new scene has not yet been measured. This prototype proves the display method, not a completed mass-production art workflow.

## Limits

Optimized for the default camera direction and 43° pitch. Large pitch changes expose flattened objects; free camera rotation, dynamic background lights, movable trees, volumetric obstacles and changing scenery shadows are not supported. Existing camera tuning remains for comparison; it does not make the plates into volumetric models. Scenery shadows and fog are baked: the shadow checkbox controls actor silhouette shadows, the haze checkbox adjusts far-layer tint and cannot recover un-fogged source pixels. Character contact blobs remain on for grounding. Environment toggle controls only added motion/light/motes; additional parallax has a separate visual switch.

No new environmental tactical bonus, attacks, damage, result types or difficulty change.

## Checks

`node tests/forest-action-layered/logic.mjs`

`node tests/forest-action-layered/regression.mjs`

`browser.cjs`: full desktop/mobile tactical checks through victory, cards, skip, retry and touch gestures.

`visual.cjs`: old versions start, same-state screenshots, image-only background imports, plane geometry, parallax/fade, scene switches, landscape sizes and software GPU frame samples. Physical iPhone Safari remains untested.
