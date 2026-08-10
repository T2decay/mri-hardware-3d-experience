# Decisions

## Independent project boundary

This app is a clean sibling project. The earlier `mri_in_practice_lab` folder
is treated as exploratory user work and is not a dependency. The new app uses
a purpose-built lesson content module and renderer.

## Guided instruction does not replace exploration

The six guided states set useful views, visibility, and emphasis. A persistent
explorer remains available beside them. Section clipping, explode, layer
visibility, opacity, isolation, B₀, field geometry, and reduced motion are
independent controls rather than mutually exclusive modes.

## Realistic visual target

The supplied cutaway image establishes the target qualities: brushed metal,
deep concentric construction, prominent copper winding detail, colored but
restrained internal systems, service hardware, studio lighting, and clear
spatial depth. The implementation uses original procedural geometry and PBR
materials; it does not reproduce a vendor design.

## Layer count and relationships

The model exposes eight student-selectable systems from the bore outward:
patient bore and liner, RF body coil, RF screen, gradient assembly, cryostat
and thermal structure, main superconducting windings, active shielding coils,
and outer vessel. Decorative formers, insulation, supports, fasteners, and
service hardware remain attached to their parent layer.

## Accuracy boundaries

Radial order is the intended teaching claim. Dimensions, layer thicknesses,
winding pack positions and counts, service-hardware placement, and material
finishes are drawing decisions. B₀ lines are qualitative cues, not numerical
simulation or a measured fringe-field map.

## Concept separation

B₀ uses a teal-blue field cue. Active magnetic shielding uses gold hardware.
The RF screen uses purple. The Faraday cage is not part of this magnet model
and is never shown as containing B₀.
