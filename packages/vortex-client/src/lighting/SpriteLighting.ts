/**
 * Room lighting — per-sprite lighting.
 *
 * NOT A PORT. See LightingConfig.ts's header.
 *
 * This is the piece that makes the effect read as lighting rather than as a dark shape laid over
 * the room. The floor overlay can only ever *cover* what stands on the floor — it is drawn above
 * the whole sprite list, so an avatar walking into a shadow is painted over rather than lit. Here
 * each room object is instead **tinted** by the light at its own position, which puts the shading
 * inside the sprite list, correctly ordered, at no extra draw call.
 *
 * The channel already exists and is the engine's own: `RoomObjectSprite.color` is AS3-native, and
 * `RoomRenderingCanvas.updateSprite()` applies it as `ExtendedSprite.tint`. `RoomVisualization`
 * already multiplies every plane's RGB by `ROOM_BACKGROUND_COLOR` for the dimmer — modulating an
 * object's colour by the light is the same model, made positional instead of global.
 *
 * **This module writes into the ported renderer's sprites**, which the rest of this directory does
 * not do. It is the one deliberate exception, taken on the author's explicit call, and it is
 * confined to this file. Two properties keep it honest:
 *
 *   - It only ever writes `tint`, and only on sprites it has recorded a base colour for.
 *   - `restore()` puts every base colour back, so switching the feature off leaves the render
 *     byte-identical to vanilla.
 *
 * The renderer rewrites `tint` from `sprite.color` on its own change path (the `needsUpdate` gate),
 * so a write here is not permanent and must be reapplied. That is also how a base colour is picked
 * up: a tint that is not the one this module last wrote is, by definition, the renderer's own.
 */
import type {Container} from 'pixi.js';
import type {RoomRenderingCanvas} from '@habbo/room/renderer/RoomRenderingCanvas';
import {Logger} from '@core/utils/Logger';
import {FALLOFF_SPAN, LightingConfig} from './LightingConfig';
import type {IOccluderData} from './OccluderGrid';
import type {ILightSource} from './types';

const log = Logger.getLogger('client.lighting.SpriteLighting');

/**
 * Offsets sampled around an object's tile when testing occlusion, in tiles.
 *
 * A single test is binary — an avatar would snap between lit and shadowed as it crosses an edge.
 * Averaging five samples gives six levels, which is enough for the transition to read as movement
 * into a shadow rather than as a switch.
 */
const OCCLUSION_SAMPLES: readonly {x: number; y: number}[] = [
    {x: 0, y: 0},
    {x: -0.35, y: 0},
    {x: 0.35, y: 0},
    {x: 0, y: -0.35},
    {x: 0, y: 0.35}
];

/** What this module last wrote for a sprite, and what the renderer had before it. */
// TS-only: no AS3 counterpart.
interface ITintRecord
{
    applied: number;
    base: number;
}

/** A room object's identity as the renderer knows it, plus where it stands. */
// TS-only: no AS3 counterpart.
export interface ILitObject
{
    instanceId: string;
    x: number;
    y: number;
}

// TS-only: no AS3 counterpart; see the file header.
export class SpriteLighting
{
    // TS-only: no AS3 counterpart.
    private readonly _canvas: RoomRenderingCanvas;
    // TS-only: no AS3 counterpart.
    private readonly _records: WeakMap<Container, ITintRecord> = new WeakMap();
    /** Sprites touched since the last restore, so the feature can be switched off cleanly. */
    // TS-only: no AS3 counterpart.
    private _touched: Container[] = [];
    // TS-only: no AS3 counterpart.
    private _factors: Map<string, number> = new Map();
    // TS-only: no AS3 counterpart.
    private _disposed: boolean = false;

    constructor(canvas: RoomRenderingCanvas)
    {
        this._canvas = canvas;
    }

    /**
     * Tint every sprite belonging to one of `objects` by the light reaching it.
     *
     * The room object itself is never in `objects`: the floor and walls are one big sprite each, and
     * a single tint across the whole floor would darken it uniformly. Those keep the floor overlay.
     */
    // TS-only: no AS3 counterpart.
    apply(lights: readonly ILightSource[], occluders: IOccluderData, objects: readonly ILitObject[]): void
    {
        if(this._disposed)
        {
            return;
        }

        const config = LightingConfig.values;

        if(lights.length === 0 || !config.enabled || !config.litSprites)
        {
            this.restore();

            return;
        }

        // Same hazard as the layer's transform sync: the canvas destroys its master container on
        // room change, and walking a destroyed container's children throws.
        if(this._canvas.container.destroyed)
        {
            this._touched = [];

            return;
        }

        const display = this._canvas.container.getChildByLabel('canvas');

        if(display === null || display.destroyed)
        {
            return;
        }

        this._factors.clear();

        for(const object of objects)
        {
            this._factors.set(object.instanceId, SpriteLighting.computeDarkness(lights, occluders, object.x, object.y, object.instanceId));
        }

        const touched: Container[] = [];

        for(const child of display.children)
        {
            const sprite = child as Container & {identifier?: string; tint?: number};
            const identifier = sprite.identifier;

            if(identifier === undefined || typeof sprite.tint !== 'number')
            {
                continue;
            }

            const darkness = this._factors.get(identifier);

            if(darkness === undefined)
            {
                // Not a lit object — the room planes, for one. Put back anything owed and move on.
                this.restoreSprite(sprite);

                continue;
            }

            const record = this._records.get(sprite);
            // A tint that is not the one written last time is the renderer's own, and therefore the
            // new base. This is what makes the module survive the renderer repainting a sprite.
            const base = record === undefined || record.applied !== sprite.tint ? sprite.tint : record.base;
            const applied = SpriteLighting.darken(base, darkness, config.shadowTint);

            sprite.tint = applied;
            this._records.set(sprite, {applied, base});
            touched.push(sprite);
        }

        this._touched = touched;
    }

    /** Put every base colour back. After this the render is vanilla again. */
    // TS-only: no AS3 counterpart.
    restore(): void
    {
        if(this._touched.length === 0)
        {
            return;
        }

        for(const sprite of this._touched)
        {
            this.restoreSprite(sprite as Container & {tint?: number});
        }

        this._touched = [];
    }

    // TS-only: no AS3 counterpart.
    private restoreSprite(sprite: Container & {tint?: number}): void
    {
        const record = this._records.get(sprite);

        if(record === undefined)
        {
            return;
        }

        // A sprite the renderer has already destroyed owes nothing, and writing to it throws.
        if(sprite.destroyed)
        {
            this._records.delete(sprite);

            return;
        }

        // Only undo our own write. If the renderer has repainted since, its colour wins.
        if(sprite.tint === record.applied)
        {
            sprite.tint = record.base;
        }

        this._records.delete(sprite);
    }

    /**
     * How dark an object at this tile should be, 0 (full light) to 1 (full darkness).
     *
     * Same two terms the floor overlay composites, so an object and the floor it stands on agree:
     * the distance falloff, and the cast shadow — combined as `1 - (1 - a)(1 - s)` rather than added,
     * which is what drawing one over the other does.
     */
    // TS-only: no AS3 counterpart.
    static computeDarkness(
        lights: readonly ILightSource[],
        occluders: IOccluderData,
        tileX: number,
        tileY: number,
        instanceId: string
    ): number
    {
        const config = LightingConfig.values;

        // The brightest light wins, rather than the darkness accumulating. Standing between two
        // lamps must not be darker than standing beside one.
        let darkest = 1;

        for(const light of lights)
        {
            let ambient = 0;

            if(config.ambient)
            {
                const distance = Math.hypot(tileX - light.x, tileY - light.y);
                const inner = light.radiusTiles;
                const outer = light.radiusTiles * FALLOFF_SPAN;
                const ramp = distance <= inner ? 0 : distance >= outer ? 1 : (distance - inner) / (outer - inner);
                const dimming = 1 + 0.35 * (1 - light.intensity);

                ambient = Math.min(1, ramp * config.ambientStrength * dimming);
            }

            let shadow = 0;

            // A lamp is never in its own shadow: its glow sits on the tile the occlusion test would
            // otherwise call blocked.
            if(config.shadows && light.sourceId !== instanceId)
            {
                shadow = SpriteLighting.sampleOcclusion(light, occluders, tileX, tileY) * config.shadowStrength;
            }

            darkest = Math.min(darkest, 1 - (1 - ambient) * (1 - shadow));
        }

        return darkest;
    }

    /** Fraction of the samples around this tile that the light cannot reach, 0..1. */
    // TS-only: no AS3 counterpart.
    private static sampleOcclusion(light: ILightSource, occluders: IOccluderData, tileX: number, tileY: number): number
    {
        if(occluders.width === 0 || occluders.height === 0)
        {
            return 0;
        }

        let blocked = 0;

        for(const offset of OCCLUSION_SAMPLES)
        {
            if(SpriteLighting.isOccluded(occluders, light.x, light.y, tileX + offset.x, tileY + offset.y))
            {
                blocked++;
            }
        }

        return blocked / OCCLUSION_SAMPLES.length;
    }

    /**
     * Walk the grid from the light to the target; is anything solid in between?
     *
     * The target's own tile is skipped — an object standing on a tile it makes solid (which every
     * caster does, including avatars now) would otherwise always shadow itself.
     */
    // TS-only: no AS3 counterpart.
    private static isOccluded(
        occluders: IOccluderData,
        lightX: number, lightY: number,
        targetX: number, targetY: number
    ): boolean
    {
        const targetTileX = Math.floor(targetX);
        const targetTileY = Math.floor(targetY);
        const deltaX = targetX - lightX;
        const deltaY = targetY - lightY;
        const distance = Math.hypot(deltaX, deltaY);

        if(distance < 0.001)
        {
            return false;
        }

        // Two samples per tile of travel: fine enough not to step over a one-tile occluder.
        const steps = Math.ceil(distance * 2);

        for(let step = 1; step < steps; step++)
        {
            const t = step / steps;
            const x = Math.floor(lightX + deltaX * t);
            const y = Math.floor(lightY + deltaY * t);

            if(x === targetTileX && y === targetTileY)
            {
                continue;
            }

            if(x < 0 || x >= occluders.width || y < 0 || y >= occluders.height)
            {
                continue;
            }

            if(occluders.solid[y * occluders.width + x] === 1)
            {
                return true;
            }
        }

        return false;
    }

    /**
     * Multiply a base colour toward the shadow tint.
     *
     * `lerp(white, tint, darkness)` is the multiplier the overlay's "tint at alpha darkness"
     * amounts to, so a sprite and the floor under it land on the same colour.
     */
    // TS-only: no AS3 counterpart.
    private static darken(base: number, darkness: number, tint: number): number
    {
        const clamped = Math.min(1, Math.max(0, darkness));

        const multiplierR = 255 - (255 - ((tint >> 16) & 0xFF)) * clamped;
        const multiplierG = 255 - (255 - ((tint >> 8) & 0xFF)) * clamped;
        const multiplierB = 255 - (255 - (tint & 0xFF)) * clamped;

        const red = Math.round((((base >> 16) & 0xFF) * multiplierR) / 255);
        const green = Math.round((((base >> 8) & 0xFF) * multiplierG) / 255);
        const blue = Math.round(((base & 0xFF) * multiplierB) / 255);

        return (red << 16) | (green << 8) | blue;
    }

    // TS-only: no AS3 counterpart.
    describe(): Record<string, unknown>
    {
        return {
            litObjects: this._factors.size,
            tintedSprites: this._touched.length,
            sample: [...this._factors.entries()].slice(0, 5).map(([id, darkness]) => ({id, darkness}))
        };
    }

    // TS-only: no AS3 counterpart.
    dispose(): void
    {
        if(this._disposed)
        {
            return;
        }

        try
        {
            this.restore();
        }
        catch (error)
        {
            log.error('Could not restore sprite tints', error);
        }

        this._factors.clear();
        this._disposed = true;
    }
}
