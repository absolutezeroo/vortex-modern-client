/**
 * Room lighting — the display layer.
 *
 * NOT A PORT. See LightingConfig.ts's header.
 *
 * Attaches one container to the rendering canvas's master container, as a sibling drawn above the
 * room's sprite list. It never becomes a child of `_display`: that container is index-addressed
 * (`_display.children[index]` in getSprite/cleanSprites/checkMouseHits), so inserting anything into
 * it would shift every sprite index and break hit-testing.
 *
 * Living on `_master` means the layer works in canvas space, and it projects tile coordinates
 * itself with the same transform `updateDisplayTransform()` applies to `_display`
 * (`geometryScreen * scale + screenOffset`). Nothing has to be mirrored per frame.
 *
 * Composition, back to front:
 *
 *   1. `_ambientSprite` — a radial falloff centred on the light, projected through the tile axes so
 *      the pool is the iso ellipse and not a screen-space circle.
 *   2. `_shadowSprite` — the cast shadows, flattened into a render texture so that overlapping
 *      shadow volumes darken once rather than once per occluder.
 *
 * Both are clipped to the floor: darkness must not spill onto the void or climb the walls, since a
 * flat floor projection is only correct on the floor.
 */
import {BlurFilter, Container, Graphics, Matrix, RenderTexture, Sprite, Texture} from 'pixi.js';
import type {Renderer} from 'pixi.js';
import type {RoomRenderingCanvas} from '@habbo/room/renderer/RoomRenderingCanvas';
import {Vector3d} from '@room/utils/Vector3d';
import {Logger} from '@core/utils/Logger';
import {FALLOFF_SPAN, LightingConfig} from './LightingConfig';
import {gridToWorld, type IOccluderData} from './OccluderGrid';
import type {ILitObject} from './SpriteLighting';
import type {ILightSource} from './types';

const log = Logger.getLogger('client.lighting.RoomLightingLayer');

/** Half-size of the generated falloff texture, in texture pixels. */
const GRADIENT_HALF = 128;

/** Cap on the shadow texture's dimensions, so a large room at high zoom cannot ask for the moon. */
const MAX_TEXTURE_SIZE = 4096;

// TS-only: no AS3 counterpart; see the file header.
export class RoomLightingLayer
{
    // TS-only: no AS3 counterpart.
    private readonly _canvas: RoomRenderingCanvas;
    // TS-only: no AS3 counterpart.
    private readonly _renderer: Renderer;
    // TS-only: no AS3 counterpart.
    private readonly _container: Container;
    // TS-only: no AS3 counterpart.
    private readonly _floorMask: Graphics;
    // TS-only: no AS3 counterpart.
    private readonly _ambientSprite: Sprite;
    // TS-only: no AS3 counterpart.
    private readonly _shadowSprite: Sprite;
    /** Scratch geometry rendered into `_shadowTexture`; never added to the scene. */
    // TS-only: no AS3 counterpart.
    private readonly _shadowGraphics: Graphics;
    /** Unmissable marker drawn by `setProbe()`, to separate "drawn wrong" from "never rendered". */
    // TS-only: no AS3 counterpart.
    private readonly _probeGraphics: Graphics;
    // TS-only: no AS3 counterpart.
    private _probeActive: boolean = false;
    /** The `debugOverlay` drawing. A sibling of `_container`, so the clip region does not hide it. */
    // TS-only: no AS3 counterpart.
    private readonly _overlayGraphics: Graphics;
    // TS-only: no AS3 counterpart.
    private readonly _shadowScene: Container;
    /** Holds what actually gets drawn into the texture, and carries the penumbra filter. */
    // TS-only: no AS3 counterpart.
    private readonly _shadowContent: Container;
    /** One flattened copy of each caster's own texture. */
    // TS-only: no AS3 counterpart.
    private readonly _silhouettes: Container;
    /** Reused across frames — a furnished room redraws these several times a second. */
    // TS-only: no AS3 counterpart.
    private readonly _silhouettePool: Sprite[] = [];
    /**
     * Each object's own sprite, erased from the darkness at its real position.
     *
     * This is what stops a shadow being painted across the chair standing in front of it, and what
     * stops the ambient darkening an avatar. The layer is above the whole sprite list and cannot be
     * interleaved into it, so instead of putting the darkness under the objects, the objects are cut
     * out of the darkness. Same result, and it needs nothing from the ported renderer.
     */
    // TS-only: no AS3 counterpart.
    private readonly _cutouts: Container;
    // TS-only: no AS3 counterpart.
    private readonly _cutoutPool: Sprite[] = [];
    /** Scratch scene for the ambient pass: full darkness, with one erasing pool per light. */
    // TS-only: no AS3 counterpart.
    private readonly _ambientScene: Container;
    // TS-only: no AS3 counterpart.
    private readonly _ambientContent: Container;
    // TS-only: no AS3 counterpart.
    private readonly _ambientBase: Graphics;
    // TS-only: no AS3 counterpart.
    private readonly _lightPoolSprites: Sprite[] = [];
    // TS-only: no AS3 counterpart.
    private _ambientTexture: RenderTexture | null = null;
    // TS-only: no AS3 counterpart.
    private _ambientWidth: number = 0;
    // TS-only: no AS3 counterpart.
    private _ambientHeight: number = 0;
    // TS-only: no AS3 counterpart.
    private _shadowTexture: RenderTexture | null = null;
    // TS-only: no AS3 counterpart.
    private _blurFilter: BlurFilter | null = null;
    // TS-only: no AS3 counterpart.
    private _gradientTexture: Texture | null = null;
    /** Reused across projections — this runs on the room's update cadence. */
    // TS-only: no AS3 counterpart.
    private readonly _projectionVector: Vector3d = new Vector3d(0, 0, 0);
    // TS-only: no AS3 counterpart.
    private _textureWidth: number = 0;
    // TS-only: no AS3 counterpart.
    private _textureHeight: number = 0;
    // TS-only: no AS3 counterpart.
    private _floorSignature: number = -1;
    /** The floor's bounding box in master space. The shadow texture is aligned to it, not to the viewport. */
    // TS-only: no AS3 counterpart.
    private _floorBounds: {x: number; y: number; width: number; height: number} | null = null;
    // TS-only: no AS3 counterpart.
    private _warnedMissingDisplay: boolean = false;
    // TS-only: no AS3 counterpart.
    private _disposed: boolean = false;

    /**
     * Is this layer still usable?
     *
     * False once disposed, and false once the canvas has destroyed `_master` out from under it —
     * which it does on room change, with `{children: true}`. Callers that run every frame have to
     * ask, because they run before anything else notices.
     */
    // TS-only: no AS3 counterpart.
    get alive(): boolean
    {
        return !this._disposed && !this._container.destroyed && !this._overlayGraphics.destroyed;
    }

    constructor(canvas: RoomRenderingCanvas, renderer: Renderer)
    {
        this._canvas = canvas;
        this._renderer = renderer;

        this._container = new Container();
        this._container.label = 'lighting';
        this._container.eventMode = 'none';
        this._container.interactiveChildren = false;

        this._floorMask = new Graphics();
        this._floorMask.label = 'lighting_floor_mask';

        this._ambientSprite = new Sprite();
        this._ambientSprite.label = 'lighting_ambient';
        // Top-left anchored: this now shows a render texture placed at the floor's bounding box,
        // not a gradient centred on a single light. The old 0.5 anchor would offset it by half the
        // floor.
        this._ambientSprite.anchor.set(0, 0);
        this._ambientSprite.visible = false;

        this._shadowSprite = new Sprite();
        this._shadowSprite.label = 'lighting_shadows';
        this._shadowSprite.visible = false;

        this._shadowGraphics = new Graphics();
        this._silhouettes = new Container();

        // The blur goes on `_shadowContent`, not on `_shadowScene`: the scene is the root handed to
        // `renderer.render()`, and a filter on a render root is a different Pixi code path than one
        // on something rendered inside it. `_shadowScene` carries only the translation into texture
        // space.
        this._shadowContent = new Container();
        this._shadowContent.addChild(this._shadowGraphics);
        this._shadowContent.addChild(this._silhouettes);

        this._shadowScene = new Container();
        this._shadowScene.addChild(this._shadowContent);

        this._ambientBase = new Graphics();
        this._ambientContent = new Container();
        this._ambientContent.addChild(this._ambientBase);
        this._ambientScene = new Container();
        this._ambientScene.addChild(this._ambientContent);

        // One cutout set, re-parented between the two scenes at render time. Both are translated by
        // the same `-bounds`, so it needs no transform of its own and cannot drift between them.
        this._cutouts = new Container();

        this._probeGraphics = new Graphics();
        this._probeGraphics.label = 'lighting_probe';
        this._probeGraphics.visible = false;

        this._overlayGraphics = new Graphics();
        this._overlayGraphics.label = 'lighting_debug_overlay';
        this._overlayGraphics.visible = false;

        this._container.addChild(this._floorMask);
        this._container.addChild(this._ambientSprite);
        this._container.addChild(this._shadowSprite);
        this._container.addChild(this._probeGraphics);
        this._container.mask = this._floorMask;

        this._canvas.container.addChild(this._container);

        // Outside `_container`, so the clip region does not hide the very thing meant to show where
        // that clip region is.
        this._canvas.container.addChild(this._overlayGraphics);
    }

    /** The canvas viewport in master space — the space `_spriteMask` is drawn in. */
    // TS-only: no AS3 counterpart.
    private get viewportWidth(): number
    {
        const scale = this._canvas.scale;

        return scale > 0 ? this._canvas.width / scale : 0;
    }

    // TS-only: no AS3 counterpart.
    private get viewportHeight(): number
    {
        const scale = this._canvas.scale;

        return scale > 0 ? this._canvas.height / scale : 0;
    }

    /**
     * Project a tile-space point onto the floor plane, in the room's own sprite space.
     *
     * Two terms, and the second one is the whole story:
     *
     *   1. `geometry.getScreenPoint()` — the isometric projection. This alone is what the layer
     *      used at first, and it is why the shadows landed a thousand pixels from the room while
     *      having exactly the right shape and size.
     *   2. Half the viewport — **the room is centred in the canvas, and that centring lives in
     *      neither the geometry nor `screenOffset`.** `RoomEngine.getRoomObjectScreenLocation()`
     *      and `getRoomObjectBoundingRectangle()` both spell it out:
     *      `point.x * scale + canvas.width / 2 + canvas.screenOffsetX`. Dividing that by the scale
     *      gives the offset in `_display`-local terms, which is what this returns.
     *
     * The scale and `screenOffset` parts of that expression are `_display`'s own transform, copied
     * onto this container by `syncToRoomDisplay()` rather than recomputed here — so this method
     * only has to produce local coordinates.
     */
    // TS-only: no AS3 counterpart.
    private project(tileX: number, tileY: number, out: {x: number; y: number}, tileZ: number = 0): boolean
    {
        this._projectionVector.x = tileX;
        this._projectionVector.y = tileY;
        this._projectionVector.z = tileZ;

        const point = this._canvas.geometry.getScreenPoint(this._projectionVector);

        if(point === null)
        {
            return false;
        }

        out.x = point.x + this.viewportWidth / 2;
        out.y = point.y + this.viewportHeight / 2;

        return true;
    }

    /**
     * Adopt `_display`'s transform, so this container and the room's sprites share one space.
     *
     * Called every frame, deliberately outside the throttled redraw: the room is draggable, and a
     * layer that only re-syncs ten times a second visibly slides behind it. Because the geometry is
     * projected into `_display`-local coordinates, a pan changes nothing else — no mask, no shadow
     * quads, no texture. Two property writes and the whole layer tracks the drag exactly.
     *
     * `_display` is private on the canvas and is reached by the label the canvas gives it. That is
     * a read: the layer copies the transform, it never writes to the ported container.
     *
     * Guarded on `alive` because of who calls it: running every frame means running *before* the
     * throttled update has had any chance to notice the room went away. The canvas destroys
     * `_master` with `{children: true}`, which destroys this container too, and Pixi nulls a
     * destroyed container's `position` — so an unguarded write here throws on the first frame after
     * a room change.
     */
    // TS-only: no AS3 counterpart.
    syncToRoomDisplay(): void
    {
        if(!this.alive)
        {
            return;
        }

        const display = this._canvas.container.getChildByLabel('canvas');

        if(display === null)
        {
            // Fall back to the documented transform. Worth saying out loud — but once, not sixty
            // times a second: this runs per frame.
            this._container.position.set(this._canvas.screenOffsetX, this._canvas.screenOffsetY);
            this._container.scale.set(this._canvas.scale);
            this._overlayGraphics.position.copyFrom(this._container.position);
            this._overlayGraphics.scale.copyFrom(this._container.scale);

            if(!this._warnedMissingDisplay)
            {
                this._warnedMissingDisplay = true;
                log.warn('Room sprite container not found by label; falling back to a computed transform');
            }

            return;
        }

        this._warnedMissingDisplay = false;

        this._container.position.set(display.x, display.y);
        this._container.scale.set(display.scale.x, display.scale.y);
        this._overlayGraphics.position.set(display.x, display.y);
        this._overlayGraphics.scale.set(display.scale.x, display.scale.y);
    }

    /**
     * Redraw everything. Called only when the caller has decided something moved — the layer holds
     * no dirty state of its own beyond the floor mask, which is keyed on the occluder signature.
     */
    // TS-only: no AS3 counterpart.
    update(
        lights: readonly ILightSource[],
        occluders: IOccluderData,
        casters: readonly ILitObject[] = [],
        illuminations: ReadonlyMap<string, number> = new Map()
    ): void
    {
        if(!this.alive)
        {
            return;
        }

        const config = LightingConfig.values;

        if(lights.length === 0 || !config.enabled)
        {
            this._container.visible = false;

            return;
        }

        const width = Math.ceil(this.viewportWidth);
        const height = Math.ceil(this.viewportHeight);

        if(width <= 0 || height <= 0)
        {
            this._container.visible = false;

            return;
        }

        this._container.visible = true;

        this.syncToRoomDisplay();
        this.updateFloorMask(occluders);
        this.updateAmbient(lights, casters);
        this.updateShadows(lights, occluders, casters, illuminations);
        this.updateDebugOverlay(lights, occluders);
    }

    /**
     * Rebuild the clip region from the floor runs. Keyed on the occluder signature, so this only
     * runs when the room's floor plan actually changes.
     */
    // TS-only: no AS3 counterpart.
    private updateFloorMask(occluders: IOccluderData): void
    {
        // The projection moves with the camera, so the mask has to follow it as well as the plan.
        const signature = (occluders.signature * 31 + this.cameraSignature()) | 0;

        if(signature === this._floorSignature)
        {
            return;
        }

        this._floorSignature = signature;
        this._floorMask.clear();
        this._floorBounds = null;

        const a = {x: 0, y: 0};
        const b = {x: 0, y: 0};
        const c = {x: 0, y: 0};
        const d = {x: 0, y: 0};

        let minX = Number.POSITIVE_INFINITY;
        let minY = Number.POSITIVE_INFINITY;
        let maxX = Number.NEGATIVE_INFINITY;
        let maxY = Number.NEGATIVE_INFINITY;

        // With `keepObjectsLit`, the occupied tiles are cut out of the clip region so the darkness
        // never lands on whatever is standing there — see the setting's comment for why this is a
        // choice rather than a fix.
        const runs = LightingConfig.values.keepObjectsLit ? occluders.litFloorRuns : occluders.floorRuns;

        for(const run of runs)
        {
            if(!this.project(gridToWorld(run.x0), gridToWorld(run.y), a) ||
                !this.project(gridToWorld(run.x1), gridToWorld(run.y), b) ||
                !this.project(gridToWorld(run.x1), gridToWorld(run.y + 1), c) ||
                !this.project(gridToWorld(run.x0), gridToWorld(run.y + 1), d))
            {
                continue;
            }

            this._floorMask.poly([a.x, a.y, b.x, b.y, c.x, c.y, d.x, d.y]);
            this._floorMask.fill({color: 0xFFFFFF, alpha: 1});

            minX = Math.min(minX, a.x, b.x, c.x, d.x);
            minY = Math.min(minY, a.y, b.y, c.y, d.y);
            maxX = Math.max(maxX, a.x, b.x, c.x, d.x);
            maxY = Math.max(maxY, a.y, b.y, c.y, d.y);
        }

        if(minX <= maxX && minY <= maxY)
        {
            // The floor is the only thing the darkness is ever visible on, so it is also the only
            // area the shadow texture has to cover — and the room's own origin sits wherever the
            // geometry puts it, routinely at negative master-space coordinates.
            this._floorBounds = {
                x: Math.floor(minX),
                y: Math.floor(minY),
                width: Math.ceil(maxX - minX),
                height: Math.ceil(maxY - minY)
            };
        }
    }

    /**
     * The distance falloff, for any number of lights.
     *
     * Built by subtraction: the texture starts fully dark, and each light **erases** its own pool
     * out of it. That is what makes several lights compose correctly — darkness laid over darkness
     * would make the space between two lamps darker than the space beside one, which is backwards.
     * Erasing means the brightest light at a point wins, with no ordering to get right.
     *
     * A circle of radius r in tile space projects to an **axis-aligned** ellipse on screen, with
     * half-extents `hypot(u.x, v.x) * r` and `hypot(u.y, v.y) * r` for projected tile axes u and v.
     * That is exact for this projection, not an approximation — for the standard 64x32 iso tile it
     * gives 32*sqrt(2)*r and 16*sqrt(2)*r, and the off-axis error is at the limit of double
     * precision. So each pool needs a position and two scales, nothing more.
     *
     * Each pool sprite now spans only its own light's reach instead of the whole viewport, so the
     * gradient's stops are fixed (`1 / FALLOFF_SPAN`) and the texture is built once.
     */
    // TS-only: no AS3 counterpart.
    private updateAmbient(lights: readonly ILightSource[], casters: readonly ILitObject[]): void
    {
        const config = LightingConfig.values;
        const bounds = this._floorBounds;

        if(!config.ambient || config.ambientStrength <= 0 || bounds === null)
        {
            this._ambientSprite.visible = false;
            this.releaseLightPools(0);

            return;
        }

        this.ensureAmbientTexture(bounds.width, bounds.height);
        this.ensureGradientTexture();

        if(this._ambientTexture === null || this._gradientTexture === null)
        {
            this._ambientSprite.visible = false;

            return;
        }

        // Same translation the shadow scene uses, so both work in display-local coordinates and the
        // one cutout set can be moved between them without a transform of its own.
        this._ambientScene.position.set(-bounds.x, -bounds.y);

        // Full darkness everywhere, before the lights carve into it.
        this._ambientBase.clear();
        this._ambientBase.rect(bounds.x, bounds.y, bounds.width, bounds.height);
        this._ambientBase.fill({color: 0xFFFFFF, alpha: 1});

        const origin = {x: 0, y: 0};
        const alongX = {x: 0, y: 0};
        const alongY = {x: 0, y: 0};
        let used = 0;

        for(const light of lights)
        {
            if(!this.project(light.x, light.y, origin) ||
                !this.project(light.x + 1, light.y, alongX) ||
                !this.project(light.x, light.y + 1, alongY))
            {
                continue;
            }

            const axisX = {x: alongX.x - origin.x, y: alongX.y - origin.y};
            const axisY = {x: alongY.x - origin.x, y: alongY.y - origin.y};
            const extentPerTileX = Math.hypot(axisX.x, axisY.x);
            const extentPerTileY = Math.hypot(axisX.y, axisY.y);

            if(extentPerTileX < 0.0001 || extentPerTileY < 0.0001)
            {
                continue;
            }

            const reach = light.radiusTiles * FALLOFF_SPAN;
            const pool = this.acquireLightPool(used);

            pool.texture = this._gradientTexture;
            // A dim light carves a shallower hole. `intensity` is 1 for now: the dimmer's brightness
            // never reaches the client, because the event that would carry it is never dispatched —
            // see RoomLightingController's header.
            pool.alpha = Math.min(1, light.intensity);
            pool.position.set(origin.x, origin.y);
            pool.scale.set(
                (extentPerTileX * reach) / GRADIENT_HALF,
                (extentPerTileY * reach) / GRADIENT_HALF
            );
            used++;
        }

        this.releaseLightPools(used);

        // Cut the objects out, so the ambient darkens the floor and not what stands on it. Tied to
        // `litSprites`: with per-sprite lighting off, objects would otherwise be the only thing in
        // the room with no shading at all.
        if(config.litSprites && this.buildCutouts(casters))
        {
            this._ambientScene.addChild(this._cutouts);
        }
        else if(this._cutouts.parent === this._ambientScene)
        {
            this._ambientScene.removeChild(this._cutouts);
        }

        this._renderer.render({
            container: this._ambientScene,
            target: this._ambientTexture,
            clear: true
        });

        this._ambientSprite.texture = this._ambientTexture;
        this._ambientSprite.rotation = 0;
        this._ambientSprite.skew.set(0, 0);
        this._ambientSprite.scale.set(1, 1);
        this._ambientSprite.position.set(bounds.x, bounds.y);
        this._ambientSprite.tint = config.shadowTint;
        this._ambientSprite.alpha = config.ambientStrength;
        this._ambientSprite.visible = true;
    }

    /** Take the pooled light-pool sprite at `index`, creating and parenting it on first use. */
    // TS-only: no AS3 counterpart.
    private acquireLightPool(index: number): Sprite
    {
        let pool = this._lightPoolSprites[index];

        if(pool === undefined)
        {
            pool = new Sprite();
            pool.anchor.set(0.5, 0.5);
            // The pool does not paint light, it removes darkness.
            pool.blendMode = 'erase';
            this._lightPoolSprites[index] = pool;
            this._ambientContent.addChild(pool);
        }

        pool.visible = true;

        return pool;
    }

    // TS-only: no AS3 counterpart.
    private releaseLightPools(used: number): void
    {
        for(let index = used; index < this._lightPoolSprites.length; index++)
        {
            this._lightPoolSprites[index].visible = false;
        }
    }

    // TS-only: no AS3 counterpart.
    private ensureAmbientTexture(requestedWidth: number, requestedHeight: number): void
    {
        const width = Math.max(1, Math.min(MAX_TEXTURE_SIZE, requestedWidth));
        const height = Math.max(1, Math.min(MAX_TEXTURE_SIZE, requestedHeight));

        if(this._ambientTexture !== null &&
            this._ambientWidth === width &&
            this._ambientHeight === height)
        {
            return;
        }

        if(this._ambientTexture !== null)
        {
            this._ambientSprite.texture = Texture.EMPTY;
            this._ambientTexture.destroy(true);
            this._ambientTexture = null;
        }

        try
        {
            this._ambientTexture = RenderTexture.create({width, height, resolution: 1});
            this._ambientWidth = width;
            this._ambientHeight = height;
        }
        catch (error)
        {
            log.error('Could not allocate the ambient render texture', error);
            this._ambientTexture = null;
        }
    }

    /**
     * The cast shadows.
     *
     * Each occluder segment is extruded away from the light and filled opaque into a render
     * texture. Flattening in the texture is the point: filling the same quads straight into the
     * scene at 55% would darken every overlap twice, and a room with a dozen occluders is nothing
     * but overlaps.
     *
     * The texture is aligned to the floor's bounding box, NOT to the viewport. A render texture
     * captures its source from local (0,0) outward, and the room's geometry routinely projects to
     * negative master-space coordinates — anchoring at the viewport origin silently clipped away
     * everything left of and above it, which in a typical room is most of the floor.
     */
    // TS-only: no AS3 counterpart.
    private updateShadows(
        lights: readonly ILightSource[],
        occluders: IOccluderData,
        casters: readonly ILitObject[],
        illuminations: ReadonlyMap<string, number>
    ): void
    {
        const config = LightingConfig.values;

        if(!config.shadows || config.shadowStrength <= 0 || occluders.segments.length === 0)
        {
            this._shadowSprite.visible = false;

            return;
        }

        const floor = this._floorBounds;

        if(floor === null || floor.width <= 0 || floor.height <= 0)
        {
            this._shadowSprite.visible = false;

            return;
        }

        // The penumbra bleeds outward, so the texture needs room for it or the blur would be cut
        // off flat at the floor's bounding box — a hard edge in the middle of the soft one.
        const blur = Math.max(0, config.shadowBlur);
        const padding = Math.ceil(blur * 3);
        const bounds = {
            x: floor.x - padding,
            y: floor.y - padding,
            width: floor.width + padding * 2,
            height: floor.height + padding * 2
        };

        this.ensureShadowTexture(bounds.width, bounds.height);

        if(this._shadowTexture === null)
        {
            this._shadowSprite.visible = false;

            return;
        }

        this.applyBlur(blur);

        // Shift local space into texture space, so a quad at local x = -320 lands inside it.
        this._shadowScene.position.set(-bounds.x, -bounds.y);

        const graphics = this._shadowGraphics;

        graphics.clear();

        if(config.silhouetteShadows)
        {
            this.drawSilhouettes(lights, casters, illuminations);

            // Outside `_shadowContent`, so the objects are punched out crisply rather than by a
            // blurred copy of themselves — the penumbra belongs to the shadow, not to the cutout.
            if(config.litSprites && this.buildCutouts(casters))
            {
                this._shadowScene.addChild(this._cutouts);
            }
            else if(this._cutouts.parent === this._shadowScene)
            {
                this._shadowScene.removeChild(this._cutouts);
            }

            this._renderer.render({
                container: this._shadowScene,
                target: this._shadowTexture,
                clear: true
            });

            this._shadowSprite.texture = this._shadowTexture;
            this._shadowSprite.position.set(bounds.x, bounds.y);
            this._shadowSprite.tint = config.shadowTint;
            this._shadowSprite.alpha = config.shadowStrength;
            this._shadowSprite.visible = true;

            return;
        }

        this.releaseSilhouettes(0);

        const near1 = {x: 0, y: 0};
        const near2 = {x: 0, y: 0};
        const far1 = {x: 0, y: 0};
        const far2 = {x: 0, y: 0};

        // The blocky fallback, kept so the two shapes can be compared side by side. One extrusion
        // per segment per light, flattened by the render texture like the silhouettes are.
        for(const light of lights)
        {
            for(const segment of occluders.segments)
            {
                const worldX1 = gridToWorld(segment.x1);
                const worldY1 = gridToWorld(segment.y1);
                const worldX2 = gridToWorld(segment.x2);
                const worldY2 = gridToWorld(segment.y2);

                const dx1 = worldX1 - light.x;
                const dy1 = worldY1 - light.y;
                const dx2 = worldX2 - light.x;
                const dy2 = worldY2 - light.y;

                const length1 = Math.hypot(dx1, dy1);
                const length2 = Math.hypot(dx2, dy2);

                // A segment through the light has no shadow direction; skip rather than divide by zero.
                if(length1 < 0.0001 || length2 < 0.0001)
                {
                    continue;
                }

                const extrude = config.shadowExtrudeTiles;

                if(!this.project(worldX1, worldY1, near1) ||
                    !this.project(worldX2, worldY2, near2) ||
                    !this.project(worldX2 + (dx2 / length2) * extrude, worldY2 + (dy2 / length2) * extrude, far2) ||
                    !this.project(worldX1 + (dx1 / length1) * extrude, worldY1 + (dy1 / length1) * extrude, far1))
                {
                    continue;
                }

                graphics.poly([near1.x, near1.y, near2.x, near2.y, far2.x, far2.y, far1.x, far1.y]);
                graphics.fill({color: 0xFFFFFF, alpha: 1});
            }
        }

        this._renderer.render({
            container: this._shadowScene,
            target: this._shadowTexture,
            clear: true
        });

        this._shadowSprite.texture = this._shadowTexture;
        this._shadowSprite.position.set(bounds.x, bounds.y);
        this._shadowSprite.tint = config.shadowTint;
        this._shadowSprite.alpha = config.shadowStrength;
        this._shadowSprite.visible = true;
    }

    /**
     * Flatten each caster's own texture onto the floor, away from the light.
     *
     * The shear is the whole trick. A sprite stands upright in screen space with its base on the
     * tile; a point `h` pixels above that base belongs, in its shadow, `h * length` pixels along the
     * floor direction `d`. Written as an affine map on display-space points, with `baseY` the
     * screen y where the object meets the floor:
     *
     *     x' = px - py * d.x * length + baseY * d.x * length
     *     y' =    - py * d.y * length + baseY * (1 + d.y * length)
     *
     * `d` is taken from the light to the object **in projected floor space**, so the isometric
     * squash is already in it — the shadow lies down on the floor plane rather than on the screen.
     *
     * Prepending this to each sprite's own `localTransform` rather than rebuilding its placement is
     * what makes flips work for free: `flipH`/`flipV` live in that transform as a negative scale,
     * and the renderer shifts the origin to compensate. Recomputing a position by hand here would
     * have to reproduce that, and would get it wrong for every mirrored sprite in the room.
     */
    // TS-only: no AS3 counterpart.
    private drawSilhouettes(
        lights: readonly ILightSource[],
        casters: readonly ILitObject[],
        illuminations: ReadonlyMap<string, number>
    ): void
    {
        const display = this._canvas.container.getChildByLabel('canvas');

        if(display === null || display.destroyed)
        {
            this.releaseSilhouettes(0);

            return;
        }

        const config = LightingConfig.values;
        const origin = {x: 0, y: 0};
        const base = {x: 0, y: 0};
        const shear = new Matrix();
        let used = 0;

        // One shadow per caster per light. They flatten in the render texture rather than stacking,
        // so a chair lit from two sides throws two shadows without either doubling in weight.
        for(const light of lights)
        {
            if(!this.project(light.x, light.y, origin))
            {
                continue;
            }

            // Where each caster meets the floor, which way its shadow runs from *this* light, and
            // how far it stretches.
            const directions = new Map<string, {dx: number; dy: number; baseY: number; stretch: number; illumination: number}>();

            for(const caster of casters)
            {
                // A lamp must not cast its own silhouette from its own glow, or every light in the
                // room paints a dark shape over itself.
                if(caster.instanceId === light.sourceId)
                {
                    continue;
                }

                if(!this.project(caster.x, caster.y, base))
                {
                    continue;
                }

                const deltaX = base.x - origin.x;
                const deltaY = base.y - origin.y;
                const length = Math.hypot(deltaX, deltaY);

                if(length < 0.001)
                {
                    // Standing on the light: no direction to cast in.
                    continue;
                }

                // Length from the geometry rather than a fixed number: a caster `d` tiles from a
                // light `h` tiles up throws a shadow `d / h` times its own height. That is what
                // separates a ceiling lamp — almost nothing directly beneath it, growing outward —
                // from a candle on the floor, which throws long ones everywhere. Clamped, because
                // a light at floor height would otherwise stretch to infinity.
                const tileDistance = Math.hypot(caster.x - light.x, caster.y - light.y);
                const stretch = Math.min(config.maxShadowStretch, tileDistance / light.heightTiles);

                // A caster the light barely reaches throws a faint shadow, and one in full shade
                // throws none. Without this every shadow is equally black wherever it falls, and a
                // caster already sitting in another object's shadow adds a second, phantom one.
                const illumination = illuminations.get(caster.instanceId) ?? 1;

                if(illumination <= 0.02)
                {
                    continue;
                }

                directions.set(caster.instanceId, {
                    dx: deltaX / length,
                    dy: deltaY / length,
                    baseY: base.y,
                    stretch,
                    illumination
                });
            }

            if(directions.size === 0)
            {
                continue;
            }

            for(const child of display.children)
            {
                const sprite = child as Container & {identifier?: string; texture?: Texture; visible: boolean};
                const identifier = sprite.identifier;

                if(identifier === undefined || !sprite.visible)
                {
                    continue;
                }

                const direction = directions.get(identifier);
                const texture = sprite.texture;

                if(direction === undefined || texture === undefined || texture === Texture.EMPTY)
                {
                    continue;
                }

                const scale = direction.stretch * config.shadowLength;
                const stretchX = direction.dx * scale;
                const stretchY = direction.dy * scale;

                shear.set(
                    1, 0,
                    -stretchX, -stretchY,
                    direction.baseY * stretchX,
                    direction.baseY * (1 + stretchY)
                );
                shear.append(sprite.localTransform);

                const silhouette = this.acquireSilhouette(used);

                silhouette.texture = texture;
                silhouette.alpha = direction.illumination;
                silhouette.setFromMatrix(shear);
                used++;
            }
        }

        this.releaseSilhouettes(used);
    }

    /**
     * Build the cutouts: every lit object's own sprite, drawn at its real transform in `erase` mode.
     *
     * Nothing is sheared here — the point is to punch the object's exact silhouette out of whatever
     * darkness has been drawn, so the darkness lands on the floor and never on the thing standing on
     * it. Returns false when there is nothing to cut out.
     */
    // TS-only: no AS3 counterpart.
    private buildCutouts(casters: readonly ILitObject[]): boolean
    {
        const display = this._canvas.container.getChildByLabel('canvas');

        if(display === null || display.destroyed || casters.length === 0)
        {
            this.releaseCutouts(0);

            return false;
        }

        const identifiers = new Set<string>();

        for(const caster of casters)
        {
            identifiers.add(caster.instanceId);
        }

        let used = 0;

        for(const child of display.children)
        {
            const sprite = child as Container & {identifier?: string; texture?: Texture; visible: boolean};
            const texture = sprite.texture;

            if(sprite.identifier === undefined ||
                !sprite.visible ||
                texture === undefined ||
                texture === Texture.EMPTY ||
                !identifiers.has(sprite.identifier))
            {
                continue;
            }

            const cutout = this.acquireCutout(used);

            cutout.texture = texture;
            cutout.setFromMatrix(sprite.localTransform);
            used++;
        }

        this.releaseCutouts(used);

        return used > 0;
    }

    // TS-only: no AS3 counterpart.
    private acquireCutout(index: number): Sprite
    {
        let cutout = this._cutoutPool[index];

        if(cutout === undefined)
        {
            cutout = new Sprite();
            cutout.blendMode = 'erase';
            this._cutoutPool[index] = cutout;
            this._cutouts.addChild(cutout);
        }

        cutout.visible = true;

        return cutout;
    }

    // TS-only: no AS3 counterpart.
    private releaseCutouts(used: number): void
    {
        for(let index = used; index < this._cutoutPool.length; index++)
        {
            const cutout = this._cutoutPool[index];

            if(cutout.visible)
            {
                cutout.visible = false;
                cutout.texture = Texture.EMPTY;
            }
        }
    }

    /** Take the pooled silhouette at `index`, creating and parenting it on first use. */
    // TS-only: no AS3 counterpart.
    private acquireSilhouette(index: number): Sprite
    {
        let silhouette = this._silhouettePool[index];

        if(silhouette === undefined)
        {
            silhouette = new Sprite();
            // **White**, not black. What matters in the render texture is the alpha; the colour is
            // supplied later by `_shadowSprite.tint`. Drawn black, the texture's RGB was zero and
            // multiplying it by `shadowTint` left zero — so the tint setting did nothing at all and
            // every shadow came out pure black.
            silhouette.tint = 0xFFFFFF;
            this._silhouettePool[index] = silhouette;
            this._silhouettes.addChild(silhouette);
        }

        silhouette.visible = true;

        return silhouette;
    }

    /** Hide every pooled silhouette from `used` on. Pooled, not destroyed — these churn per redraw. */
    // TS-only: no AS3 counterpart.
    private releaseSilhouettes(used: number): void
    {
        for(let index = used; index < this._silhouettePool.length; index++)
        {
            const silhouette = this._silhouettePool[index];

            if(silhouette.visible)
            {
                silhouette.visible = false;
                silhouette.texture = Texture.EMPTY;
            }
        }
    }

    /**
     * Put the penumbra on the scratch container, so the blur is baked into the texture on redraw
     * rather than re-run by Pixi on the displayed sprite every single frame.
     */
    // TS-only: no AS3 counterpart.
    private applyBlur(strength: number): void
    {
        if(strength <= 0)
        {
            this._shadowContent.filters = [];
            this._blurFilter = null;

            return;
        }

        if(this._blurFilter === null)
        {
            this._blurFilter = new BlurFilter({strength, quality: 3});
            this._shadowContent.filters = [this._blurFilter];

            return;
        }

        if(this._blurFilter.strength !== strength)
        {
            this._blurFilter.strength = strength;
        }
    }

    // TS-only: no AS3 counterpart.
    private ensureShadowTexture(requestedWidth: number, requestedHeight: number): void
    {
        const width = Math.min(MAX_TEXTURE_SIZE, requestedWidth);
        const height = Math.min(MAX_TEXTURE_SIZE, requestedHeight);

        if(width < requestedWidth || height < requestedHeight)
        {
            // Say so rather than clip in silence — clipping the shadow texture without a word is
            // exactly the fault this alignment work was fixing.
            log.warn(
                `Floor is larger than the shadow texture cap (${requestedWidth}x${requestedHeight} > ` +
                `${MAX_TEXTURE_SIZE}); shadows beyond the cap will not be drawn`
            );
        }

        if(this._shadowTexture !== null && this._textureWidth === width && this._textureHeight === height)
        {
            return;
        }

        if(this._shadowTexture !== null)
        {
            this._shadowSprite.texture = Texture.EMPTY;
            this._shadowTexture.destroy(true);
            this._shadowTexture = null;
        }

        try
        {
            this._shadowTexture = RenderTexture.create({width, height, resolution: 1});
            this._textureWidth = width;
            this._textureHeight = height;
        }
        catch (error)
        {
            log.error('Could not allocate the shadow render texture', error);
            this._shadowTexture = null;
        }
    }

    /**
     * Build the light-pool texture: opaque out to the light's radius, fading to nothing at its
     * reach.
     *
     * This is the shape that gets **erased** from the darkness, so it is the inverse of what the
     * old single-light overlay drew. It is also now built exactly once: each pool sprite is scaled
     * to its own light's reach, which makes the stops a fixed ratio (`1 / FALLOFF_SPAN`) instead of
     * something recomputed from the viewport every time the radius moved.
     *
     * Drawn on a 2D canvas rather than through a Pixi gradient fill so it does not depend on which
     * gradient types this Pixi build supports.
     */
    // TS-only: no AS3 counterpart.
    private ensureGradientTexture(): void
    {
        if(this._gradientTexture !== null)
        {
            return;
        }

        const size = GRADIENT_HALF * 2;
        const canvas = document.createElement('canvas');

        canvas.width = size;
        canvas.height = size;

        const context = canvas.getContext('2d');

        if(context === null)
        {
            log.error('Could not get a 2D context for the falloff texture');

            return;
        }

        const gradient = context.createRadialGradient(
            GRADIENT_HALF, GRADIENT_HALF, 0,
            GRADIENT_HALF, GRADIENT_HALF, GRADIENT_HALF
        );

        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(1 / FALLOFF_SPAN, 'rgba(255,255,255,1)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');

        context.fillStyle = gradient;
        context.fillRect(0, 0, size, size);

        this._gradientTexture = Texture.from(canvas);
    }

    /**
     * Draw the layer's own idea of the room on top of it.
     *
     * Red: the occluder segments, exactly as the shadow pass sees them. Green cross: the light.
     * Cyan: the floor clip outline. Laid over the real room, this separates "the geometry is in the
     * wrong place" from "the shading looks wrong" — two faults that look identical in a screenshot
     * and have nothing in common.
     *
     * Drawn outside the clip, so it stays visible where the darkness is not.
     */
    // TS-only: no AS3 counterpart.
    private updateDebugOverlay(lights: readonly ILightSource[], occluders: IOccluderData): void
    {
        const graphics = this._overlayGraphics;

        graphics.clear();

        if(!LightingConfig.values.debugOverlay)
        {
            graphics.visible = false;

            return;
        }

        graphics.visible = true;

        const a = {x: 0, y: 0};
        const b = {x: 0, y: 0};
        const c = {x: 0, y: 0};
        const d = {x: 0, y: 0};

        for(const run of occluders.floorRuns)
        {
            // Four projected corners, not `rect()` from two of them. A floor run is a parallelogram
            // once projected; drawing it as an axis-aligned box put cyan lines out in the void next
            // to the floor and read exactly like a geometry offset — in a tool whose entire job is
            // to tell you whether the geometry is offset.
            if(this.project(gridToWorld(run.x0), gridToWorld(run.y), a) &&
                this.project(gridToWorld(run.x1), gridToWorld(run.y), b) &&
                this.project(gridToWorld(run.x1), gridToWorld(run.y + 1), c) &&
                this.project(gridToWorld(run.x0), gridToWorld(run.y + 1), d))
            {
                graphics.poly([a.x, a.y, b.x, b.y, c.x, c.y, d.x, d.y]);
            }
        }

        graphics.stroke({color: 0x00FFFF, width: 1, alpha: 0.5});

        for(const segment of occluders.segments)
        {
            if(this.project(gridToWorld(segment.x1), gridToWorld(segment.y1), a) &&
                this.project(gridToWorld(segment.x2), gridToWorld(segment.y2), b))
            {
                graphics.moveTo(a.x, a.y);
                graphics.lineTo(b.x, b.y);
            }
        }

        graphics.stroke({color: 0xFF0000, width: 3, alpha: 0.9});

        for(const light of lights)
        {
            if(!this.project(light.x, light.y, a))
            {
                continue;
            }

            graphics.moveTo(a.x - 16, a.y);
            graphics.lineTo(a.x + 16, a.y);
            graphics.moveTo(a.x, a.y - 16);
            graphics.lineTo(a.x, a.y + 16);
        }

        graphics.stroke({color: 0x00FF00, width: 3, alpha: 1});
    }

    /**
     * Draw an unmissable magenta marker with the mask removed.
     *
     * This answers the one question the numbers cannot: whether this container reaches the screen
     * at all. If the marker appears, the plumbing is sound and any remaining fault is in what gets
     * drawn or in the mask; if it does not, nothing drawn here would ever have been visible and the
     * fault is upstream, in where the layer is attached.
     */
    // TS-only: no AS3 counterpart.
    setProbe(enabled: boolean): boolean
    {
        if(this._disposed || this._container.destroyed)
        {
            return false;
        }

        this._probeActive = enabled;
        this._probeGraphics.clear();
        this._probeGraphics.visible = enabled;

        this._container.mask = enabled ? null : this._floorMask;
        this._ambientSprite.visible = this._ambientSprite.visible && !enabled;
        this._shadowSprite.visible = this._shadowSprite.visible && !enabled;

        if(!enabled)
        {
            // Force the next update to redraw everything the probe overrode.
            this._floorSignature = -1;

            return true;
        }

        const bounds = this._floorBounds;

        if(bounds !== null)
        {
            // Where the layer believes the floor is.
            this._probeGraphics.rect(bounds.x, bounds.y, bounds.width, bounds.height);
            this._probeGraphics.fill({color: 0xFF00FF, alpha: 0.45});
        }

        // Where master-space (0,0) is — if this square is not at the room's top-left area, the
        // layer and the room are not in the same space.
        this._probeGraphics.rect(0, 0, 64, 64);
        this._probeGraphics.fill({color: 0x00FF00, alpha: 0.9});

        return true;
    }

    /**
     * Project a point the way this layer does, and hand back the result in **master space** — the
     * same space `RoomEngine.getRoomObjectScreenLocation()` answers in.
     *
     * Only for the projection comparison: two numbers computed from the same input by two different
     * routes is the one thing that can settle whether this layer is offset from the room, and by
     * how much. Reading either implementation on its own cannot.
     */
    // TS-only: no AS3 counterpart.
    projectToMaster(x: number, y: number, z: number): {x: number; y: number} | null
    {
        const local = {x: 0, y: 0};

        if(!this.project(x, y, local, z))
        {
            return null;
        }

        const display = this._canvas.container.getChildByLabel('canvas');
        const scale = display === null ? this._canvas.scale : display.scale.x;
        const offsetX = display === null ? this._canvas.screenOffsetX : display.x;
        const offsetY = display === null ? this._canvas.screenOffsetY : display.y;

        return {x: local.x * scale + offsetX, y: local.y * scale + offsetY};
    }

    /**
     * Report the layer's live state, including where a known floor tile actually projects to.
     *
     * The projection is the part that cannot be checked by reading: if tile (0,0) lands far outside
     * the viewport, or the mask ends up empty, the layer is working perfectly and drawing nothing.
     */
    // TS-only: no AS3 counterpart.
    describe(): Record<string, unknown>
    {
        // The debug panel polls this four times a second, so it can land in the one frame between
        // the canvas destroying our container and the controller noticing.
        if(!this.alive)
        {
            return {alive: false, disposed: this._disposed, destroyed: this._container.destroyed};
        }

        const probe = {x: 0, y: 0};
        const projected = this.project(gridToWorld(0), gridToWorld(0), probe) ? {x: probe.x, y: probe.y} : null;
        const projectedCentre = this.project(gridToWorld(5), gridToWorld(5), probe) ? {x: probe.x, y: probe.y} : null;

        return {
            attached: this._container.parent !== null,
            destroyed: this._container.destroyed,
            containerVisible: this._container.visible,
            probeActive: this._probeActive,
            // Copied from `_display` — these two must match `roomDisplay.x/y/scale` exactly.
            transform: {
                x: this._container.x,
                y: this._container.y,
                scaleX: this._container.scale.x,
                scaleY: this._container.scale.y
            },
            // The chain up to the root. If the room is on screen, this chain ends at whatever the
            // room canvas itself hangs from — a layer that renders nothing usually hangs elsewhere.
            ancestors: this.describeAncestors(),
            maskAssigned: this._container.mask !== null,
            maskBounds: this.describeBounds(this._floorMask),
            floorBounds: this._floorBounds,
            // The decisive comparison: where the room's own sprite list actually lands on screen,
            // against where this layer puts the same floor. Both hang off `_master`, so any delta
            // between them is a transform this layer is not accounting for.
            roomDisplay: this.describeRoomDisplay(),
            selfGlobalBounds: this.describeGlobalBounds(this._container),
            viewport: {width: this.viewportWidth, height: this.viewportHeight},
            ambient: {
                visible: this._ambientSprite.visible,
                alpha: this._ambientSprite.alpha,
                hasTexture: this._gradientTexture !== null
            },
            shadows: {
                visible: this._shadowSprite.visible,
                alpha: this._shadowSprite.alpha,
                hasTexture: this._shadowTexture !== null,
                bounds: this.describeBounds(this._shadowGraphics)
            },
            projection: {
                tile0x0: projected,
                tile5x5: projectedCentre
            }
        };
    }

    /**
     * Where the room's own sprite container sits, and where its first few sprites landed.
     *
     * `_display` is private on the canvas, so it is reached by the label the canvas gives it
     * ('canvas'). Read-only, and only for diagnostics — this must never become a way to drive the
     * layer off the ported class's internals.
     */
    // TS-only: no AS3 counterpart.
    private describeRoomDisplay(): Record<string, unknown> | null
    {
        const display = this._canvas.container.getChildByLabel('canvas');

        if(display === null)
        {
            return null;
        }

        const sprites: {x: number; y: number}[] = [];

        for(const child of display.children.slice(0, 3))
        {
            sprites.push({x: child.x, y: child.y});
        }

        return {
            x: display.x,
            y: display.y,
            scaleX: display.scale.x,
            scaleY: display.scale.y,
            childCount: display.children.length,
            globalBounds: this.describeGlobalBounds(display),
            firstSpriteLocalPositions: sprites
        };
    }

    // TS-only: no AS3 counterpart.
    private describeGlobalBounds(target: Container): Record<string, number> | null
    {
        if(target.destroyed)
        {
            return null;
        }

        const bounds = target.getBounds();

        return {x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height};
    }

    // TS-only: no AS3 counterpart.
    private describeAncestors(): {label: string; visible: boolean; alpha: number; x: number; y: number}[]
    {
        const chain: {label: string; visible: boolean; alpha: number; x: number; y: number}[] = [];

        let node: Container | null = this._container.parent;
        let depth = 0;

        while(node !== null && depth < 16)
        {
            chain.push({
                label: node.label ?? '(unlabelled)',
                visible: node.visible,
                alpha: node.alpha,
                x: node.x,
                y: node.y
            });

            node = node.parent;
            depth++;
        }

        return chain;
    }

    // TS-only: no AS3 counterpart.
    private describeBounds(target: Graphics): Record<string, number> | null
    {
        if(target.destroyed)
        {
            return null;
        }

        const bounds = target.getLocalBounds();

        return {x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height};
    }

    /** Cheap mix of everything that moves the projection. */
    // TS-only: no AS3 counterpart.
    cameraSignature(): number
    {
        const geometry = this._canvas.geometry;

        // Deliberately NOT screenOffsetX/Y. The geometry is projected in `_display`-local space, so
        // panning the room does not move a single local coordinate — it only moves the transform,
        // which `syncToRoomDisplay()` copies every frame. Including the offset here would rebuild
        // the mask and re-render the shadow texture on every mouse-move of a drag, for a picture
        // identical to the one already on screen.
        let signature = Math.round(this._canvas.scale * 1000) * 83492791;

        signature = (signature ^ (geometry.updateId * 2654435761)) | 0;
        signature = (signature ^ (Math.round(this.viewportWidth) * 40503)) | 0;
        signature = (signature ^ (Math.round(this.viewportHeight) * 51203)) | 0;

        return signature;
    }

    // TS-only: no AS3 counterpart.
    dispose(): void
    {
        if(this._disposed)
        {
            return;
        }

        this._disposed = true;

        // The canvas owns `_master` and destroys it with `{children: true}`. If it got there first
        // our container is already gone, and touching it throws — so every step below is guarded on
        // the container still being alive rather than on our own flag.
        const alive = !this._container.destroyed;

        if(alive)
        {
            this._container.mask = null;

            if(this._container.parent !== null)
            {
                this._container.parent.removeChild(this._container);
            }

            this._shadowSprite.texture = Texture.EMPTY;
            this._ambientSprite.texture = Texture.EMPTY;
        }

        if(this._shadowTexture !== null)
        {
            this._shadowTexture.destroy(true);
            this._shadowTexture = null;
        }

        if(this._ambientTexture !== null)
        {
            this._ambientTexture.destroy(true);
            this._ambientTexture = null;
        }

        // Before the scenes: `_cutouts` is re-parented between them at render time, so whichever
        // scene happens to hold it would otherwise destroy it and leave the other with a dangling
        // child on the next room.
        if(!this._cutouts.destroyed)
        {
            this._cutouts.parent?.removeChild(this._cutouts);
            this._cutouts.destroy({children: true});
        }

        if(!this._ambientScene.destroyed)
        {
            this._ambientScene.destroy({children: true});
        }

        if(this._gradientTexture !== null)
        {
            this._gradientTexture.destroy(true);
            this._gradientTexture = null;
        }

        if(!this._shadowScene.destroyed)
        {
            this._shadowScene.destroy({children: true});
        }

        if(!this._overlayGraphics.destroyed)
        {
            this._overlayGraphics.parent?.removeChild(this._overlayGraphics);
            this._overlayGraphics.destroy();
        }

        if(alive)
        {
            this._container.destroy({children: true});
        }
    }
}
