# Superconducting Magnet Lab

An independent, static React/Three.js companion experience for the Chapter 9
magnet-system lesson in *MRI in Practice, Fifth Edition*.

This project was intentionally created as a sibling of `mri_in_practice_lab`.
It does not import that project's schema, store, components, or scene manager.

## Run locally

```bash
npm install
npm run dev -- --host 127.0.0.1
```

Open the URL printed by Vite.

## Production build

```bash
npm run build
npm run preview -- --host 127.0.0.1
```

The Vite base is relative, so `dist/` can be hosted as a static site without a
server runtime or login.

## Interaction contract

- The six guided states configure purposeful teaching views.
- Free exploration remains available in every state.
- Eight bore-outward systems remain independently selectable and hideable.
- Layer opacity, isolation, explode, section plane, cutaway, and B₀ controls
  are independent state dimensions.
- Guided state changes do not disable the section plane or remove the layer
  explorer.
- Central-bore and returning-field cues can be compared or viewed separately.

## Source and model status

Teaching claims and page anchors are bounded to the supplied Chapter 9
materials, especially pp. 318–326 for the superconducting magnet. The model is
original, vendor-neutral, conceptual, and explicitly not to scale. Layer
thicknesses, winding counts, service-hardware geometry, and field curves are
illustrative rather than scanner specifications or calculated data.
