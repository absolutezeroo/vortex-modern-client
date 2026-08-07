/**
 * Room lighting — shared types.
 *
 * NOT A PORT. See LightingConfig.ts's header.
 */

/**
 * A light, in tile space.
 *
 * There is deliberately no colour here. The dimmer's colour is already applied by the ported
 * pipeline — FurnitureRoomBackgroundColorLogic sets ROOM_BACKGROUND_COLOR and RoomVisualization
 * multiplies every plane's RGB by it — so tinting the pool with it again would apply the moodlight
 * twice. This layer only contributes what the Flash client has no notion of: direction and
 * occlusion.
 */
// TS-only: no AS3 counterpart.
export interface ILightSource
{
    /** Tile-space position of the light on the floor plane. */
    x: number;
    y: number;
    /** 0..1. Scales how dark the room gets away from this light. */
    intensity: number;
    /** How far the light reaches, in tiles. */
    radiusTiles: number;
    /**
     * Height above the floor, in tiles.
     *
     * This is what separates a ceiling lamp from a candle on the ground. Shadow length is
     * `horizontalDistance / height`: directly under a high light a caster throws almost nothing,
     * and the same caster at the edge of a low light throws a long one. Without it every light in
     * the room casts identically, which is the single thing that most makes the result read as
     * fake.
     */
    heightTiles: number;
    /**
     * Where this light came from. `'dimmer'`, `'debug'`, or the emitting object's instance id.
     *
     * Carried so an emitter never shadows itself: its own silhouette must not be cast by its own
     * light, or every lamp in the room paints a dark shape over itself.
     */
    sourceId: string;
    /** Diagnostics only: how this light came to exist. */
    kind: 'dimmer' | 'furni' | 'debug';
    /**
     * Diagnostics only: the emitter's own tile, before `snapToFloor` moved the light onto walkable
     * ground. A light that ends up far from its object is snapping, not mis-projecting — and the
     * two look identical on screen.
     */
    rawX: number;
    rawY: number;
    /** Diagnostics only: which sprite's blend mode flagged this object as emitting. */
    matchedSprite: number;
}
