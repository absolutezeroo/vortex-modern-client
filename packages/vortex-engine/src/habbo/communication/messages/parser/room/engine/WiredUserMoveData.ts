import type {Vector3d} from '@room/utils/Vector3d';

/**
 * WiredUserMoveData — one avatar move inside a wired movements bundle (header 325, entry type 0).
 *
 * Name derived: fully obfuscated in AS3 (class `_SafeCls_3595`); named after the readable
 * `userMoves` collection it belongs to.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2184/_SafeCls_3595.as
 */
export class WiredUserMoveData
{
    // AS3: _SafeCls_3595.as::_SafeCls_3595()
    constructor(
        private readonly _userIndex: number,
        private readonly _source: Vector3d,
        private readonly _target: Vector3d,
        private readonly _moveType: string,
        private readonly _animationTime: number,
        private readonly _bodyDirection: number,
        private readonly _headDirection: number,
        private readonly _jumpPower: number
    )
    {
    }

    // AS3: _SafeCls_3595.as::get userIndex()
    get userIndex(): number
    {
        return this._userIndex;
    }

    // AS3: _SafeCls_3595.as::get source()
    get source(): Vector3d
    {
        return this._source;
    }

    // AS3: _SafeCls_3595.as::get target()
    get target(): Vector3d
    {
        return this._target;
    }

    // AS3: _SafeCls_3595.as::get moveType()
    get moveType(): string
    {
        return this._moveType;
    }

    // AS3: _SafeCls_3595.as::get animationTime()
    get animationTime(): number
    {
        return this._animationTime;
    }

    // AS3: _SafeCls_3595.as::get bodyDirection()
    get bodyDirection(): number
    {
        return this._bodyDirection;
    }

    // AS3: _SafeCls_3595.as::get headDirection()
    get headDirection(): number
    {
        return this._headDirection;
    }

    // AS3: _SafeCls_3595.as::get jumpPower()
    get jumpPower(): number
    {
        return this._jumpPower;
    }
}
