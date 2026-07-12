/**
 * TileObjectMap
 *
 * @see source_as_flash/com/sulake/habbo/room/utils/TileObjectMap.as
 *
 * 2D spatial index mapping tiles to room objects.
 * Enables fast O(1) lookup of which object occupies a given tile.
 */
import type {IRoomObject} from '@room/object/IRoomObject';
import {RoomObjectVariableEnum} from '@habbo/room/object/RoomObjectVariableEnum';

export class TileObjectMap
{
    private _map: (IRoomObject | null)[];
    private _width: number;
    private _height: number;

    constructor(width: number, height: number)
    {
        this._width = width;
        this._height = height;
        this._map = new Array(width * height).fill(null);
    }

    /**
	 * Get the room object occupying a tile.
	 */
    getObjectInTile(x: number, y: number): IRoomObject | null
    {
        if(x < 0 || x >= this._width || y < 0 || y >= this._height)
        {
            return null;
        }

        return this._map[y * this._width + x];
    }

    /**
	 * Set a room object in a tile.
	 */
    setObjectInTile(x: number, y: number, object: IRoomObject | null): void
    {
        if(x < 0 || x >= this._width || y < 0 || y >= this._height)
        {
            return;
        }

        this._map[y * this._width + x] = object;
    }

    /**
	 * Add a room object to the map, considering its footprint (size and rotation).
	 * Based on AS3 TileObjectMap.addRoomObject()
	 */
    addRoomObject(object: IRoomObject): void
    {
        const location = object.getLocation();
        const direction = object.getDirection();
        const model = object.getModel();

        if(!location || !model) return;

        let sizeX = model.getNumber(RoomObjectVariableEnum.FURNITURE_SIZE_X) || 1;
        let sizeY = model.getNumber(RoomObjectVariableEnum.FURNITURE_SIZE_Y) || 1;
        const sizeZ = model.getNumber(RoomObjectVariableEnum.FURNITURE_SIZE_Z) || 0;

        // Rotate dimensions based on direction
        const dir = direction ? Math.round(direction.x / 90) % 4 : 0;

        if(dir === 1 || dir === 3)
        {
            const temp = sizeX;
            sizeX = sizeY;
            sizeY = temp;
        }

        const baseX = Math.floor(location.x);
        const baseY = Math.floor(location.y);
        const objectHeight = location.z + sizeZ;

        // Place object in all tiles it occupies
        for(let ix = baseX; ix < baseX + sizeX; ix++)
        {
            for(let iy = baseY; iy < baseY + sizeY; iy++)
            {
                if(ix >= 0 && ix < this._width && iy >= 0 && iy < this._height)
                {
                    const existing = this._map[iy * this._width + ix];

                    // Only place if tile empty or existing object is lower
                    if(existing === null)
                    {
                        this._map[iy * this._width + ix] = object;
                    }
                    else
                    {
                        const existingLoc = existing.getLocation();
                        const existingModel = existing.getModel();
                        const existingZ = existingLoc ? existingLoc.z : 0;
                        const existingSizeZ = existingModel ? (existingModel.getNumber(RoomObjectVariableEnum.FURNITURE_SIZE_Z) || 0) : 0;

                        if(objectHeight > existingZ + existingSizeZ)
                        {
                            this._map[iy * this._width + ix] = object;
                        }
                    }
                }
            }
        }
    }

    /**
	 * Clear all tiles.
	 */
    clear(): void
    {
        this._map.fill(null);
    }

    /**
	 * Rebuild the whole map from scratch from a fresh object list.
	 * Based on AS3 TileObjectMap.populate()
	 */
    populate(objects: readonly IRoomObject[]): void
    {
        this.clear();

        for(const object of objects) this.addRoomObject(object);
    }

    dispose(): void
    {
        this._map = [];
    }
}
