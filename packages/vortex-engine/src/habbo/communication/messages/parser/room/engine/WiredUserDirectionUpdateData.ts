/**
 * WiredUserDirectionUpdateData — one avatar turn inside a wired movements bundle (header 325, entry
 * type 3).
 *
 * Name derived: fully obfuscated in AS3 (class `_SafeCls_3917`); named after the readable
 * `userDirectionUpdates` collection it belongs to.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2184/_SafeCls_3917.as
 */
export class WiredUserDirectionUpdateData
{
    // AS3: _SafeCls_3917.as::_SafeCls_3917()
    constructor(
        private readonly _userIndex: number,
        private readonly _bodyDirection: number,
        private readonly _headDirection: number
    )
    {
    }

    // AS3: _SafeCls_3917.as::get userIndex()
    get userIndex(): number
    {
        return this._userIndex;
    }

    // AS3: _SafeCls_3917.as::get bodyDirection()
    get bodyDirection(): number
    {
        return this._bodyDirection;
    }

    // AS3: _SafeCls_3917.as::get headDirection()
    get headDirection(): number
    {
        return this._headDirection;
    }
}
