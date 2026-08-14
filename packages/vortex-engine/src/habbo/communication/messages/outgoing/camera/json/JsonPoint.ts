/**
 * A point inside the room-render JSON payload.
 *
 * The AS3 class is `[SecureSWF(rename="false")]` — its accessor names survive obfuscation on
 * purpose, because `JSON.stringify` turns them into the payload's keys. Renaming a member here
 * changes the wire format.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2901/JsonPoint.as
 */
export class JsonPoint
{
    // AS3: .../_SafePkg_2901/JsonPoint.as::_SafeStr_4555
    private readonly _x: number;

    // AS3: .../_SafePkg_2901/JsonPoint.as::_SafeStr_4557
    private readonly _y: number;

    // AS3: .../_SafePkg_2901/JsonPoint.as::JsonPoint()
    constructor(x: number, y: number)
    {
        this._x = x;
        this._y = y;
    }

    // AS3: .../_SafePkg_2901/JsonPoint.as::get x()
    get x(): number
    {
        return this._x;
    }

    // AS3: .../_SafePkg_2901/JsonPoint.as::get y()
    get y(): number
    {
        return this._y;
    }

    // TS-only: no AS3 counterpart. AS3's JSON.stringify walks a sealed class's public traits, so
    // the getters above ARE the payload. TypeScript's stringify only sees own enumerable fields and
    // would emit `_x`/`_y` instead, so the mapping has to be written out. Key order follows the AS3
    // declaration order because the payload is checksummed as a string.
    toJSON(): { x: number; y: number }
    {
        return {x: this._x, y: this._y};
    }
}
