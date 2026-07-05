/**
 * RoomInstance
 *
 * Based on AS3: com.sulake.room.RoomInstance
 *
 * Manages a single room with its objects organized by category.
 *
 * @see sources/win63_version/room/RoomInstance.as
 */
import type {IRoomInstance} from './IRoomInstance';
import type {IRoomInstanceContainer} from './IRoomInstanceContainer';
import type {IRoomObject} from './object/IRoomObject';
import type {IRoomObjectController} from './object/IRoomObjectController';
import type {IRoomObjectEventHandler} from './object/logic/IRoomObjectEventHandler';
import type {IRoomObjectManager} from './IRoomObjectManager';
import type {IRoomRendererBase} from './renderer/IRoomRendererBase';

export class RoomInstance implements IRoomInstance
{
    private _container: IRoomInstanceContainer | null;
    private _managers: Map<string, IRoomObjectManager> = new Map();
    private _updateCategories: number[] = [];
    private _numbers: Map<string, number> = new Map();
    private _strings: Map<string, string> = new Map();
    private _immutableNumbers: Set<string> = new Set();
    private _immutableStrings: Set<string> = new Set();
    private _renderer: IRoomRendererBase | null = null;

    constructor(id: string, container: IRoomInstanceContainer)
    {
        this._id = id;
        this._container = container;
    }

    private _id: string;

    get id(): string
    {
        return this._id;
    }

    getNumber(key: string): number
    {
        return this._numbers.get(key) ?? NaN;
    }

    setNumber(key: string, value: number, immutable: boolean = false): void
    {
        if(this._immutableNumbers.has(key))
        {
            return;
        }

        if(immutable)
        {
            this._immutableNumbers.add(key);
        }

        if(this._numbers.get(key) !== value)
        {
            this._numbers.set(key, value);
        }
    }

    getString(key: string): string
    {
        return this._strings.get(key) ?? '';
    }

    setString(key: string, value: string, immutable: boolean = false): void
    {
        if(this._immutableStrings.has(key))
        {
            return;
        }

        if(immutable)
        {
            this._immutableStrings.add(key);
        }

        if(this._strings.get(key) !== value)
        {
            this._strings.set(key, value);
        }
    }

    addObjectUpdateCategory(category: number): void
    {
        const index = this._updateCategories.indexOf(category);

        if(index >= 0)
        {
            return;
        }

        this._updateCategories.push(category);
    }

    removeObjectUpdateCategory(category: number): void
    {
        const index = this._updateCategories.indexOf(category);

        if(index >= 0)
        {
            this._updateCategories.splice(index, 1);
        }
    }

    update(): void
    {
        const time = performance.now();

        for(let i = this._updateCategories.length - 1; i >= 0; i--)
        {
            const category = this._updateCategories[i];
            const manager = this.getObjectManager(category);

            if(manager !== null)
            {
                const objects = manager.objects;

                for(let j = objects.length - 1; j >= 0; j--)
                {
                    const object = objects[j] as IRoomObjectController | null;

                    if(object !== null)
                    {
                        const handler: IRoomObjectEventHandler | null = object.getEventHandler();

                        if(handler !== null)
                        {
                            handler.update(time);
                        }
                    }
                }
            }
        }
    }

    /**
	 * Set the renderer for this room.
	 * Disposes the old renderer, resets the new one, and feeds all existing objects to it.
	 *
	 * @see AS3 RoomInstance.setRenderer() lines 319-357
	 */
    setRenderer(renderer: IRoomRendererBase | null): void
    {
        if(renderer === this._renderer)
        {
            return;
        }

        if(this._renderer !== null)
        {
            this._renderer.dispose();
        }

        this._renderer = renderer;

        if(this._renderer === null)
        {
            return;
        }

        this._renderer.reset();

        // Feed all existing objects to the new renderer
        const managerIds = this.getObjectManagerIds();

        for(let i = managerIds.length - 1; i >= 0; i--)
        {
            const categoryId = managerIds[i];
            const count = this.getObjectCount(categoryId);

            for(let j = count - 1; j >= 0; j--)
            {
                const object = this.getObjectWithIndex(j, categoryId) as IRoomObjectController | null;

                if(object !== null)
                {
                    this._renderer.feedRoomObject(object);
                }
            }
        }
    }

    /**
	 * Get the current renderer.
	 *
	 * @see AS3 RoomInstance.getRenderer() lines 359-362
	 */
    getRenderer(): IRoomRendererBase | null
    {
        return this._renderer;
    }

    createRoomObject(id: number, type: string, category: number): IRoomObject | null
    {
        if(this._container !== null)
        {
            return this._container.createRoomObject(this._id, id, type, category);
        }

        return null;
    }

    /**
	 * Create an object internally and feed it to the renderer.
	 *
	 * @see AS3 RoomInstance.createObjectInternal() lines 201-215
	 */
    createObjectInternal(id: number, stateCount: number, type: string, category: number): IRoomObject | null
    {
        const manager = this.createObjectManager(category);

        if(manager !== null)
        {
            const object = manager.createObject(id, stateCount, type);

            if(object !== null && this._renderer !== null)
            {
                this._renderer.feedRoomObject(object);
            }

            return object;
        }

        return null;
    }

    getObject(id: number, category: number): IRoomObject | null
    {
        const manager = this.getObjectManager(category);

        if(manager !== null)
        {
            return manager.getObject(id);
        }

        return null;
    }

    getObjects(category: number): IRoomObject[]
    {
        const manager = this.getObjectManager(category);

        return manager ? manager.objects : [];
    }

    getObjectWithIndex(index: number, category: number): IRoomObject | null
    {
        const manager = this.getObjectManager(category);

        if(manager !== null)
        {
            return manager.getObjectByIndex(index);
        }

        return null;
    }

    getObjectCount(category: number): number
    {
        const manager = this.getObjectManager(category);

        if(manager !== null)
        {
            return manager.objectCount;
        }

        return 0;
    }

    getObjectWithIndexAndType(index: number, type: string, category: number): IRoomObject | null
    {
        const manager = this.getObjectManager(category);

        if(manager !== null)
        {
            return manager.getObjectWithIndexAndType(index, type);
        }

        return null;
    }

    getObjectCountForType(type: string, category: number): number
    {
        const manager = this.getObjectManager(category);

        if(manager !== null)
        {
            return manager.getObjectCountForType(type);
        }

        return 0;
    }

    /**
	 * Dispose a single object. Removes it from the renderer first.
	 *
	 * @see AS3 RoomInstance.disposeObject() lines 273-290
	 */
    disposeObject(id: number, category: number): boolean
    {
        const manager = this.getObjectManager(category);

        if(manager !== null)
        {
            const object = manager.getObject(id);

            if(object !== null)
            {
                object.tearDown();

                if(this._renderer !== null)
                {
                    this._renderer.removeRoomObject(object);
                }

                return manager.disposeObject(id);
            }
        }

        return false;
    }

    /**
	 * Dispose all objects in a category. Removes each from the renderer first.
	 *
	 * @see AS3 RoomInstance.disposeObjects() lines 292-317
	 */
    disposeObjects(category: number): number
    {
        const manager = this.getObjectManager(category);
        let count = 0;

        if(manager !== null)
        {
            count = manager.objectCount;

            for(let i = 0; i < count; i++)
            {
                const object = manager.getObjectByIndex(i) as IRoomObjectController | null;

                if(object !== null)
                {
                    if(this._renderer !== null)
                    {
                        this._renderer.removeRoomObject(object);
                    }

                    object.dispose();
                }
            }

            manager.reset();
        }

        return count;
    }

    getObjectManagerIds(): number[]
    {
        return Array.from(this._managers.keys()).map(k => parseInt(k, 10));
    }

    hasUninitializedObjects(): boolean
    {
        for(const manager of this._managers.values())
        {
            const count = manager.objectCount;

            for(let i = 0; i < count; i++)
            {
                const object = manager.getObjectByIndex(i);

                if(object && !object.isInitialized())
                {
                    return true;
                }
            }
        }

        return false;
    }

    /**
	 * Dispose the room instance and its renderer.
	 *
	 * @see AS3 RoomInstance.dispose() lines 51-96
	 */
    dispose(): void
    {
        for(const manager of this._managers.values())
        {
            manager.dispose();
        }

        this._managers.clear();

        if(this._renderer !== null)
        {
            this._renderer.dispose();
            this._renderer = null;
        }

        this._container = null;
        this._updateCategories.length = 0;
        this._numbers.clear();
        this._strings.clear();
        this._immutableNumbers.clear();
        this._immutableStrings.clear();
    }

    protected createObjectManager(category: number): IRoomObjectManager | null
    {
        const key = String(category);

        if(this._managers.has(key))
        {
            return this._managers.get(key)!;
        }

        if(this._container === null)
        {
            return null;
        }

        const manager = this._container.createRoomObjectManager();

        if(manager !== null)
        {
            this._managers.set(key, manager);
        }

        return manager;
    }

    protected getObjectManager(category: number): IRoomObjectManager | null
    {
        return this._managers.get(String(category)) ?? null;
    }

    protected disposeObjectManager(category: number): boolean
    {
        const key = String(category);

        this.disposeObjects(category);

        if(this._managers.has(key))
        {
            const manager = this._managers.get(key)!;
            this._managers.delete(key);
            manager.dispose();

            return true;
        }

        return false;
    }
}
