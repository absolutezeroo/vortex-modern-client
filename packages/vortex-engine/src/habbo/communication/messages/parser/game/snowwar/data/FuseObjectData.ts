import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IStuffData} from '@habbo/room/object/data/IStuffData';
import {FurnitureDataParser} from '../../../room/engine/FurnitureDataParser';

/**
 * One piece of scenery in a snow-war arena: a tree, a snowball machine, a pile.
 *
 * They arrive inside the level rather than through the room engine, because a game arena is not a
 * room — the same eleven fields describe both the collision footprint (`xDimension`/`yDimension`/
 * `canStandOn`) and how to draw it (`name`, `direction`, `stuffData`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/game/snowwar/data/FuseObjectData.as
 */
export class FuseObjectData
{
    // AS3: FuseObjectData.as::_name
    private _name: string = '';

    /** Derived name — `_SafeStr_4872`. */
    // AS3: FuseObjectData.as::_SafeStr_4872
    private _id: number = 0;

    /** Derived name — `_SafeStr_4555`. */
    // AS3: FuseObjectData.as::_SafeStr_4555
    private _x: number = 0;

    /** Derived name — `_SafeStr_4557`. */
    // AS3: FuseObjectData.as::_SafeStr_4557
    private _y: number = 0;

    /** Derived name — `_SafeStr_10049`. */
    // AS3: FuseObjectData.as::_SafeStr_10049
    private _xDimension: number = 0;

    /** Derived name — `_SafeStr_9375`. */
    // AS3: FuseObjectData.as::_SafeStr_9375
    private _yDimension: number = 0;

    /** Derived name — `_SafeStr_4970`. */
    // AS3: FuseObjectData.as::_SafeStr_4970
    private _height: number = 0;

    /** Derived name — `_SafeStr_4615`. */
    // AS3: FuseObjectData.as::_SafeStr_4615
    private _direction: number = 0;

    /** Derived name — `_SafeStr_9111`. */
    // AS3: FuseObjectData.as::_SafeStr_9111
    private _altitude: number = 0;

    /** Derived name — `_SafeStr_9169`. */
    // AS3: FuseObjectData.as::_SafeStr_9169
    private _canStandOn: boolean = false;

    /** Derived name — `_SafeStr_6565`. */
    // AS3: FuseObjectData.as::_SafeStr_6565
    private _stuffData: IStuffData | null = null;

    /**
     * The stuff data is read by the *same* shared parser the room engine uses, which is why the
     * arena can hand these objects to the normal furniture visualizations.
     */
    // AS3: FuseObjectData.as::parse()
    public parse(wrapper: IMessageDataWrapper): void
    {
        this._name = wrapper.readString();
        this._id = wrapper.readInt();
        this._x = wrapper.readInt();
        this._y = wrapper.readInt();
        this._xDimension = wrapper.readInt();
        this._yDimension = wrapper.readInt();
        this._height = wrapper.readInt();
        this._direction = wrapper.readInt();
        this._altitude = wrapper.readInt();
        this._canStandOn = wrapper.readBoolean();
        this._stuffData = FurnitureDataParser.parseStuffData(wrapper);
    }

    // AS3: FuseObjectData.as::get name()
    public get name(): string
    {
        return this._name;
    }

    // AS3: FuseObjectData.as::get id()
    public get id(): number
    {
        return this._id;
    }

    // AS3: FuseObjectData.as::get x()
    public get x(): number
    {
        return this._x;
    }

    // AS3: FuseObjectData.as::get y()
    public get y(): number
    {
        return this._y;
    }

    // AS3: FuseObjectData.as::get xDimension()
    public get xDimension(): number
    {
        return this._xDimension;
    }

    // AS3: FuseObjectData.as::get yDimension()
    public get yDimension(): number
    {
        return this._yDimension;
    }

    // AS3: FuseObjectData.as::get height()
    public get height(): number
    {
        return this._height;
    }

    // AS3: FuseObjectData.as::get direction()
    public get direction(): number
    {
        return this._direction;
    }

    // AS3: FuseObjectData.as::get altitude()
    public get altitude(): number
    {
        return this._altitude;
    }

    // AS3: FuseObjectData.as::get canStandOn()
    public get canStandOn(): boolean
    {
        return this._canStandOn;
    }

    // AS3: FuseObjectData.as::get stuffData()
    public get stuffData(): IStuffData | null
    {
        return this._stuffData;
    }
}
