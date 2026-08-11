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

The layer-separation, concentric exploded-view, and zoom controls live inside
the 3D viewport so students can see the model respond without searching
elsewhere on the page. Axial separation moves layers along the bore axis. The
exploded view keeps every layer centered and progressively enlarges successive
shell diameters to create radial gaps. The two effects remain independent and
can be combined. Mouse-wheel and keyboard zoom remain available.

Scanner-cladding visibility is a persistent exploration choice. Guided states
and isolation may change camera, cutaway, emphasis, and other component states,
but they do not restore hidden cladding. Only an explicit restore, Show all, or
Reset all action does that.

## Realistic visual target

The supplied cutaway image establishes the target qualities: brushed metal,
deep concentric construction, prominent copper winding detail, colored but
restrained internal systems, service hardware, studio lighting, and clear
spatial depth. The implementation uses original procedural geometry and PBR
materials; it does not reproduce a vendor design.

## Layer count and relationships

The model exposes eight student-selectable systems from the bore outward:
patient bore and liner, RF body coil, gradient assembly, cryostat
and thermal structure, main superconducting windings, active shielding coils,
outer vessel, and patient-facing scanner cladding. Decorative formers,
insulation, supports, and fasteners remain attached to their parent layer.

The quench vent and cryogenic chiller/cold-head assembly are selectable service
components, but are not numbered as radial layers. This preserves the physical
distinction between nested magnet construction and hardware that services the
cryostat.

## Familiar scanner exterior without vendor mimicry

The complete state now uses an original glossy white cladding shell, circular
front fascia, cool gray-blue trim, dark base, a small display at 12 o'clock,
and symmetric interface panels at 3 and 9 o'clock to establish the familiar
clinical scanner silhouette. The patient table is intentionally omitted.
Removing cladding reveals the prior engineering cutaway. The exterior is
intentionally generic and carries no logo, scanner dimensions, or
manufacturer-specific seam pattern.

## Explicit cutaway semantics

The cutaway control names both what is removed and what remains. The original
view is retained as 90 degrees removed / 270 degrees retained. A second, more
open view removes 270 degrees and retains a 90-degree structural sector. This
avoids using the phrase "270-degree cutaway" without defining its meaning.

## Strip all reconstruction behavior

Strip all hides every layer and service component while keeping the explorer
available. Selecting a hidden item from the list reveals it and restores its
saved opacity, allowing students to rebuild the scanner deliberately. Show all
restores every component to full opacity.

## Accuracy boundaries

Radial order is the intended teaching claim. Dimensions, layer thicknesses,
winding pack positions and counts, cladding form, service-component placement,
and material finishes are drawing decisions. B₀ lines are qualitative cues, not numerical
simulation or a measured fringe-field map.

## Concept separation

B₀ uses a teal-blue field cue. Active magnetic shielding uses gold hardware.
The Faraday cage is not part of this magnet model and is never shown as
containing B₀. An internal RF shield is intentionally omitted from the
student-facing layer list because it is not identified as a separate component
in the assigned Chapter 9 reading.
