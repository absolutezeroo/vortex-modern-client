/**
 * RoomRenderingCanvas
 *
 * Based on AS3: com.sulake.room.renderer.RoomSpriteCanvas (class_3523)
 *
 * Main rendering canvas for room visualization.
 * Owns a flat display list of ExtendedSprite children.
 * Each frame: reads sprite data from visualizations, builds a SortableSprite list,
 * sorts by Z, and creates/updates canvas-owned ExtendedSprite display objects.
 * Hit-testing iterates ExtendedSprite children backwards (front to back).
 *
 * @see sources/win63_version/room/renderer/class_3523.as
 */
import {Container, Graphics, Texture, type Renderer} from 'pixi.js';
import type {IRoomGeometry} from '@room/utils/IRoomGeometry';
import type {IRoomObjectSpriteVisualization} from '@room/object/visualization/IRoomObjectSpriteVisualization';
import type {IRoomObject} from '@room/object/IRoomObject';
import type {IRoomRenderingCanvas as IRoomRenderingCanvasInterface} from '@room/renderer/IRoomRenderingCanvas';
import type {IRoomRenderingCanvasMouseListener} from '@room/renderer/IRoomRenderingCanvasMouseListener';
import type {IRoomSpriteCanvasContainer} from '@room/renderer/IRoomSpriteCanvasContainer';
import {RoomGeometry} from '@room/utils/RoomGeometry';
import {RoomSpriteMouseEvent} from '@room/events/RoomSpriteMouseEvent';
import {Vector3d} from '@room/utils/Vector3d';
import {RoomEnterEffect} from '@room/utils/RoomEnterEffect';
import {RoomObjectSpriteType} from '@room/object/enum/RoomObjectSpriteType';
import {ExtendedSprite} from './utils/ExtendedSprite';
import {SortableSprite} from './utils/SortableSprite';
import {ObjectMouseData} from './utils/ObjectMouseData';

export type {IRoomRenderingCanvasMouseListener};

const SKIP_FRAME_COUNT_FOR_UPDATE_INTERVAL = 50;
const FRAME_COUNT_FOR_UPDATE_INTERVAL = 50;
const SLOW_FRAME_UPDATE_INTERVAL = 60;
const FAST_FRAME_UPDATE_INTERVAL = 50;
const MAXIMUM_VALID_FRAME_UPDATE_INTERVAL = 1000;
const REALLY_SLOW_FRAME_UPDATE_INTERVAL = 60 * 3;

interface IObjectSpriteCache
{
    initialized: boolean;
    instanceId: number;
    updateId: number;
    geometryUpdateId: number;
    objectUpdateId: number;
    objectUpdateLoc: Vector3d;
    screenLoc: Vector3d;
    roundedLoc: Vector3d;
    locationChanged: boolean;
    screenX: number;
    screenY: number;
    screenZ: number;
    spriteCount: number;
    sprites: SortableSprite[];
}

/**
 * Stored visualization entry — visualization + its room object.
 */
export class RoomRenderingCanvas implements IRoomRenderingCanvasInterface
{
    private static compareSortableSprites(a: SortableSprite, b: SortableSprite): number
    {
        return b.z - a.z;
    }

    private _sortableSpriteList: SortableSprite[] = [];
    private _objectSpriteCaches: Map<string, IObjectSpriteCache> = new Map();
    private _spritePool: ExtendedSprite[] = [];
    private _spriteCount: number = 0;
    private _activeSpriteCount: number = 0;
    private _mouseActiveObjects: Map<string, ObjectMouseData> = new Map();
    private _eventCache: Map<string, RoomSpriteMouseEvent> = new Map();
    private _mouseLocationX: number = 0;
    private _mouseLocationY: number = 0;
    private _mouseOldX: number = -10000000;
    private _mouseOldY: number = -10000000;
    private _mouseCheckCount: number = 0;
    private _mouseSpriteWasHit: boolean = false;
    private _eventId: number = 0;
    private _renderTimeStamp: number = -1;
    private _skipObjectUpdate: boolean = false;
    private _runningSlow: boolean = false;
    private _updateIntervalFrameCount: number = 0;
    private _averageUpdateInterval: number = 0;
    private _averageRenderTime: number = 0;
    private _lastRenderTime: number = 0;
    private _haltedFrameInterval: number = 0;
    private _skipSpriteVisibilityChecking: boolean = false;
    private _useExclusionRects: boolean = false;
    private _exclusionRects: {left: number; top: number; right: number; bottom: number}[] = [];
    private _fpsCounterEnabled: boolean = false;
    private _useMask: boolean = false;
    private _displayTransformDirty: boolean = true;
    private _lastRenderedWidth: number = -1;
    private _lastRenderedHeight: number = -1;

    private readonly _roomObjectContainer: IRoomSpriteCanvasContainer;
    private readonly _master: Container;
    private readonly _display: Container;
    private _spriteMask: Graphics | null = null;
    private readonly _id: number;

    constructor(container: IRoomSpriteCanvasContainer, id: number, width: number, height: number, scale: number)
    {
        this._roomObjectContainer = container;
        this._id = id;
        this._width = width;
        this._height = height;
        // AS3: _scale = 1 (display scale), _Str_6356 = scale (geometry scale)
        this._scale = 1;

        // AS3: _master = new Sprite(), _display = new Sprite() added to _master
        this._master = new Container();
        this._master.label = `RoomRenderingCanvas_${id}`;
        this._master.eventMode = 'none';
        this._master.interactiveChildren = false;

        this._display = new Container();
        this._display.label = 'canvas';
        this._display.eventMode = 'none';
        this._display.interactiveChildren = false;
        this._display.sortableChildren = false;
        this._master.addChild(this._display);

        // Create geometry with default direction (isometric view)
        this._geometry = new RoomGeometry(
            scale,
            new Vector3d(-135, 30, 0),
            new Vector3d(11, 11, 5),
            new Vector3d(-135, 0.5, 0)
        );
    }

    get id(): number
    {
        return this._id;
    }

    private _geometry: RoomGeometry;

    get geometry(): RoomGeometry
    {
        return this._geometry;
    }

    private _width: number = 0;

    get width(): number
    {
        return this._width * this._scale;
    }

    private _height: number = 0;

    get height(): number
    {
        return this._height * this._scale;
    }

    private _screenOffsetX: number = 0;

    get screenOffsetX(): number
    {
        return this._screenOffsetX;
    }

    set screenOffsetX(value: number)
    {
        if(value === this._screenOffsetX)
        {
            return;
        }

        this._mouseLocationX -= (value - this._screenOffsetX);
        this._screenOffsetX = value;
        this._displayTransformDirty = true;
    }

    private _screenOffsetY: number = 0;

    get screenOffsetY(): number
    {
        return this._screenOffsetY;
    }

    set screenOffsetY(value: number)
    {
        if(value === this._screenOffsetY)
        {
            return;
        }

        this._mouseLocationY -= (value - this._screenOffsetY);
        this._screenOffsetY = value;
        this._displayTransformDirty = true;
    }

    private _scale: number = 1;

    get scale(): number
    {
        return this._scale;
    }

    private _mouseListener: IRoomRenderingCanvasMouseListener | null = null;

    get mouseListener(): IRoomRenderingCanvasMouseListener | null
    {
        return this._mouseListener;
    }

    set mouseListener(value: IRoomRenderingCanvasMouseListener | null)
    {
        this._mouseListener = value;
    }

    // AS3: sources/win63_version/room/renderer/class_3523.as::get useMask()
    get useMask(): boolean
    {
        return this._useMask;
    }

    // AS3: sources/win63_version/room/renderer/class_3523.as::set useMask()
    set useMask(value: boolean)
    {
        if(value === this._useMask)
        {
            return;
        }

        this._useMask = value;
        this.updateMask();
    }

    // AS3: sources/win63_version/room/renderer/class_3523.as::get fpsCounterEnabled()
    get fpsCounterEnabled(): boolean
    {
        return this._fpsCounterEnabled;
    }

    // AS3: sources/win63_version/room/renderer/class_3523.as::set fpsCounterEnabled()
    set fpsCounterEnabled(value: boolean)
    {
        this._fpsCounterEnabled = value;
        // TODO(AS3): sources/win63_version/room/renderer/class_3523.as fpsCounterEnabled
        // Flash draws TextField overlays with FPS/render/memory data. Keep the public
        // API for parity; no Pixi overlay is created yet.
    }

    /**
	 * Renders the room at 1:1 scale with no screen offset and captures it to a
	 * canvas. The AS3 version also lowers Stage.quality for the capture and
	 * restores it afterward; PixiJS has no per-render quality knob, so that
	 * step is dropped as a non-portable Flash-ism.
	 *
	 * @see sources/win63_version/room/renderer/class_3523.as::takeScreenShot() line 313
	 */
    // AS3: sources/win63_version/room/renderer/class_3523.as::takeScreenShot()
    takeScreenShot(renderer: Renderer): HTMLCanvasElement
    {
        this._skipSpriteVisibilityChecking = true;

        const savedScale = this._scale;
        const savedOffsetX = this._screenOffsetX;
        const savedOffsetY = this._screenOffsetY;

        this.setScale(1);
        this._screenOffsetX = 0;
        this._screenOffsetY = 0;

        this.render(-1, true);

        const canvas = renderer.extract.canvas(this._display) as HTMLCanvasElement;

        this._skipSpriteVisibilityChecking = false;
        this.setScale(savedScale);
        this._screenOffsetX = savedOffsetX;
        this._screenOffsetY = savedOffsetY;

        return canvas;
    }

    // AS3: sources/win63_version/room/renderer/class_3523.as::skipSpriteVisibilityChecking()
    skipSpriteVisibilityChecking(): void
    {
        this._skipSpriteVisibilityChecking = true;
        this.render(-1, true);
    }

    // AS3: sources/win63_version/room/renderer/class_3523.as::resumeSpriteVisibilityChecking()
    resumeSpriteVisibilityChecking(): void
    {
        this._skipSpriteVisibilityChecking = false;
        this._displayTransformDirty = true;
    }

    private _disposed: boolean = false;

    get disposed(): boolean
    {
        return this._disposed;
    }

    /**
	 * The display container (added to PixiJS stage).
	 * AS3: get displayObject() returns _master.
	 */
    get container(): Container
    {
        return this._master;
    }

    /**
	 * Initialize canvas dimensions.
	 * AS3: initialize(width, height)
	 */
    initialize(width: number, height: number): void
    {
        if(width < 1) width = 1;
        if(height < 1) height = 1;
        this._width = width;
        this._height = height;
        this.updateMask();
        this._displayTransformDirty = true;
    }

    // AS3: sources/win63_version/room/renderer/class_3523.as::initialize()
    // Creates/updates a Sprite named "mask" and assigns it to _display.mask when
    // useMask is enabled.
    private updateMask(): void
    {
        if(this._spriteMask === null)
        {
            this._spriteMask = new Graphics();
            this._spriteMask.label = 'mask';
        }

        this._spriteMask.clear();
        this._spriteMask.rect(0, 0, this._width, this._height);
        this._spriteMask.fill(0);

        if(this._useMask)
        {
            if(this._spriteMask.parent !== this._master)
            {
                this._master.addChild(this._spriteMask);
            }

            this._display.mask = this._spriteMask;
        }
        else
        {
            if(this._spriteMask.parent === this._master)
            {
                this._master.removeChild(this._spriteMask);
            }

            this._display.mask = null;
        }
    }

    /**
	 * Set the display zoom scale.
	 * AS3: class_3523.setScale() updates var_337 only and does not recreate RoomGeometry.
	 */
    setScale(
        scale: number,
        point: { x: number; y: number } | null = null,
        offset: { x: number; y: number } | null = null
    ): void
    {
        if(scale === this._scale) return;

        if(point === null)
        {
            point = { x: this._width / 2, y: this._height / 2 };
        }

        if(offset === null)
        {
            offset = point;
        }

        const localX = (point.x - this._master.x - this._screenOffsetX) / this._scale;
        const localY = (point.y - this._master.y - this._screenOffsetY) / this._scale;

        this._scale = scale;
        this._displayTransformDirty = true;
        this.screenOffsetX = (offset.x - this._master.x) - localX * scale;
        this.screenOffsetY = (offset.y - this._master.y) - localY * scale;
        this.updateDisplayTransform();
    }

    setScreenOffset(x: number, y: number): void
    {
        this.screenOffsetX = x;
        this.screenOffsetY = y;
    }

    /**
	 * Main render loop. Called each frame.
	 * Based on AS3 RoomSpriteCanvas.render()
	 *
	 * @see sources/flash_version/com/sulake/room/renderer/RoomSpriteCanvas.as line 390
	 */
    render(time: number, force: boolean = false): void
    {
        if(time === -1)
        {
            time = this._renderTimeStamp + 1;
        }

        if(this._geometry === null)
        {
            return;
        }

        if(time === this._renderTimeStamp && !force)
        {
            return;
        }

        this._skipObjectUpdate = !this._skipObjectUpdate;
        this.calculateUpdateInterval(time);

        const renderStartedAt = performance.now();

        if(this._width !== this._lastRenderedWidth || this._height !== this._lastRenderedHeight)
        {
            force = true;
        }

        if(this._displayTransformDirty)
        {
            force = true;
        }

        // Update display position (AS3: display.x/y/scaleX/scaleY)
        this.updateDisplayTransform();

        let spriteIndex = 0;

        // Iterate all visualizations, update them, build SortableSprite list
        // AS3: for each room object → _Str_24532()
        const objectCount = this._roomObjectContainer.getRoomObjectCount();

        for(let i = 0; i < objectCount; i++)
        {
            const object = this._roomObjectContainer.getRoomObjectWithIndex(i);
            const objectId = this._roomObjectContainer.getRoomObjectIdWithIndex(i);

            if(object !== null && objectId !== null)
            {
                spriteIndex += this.renderObject(object, objectId, time, force, spriteIndex);
            }
        }

        // AS3: _sortableSpriteList.sortOn("z", DESCENDING | NUMERIC)
        this._sortableSpriteList.sort(RoomRenderingCanvas.compareSortableSprites);

        // Trim excess sortable sprites
        if(spriteIndex < this._sortableSpriteList.length)
        {
            this._sortableSpriteList.length = spriteIndex;
        }

        // Update ExtendedSprites from sorted list
        for(let i = 0; i < spriteIndex; i++)
        {
            const sortable = this._sortableSpriteList[i];

            if(sortable !== null)
            {
                this.updateSprite(i, sortable);
            }
        }

        // Hide/pool unused sprites beyond spriteIndex
        this.cleanSprites(spriteIndex);

        this._renderTimeStamp = time;
        this._lastRenderedWidth = this._width;
        this._lastRenderedHeight = this._height;
        this._displayTransformDirty = false;
        this._lastRenderTime = performance.now() - renderStartedAt;
    }

    // AS3: sources/win63_version/room/renderer/class_3523.as::calculateUpdateInterval()
    private calculateUpdateInterval(time: number): void
    {
        if(this._renderTimeStamp <= 0)
        {
            return;
        }

        const updateInterval = time - this._renderTimeStamp;

        if(updateInterval > REALLY_SLOW_FRAME_UPDATE_INTERVAL)
        {
            this._haltedFrameInterval = updateInterval;
        }

        if(updateInterval > MAXIMUM_VALID_FRAME_UPDATE_INTERVAL)
        {
            return;
        }

        this._updateIntervalFrameCount++;

        if(this._updateIntervalFrameCount === SKIP_FRAME_COUNT_FOR_UPDATE_INTERVAL + 1)
        {
            this._averageUpdateInterval = updateInterval;
            this._averageRenderTime = this._lastRenderTime;

            return;
        }

        if(this._updateIntervalFrameCount <= SKIP_FRAME_COUNT_FOR_UPDATE_INTERVAL + 1)
        {
            return;
        }

        const frameCount = this._updateIntervalFrameCount - SKIP_FRAME_COUNT_FOR_UPDATE_INTERVAL;

        this._averageUpdateInterval = this._averageUpdateInterval * (frameCount - 1) / frameCount + updateInterval / frameCount;
        this._averageRenderTime = this._averageRenderTime * (frameCount - 1) / frameCount + this._lastRenderTime / frameCount;

        if(this._updateIntervalFrameCount > SKIP_FRAME_COUNT_FOR_UPDATE_INTERVAL + FRAME_COUNT_FOR_UPDATE_INTERVAL)
        {
            this._updateIntervalFrameCount = SKIP_FRAME_COUNT_FOR_UPDATE_INTERVAL;

            if(!this._runningSlow && this._averageUpdateInterval > SLOW_FRAME_UPDATE_INTERVAL)
            {
                this._runningSlow = true;
            }
            else if(this._runningSlow && this._averageUpdateInterval < FAST_FRAME_UPDATE_INTERVAL)
            {
                this._runningSlow = false;
            }

            if(this._fpsCounterEnabled)
            {
                // TODO(AS3): sources/win63_version/room/renderer/class_3523.as calculateUpdateInterval()
                // Render FPS/debug TextField equivalents for Pixi when debug overlays are ported.
            }

            this._haltedFrameInterval = 0;
        }
    }

    /**
	 * Handle mouse events by hit-testing against all room sprites.
	 * Based on AS3 RoomSpriteCanvas.handleMouseEvent()
	 *
	 * @see sources/flash_version/com/sulake/room/renderer/RoomSpriteCanvas.as line 1005
	 */
    handleMouseEvent(
        x: number, y: number, type: string,
        altKey: boolean = false, ctrlKey: boolean = false,
        shiftKey: boolean = false, buttonDown: boolean = false
    ): boolean
    {
        type = this.normalizeMouseEventType(type);

        // Convert to canvas-local coords (AS3: subtract screenOffset, divide by scale)
        x = x - this._screenOffsetX;
        y = y - this._screenOffsetY;
        this._mouseLocationX = x / this._scale;
        this._mouseLocationY = y / this._scale;

        // Optimization: skip redundant mouseMove checks within same frame
        if(this._mouseCheckCount > 0 && type === 'mouseMove')
        {
            return this._mouseSpriteWasHit;
        }

        this._mouseSpriteWasHit = this.checkMouseHits(
            Math.floor(this._mouseLocationX),
            Math.floor(this._mouseLocationY),
            type, altKey, ctrlKey, shiftKey, buttonDown
        );
        this._mouseCheckCount++;

        // AS3 wires "click"/"doubleClick" to a second, dedicated native-event
        // listener (clickHandler → checkMouseClickHits) that hit-tests only
        // clickHandling sprites (ad-banner furniture), independent of and in
        // addition to the roll-over/click routing above.
        if(type === 'click' || type === 'doubleClick')
        {
            this.checkMouseClickHits(
                Math.floor(this._mouseLocationX),
                Math.floor(this._mouseLocationY),
                type === 'doubleClick',
                altKey, ctrlKey, shiftKey, buttonDown
            );
        }

        return this._mouseSpriteWasHit;
    }

    /**
	 * Get the canvas ID.
	 *
	 * @see sources/win63_version/room/renderer/class_3523.as line 1346
	 */
    getId(): number
    {
        return this._id;
    }

    /**
	 * Per-frame update for mouse event processing.
	 * Based on AS3 RoomSpriteCanvas.update()
	 *
	 * @see sources/win63_version/room/renderer/class_3523.as line 1326
	 */
    update(): void
    {
        if(this._mouseCheckCount === 0)
        {
            this.checkMouseHits(
                Math.floor(this._mouseLocationX),
                Math.floor(this._mouseLocationY),
                'mouseMove'
            );
        }

        this._mouseCheckCount = 0;
        this._eventId++;
    }

    suppressMouseUpdate(): void
    {
        this._mouseCheckCount = 1;
    }

    /**
	 * @deprecated Use update() instead. Kept for backward compatibility.
	 */
    updateMouseState(): void
    {
        this.update();
    }

    dispose(): void
    {
        if(this._disposed) return;

        this.cleanSprites(0);

        if(this._geometry !== null)
        {
            this._geometry.dispose();
        }

        // Dispose pooled sprites
        for(const sprite of this._spritePool)
        {
            sprite.dispose();
        }

        this._spritePool = [];
        this._sortableSpriteList = [];
        this._objectSpriteCaches.clear();
        this._mouseActiveObjects.clear();
        this._eventCache.clear();
        this._mouseListener = null;
        this._display.mask = null;

        if(this._spriteMask !== null)
        {
            if(this._spriteMask.parent !== null)
            {
                this._spriteMask.parent.removeChild(this._spriteMask);
            }

            this._spriteMask.destroy();
            this._spriteMask = null;
        }

        this._master.destroy({children: true});
        this._disposed = true;
    }

    /**
	 * Process a single room object's sprites into the SortableSprite list.
	 * Based on AS3 RoomSpriteCanvas._Str_24532()
	 *
	 * @see sources/flash_version/com/sulake/room/renderer/RoomSpriteCanvas.as line 514
	 */
    // AS3: sources/win63_version/room/renderer/class_3523.as::renderObject()
    private renderObject(
        object: IRoomObject,
        objectId: string,
        time: number,
        force: boolean,
        startIndex: number
    ): number
    {
        const visualization = object.getVisualization() as IRoomObjectSpriteVisualization | null;

        if(visualization === null)
        {
            this.disposeObjectSpriteCache(objectId);
            return 0;
        }

        const cache = this.getObjectSpriteCache(objectId);
        const screenPos = this.getCachedScreenLocation(object, cache);

        if(screenPos === null)
        {
            this.disposeObjectSpriteCache(objectId);
            return 0;
        }

        // Update the visualization (may change sprite z-values)
        visualization.update(
            this._geometry,
            time,
            !cache.initialized || cache.spriteCount > 0 || force,
            this._skipObjectUpdate && this._runningSlow
        );

        if(cache.locationChanged)
        {
            force = true;
        }

        // Screen center offset (AS3: screenX += _wd / 2, screenY += _ht / 2)
        const screenX = Math.floor(screenPos.x) + Math.floor(this._width / 2);
        const screenY = Math.floor(screenPos.y) + Math.floor(this._height / 2);

        // Base Z with sub-pixel offset (AS3: 1.2E-7 * x)
        let baseZ = screenPos.z;

        if(screenPos.x > 0)
        {
            baseZ += screenPos.x * 1.2e-7;
        }
        else
        {
            baseZ += (-screenPos.x) * 1.2e-7;
        }

        const instanceId = visualization.getInstanceId();
        const updateId = visualization.getUpdateID();

        if(!force &&
			cache.initialized &&
			cache.instanceId === instanceId &&
			cache.updateId === updateId &&
			cache.screenX === screenX &&
			cache.screenY === screenY &&
			cache.screenZ === baseZ)
        {
            return cache.spriteCount;
        }

        cache.initialized = true;
        cache.instanceId = instanceId;
        cache.updateId = updateId;
        cache.screenX = screenX;
        cache.screenY = screenY;
        cache.screenZ = baseZ;

        const spriteCount = visualization.spriteCount;
        let localCount = 0;

        for(let i = 0; i < spriteCount; i++)
        {
            const sprite = visualization.getSprite(i);

            if(sprite === null || !sprite.visible)
            {
                continue;
            }

            // AS3: if(asset == null) continue
            if(sprite.texture === null)
            {
                continue;
            }

            const finalX = screenX + sprite.offsetX + this._screenOffsetX;
            const finalY = screenY + sprite.offsetY + this._screenOffsetY;
            const spriteWidth = sprite.width > 0 ? sprite.width : sprite.texture.width;
            const spriteHeight = sprite.height > 0 ? sprite.height : sprite.texture.height;

            if(!this.rectangleVisible(finalX, finalY, spriteWidth, spriteHeight))
            {
                continue;
            }

            // Get or create SortableSprite.
            // AS3: RoomObjectSortableSpriteCacheItem.addSprite() pushes the new
            // SortableSprite into the per-object cache, and RoomSpriteCanvas pushes
            // that same reference into the global _sortableSpriteList only when it is
            // created. Existing cached sprites stay in the global list and keep the
            // previous sorted order between frames.
            let sortable: SortableSprite;

            if(localCount < cache.sprites.length)
            {
                sortable = cache.sprites[localCount];
            }
            else
            {
                sortable = new SortableSprite();
                cache.sprites.push(sortable);
                this._sortableSpriteList.push(sortable);
            }

            sortable.name = objectId;
            sortable.sprite = sprite;
            sortable.x = finalX - this._screenOffsetX;
            sortable.y = finalY - this._screenOffsetY;
            sortable.z = baseZ + sprite.relativeDepth + 3.7e-11 * (startIndex + localCount);

            localCount++;
        }

        cache.spriteCount = localCount;

        if(localCount < cache.sprites.length)
        {
            for(let i = localCount; i < cache.sprites.length; i++)
            {
                cache.sprites[i].dispose();
            }

            cache.sprites.length = localCount;
        }

        return localCount;
    }

    // AS3: sources/win63_version/room/renderer/class_3523.as::rectangleVisible()
    private rectangleVisible(x: number, y: number, width: number, height: number): boolean
    {
        if(this._skipSpriteVisibilityChecking)
        {
            return true;
        }

        if(this._scale !== 1)
        {
            x = (x - this._screenOffsetX) * this._scale + this._screenOffsetX;
            y = (y - this._screenOffsetY) * this._scale + this._screenOffsetY;
            width *= this._scale;
            height *= this._scale;
        }

        if(x < this._width && x + width >= 0 && y < this._height && y + height >= 0)
        {
            if(!this._useExclusionRects)
            {
                return true;
            }

            return this.rectangleVisibleWithExclusion(x, y, width, height);
        }

        return false;
    }

    /**
	 * Culls a rect if it's fully contained within any registered exclusion
	 * region. Dormant in AS3: the gating flag and exclusion list are declared
	 * but never populated anywhere in class_3523.as, so this path is
	 * unreachable there too — ported for structural parity.
	 *
	 * @see sources/win63_version/room/renderer/class_3523.as::rectangleVisibleWithExclusion() line 711
	 */
    // AS3: sources/win63_version/room/renderer/class_3523.as::rectangleVisibleWithExclusion()
    private rectangleVisibleWithExclusion(x: number, y: number, width: number, height: number): boolean
    {
        if(x < 0)
        {
            width += x;
            x = 0;
        }

        if(y < 0)
        {
            height += y;
            y = 0;
        }

        if(x + width >= this._width)
        {
            width -= this._width + 1 - (x + width);
        }

        if(y + height >= this._height)
        {
            height -= this._height + 1 - (y + height);
        }

        for(const rect of this._exclusionRects)
        {
            if(x >= rect.left && x + width < rect.right && y >= rect.top && y + height < rect.bottom)
            {
                return false;
            }
        }

        return true;
    }

    roomObjectRemoved(objectId: string): void
    {
        this.disposeObjectSpriteCache(objectId);
    }

    private getObjectSpriteCache(objectId: string): IObjectSpriteCache
    {
        let cache = this._objectSpriteCaches.get(objectId);

        if(cache === undefined)
        {
            cache = {
                initialized: false,
                instanceId: -1,
                updateId: -1,
                geometryUpdateId: -1,
                objectUpdateId: -1,
                objectUpdateLoc: new Vector3d(),
                screenLoc: new Vector3d(),
                roundedLoc: new Vector3d(),
                locationChanged: false,
                screenX: 0,
                screenY: 0,
                screenZ: 0,
                spriteCount: 0,
                sprites: []
            };
            this._objectSpriteCaches.set(objectId, cache);
        }

        return cache;
    }

    private getCachedScreenLocation(object: IRoomObject, cache: IObjectSpriteCache): Vector3d | null
    {
        const location = object.getLocation();
        const geometryUpdateId = this._geometry.updateId;
        const objectUpdateId = object.getUpdateID();
        let locationChanged = false;

        if(geometryUpdateId !== cache.geometryUpdateId || objectUpdateId !== cache.objectUpdateId)
        {
            cache.objectUpdateId = objectUpdateId;

            if(geometryUpdateId !== cache.geometryUpdateId ||
				location.x !== cache.objectUpdateLoc.x ||
				location.y !== cache.objectUpdateLoc.y ||
				location.z !== cache.objectUpdateLoc.z)
            {
                cache.geometryUpdateId = geometryUpdateId;
                cache.objectUpdateLoc.assign(location);
                locationChanged = true;
            }
        }

        cache.locationChanged = locationChanged;

        if(locationChanged)
        {
            const screenLocation = this._geometry.getScreenPosition(location);

            if(screenLocation === null)
            {
                return null;
            }

            const accurateZVariable = this._roomObjectContainer.roomObjectVariableAccurateZ;
            const accurateZ = accurateZVariable ? object.getModel().getNumber(accurateZVariable) : NaN;

            if(Number.isNaN(accurateZ) || accurateZ === 0)
            {
                cache.roundedLoc.x = Math.round(location.x);
                cache.roundedLoc.y = Math.round(location.y);
                cache.roundedLoc.z = location.z;

                if(cache.roundedLoc.x !== location.x || cache.roundedLoc.y !== location.y)
                {
                    const roundedScreenLocation = this._geometry.getScreenPosition(cache.roundedLoc);

                    cache.screenLoc.assign(screenLocation);

                    if(roundedScreenLocation !== null)
                    {
                        cache.screenLoc.z = roundedScreenLocation.z;
                    }
                }
                else
                {
                    cache.screenLoc.assign(screenLocation);
                }
            }
            else
            {
                cache.screenLoc.assign(screenLocation);
            }

            cache.screenLoc.x = Math.round(cache.screenLoc.x);
            cache.screenLoc.y = Math.round(cache.screenLoc.y);
        }

        return cache.screenLoc;
    }

    private disposeObjectSpriteCache(objectId: string): void
    {
        const cache = this._objectSpriteCaches.get(objectId);

        if(cache !== undefined)
        {
            for(let i = 0; i < cache.sprites.length; i++)
            {
                cache.sprites[i].dispose();
            }

            cache.sprites.length = 0;
        }

        this._objectSpriteCaches.delete(objectId);
    }

    private updateDisplayTransform(): void
    {
        if(this._display.x !== this._screenOffsetX)
        {
            this._display.x = this._screenOffsetX;
        }

        if(this._display.y !== this._screenOffsetY)
        {
            this._display.y = this._screenOffsetY;
        }

        if(this._display.scale.x !== this._scale)
        {
            this._display.scale.x = this._scale;
        }

        if(this._display.scale.y !== this._scale)
        {
            this._display.scale.y = this._scale;
        }
    }

    /**
	 * Update or create an ExtendedSprite at the given display index.
	 * Based on AS3 RoomSpriteCanvas.updateSprite()
	 *
	 * @see sources/flash_version/com/sulake/room/renderer/RoomSpriteCanvas.as line 704
	 */
    // AS3: sources/win63_version/room/renderer/class_3523.as::updateSprite()
    private updateSprite(index: number, sortable: SortableSprite): void
    {
        const sprite = sortable.sprite;

        if(sprite === null)
        {
            return;
        }

        let extSprite: ExtendedSprite;
        let isNewSprite = false;

        if(index >= this._spriteCount)
        {
            // Need a new ExtendedSprite — pop from pool or create
            if(this._spritePool.length > 0)
            {
                extSprite = this._spritePool.pop()!;
            }
            else
            {
                extSprite = new ExtendedSprite();
            }

            this._display.addChild(extSprite);
            this._spriteCount++;
            isNewSprite = true;
        }
        else
        {
            extSprite = this._display.children[index] as ExtendedSprite;

            if(!extSprite)
            {
                return;
            }

            // Handle varyingDepth changes (AS3: remove and re-add)
            if(extSprite.varyingDepth !== sprite.varyingDepth)
            {
                if(extSprite.varyingDepth && !sprite.varyingDepth)
                {
                    this._display.removeChildAt(index);
                    this._spritePool.push(extSprite);
                    this.updateSprite(index, sortable);
                    return;
                }

                // Insert new sprite at this position
                const newSprite = this._spritePool.length > 0 ? this._spritePool.pop()! : new ExtendedSprite();
                this._display.addChildAt(newSprite, index);
                extSprite = newSprite;
                isNewSprite = true;
            }
        }

        // Update sprite properties if changed
        // AS3: if(_Str_17574(instanceId, updateId))
        if(extSprite.needsUpdate(sprite.instanceId, sprite.updateId))
        {
            extSprite.alphaTolerance = sprite.alphaTolerance;

            const alpha = sprite.alpha / 255;

            if(extSprite.alpha !== alpha)
            {
                extSprite.alpha = alpha;
            }

            extSprite.identifier = sortable.name;
            extSprite.tag = sprite.tag;
            extSprite.varyingDepth = sprite.varyingDepth;
            extSprite.clickHandling = sprite.clickHandling;
            extSprite.skipMouseHandling = sprite.skipMouseHandling;

            // Set texture (AS3: bitmapData = getBitmapData(asset, ...))
            if(sprite.texture !== null)
            {
                extSprite.setTexture(sprite.texture);
            }
            else
            {
                extSprite.setTexture(null);
            }

            // AS3: updateEnterRoomEffect(extSprite, sprite, RoomEnterEffect.isVisualizationOn())
            // only applies the dim/reveal override for freshly created sprites — the
            // call on the update path always passes `false` in AS3 and is a no-op.
            this.updateEnterRoomEffect(extSprite, sprite.spriteType, isNewSprite && RoomEnterEffect.isVisualizationOn());

            // Handle flipping
            if(sprite.flipH)
            {
                extSprite.scale.x = -1;
            }
            else
            {
                extSprite.scale.x = 1;
            }

            if(sprite.flipV)
            {
                extSprite.scale.y = -1;
            }
            else
            {
                extSprite.scale.y = 1;
            }

            // Tint (color)
            if(sprite.color !== 0xFFFFFF)
            {
                extSprite.tint = sprite.color;
            }
            else
            {
                extSprite.tint = 0xFFFFFF;
            }

            // Blend mode
            extSprite.blendMode = sprite.blendMode as any;
        }

        // Always update position
        if(extSprite.x !== sortable.x)
        {
            extSprite.x = sortable.x;
        }

        if(extSprite.y !== sortable.y)
        {
            extSprite.y = sortable.y;
        }

        extSprite.offsetX = sprite.offsetX;
        extSprite.offsetY = sprite.offsetY;
        extSprite.visible = true;

        this._activeSpriteCount = Math.max(this._activeSpriteCount, index + 1);
    }

    /**
	 * Applies the new-user room-enter dim/reveal override to a freshly created
	 * sprite. Dormant unless RoomEnterEffect.init() has been triggered elsewhere
	 * (habbo/toolbar NUX flow), matching AS3 behavior where this is a no-op until
	 * the effect is armed.
	 *
	 * @see sources/win63_version/room/renderer/class_3523.as::updateEnterRoomEffect() line 879
	 */
    // AS3: sources/win63_version/room/renderer/class_3523.as::updateEnterRoomEffect()
    private updateEnterRoomEffect(extSprite: ExtendedSprite, spriteType: number, active: boolean): void
    {
        if(!active || extSprite.texture === Texture.EMPTY)
        {
            return;
        }

        switch(spriteType)
        {
            case RoomObjectSpriteType.ROOM_PLANE:
                extSprite.alpha = RoomEnterEffect.getDelta(0.9);
                break;
            case RoomObjectSpriteType.AVATAR:
                extSprite.alpha = RoomEnterEffect.getDelta(0.5);
                break;
            case RoomObjectSpriteType.AVATAR_OWN:
                break;
            default:
                extSprite.alpha = RoomEnterEffect.getDelta(0.1);
                break;
        }
    }

    /**
	 * Hide or pool unused sprites beyond the active count.
	 * Based on AS3 RoomSpriteCanvas._Str_20677()
	 */
    private cleanSprites(activeCount: number): void
    {
        if(activeCount < this._activeSpriteCount || this._activeSpriteCount === 0)
        {
            for(let i = this._spriteCount - 1; i >= activeCount; i--)
            {
                const extSprite = this._display.children[i] as ExtendedSprite;

                if(extSprite)
                {
                    extSprite.setTexture(null);
                    extSprite.visible = false;
                }
            }
        }

        this._activeSpriteCount = activeCount;
    }

    /**
	 * Get an ExtendedSprite at the given display index.
	 * AS3: getSprite()
	 */
    private getSprite(index: number): ExtendedSprite | null
    {
        if(index < 0 || index >= this._spriteCount)
        {
            return null;
        }

        return this._display.children[index] as ExtendedSprite ?? null;
    }

    /**
	 * Core hit-test method. Iterates sprites in reverse order (front to back).
	 * Based on AS3 RoomSpriteCanvas._Str_19207()
	 *
	 * @see sources/flash_version/com/sulake/room/renderer/RoomSpriteCanvas.as line 1069
	 */
    // AS3: sources/win63_version/room/renderer/class_3523.as::checkMouseHits()
    private checkMouseHits(
        x: number, y: number, type: string,
        altKey: boolean = false, ctrlKey: boolean = false,
        shiftKey: boolean = false, buttonDown: boolean = false
    ): boolean
    {
        let wasHit = false;
        const hitObjectIds: Set<string> = new Set();

        // Iterate from frontmost to backmost (AS3: i from _activeSpriteCount-1 downto 0)
        for(let i = this._activeSpriteCount - 1; i >= 0; i--)
        {
            const extSprite = this.getSprite(i);

            if(extSprite === null || !extSprite.visible)
            {
                continue;
            }

            // Hit test in sprite-local coordinates
            const localX = x - extSprite.x;
            const localY = y - extSprite.y;

            if(!extSprite.hitTest(localX, localY))
            {
                continue;
            }

            if(extSprite.skipMouseHandling)
            {
                continue;
            }

            // Skip click-handling sprites for non-click events (AS3 pattern)
            if(extSprite.clickHandling && (type === 'click' || type === 'doubleClick'))
            {
                continue;
            }

            const objectId = extSprite.identifier;

            if(hitObjectIds.has(objectId))
            {
                continue;
            }

            const spriteTag = extSprite.tag;
            const activeData = this._mouseActiveObjects.get(objectId);

            // Handle roll-over/roll-out transitions
            if(activeData !== undefined && activeData.spriteTag !== spriteTag)
            {
                const rollOutEvent = this.createMouseEvent(
                    0, 0, 0, 0, 'rollOut', activeData.spriteTag,
                    altKey, ctrlKey, shiftKey, buttonDown
                );

                this.bufferMouseEvent(rollOutEvent, objectId);
            }

            let event: RoomSpriteMouseEvent;

            if(type === 'mouseMove' && (activeData === undefined || activeData.spriteTag !== spriteTag))
            {
                // New object or different sprite → send roll_over
                event = this.createMouseEvent(
                    x, y, localX, localY,
                    'rollOver', spriteTag,
                    altKey, ctrlKey, shiftKey, buttonDown
                );
            }
            else
            {
                event = this.createMouseEvent(
                    x, y, localX, localY,
                    type, spriteTag,
                    altKey, ctrlKey, shiftKey, buttonDown
                );
                event.spriteOffsetX = extSprite.offsetX;
                event.spriteOffsetY = extSprite.offsetY;
            }

            // Update active object tracking
            if(activeData === undefined)
            {
                const newData = new ObjectMouseData();

                newData.objectId = objectId;
                newData.spriteTag = spriteTag;

                this._mouseActiveObjects.set(objectId, newData);
            }
            else
            {
                activeData.spriteTag = spriteTag;
            }

            // Only buffer if coordinates changed, or it's not mouse_move
            if(type !== 'mouseMove' || x !== this._mouseOldX || y !== this._mouseOldY)
            {
                this.bufferMouseEvent(event, objectId);
            }

            hitObjectIds.add(objectId);
            wasHit = true;
        }

        // Generate roll_out events for objects no longer under the mouse
        // AS3: iterate _mouseActiveObjects keys, remove those not in hitObjectIds
        const keysToRemove: string[] = [];

        for(const [objectId, data] of this._mouseActiveObjects)
        {
            if(!hitObjectIds.has(objectId))
            {
                const rollOutEvent = this.createMouseEvent(
                    0, 0, 0, 0, 'rollOut', data.spriteTag,
                    altKey, ctrlKey, shiftKey, buttonDown
                );
                this.bufferMouseEvent(rollOutEvent, objectId);
                keysToRemove.push(objectId);
            }
        }

        for(const key of keysToRemove)
        {
            this._mouseActiveObjects.delete(key);
        }

        // Process all buffered events
        this.processMouseEvents();

        this._mouseOldX = x;
        this._mouseOldY = y;

        return wasHit;
    }

    /**
	 * Hit-tests only clickHandling sprites (ad-banner furniture with a click
	 * URL) for a click/doubleClick, independent of the normal roll-over/click
	 * routing in checkMouseHits() (which deliberately skips clickHandling
	 * sprites for click events).
	 *
	 * @see sources/win63_version/room/renderer/class_3523.as::checkMouseClickHits() line 1133
	 */
    // AS3: sources/win63_version/room/renderer/class_3523.as::checkMouseClickHits()
    private checkMouseClickHits(
        x: number, y: number, isDoubleClick: boolean,
        altKey: boolean = false, ctrlKey: boolean = false,
        shiftKey: boolean = false, buttonDown: boolean = false
    ): boolean
    {
        const type = isDoubleClick ? 'doubleClick' : 'click';
        const hitObjectIds: Set<string> = new Set();
        let wasHit = false;

        for(let i = this._activeSpriteCount - 1; i >= 0; i--)
        {
            const extSprite = this.getSprite(i);

            if(extSprite === null || !extSprite.clickHandling)
            {
                continue;
            }

            const localX = x - extSprite.x;
            const localY = y - extSprite.y;

            if(extSprite.hitTest(localX, localY))
            {
                const objectId = extSprite.identifier;

                if(!hitObjectIds.has(objectId))
                {
                    const spriteTag = extSprite.tag;
                    const event = this.createMouseEvent(
                        x, y, localX, localY,
                        type, spriteTag,
                        altKey, ctrlKey, shiftKey, buttonDown
                    );

                    this.bufferMouseEvent(event, objectId);
                    hitObjectIds.add(objectId);
                }
            }

            wasHit = true;
        }

        this.processMouseEvents();

        return wasHit;
    }

    /**
	 * Create a RoomSpriteMouseEvent.
	 * Based on AS3 RoomSpriteCanvas._Str_11609()
	 */
    private createMouseEvent(
        x: number, y: number,
        localX: number, localY: number,
        type: string, spriteTag: string,
        altKey: boolean, ctrlKey: boolean,
        shiftKey: boolean, buttonDown: boolean
    ): RoomSpriteMouseEvent
    {
        // AS3: screenX = x - (wd/2), screenY = y - (ht/2)
        const screenX = x - Math.floor(this._width / 2);
        const screenY = y - Math.floor(this._height / 2);
        const canvasId = `canvas_${this._id}`;
        const eventId = `${canvasId}_${this._eventId}`;

        return new RoomSpriteMouseEvent(
            type, eventId, canvasId, spriteTag,
            screenX, screenY,
            localX, localY,
            ctrlKey, altKey, shiftKey, buttonDown
        );
    }

    private normalizeMouseEventType(type: string): string
    {
        switch(type)
        {
            case 'mouse_move':
                return 'mouseMove';
            case 'mouse_down':
                return 'mouseDown';
            case 'mouse_up':
                return 'mouseUp';
            case 'double_click':
                return 'doubleClick';
            case 'roll_over':
                return 'rollOver';
            case 'roll_out':
                return 'rollOut';
            default:
                return type;
        }
    }

    /**
	 * Buffer a mouse event for later processing.
	 * Based on AS3 RoomSpriteCanvas._Str_14715()
	 */
    private bufferMouseEvent(event: RoomSpriteMouseEvent, objectId: string): void
    {
        this._eventCache.set(objectId, event);
    }

    /**
	 * Process all buffered mouse events by dispatching to room objects.
	 * Based on AS3 RoomSpriteCanvas._Str_20604()
	 *
	 * @see sources/flash_version/com/sulake/room/renderer/RoomSpriteCanvas.as line 1175
	 */
    private processMouseEvents(): void
    {
        for(const [objectId, event] of this._eventCache)
        {
            const object = this.findObjectById(objectId);

            if(!object)
            {
                continue;
            }

            if(this._mouseListener)
            {
                this._mouseListener.processRoomCanvasMouseEvent(event, object, this._geometry);
            }
            else
            {
                const handler = object.getMouseHandler();

                if(handler)
                {
                    handler.mouseEvent(event, this._geometry);
                }
            }
        }

        this._eventCache.clear();
    }

    /**
	 * Find a room object by its composite objectId string.
	 * AS3: container.getRoomObject(objectId)
	 */
    private findObjectById(objectId: string): IRoomObject | null
    {
        return this._roomObjectContainer.getRoomObject(objectId);
    }
}
