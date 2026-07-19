/**
 * RoomRenderer
 *
 * Based on AS3: com.sulake.room.renderer.class_3447
 *
 * Manages a collection of room objects and rendering canvases.
 * Objects are fed to the renderer, which distributes them to canvases.
 * Canvases query objects from this renderer (via IRoomSpriteCanvasContainer).
 *
 * @see sources/win63_version/room/renderer/class_3447.as
 */
import type {IRoomObject} from '../object/IRoomObject';
import type {IRoomRenderer} from './IRoomRenderer';
import type {IRoomRenderingCanvas} from './IRoomRenderingCanvas';
import type {IRoomSpriteCanvasContainer} from './IRoomSpriteCanvasContainer';

export class RoomRenderer implements IRoomRenderer, IRoomSpriteCanvasContainer
{
    private _objects: Map<string, IRoomObject> = new Map();
    private _objectKeys: string[] = [];
    private _canvases: Map<string, IRoomRenderingCanvas> = new Map();
    private _disposed: boolean = false;

    get disposed(): boolean
    {
        return this._disposed;
    }

    private _roomObjectVariableAccurateZ: string | null = null;

    get roomObjectVariableAccurateZ(): string | null
    {
        return this._roomObjectVariableAccurateZ;
    }

    set roomObjectVariableAccurateZ(value: string | null)
    {
        this._roomObjectVariableAccurateZ = value;
    }

    /**
	 * Dispose all canvases and objects.
	 *
	 * @see AS3 class_3447 lines 51-84
	 */
    dispose(): void
    {
        if(this._disposed) return;

        for(const canvas of this._canvases.values())
        {
            canvas.dispose();
        }

        this._canvases.clear();
        this._objects.clear();
        this._objectKeys.length = 0;
        this._disposed = true;
    }

    /**
	 * Reset the object list.
	 *
	 * @see AS3 class_3447 line 87
	 */
    reset(): void
    {
        this._objects.clear();
        this._objectKeys.length = 0;
    }

    /**
	 * Get the string identifier for a room object.
	 *
	 * @see AS3 class_3447 lines 91-98
	 */
    getRoomObjectIdentifier(object: IRoomObject): string | null
    {
        if(object !== null)
        {
            return String(object.getInstanceId());
        }

        return null;
    }

    /**
	 * Add a room object to the renderer.
	 *
	 * @see AS3 class_3447 lines 100-107
	 */
    feedRoomObject(object: IRoomObject): void
    {
        if(object === null) return;

        const id = this.getRoomObjectIdentifier(object);

        if(id === null) return;

        if(!this._objects.has(id))
        {
            this._objectKeys.push(id);
        }

        this._objects.set(id, object);
    }

    /**
	 * Remove a room object from the renderer and notify canvases.
	 *
	 * @see AS3 class_3447 lines 109-125
	 */
    removeRoomObject(object: IRoomObject): void
    {
        const id = this.getRoomObjectIdentifier(object);

        if(id === null) return;

        this._objects.delete(id);

        const keyIndex = this._objectKeys.indexOf(id);

        if(keyIndex >= 0)
        {
            this._objectKeys.splice(keyIndex, 1);
        }

        // Notify canvases that an object was removed
        for(const canvas of this._canvases.values())
        {
            if('roomObjectRemoved' in canvas && typeof (canvas as any).roomObjectRemoved === 'function')
            {
                (canvas as any).roomObjectRemoved(id);
            }
        }
    }

    /**
	 * Get a room object by its identifier.
	 *
	 * @see AS3 class_3447 lines 127-130
	 */
    getRoomObject(id: string): IRoomObject | null
    {
        return this._objects.get(id) ?? null;
    }

    /**
	 * Get a room object by index.
	 *
	 * @see AS3 class_3447 lines 132-135
	 */
    getRoomObjectWithIndex(index: number): IRoomObject | null
    {
        if(index < 0 || index >= this._objectKeys.length) return null;

        return this._objects.get(this._objectKeys[index]) ?? null;
    }

    /**
	 * Get the ID of a room object by index.
	 *
	 * @see AS3 class_3447 lines 137-140
	 */
    getRoomObjectIdWithIndex(index: number): string | null
    {
        if(index < 0 || index >= this._objectKeys.length) return null;

        return this._objectKeys[index];
    }

    /**
	 * Get the total number of room objects.
	 *
	 * @see AS3 class_3447 lines 142-145
	 */
    getRoomObjectCount(): number
    {
        return this._objects.size;
    }

    /**
	 * Render all canvases.
	 *
	 * @see AS3 class_3447 lines 147-163
	 */
    render(): void
    {
        const time = performance.now();

        for(const canvas of this._canvases.values())
        {
            canvas.render(time);
        }
    }

    /**
	 * Create a new canvas or reinitialize an existing one.
	 *
	 * @see AS3 class_3447 lines 165-181
	 */
    createCanvas(id: number, width: number, height: number, scale: number): IRoomRenderingCanvas
    {
        const key = String(id);
        const existing = this._canvases.get(key);

        if(existing)
        {
            existing.initialize(width, height);
            // TODO(AS3): sources/win63_version/room/renderer/class_2019.as createCanvas()
            // updates the existing RoomGeometry.scale to param4. Do not call
            // IRoomRenderingCanvas.setScale() here: AS3 class_3523.setScale()
            // is display zoom, not geometry scale.

            return existing;
        }

        const canvas = this.createCanvasInstance(id, width, height, scale);

        this._canvases.set(key, canvas);

        return canvas;
    }

    /**
	 * Get a canvas by ID.
	 *
	 * @see AS3 class_3447 lines 188-191
	 */
    getCanvas(id: number): IRoomRenderingCanvas | null
    {
        return this._canvases.get(String(id)) ?? null;
    }

    /**
	 * Dispose a canvas by ID.
	 *
	 * @see AS3 class_3447 lines 193-201
	 */
    disposeCanvas(id: number): boolean
    {
        const key = String(id);
        const canvas = this._canvases.get(key);

        if(canvas)
        {
            canvas.dispose();
            this._canvases.delete(key);
        }

        return false;
    }

    /**
	 * Update cycle: render all canvases, then call canvas.update() for event dispatch.
	 *
	 * @see AS3 class_3447 lines 203-218
	 */
    update(_time: number): void
    {
        this.render();

        for(const canvas of this._canvases.values())
        {
            canvas.update();
        }
    }

    /**
	 * Create a canvas instance. Protected to allow subclasses to override
	 * with custom canvas types (e.g., HabboRoomSpriteCanvas).
	 *
	 * @see AS3 class_3447 lines 183-186
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/room/renderer/_SafeCls_2253.as::createCanvasInstance()
    // TODO(AS3): AS3's base class is concrete here - it returns a real canvas instance
    // (`_SafeCls_3074`), not an abstract hook. There is no engine-layer (non-Habbo) canvas
    // implementation to construct in this port's architecture (`room/` never imports from
    // `habbo/room/`, where the only concrete canvas - RoomRenderingCanvas - lives), so a throw
    // stands in for AS3's concrete default. Harmless today: HabboRoomRenderer always overrides
    // this, the same way AS3's own callers only ever use the Habbo-specific renderer subclass.
    protected createCanvasInstance(_id: number, _width: number, _height: number, _scale: number): IRoomRenderingCanvas
    {
        throw new Error('[RoomRenderer] createCanvasInstance must be overridden');
    }
}
