import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {FuseObjectData} from './FuseObjectData';

/**
 * A snow-war arena as the server describes it: its extent, its terrain and its scenery.
 *
 * `heightMap` is one string, not a grid — the same base-33 encoding the room's own floor plan uses,
 * one character per tile, row-major across `width`. The arena decodes it into its pathfinding grid.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/game/snowwar/data/GameLevelData.as
 */
export class GameLevelData
{
    // AS3: GameLevelData.as::_width
    private _width: number = 0;

    /** Derived name — `_SafeStr_4970`. */
    // AS3: GameLevelData.as::_SafeStr_4970
    private _height: number = 0;

    /** Derived name — `_SafeStr_5612`. */
    // AS3: GameLevelData.as::_SafeStr_5612
    private _heightMap: string = '';

    /** Derived name — `_SafeStr_7665`. */
    // AS3: GameLevelData.as::_SafeStr_7665
    private _fuseObjects: FuseObjectData[] = [];

    // AS3: GameLevelData.as::GameLevelData()
    constructor(wrapper: IMessageDataWrapper)
    {
        this.parse(wrapper);
    }

    // AS3: GameLevelData.as::parse()
    public parse(wrapper: IMessageDataWrapper): void
    {
        this._width = wrapper.readInt();
        this._height = wrapper.readInt();
        this._heightMap = wrapper.readString();

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            const object = new FuseObjectData();

            object.parse(wrapper);

            this._fuseObjects.push(object);
        }
    }

    // AS3: GameLevelData.as::get width()
    public get width(): number
    {
        return this._width;
    }

    // AS3: GameLevelData.as::get height()
    public get height(): number
    {
        return this._height;
    }

    // AS3: GameLevelData.as::get heightMap()
    public get heightMap(): string
    {
        return this._heightMap;
    }

    // AS3: GameLevelData.as::get fuseObjects()
    public get fuseObjects(): FuseObjectData[]
    {
        return this._fuseObjects;
    }
}
