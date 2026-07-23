/**
 * WiredWallItemMoveData — one wall-item move inside a wired movements bundle (header 325, entry
 * type 2). Positions are wall coordinates; the handler converts them through LegacyWallGeometry.
 *
 * Name derived: fully obfuscated in AS3 (class `_SafeCls_3201`); named after the readable
 * `wallItemMoves` collection it belongs to.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2184/_SafeCls_3201.as
 */
export class WiredWallItemMoveData
{
    // AS3: _SafeCls_3201.as::_SafeCls_3201()
    constructor(
        private readonly _itemId: number,
        private readonly _isDirectionRight: boolean,
        private readonly _oldWallX: number,
        private readonly _oldWallY: number,
        private readonly _oldOffsetX: number,
        private readonly _oldOffsetY: number,
        private readonly _newWallX: number,
        private readonly _newWallY: number,
        private readonly _newOffsetX: number,
        private readonly _newOffsetY: number,
        private readonly _animationTime: number
    )
    {
    }

    // AS3: _SafeCls_3201.as::get itemId()
    get itemId(): number
    {
        return this._itemId;
    }

    // AS3: _SafeCls_3201.as::get isDirectionRight()
    get isDirectionRight(): boolean
    {
        return this._isDirectionRight;
    }

    // AS3: _SafeCls_3201.as::get oldWallX()
    get oldWallX(): number
    {
        return this._oldWallX;
    }

    // AS3: _SafeCls_3201.as::get oldWallY()
    get oldWallY(): number
    {
        return this._oldWallY;
    }

    // AS3: _SafeCls_3201.as::get oldOffsetX()
    get oldOffsetX(): number
    {
        return this._oldOffsetX;
    }

    // AS3: _SafeCls_3201.as::get oldOffsetY()
    get oldOffsetY(): number
    {
        return this._oldOffsetY;
    }

    // AS3: _SafeCls_3201.as::get newWallX()
    get newWallX(): number
    {
        return this._newWallX;
    }

    // AS3: _SafeCls_3201.as::get newWallY()
    get newWallY(): number
    {
        return this._newWallY;
    }

    // AS3: _SafeCls_3201.as::get newOffsetX()
    get newOffsetX(): number
    {
        return this._newOffsetX;
    }

    // AS3: _SafeCls_3201.as::get newOffsetY()
    get newOffsetY(): number
    {
        return this._newOffsetY;
    }

    // AS3: _SafeCls_3201.as::get animationTime()
    get animationTime(): number
    {
        return this._animationTime;
    }
}
