/**
 * Whether the room skips updating avatars that are nowhere near the viewport.
 *
 * TS-only: no AS3 counterpart, and deliberately not presented as one. `AvatarVisualization.update()`
 * takes a fourth `skipUpdate` parameter in both AS3 and this port, and it is worth saying plainly
 * that **AS3 never reads it** — `param4` appears nowhere in that method's body. The port ignoring it
 * is faithful, not a gap, so nothing here can be justified as restoring lost behaviour. This is an
 * invention, in the same category as `AvatarRenderMode`: Flash never met a room where it mattered.
 *
 * What it buys: `room.obj` — the pass that runs every object's visualization update — is the largest
 * channel at scale and the fastest-growing one, measured at 3.41 ms for 500 avatars and 5.30 ms for
 * 1000. It runs for every avatar in the room, while only the ones on screen are ever drawn; the
 * existing visibility test is per sprite and fires long after the work is done.
 *
 * What it costs: a skipped visualization does not advance its animation frames, so an avatar that
 * re-enters the viewport resumes mid-cycle rather than where a continuously-updated one would be.
 * Position is unaffected — that comes from the object's own logic, which `RoomEngine` drives
 * independently of rendering — so an avatar returning to view is already in the right place.
 *
 * Only avatars are culled. Furniture keeps updating regardless: a large item's sprites reach well
 * beyond its anchor, and an anchor-based test would make big pieces pop in and out at the edges.
 *
 * Off by default, and toggled with `:roomculling` so a `:stresstest` run can be taken both ways.
 */
export class RoomCullingMode
{
    /**
     * Whether off-screen avatars skip their visualization update.
     *
     * Off by default: at a thousand avatars the client already holds 44 fps without it, so this
     * earns its place only where it is measured to, and the measurement has to be possible both ways.
     */
    // TS-only: see the class note.
    public static avatars: boolean = false;
}
