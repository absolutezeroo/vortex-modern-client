import type {JsonPoint} from './JsonPoint';

/**
 * One mask applied to a room plane, inside the room-render JSON payload.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2901/JsonMaskDrawingData.as
 */
export class JsonMaskDrawingData
{
    // AS3: .../_SafePkg_2901/JsonMaskDrawingData.as::_name
    private readonly _name: string;

    // AS3: .../_SafePkg_2901/JsonMaskDrawingData.as::_SafeStr_5184
    private readonly _location: JsonPoint;

    // AS3: .../_SafePkg_2901/JsonMaskDrawingData.as::_flipH
    private readonly _flipH: boolean;

    // AS3: .../_SafePkg_2901/JsonMaskDrawingData.as::_flipV
    private readonly _flipV: boolean;

    // AS3: .../_SafePkg_2901/JsonMaskDrawingData.as::JsonMaskDrawingData()
    constructor(name: string, location: JsonPoint, flipH: boolean, flipV: boolean)
    {
        this._name = name;
        this._location = location;
        this._flipH = flipH;
        this._flipV = flipV;
    }

    // AS3: .../_SafePkg_2901/JsonMaskDrawingData.as::get name()
    get name(): string
    {
        return this._name;
    }

    // AS3: .../_SafePkg_2901/JsonMaskDrawingData.as::get location()
    get location(): JsonPoint
    {
        return this._location;
    }

    // AS3: .../_SafePkg_2901/JsonMaskDrawingData.as::get flipH()
    get flipH(): boolean
    {
        return this._flipH;
    }

    // AS3: .../_SafePkg_2901/JsonMaskDrawingData.as::get flipV()
    get flipV(): boolean
    {
        return this._flipV;
    }

    // TS-only: see JsonPoint.toJSON(). Key order is the AS3 accessor declaration order.
    toJSON(): { name: string; location: JsonPoint; flipH: boolean; flipV: boolean }
    {
        return {
            name: this._name,
            location: this._location,
            flipH: this._flipH,
            flipV: this._flipV
        };
    }
}
