/**
 * Room lighting — runtime configuration and off-switch.
 *
 * NOTHING IN THIS DIRECTORY IS A PORT. The Flash client has no dynamic light and no computed
 * shadow whatsoever:
 *
 *   - "Lighting" is a frozen lambert baked into the plane rasterizer: three constants picked on
 *     the sign of the plane normal (RoomVisualization.FLOOR_COLOR_TOP/LEFT/RIGHT,
 *     WALL_COLOR_TOP/SIDE/BOTTOM). No source, no position, no direction.
 *   - The moodlight/dimmer is not a light: FurnitureRoomBackgroundColorLogic sets
 *     ROOM_BACKGROUND_COLOR and RoomVisualization multiplies every plane's RGB by it, uniformly,
 *     with no attenuation.
 *   - Furniture shadows are painted into the sprites. `shadow` does not appear once in room/ or
 *     habbo/room/.
 *
 * So every member here is TS-only by construction, and the whole subsystem is additive: it reads
 * the engine (geometry, stacking height map, dimmer events) and never writes to it. See
 * docs/architectures/room-lighting-architecture.md for the contract this must keep.
 *
 * Disabled by default. Toggle at runtime from the console via `window.VortexLighting`.
 */
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('client.lighting.LightingConfig');

/**
 * Where the falloff reaches full darkness, as a multiple of the light's radius.
 *
 * Shared: the floor overlay bakes it into its gradient stops and the per-sprite pass evaluates it
 * directly, and the two have to agree or an object and the floor under it land on different
 * shades.
 */
// TS-only: no AS3 counterpart.
export const FALLOFF_SPAN = 2.2;

// TS-only: no AS3 counterpart; the tunables of a subsystem the Flash client does not have.
export interface IRoomLightingConfig
{
    /** Master switch. When false the layer is torn down and costs nothing. */
    enabled: boolean;
    /**
     * Place a light at the room's centre tile when no moodlight is lit, so the effect is visible
     * in a room that has no dimmer furniture. Development aid, off by default.
     */
    debugLight: boolean;
    /** Draw the cast shadows. */
    shadows: boolean;
    /**
     * Cast the objects' real silhouettes instead of their tile footprints.
     *
     * Occluders are read off a tile grid, so an extruded shadow is a block: a chair and a wardrobe
     * on the same tile throw the same square. Silhouette mode instead flattens each caster's own
     * texture onto the floor, away from the light — the alpha is already in the sprites, so this
     * costs no assets, only one draw per caster.
     *
     * The tile grid is still what decides *whether* a thing is lit; this only changes the shape
     * that gets drawn.
     */
    silhouetteShadows: boolean;
    /**
     * Global multiplier on shadow length. The per-shadow length itself comes from the geometry —
     * `horizontalDistance / lightHeight` — so this only scales the whole effect.
     */
    shadowLength: number;
    /**
     * Height added to a light's own object, in tiles.
     *
     * A furni's `location.z` is where it sits on the stack, not where its glow is: a lamp standing
     * on the floor reports `z = 0` while its bulb is a metre up. Without an offset every floor light
     * would be at height zero and cast shadows of infinite length. There is nothing in the data that
     * gives the real emitter height, so this is an assumption, exposed as a slider rather than
     * buried as a constant.
     */
    lightHeightTiles: number;
    /** Longest shadow allowed, in caster heights. Stops a light at floor level stretching to infinity. */
    maxShadowStretch: number;
    /** Draw the distance falloff around the light. */
    ambient: boolean;
    /**
     * Light the room's objects individually, by tinting each sprite according to the light reaching
     * its own position, instead of covering them with the floor overlay.
     *
     * This is the one thing in the subsystem that writes into the ported renderer — see
     * SpriteLighting.ts's header. Turning it off restores the vanilla tints immediately.
     */
    litSprites: boolean;
    /**
     * Draw the layer's own idea of the room on top of it: occluder segments in red, the light as a
     * green cross, the floor clip outline in cyan.
     *
     * For "the shadow is not where it should be" this is the only honest instrument — it shows
     * whether the geometry is wrong or the shading is, which no amount of looking at the result can
     * separate.
     */
    debugOverlay: boolean;
    /** Opacity of a cast shadow, 0..1. */
    shadowStrength: number;
    /**
     * Penumbra width in pixels. 0 gives the hard-edged shadow volumes; anything above softens them.
     * Baked into the shadow texture on redraw, so it costs nothing per frame.
     */
    shadowBlur: number;
    /** Opacity of the darkness far from the light, 0..1. */
    ambientStrength: number;
    /** Colour the darkness is tinted with. */
    shadowTint: number;
    /** How far the light reaches, in tiles, before the ambient darkness takes over. */
    lightRadiusTiles: number;
    /**
     * A tile whose furniture stack reaches this height (in tiles) casts a shadow. Floor mats and
     * rugs sit below it, tables and seats above.
     */
    minCasterHeight: number;
    /**
     * Let avatars cast shadows. They are absent from the furniture stacking height map, so they are
     * collected from the room's user objects instead.
     */
    avatarsCastShadows: boolean;
    /**
     * Treat glowing furniture as light sources.
     *
     * A furni is taken to emit light when one of its visible sprites uses the additive blend mode —
     * `ink="1"` in the visualization data, which `FurnitureVisualization.getBlendMode()` maps to
     * `'add'`.
     *
     * **A heuristic, not a fact about the data.** Additive means "draw this additively": artists use
     * it for glow, but also for gloss, glass and highlights, and a lamp whose lit look is painted
     * into its texture has no additive layer at all. The client carries no authoritative flag for
     * emission — furnidata has none — so any criterion here is a guess. `Log furni` in the debug
     * panel lists what a given room actually matched.
     */
    furnitureEmitsLight: boolean;
    /** How far a glowing furni reaches, in tiles. The moodlight uses `lightRadiusTiles` instead. */
    furnitureLightRadius: number;
    /** Cap on simultaneous lights, nearest to the room centre first. Each one costs a pass. */
    maxLights: number;
    /**
     * Keep occupied tiles out of the darkness.
     *
     * The room's sprite list is a single index-addressed container, so this layer cannot be
     * interleaved between the floor and the objects standing on it — the darkness is necessarily
     * drawn over everything, and an avatar walking into a shadow goes dark with it. Punching the
     * occupied tiles out of the clip region avoids that, at the cost of a lit tile under each
     * caster. Which of the two reads worse is a matter of taste, so it is a switch.
     */
    keepObjectsLit: boolean;
    /** How far a shadow is extruded away from its occluder, in tiles. Must leave any room. */
    shadowExtrudeTiles: number;
    /** Minimum delay between two recomputations, in ms. The layer redraws only when something moved. */
    updateIntervalMs: number;
}

// TS-only: no AS3 counterpart; defaults for the above.
const DEFAULTS: IRoomLightingConfig = {
    enabled: false,
    debugLight: false,
    shadows: true,
    silhouetteShadows: true,
    shadowLength: 0.7,
    lightHeightTiles: 2.2,
    maxShadowStretch: 2.5,
    ambient: true,
    litSprites: true,
    debugOverlay: false,
    avatarsCastShadows: true,
    furnitureEmitsLight: true,
    furnitureLightRadius: 4,
    maxLights: 8,
    keepObjectsLit: false,
    shadowStrength: 0.55,
    shadowBlur: 10,
    ambientStrength: 0.40,
    shadowTint: 0x0A0A20,
    lightRadiusTiles: 7,
    minCasterHeight: 0.4,
    shadowExtrudeTiles: 96,
    updateIntervalMs: 100
};

// TS-only: no AS3 counterpart.
type ChangeListener = () => void;

/**
 * The live configuration. Static because there is exactly one room view at a time, and because
 * the console handle has to reach it without a DI lookup.
 */
// TS-only: no AS3 counterpart; see the file header.
export class LightingConfig
{
    // TS-only: no AS3 counterpart.
    private static _values: IRoomLightingConfig = {...DEFAULTS};

    // TS-only: no AS3 counterpart.
    private static _listeners: ChangeListener[] = [];

    /**
     * The controller's diagnostic entry points, registered at install time. Held here so the console
     * handle can expose them without this module importing the controller, which imports this one.
     */
    // TS-only: no AS3 counterpart.
    private static _diagnose: (() => Record<string, unknown>) | null = null;

    // TS-only: no AS3 counterpart.
    private static _probe: ((enabled: boolean) => string) | null = null;

    // TS-only: no AS3 counterpart.
    static registerDiagnostics(
        diagnose: (() => Record<string, unknown>) | null,
        probe: ((enabled: boolean) => string) | null = null
    ): void
    {
        LightingConfig._diagnose = diagnose;
        LightingConfig._probe = probe;
    }

    // TS-only: no AS3 counterpart.
    static get values(): Readonly<IRoomLightingConfig>
    {
        return LightingConfig._values;
    }

    // TS-only: no AS3 counterpart.
    static get enabled(): boolean
    {
        return LightingConfig._values.enabled;
    }

    /**
     * Apply a partial update and notify listeners once. Unknown keys are ignored rather than
     * stored, so a typo in the console cannot silently create a dead setting.
     */
    // TS-only: no AS3 counterpart.
    static set(patch: Partial<IRoomLightingConfig>): Readonly<IRoomLightingConfig>
    {
        let changed = false;

        for(const key of Object.keys(patch) as (keyof IRoomLightingConfig)[])
        {
            if(!(key in DEFAULTS))
            {
                log.warn(`Unknown lighting setting ignored: ${String(key)}`);
                continue;
            }

            const value = patch[key];

            if(value === undefined || LightingConfig._values[key] === value)
            {
                continue;
            }

            (LightingConfig._values[key] as IRoomLightingConfig[keyof IRoomLightingConfig]) = value;
            changed = true;
        }

        if(changed)
        {
            LightingConfig.notify();
        }

        return LightingConfig._values;
    }

    // TS-only: no AS3 counterpart.
    static reset(): void
    {
        LightingConfig._values = {...DEFAULTS};
        LightingConfig.notify();
    }

    /** Subscribe to changes. Returns the unsubscribe function. */
    // TS-only: no AS3 counterpart.
    static onChange(listener: ChangeListener): () => void
    {
        LightingConfig._listeners.push(listener);

        return () =>
        {
            const index = LightingConfig._listeners.indexOf(listener);

            if(index !== -1)
            {
                LightingConfig._listeners.splice(index, 1);
            }
        };
    }

    // TS-only: no AS3 counterpart.
    private static notify(): void
    {
        for(const listener of [...LightingConfig._listeners])
        {
            try
            {
                listener();
            }
            catch (error)
            {
                log.error('Lighting config listener failed', error);
            }
        }
    }

    /**
     * Expose the off-switch on `window.VortexLighting`, so the effect can be turned on and off
     * live and compared against the vanilla render without a rebuild.
     */
    // TS-only: no AS3 counterpart.
    static installConsoleHandle(): void
    {
        const handle = {
            get config(): Readonly<IRoomLightingConfig>
            {
                return LightingConfig.values;
            },
            on(): Readonly<IRoomLightingConfig>
            {
                return LightingConfig.set({enabled: true});
            },
            off(): Readonly<IRoomLightingConfig>
            {
                return LightingConfig.set({enabled: false});
            },
            toggle(): Readonly<IRoomLightingConfig>
            {
                return LightingConfig.set({enabled: !LightingConfig.enabled});
            },
            set(patch: Partial<IRoomLightingConfig>): Readonly<IRoomLightingConfig>
            {
                return LightingConfig.set(patch);
            },
            reset(): void
            {
                LightingConfig.reset();
            },
            /**
             * Walk the whole path and report where it stops. Resolved lazily so this module does
             * not have to import the controller (which imports this one).
             */
            diagnose(): Record<string, unknown> | string
            {
                const diagnose = LightingConfig._diagnose;

                return diagnose === null ? 'lighting controller not installed' : diagnose();
            },
            /** Draw an unmissable marker with the mask off — does this layer reach the screen? */
            probe(enabled: boolean = true): string
            {
                const probe = LightingConfig._probe;

                return probe === null ? 'lighting controller not installed' : probe(enabled);
            }
        };

        (window as unknown as {VortexLighting: typeof handle}).VortexLighting = handle;

        log.debug('window.VortexLighting installed (off by default; call VortexLighting.on())');
    }
}
