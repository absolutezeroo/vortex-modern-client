/**
 * Room lighting — lifecycle and light resolution.
 *
 * NOT A PORT. See LightingConfig.ts's header.
 *
 * Owns the layer's lifetime, decides where the light is, and drives recomputation off the Pixi
 * ticker at the configured cadence. It reads the engine and never writes to it: the ported room
 * pipeline is not aware this exists, and turning the feature off leaves not one line of it running.
 *
 * On finding the light: the moodlight object is located by scanning the room's wall objects for the
 * one whose logic is FurnitureRoomDimmerLogic, NOT by listening to RoomEngineDimmerStateEvent.
 * That event is dead in this port — FurnitureDimmerWidgetHandler registers for
 * RoomEngineDimmerStateEvent.CYCLED, but nothing anywhere constructs one, so it never fires.
 * Building on it would have produced a feature that silently never lights up.
 */
import type {Ticker} from 'pixi.js';
import {Vortex} from 'vortex-engine';
import type {RoomEngine} from '@habbo/room/RoomEngine';
import type {RoomRenderingCanvas} from '@habbo/room/renderer/RoomRenderingCanvas';
import type {IRoomObject} from '@room/object/IRoomObject';
import type {IRoomObjectSpriteVisualization} from '@room/object/visualization/IRoomObjectSpriteVisualization';
import type {RoomObject} from '@room/object/RoomObject';
import {RoomObjectCategoryEnum} from '@habbo/room/object/RoomObjectCategoryEnum';
import {RoomObjectVariableEnum} from '@habbo/room/object/RoomObjectVariableEnum';
import {FurnitureRoomDimmerLogic} from '@habbo/room/object/logic/furniture/FurnitureRoomDimmerLogic';
import {RoomEngineEvent} from '@habbo/room/events/RoomEngineEvent';
import {Logger} from '@core/utils/Logger';
import {LightingConfig} from './LightingConfig';
import {installLightingDebugger} from './LightingDebugPanel';
import {RoomLightingLayer} from './RoomLightingLayer';
import {buildOccluders, isFloorTile, worldToTile, type IOccluderData} from './OccluderGrid';
import {SpriteLighting, type ILitObject} from './SpriteLighting';
import type {ILightSource} from './types';

const log = Logger.getLogger('client.lighting.RoomLightingController');

/**
 * The dimmer's brightness as it arrives from the server. The slider's own range starts well above
 * zero, so a lit moodlight never reads as no light at all.
 */
const MAX_BRIGHTNESS = 255;

// TS-only: no AS3 counterpart; see the file header.
export class RoomLightingController
{
    // TS-only: no AS3 counterpart.
    private static _instance: RoomLightingController | null = null;

    // TS-only: no AS3 counterpart.
    private _layer: RoomLightingLayer | null = null;
    // TS-only: no AS3 counterpart.
    private _spriteLighting: SpriteLighting | null = null;
    // TS-only: no AS3 counterpart.
    private _layerCanvas: RoomRenderingCanvas | null = null;
    // TS-only: no AS3 counterpart.
    private _accumulator: number = 0;
    // TS-only: no AS3 counterpart.
    private _lastSignature: number = 0;
    // TS-only: no AS3 counterpart.
    private _configVersion: number = 0;
    // TS-only: no AS3 counterpart.
    private _unsubscribeConfig: (() => void) | null = null;
    // TS-only: no AS3 counterpart.
    private _tickHandler: ((ticker: Ticker) => void) | null = null;
    // TS-only: no AS3 counterpart.
    private _roomDisposedHandler: (() => void) | null = null;
    /** Ticks seen. If this stays at 0 the Pixi ticker is not driving us at all. */
    // TS-only: no AS3 counterpart.
    private _tickCount: number = 0;
    /** Times the layer was actually asked to redraw. */
    // TS-only: no AS3 counterpart.
    private _updateCount: number = 0;
    /** Why the last tick gave up, or null if it went all the way through. */
    // TS-only: no AS3 counterpart.
    private _lastBail: string | null = 'no tick yet';
    // TS-only: no AS3 counterpart.
    private _lastError: string | null = null;
    /** Lights refused by the cap last time, so the warning fires on change instead of per tick. */
    // TS-only: no AS3 counterpart.
    private _droppedLights: number = 0;
    // TS-only: no AS3 counterpart.
    private _uninstallDebugPanel: (() => void) | null = null;
    // TS-only: no AS3 counterpart.
    private _disposed: boolean = false;

    /**
     * Install the subsystem. Cheap and inert while disabled: one ticker callback that returns on
     * the first line, and nothing attached to the room.
     */
    // TS-only: no AS3 counterpart.
    static install(): RoomLightingController
    {
        if(RoomLightingController._instance !== null)
        {
            return RoomLightingController._instance;
        }

        const controller = new RoomLightingController();

        RoomLightingController._instance = controller;
        controller.attach();

        LightingConfig.registerDiagnostics(
            () => controller.diagnose(),
            (enabled: boolean) => controller.setProbe(enabled)
        );
        LightingConfig.installConsoleHandle();
        controller._uninstallDebugPanel = installLightingDebugger();

        return controller;
    }

    // TS-only: no AS3 counterpart.
    static get instance(): RoomLightingController | null
    {
        return RoomLightingController._instance;
    }

    // TS-only: no AS3 counterpart.
    private attach(): void
    {
        const vortex = Vortex.instance;

        this._tickHandler = (ticker: Ticker) => this.onTick(ticker.deltaMS);
        vortex.application.ticker.add(this._tickHandler);

        // The canvas goes away with the room; drop the layer with it rather than let the next room
        // inherit a container parented to a destroyed master.
        this._roomDisposedHandler = () => this.teardownLayer();
        vortex.roomEngine.events.on(RoomEngineEvent.REE_DISPOSED, this._roomDisposedHandler);

        this._unsubscribeConfig = LightingConfig.onChange(() =>
        {
            this._configVersion++;
            this._accumulator = Number.MAX_SAFE_INTEGER;

            if(!LightingConfig.enabled)
            {
                this.teardownLayer();
            }
        });

        log.debug('Room lighting installed (disabled by default)');
    }

    /**
     * One tick.
     *
     * Every early return records why in `_lastBail`, and a throw is caught and recorded rather than
     * left to be swallowed by the ticker. A subsystem that draws nothing must be able to say which
     * line it stopped on — `VortexLighting.diagnose()` reads these back.
     */
    // TS-only: no AS3 counterpart.
    private onTick(deltaMS: number): void
    {
        if(this._disposed)
        {
            return;
        }

        this._tickCount++;

        const config = LightingConfig.values;

        if(!config.enabled)
        {
            this._lastBail = 'disabled';

            return;
        }

        // Every frame, before the throttle: the room is draggable, and the layer has to move with
        // it at the room's own frame rate. This is two property writes — the expensive work below
        // stays throttled, and a pan does not trigger any of it.
        //
        // Running before the throttle also means running before anything has checked whether the
        // room still exists. The canvas destroys its master container — and every child, including
        // ours — on room change, so a dead layer has to be dropped here rather than written to.
        if(this._layer !== null)
        {
            if(this._layer.alive)
            {
                this._layer.syncToRoomDisplay();
            }
            else
            {
                this._lastBail = 'layer container was destroyed by the canvas; rebuilding';
                this.teardownLayer();
            }
        }

        this._accumulator += deltaMS;

        if(this._accumulator < config.updateIntervalMs)
        {
            return;
        }

        this._accumulator = 0;

        try
        {
            this.runUpdate();
        }
        catch (error)
        {
            this._lastError = error instanceof Error ? `${error.message}\n${error.stack ?? ''}` : String(error);
            this._lastBail = 'threw';
            log.error('Room lighting update failed; disabling to avoid spamming the ticker', error);
            LightingConfig.set({enabled: false});
        }
    }

    // TS-only: no AS3 counterpart.
    private runUpdate(): void
    {
        const config = LightingConfig.values;
        const engine = Vortex.instance.roomEngine;
        const roomId = engine.activeRoomId;
        const canvas = engine.getRenderingCanvas(roomId, 1);

        if(canvas === null || canvas.disposed)
        {
            this._lastBail = canvas === null
                ? `no rendering canvas for room ${roomId} (canvasId 1)`
                : `rendering canvas for room ${roomId} is disposed`;
            this.teardownLayer();

            return;
        }

        if(this._layer === null || this._layerCanvas !== canvas)
        {
            this.teardownLayer();

            this._layer = new RoomLightingLayer(canvas, Vortex.instance.application.renderer);
            this._spriteLighting = new SpriteLighting(canvas);
            this._layerCanvas = canvas;
            this._lastSignature = 0;
        }

        const heightMap = engine.getFurniStackingHeightMap(roomId);

        if(heightMap === null)
        {
            this._lastBail = `no furni stacking height map for room ${roomId}`;
        }

        const occluders = buildOccluders(
            heightMap,
            config.minCasterHeight,
            config.avatarsCastShadows ? this.collectAvatarTiles(engine, roomId) : []
        );
        const lights = this.resolveLights(engine, roomId, occluders);

        if(lights.length === 0)
        {
            this._lastBail = occluders.width === 0
                ? 'no light: the room has no height map, so not even the debug light has a floor'
                : 'no light: no moodlight, no glowing furniture, and debugLight is off';
        }
        else if(heightMap !== null)
        {
            this._lastBail = null;
        }

        const litObjects = this.collectLitObjects(engine, roomId);

        // How lit each object is, computed once and used twice: the layer scales each silhouette by
        // it, so a caster in shade throws a faint shadow or none at all instead of a full black one
        // on top of somebody else's.
        const illuminations = new Map<string, number>();

        for(const object of litObjects)
        {
            const darkness = SpriteLighting.computeDarkness(lights, occluders, object.x, object.y, object.instanceId);

            illuminations.set(object.instanceId, 1 - darkness);
        }

        // Before the signature gate, deliberately. Objects move without changing the occluder grid —
        // an avatar walking across open floor, a sprite the renderer has just repainted — and the
        // tints have to follow them. This pass writes properties, it does not redraw anything.
        if(this._spriteLighting !== null)
        {
            this._spriteLighting.apply(lights, occluders, litObjects);
        }

        let signature = this.computeSignature(lights, occluders, this._layer.cameraSignature());

        // Silhouettes are drawn from the casters' own positions, so the shadow texture has to be
        // rebuilt whenever one of them moves — which the occluder grid only notices when the move
        // crosses a tile boundary.
        if(LightingConfig.values.silhouetteShadows)
        {
            signature = (signature * 31 + RoomLightingController.hashPositions(litObjects)) | 0;
        }

        if(signature === this._lastSignature)
        {
            return;
        }

        this._lastSignature = signature;
        this._updateCount++;
        this._layer.update(lights, occluders, litObjects, illuminations);
    }

    /**
     * Draw an unmissable marker in the layer, mask removed. Answers whether the container reaches
     * the screen at all — the one thing no amount of reported state can settle.
     */
    // TS-only: no AS3 counterpart.
    setProbe(enabled: boolean): string
    {
        if(this._layer === null)
        {
            return 'no layer yet — enter a room with lighting enabled first';
        }

        this._layer.setProbe(enabled);

        return enabled
            ? 'probe on: look for a magenta rectangle over the floor and a green square at master (0,0)'
            : 'probe off';
    }

    /**
     * Every furniture and wall object with the blend modes its sprites actually use.
     *
     * The emitter test is a heuristic over this data, so when a room lights the wrong things the
     * question is never "is the code right" but "what does this room contain". Nothing short of
     * this listing answers that: a lamp that is not detected and a rug that is look identical from
     * the outside.
     */
    // TS-only: no AS3 counterpart.
    dumpObjects(): Record<string, unknown>[]
    {
        const engine = Vortex.instance.roomEngine;
        const roomId = engine.activeRoomId;
        const rows: Record<string, unknown>[] = [];
        const categories: {label: string; value: number}[] = [
            {label: 'furniture', value: RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE},
            {label: 'wall', value: RoomObjectCategoryEnum.OBJECT_CATEGORY_WALL}
        ];

        for(const category of categories)
        {
            const count = engine.getRoomObjectCount(roomId, category.value);

            for(let index = 0; index < count; index++)
            {
                const object = engine.getRoomObjectWithIndex(roomId, index, category.value);

                if(object === null)
                {
                    continue;
                }

                const visualization = object.getVisualization() as IRoomObjectSpriteVisualization | null;
                const blendModes: string[] = [];
                const hidden: string[] = [];

                if(visualization !== null && typeof visualization.spriteCount === 'number')
                {
                    for(let spriteIndex = 0; spriteIndex < visualization.spriteCount; spriteIndex++)
                    {
                        const sprite = visualization.getSprite(spriteIndex);

                        if(sprite === null)
                        {
                            continue;
                        }

                        // Split them: a lamp whose glow layer exists but is not drawn is a very
                        // different finding from one that has no glow layer at all.
                        (sprite.visible ? blendModes : hidden).push(`${spriteIndex}:${sprite.blendMode}`);
                    }
                }

                const location = object.getLocation();

                rows.push({
                    id: String(object.getInstanceId()),
                    category: category.label,
                    typeId: object.getModel().getNumber(RoomObjectVariableEnum.FURNITURE_TYPE_ID),
                    tile: `${location.x.toFixed(1)},${location.y.toFixed(1)},${location.z.toFixed(1)}`,
                    emitting: RoomLightingController.findEmittingSprite(object) >= 0,
                    visibleSprites: blendModes.join(' '),
                    hiddenSprites: hidden.join(' ')
                });
            }
        }

        return rows;
    }

    /**
     * The layer's projection against the engine's own, for every object in the room.
     *
     * `RoomEngine.getRoomObjectScreenLocation()` is authoritative: it is what the rest of the client
     * uses to place things over the room. Feeding both it and this layer the **same** location and
     * subtracting is the only way to answer "is the lighting offset, and by how much" — the two
     * implementations agreeing on a shape while disagreeing on a translation is exactly what a
     * missing term looks like, and it is invisible in a screenshot.
     *
     * A constant non-zero delta across every object means one missing term. A delta that grows with
     * distance means a scale problem. A delta that is zero here means the geometry is right and the
     * fault is in what gets drawn.
     */
    // TS-only: no AS3 counterpart.
    compareProjection(): Record<string, unknown>[]
    {
        const engine = Vortex.instance.roomEngine;
        const roomId = engine.activeRoomId;
        const layer = this._layer;
        const rows: Record<string, unknown>[] = [];

        if(layer === null || !layer.alive)
        {
            return [{note: 'no live layer — enter a room with lighting enabled'}];
        }

        const categories: {label: string; value: number}[] = [
            {label: 'furniture', value: RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE},
            {label: 'wall', value: RoomObjectCategoryEnum.OBJECT_CATEGORY_WALL},
            {label: 'user', value: RoomObjectCategoryEnum.OBJECT_CATEGORY_USER}
        ];

        for(const category of categories)
        {
            const count = engine.getRoomObjectCount(roomId, category.value);

            for(let index = 0; index < count; index++)
            {
                const object = engine.getRoomObjectWithIndex(roomId, index, category.value);

                if(object === null)
                {
                    continue;
                }

                const objectId = object.getId();
                const location = object.getLocation();
                const engineScreen = engine.getRoomObjectScreenLocation(roomId, objectId, category.value, 1);
                const mine = layer.projectToMaster(location.x, location.y, location.z);

                rows.push({
                    id: String(object.getInstanceId()),
                    category: category.label,
                    location: `${location.x.toFixed(2)},${location.y.toFixed(2)},${location.z.toFixed(2)}`,
                    engine: engineScreen === null ? '-' : `${engineScreen.x.toFixed(1)},${engineScreen.y.toFixed(1)}`,
                    layer: mine === null ? '-' : `${mine.x.toFixed(1)},${mine.y.toFixed(1)}`,
                    deltaX: engineScreen === null || mine === null ? '-' : (mine.x - engineScreen.x).toFixed(2),
                    deltaY: engineScreen === null || mine === null ? '-' : (mine.y - engineScreen.y).toFixed(2)
                });
            }
        }

        return rows;
    }

    /**
     * Walk the whole path once, right now, and report what each step found.
     *
     * This exists because the subsystem's failure mode is silence: every step degrades to "draw
     * nothing" rather than throwing, so reading the code tells you less than one call of this does.
     */
    // TS-only: no AS3 counterpart.
    diagnose(): Record<string, unknown>
    {
        const engine = Vortex.instance.roomEngine;
        const roomId = engine.activeRoomId;
        const canvas = engine.getRenderingCanvas(roomId, 1);
        const heightMap = engine.getFurniStackingHeightMap(roomId);
        const occluders = buildOccluders(heightMap, LightingConfig.values.minCasterHeight);
        const lights = this.resolveLights(engine, roomId, occluders);

        return {
            config: {...LightingConfig.values},
            ticker: {
                ticks: this._tickCount,
                redraws: this._updateCount,
                running: Vortex.instance.application.ticker.started,
                lastBail: this._lastBail,
                lastError: this._lastError
            },
            room: {
                activeRoomId: roomId,
                canvas: canvas === null ? null : {
                    disposed: canvas.disposed,
                    scale: canvas.scale,
                    width: canvas.width,
                    height: canvas.height,
                    screenOffsetX: canvas.screenOffsetX,
                    screenOffsetY: canvas.screenOffsetY,
                    containerInStage: canvas.container.parent !== null
                }
            },
            heightMap: heightMap === null ? null : {width: heightMap.width, height: heightMap.height},
            occluders: {
                width: occluders.width,
                height: occluders.height,
                segments: occluders.segments.length,
                floorRuns: occluders.floorRuns.length,
                firstSegments: occluders.segments.slice(0, 4),
                firstFloorRuns: occluders.floorRuns.slice(0, 4)
            },
            lights,
            layer: this._layer === null ? null : this._layer.describe(),
            spriteLighting: this._spriteLighting === null ? null : this._spriteLighting.describe()
        };
    }

    /**
     * Where the light is.
     *
     * The moodlight if the room has one, the room's centre if `debugLight` is on (so the effect can
     * be judged in a room with no dimmer furniture), otherwise nothing — and nothing means the
     * layer draws nothing at all, not a dark room.
     */
    // TS-only: no AS3 counterpart.
    private resolveLights(engine: RoomEngine, roomId: number, occluders: IOccluderData): ILightSource[]
    {
        const config = LightingConfig.values;
        const lights: ILightSource[] = [];
        const dimmer = this.findDimmerObject(engine, roomId);

        if(dimmer !== null)
        {
            const location = dimmer.getLocation();

            // No half-tile nudge: tiles are centred on integers, so an object's own location is
            // already its tile's centre. A moodlight hangs on a wall, though, so that centre lands
            // where there is no floor — and a light inside an occluder puts the whole room in its
            // own shadow. Snap it in.
            const snapped = this.snapToFloor(occluders, location.x, location.y);

            if(snapped !== null)
            {
                lights.push({
                    x: snapped.x,
                    y: snapped.y,
                    intensity: 1,
                    radiusTiles: config.lightRadiusTiles,
                    heightTiles: Math.max(0.1, location.z + config.lightHeightTiles),
                    sourceId: String(dimmer.getInstanceId()),
                    kind: 'dimmer',
                    rawX: location.x,
                    rawY: location.y,
                    matchedSprite: -1
                });
            }
        }

        if(config.furnitureEmitsLight)
        {
            lights.push(...this.collectEmitterLights(engine, roomId, occluders));
        }

        if(lights.length === 0 && config.debugLight && occluders.width > 0 && occluders.height > 0)
        {
            // The geometric centre of the grid is not necessarily a tile you could stand on.
            const centre = this.snapToFloor(occluders, occluders.width / 2, occluders.height / 2);

            if(centre !== null)
            {
                lights.push({
                    x: centre.x,
                    y: centre.y,
                    intensity: 1,
                    radiusTiles: config.lightRadiusTiles,
                    heightTiles: Math.max(0.1, config.lightHeightTiles),
                    sourceId: 'debug',
                    kind: 'debug',
                    rawX: occluders.width / 2,
                    rawY: occluders.height / 2,
                    matchedSprite: -1
                });
            }
        }

        if(lights.length <= config.maxLights)
        {
            return lights;
        }

        // Each light is a pass. Keep the ones nearest the middle of the room, where they are most
        // likely to be on screen, and say how many were dropped rather than truncating in silence.
        const centreX = occluders.width / 2;
        const centreY = occluders.height / 2;

        lights.sort((a, b) =>
            Math.hypot(a.x - centreX, a.y - centreY) - Math.hypot(b.x - centreX, b.y - centreY));

        const dropped = lights.length - config.maxLights;

        if(dropped !== this._droppedLights)
        {
            this._droppedLights = dropped;
            log.warn(`${dropped} light(s) over the maxLights cap of ${config.maxLights} are not rendered`);
        }

        return lights.slice(0, config.maxLights);
    }

    /**
     * Every furni that glows, as a light.
     *
     * The test is the additive blend mode on a visible sprite. In the visualization data a layer
     * carries `ink`, and `FurnitureVisualization.getBlendMode()` maps `ink === 1` to `'add'` — the
     * additive layer artists use for a glow. So a lamp lights the room because its own art says it
     * is emitting, with no name matching and no per-furni table to maintain.
     */
    // TS-only: no AS3 counterpart.
    private collectEmitterLights(engine: RoomEngine, roomId: number, occluders: IOccluderData): ILightSource[]
    {
        const config = LightingConfig.values;
        const lights: ILightSource[] = [];
        const categories = [
            RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE,
            RoomObjectCategoryEnum.OBJECT_CATEGORY_WALL
        ];

        for(const category of categories)
        {
            const count = engine.getRoomObjectCount(roomId, category);

            for(let index = 0; index < count; index++)
            {
                const object = engine.getRoomObjectWithIndex(roomId, index, category);

                if(object === null)
                {
                    continue;
                }

                const matchedSprite = RoomLightingController.findEmittingSprite(object);

                if(matchedSprite < 0)
                {
                    continue;
                }

                const location = object.getLocation();
                const snapped = this.snapToFloor(occluders, location.x, location.y);

                if(snapped === null)
                {
                    continue;
                }

                lights.push({
                    x: snapped.x,
                    y: snapped.y,
                    intensity: 1,
                    // A furni reports the height it sits at, not where its glow is; the offset
                    // stands in for the bulb being above the base.
                    radiusTiles: config.furnitureLightRadius,
                    heightTiles: Math.max(0.1, location.z + config.lightHeightTiles),
                    sourceId: String(object.getInstanceId()),
                    kind: 'furni',
                    rawX: location.x,
                    rawY: location.y,
                    matchedSprite
                });
            }
        }

        return lights;
    }

    /**
     * Index of the first visible additive sprite on this object, or -1.
     *
     * **This is a heuristic, not a fact about the data.** An additive layer (`ink === 1`) means
     * "draw this additively", which artists use for glow but equally for gloss, glass and
     * highlights — and a lamp whose lit look is painted into its texture carries no additive layer
     * at all. It over-triggers and under-triggers, both observed. The index is returned rather than
     * a boolean so `diagnose()` can say which sprite caused a match, because deciding whether a
     * given room is being read correctly is not something reading this code can settle.
     *
     * `visible` still matters: a lamp that is switched off keeps its glow layer and stops drawing
     * it, so ignoring that would light the room from every unlit lamp in it.
     */
    // TS-only: no AS3 counterpart.
    private static findEmittingSprite(object: IRoomObject): number
    {
        const visualization = object.getVisualization() as IRoomObjectSpriteVisualization | null;

        if(visualization === null || typeof visualization.spriteCount !== 'number')
        {
            return -1;
        }

        for(let index = 0; index < visualization.spriteCount; index++)
        {
            const sprite = visualization.getSprite(index);

            if(sprite !== null && sprite.visible && sprite.blendMode === 'add')
            {
                return index;
            }
        }

        return -1;
    }

    /**
     * Every object that should be lit individually, with its tile.
     *
     * The room object itself (`OBJECT_CATEGORY_ROOM`) is deliberately absent: the floor and each
     * wall are single large sprites, and one tint across the whole floor would flatten it. Those
     * keep the floor overlay, which shades them per pixel.
     *
     * The identity is `getInstanceId()` as a string, because that is exactly what the renderer uses
     * as its object key (`RoomRenderer.getRoomObjectIdentifier()`) and therefore what ends up on
     * each `ExtendedSprite.identifier`.
     */
    // TS-only: no AS3 counterpart.
    private collectLitObjects(engine: RoomEngine, roomId: number): ILitObject[]
    {
        const objects: ILitObject[] = [];
        const categories = [
            RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE,
            RoomObjectCategoryEnum.OBJECT_CATEGORY_WALL,
            RoomObjectCategoryEnum.OBJECT_CATEGORY_USER
        ];

        for(const category of categories)
        {
            const count = engine.getRoomObjectCount(roomId, category);

            for(let index = 0; index < count; index++)
            {
                const object = engine.getRoomObjectWithIndex(roomId, index, category);

                if(object === null)
                {
                    continue;
                }

                const location = object.getLocation();

                objects.push({
                    instanceId: String(object.getInstanceId()),
                    x: location.x,
                    y: location.y
                });
            }
        }

        return objects;
    }

    /**
     * The tiles avatars are standing on.
     *
     * Avatars never reach the furniture stacking height map — that map is fed by the HeightMap
     * message and tracks furniture only — so a room full of people casts no shadows at all unless
     * they are collected separately from the room object list.
     */
    // TS-only: no AS3 counterpart.
    private collectAvatarTiles(engine: RoomEngine, roomId: number): {x: number; y: number}[]
    {
        const tiles: {x: number; y: number}[] = [];
        const category = RoomObjectCategoryEnum.OBJECT_CATEGORY_USER;
        const count = engine.getRoomObjectCount(roomId, category);

        for(let index = 0; index < count; index++)
        {
            const object = engine.getRoomObjectWithIndex(roomId, index, category);

            if(object === null)
            {
                continue;
            }

            const location = object.getLocation();

            tiles.push({x: location.x, y: location.y});
        }

        return tiles;
    }

    /**
     * Move a light onto the nearest floor tile, searching outward in square rings.
     *
     * Returns null when the room has no floor within reach, which is the honest answer for a light
     * that cannot illuminate anything.
     */
    // TS-only: no AS3 counterpart.
    private snapToFloor(occluders: IOccluderData, x: number, y: number): {x: number; y: number} | null
    {
        // Round, not floor: tiles are centred on integers, so world 5.6 is inside tile 6.
        const tileX = worldToTile(x);
        const tileY = worldToTile(y);

        if(isFloorTile(occluders, tileX, tileY))
        {
            return {x, y};
        }

        const maxRadius = Math.max(occluders.width, occluders.height);

        for(let radius = 1; radius <= maxRadius; radius++)
        {
            for(let offsetY = -radius; offsetY <= radius; offsetY++)
            {
                for(let offsetX = -radius; offsetX <= radius; offsetX++)
                {
                    // Ring only: the interior was covered by the previous, smaller radius.
                    if(Math.abs(offsetX) !== radius && Math.abs(offsetY) !== radius)
                    {
                        continue;
                    }

                    if(isFloorTile(occluders, tileX + offsetX, tileY + offsetY))
                    {
                        // The tile index *is* its centre in world space.
                        return {x: tileX + offsetX, y: tileY + offsetY};
                    }
                }
            }
        }

        return null;
    }

    /**
     * Find the moodlight by its logic. Wall first — that is where a moodlight hangs — then floor,
     * because nothing in the port guarantees the category for every dimmer-shaped item.
     */
    // TS-only: no AS3 counterpart.
    private findDimmerObject(engine: RoomEngine, roomId: number): IRoomObject | null
    {
        const categories = [
            RoomObjectCategoryEnum.OBJECT_CATEGORY_WALL,
            RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE
        ];

        for(const category of categories)
        {
            const count = engine.getRoomObjectCount(roomId, category);

            for(let index = 0; index < count; index++)
            {
                const object = engine.getRoomObjectWithIndex(roomId, index, category);

                if(object === null)
                {
                    continue;
                }

                const handler = (object as RoomObject).getEventHandler?.();

                if(handler instanceof FurnitureRoomDimmerLogic)
                {
                    return object;
                }
            }
        }

        return null;
    }

    /**
     * Sub-tile positions of every caster, mixed into one number.
     *
     * Quantised to a sixteenth of a tile: fine enough that a walking avatar's shadow follows it
     * smoothly, coarse enough that a stationary room stops redrawing.
     */
    // TS-only: no AS3 counterpart.
    private static hashPositions(objects: readonly ILitObject[]): number
    {
        let hash = objects.length;

        for(const object of objects)
        {
            hash = (hash * 31 + Math.round(object.x * 16)) | 0;
            hash = (hash * 31 + Math.round(object.y * 16)) | 0;
        }

        return hash;
    }

    /** Everything that would change the picture, mixed into one comparable number. */
    // TS-only: no AS3 counterpart.
    private computeSignature(lights: readonly ILightSource[], occluders: IOccluderData, cameraSignature: number): number
    {
        let signature = (occluders.signature ^ cameraSignature) | 0;

        signature = (signature * 31 + this._configVersion) | 0;
        signature = (signature * 31 + lights.length) | 0;

        for(const light of lights)
        {
            signature = (signature * 31 + Math.round(light.x * 16)) | 0;
            signature = (signature * 31 + Math.round(light.y * 16)) | 0;
            signature = (signature * 31 + Math.round(light.intensity * MAX_BRIGHTNESS)) | 0;
            signature = (signature * 31 + Math.round(light.radiusTiles * 16)) | 0;
        }

        return signature;
    }

    // TS-only: no AS3 counterpart.
    private teardownLayer(): void
    {
        // Before the layer: this is what puts the renderer's own tints back, and it has to happen
        // whether the feature was switched off, the room changed, or the whole thing was disposed.
        if(this._spriteLighting !== null)
        {
            this._spriteLighting.dispose();
            this._spriteLighting = null;
        }

        if(this._layer !== null)
        {
            this._layer.dispose();
            this._layer = null;
        }

        this._layerCanvas = null;
        this._lastSignature = 0;
    }

    // TS-only: no AS3 counterpart.
    dispose(): void
    {
        if(this._disposed)
        {
            return;
        }

        this._disposed = true;

        this._uninstallDebugPanel?.();
        this._uninstallDebugPanel = null;

        LightingConfig.registerDiagnostics(null);
        this.teardownLayer();

        if(this._tickHandler !== null)
        {
            Vortex.instance.application.ticker.remove(this._tickHandler);
            this._tickHandler = null;
        }

        if(this._roomDisposedHandler !== null)
        {
            Vortex.instance.roomEngine.events.off(RoomEngineEvent.REE_DISPOSED, this._roomDisposedHandler);
            this._roomDisposedHandler = null;
        }

        if(this._unsubscribeConfig !== null)
        {
            this._unsubscribeConfig();
            this._unsubscribeConfig = null;
        }

        if(RoomLightingController._instance === this)
        {
            RoomLightingController._instance = null;
        }
    }
}
