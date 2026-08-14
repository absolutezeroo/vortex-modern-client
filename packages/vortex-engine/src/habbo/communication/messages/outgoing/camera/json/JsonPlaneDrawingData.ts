import {JsonPoint} from './JsonPoint';
import type {JsonMaskDrawingData} from './JsonMaskDrawingData';
import type {JsonTextureColumnData} from './JsonTextureColumnData';

/**
 * One room plane (floor tile, wall segment) inside the room-render JSON payload.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2901/JsonPlaneDrawingData.as
 */
export class JsonPlaneDrawingData
{
    // AS3: .../_SafePkg_2901/JsonPlaneDrawingData.as::_SafeStr_4713
    private _z: number = 0;

    // AS3: .../_SafePkg_2901/JsonPlaneDrawingData.as::_SafeStr_6600
    private readonly _cornerPoints: JsonPoint[] = [];

    // AS3: .../_SafePkg_2901/JsonPlaneDrawingData.as::_color
    private _color: number = 0;

    // AS3: .../_SafePkg_2901/JsonPlaneDrawingData.as::_SafeStr_4893
    private readonly _masks: JsonMaskDrawingData[] = [];

    // AS3: .../_SafePkg_2901/JsonPlaneDrawingData.as::_SafeStr_9059
    private _bottomAligned: boolean = false;

    // AS3: .../_SafePkg_2901/JsonPlaneDrawingData.as::_SafeStr_8627
    private readonly _texCols: JsonTextureColumnData[] = [];

    // AS3: .../_SafePkg_2901/JsonPlaneDrawingData.as::get z()
    get z(): number
    {
        return this._z;
    }

    // AS3: .../_SafePkg_2901/JsonPlaneDrawingData.as::set z()
    set z(value: number)
    {
        this._z = value;
    }

    // AS3: .../_SafePkg_2901/JsonPlaneDrawingData.as::get cornerPoints()
    get cornerPoints(): JsonPoint[]
    {
        return this._cornerPoints;
    }

    // AS3: .../_SafePkg_2901/JsonPlaneDrawingData.as::addCornerPoint()
    addCornerPoint(x: number, y: number): void
    {
        this._cornerPoints.push(new JsonPoint(x, y));
    }

    // AS3: .../_SafePkg_2901/JsonPlaneDrawingData.as::get masks()
    get masks(): JsonMaskDrawingData[]
    {
        return this._masks;
    }

    // AS3: .../_SafePkg_2901/JsonPlaneDrawingData.as::addMask()
    addMask(mask: JsonMaskDrawingData): void
    {
        this._masks.push(mask);
    }

    // AS3: .../_SafePkg_2901/JsonPlaneDrawingData.as::get color()
    get color(): number
    {
        return this._color;
    }

    // AS3: .../_SafePkg_2901/JsonPlaneDrawingData.as::set color()
    set color(value: number)
    {
        this._color = value;
    }

    // AS3: .../_SafePkg_2901/JsonPlaneDrawingData.as::get bottomAligned()
    get bottomAligned(): boolean
    {
        return this._bottomAligned;
    }

    // AS3: .../_SafePkg_2901/JsonPlaneDrawingData.as::setBottomAligned()
    setBottomAligned(value: boolean): void
    {
        this._bottomAligned = value;
    }

    // AS3: .../_SafePkg_2901/JsonPlaneDrawingData.as::get texCols()
    get texCols(): JsonTextureColumnData[]
    {
        return this._texCols;
    }

    // AS3: .../_SafePkg_2901/JsonPlaneDrawingData.as::addTexCol()
    addTexCol(texCol: JsonTextureColumnData): void
    {
        this._texCols.push(texCol);
    }

    // TS-only: see JsonPoint.toJSON(). Key order is the AS3 accessor declaration order, which is
    // also the order AS3's JSON.stringify emits — the payload is checksummed as a string, so the
    // order is part of the wire format, not cosmetic.
    toJSON(): {
        z: number;
        cornerPoints: JsonPoint[];
        masks: JsonMaskDrawingData[];
        color: number;
        bottomAligned: boolean;
        texCols: JsonTextureColumnData[];
    }
    {
        return {
            z: this._z,
            cornerPoints: this._cornerPoints,
            masks: this._masks,
            color: this._color,
            bottomAligned: this._bottomAligned,
            texCols: this._texCols
        };
    }
}
