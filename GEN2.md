# Gen 2 local preview

Gen 1 remains the default. The header selector switches to Gen 2 Studio while
retaining lesson, component visibility, opacity, selection, sectioning, field,
challenge and separation state. Switching renderers restores the camera to the
current lesson preset. Free orbit/zoom positions are not transferred.

The original `src/scene/MagnetScene.ts` is unchanged. Gen 2 is deliberately an
independent renderer in `src/scene/MagnetSceneGen2.ts`, forked from bd6d9af.
Shared lesson content and state definitions are unchanged. Future interaction
fixes should be checked against both renderers.

Gen 2 adds a revolved curved fascia with capped cutaway edges, shorter white
bore lip, rounded control panels and base, ventilation slots, vessel fasteners,
procedural metal grain, revised studio lighting and a receiving floor. Geometry
and material finishes remain illustrative, vendor-neutral and not to scale.
No external textures or new dependencies are required.

## Validation

- TypeScript and Vite production build passed.
- Gen 1 renderer, lesson content and state definitions match the base commit.
- Desktop browser exercised all six guided steps and three cutaway presets.
- Version switches preserved separation and hidden cladding; section slider
  remained at 55 after a switch. Both radial and axial controls were exercised.
- Strip all, bore reconstruction and Show all exercised.
- 390px mobile layout has no horizontal overflow; selector works both ways.
- Final browser console: zero errors and zero warnings since reload.

Approved for student publication on September 8, 2026. Pushes to `main` build
and deploy both generations through the existing GitHub Pages workflow.

Run `npm ci` if dependencies are absent, then
`npm run dev -- --host 127.0.0.1` for local development.
