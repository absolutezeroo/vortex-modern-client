import type {Vector3d} from '@room/utils/Vector3d';

/**
 * WiredFurniMoveData — one floor-furni move inside a wired movements bundle (header 325, entry
 * type 1). Carries the two optional ballistics fields wired sliders use: overshoot and curve.
 *
 * Name derived: fully obfuscated in AS3 (class `_SafeCls_2481`); named after the readable
 * `furniMoves` collection it belongs to.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2184/_SafeCls_2481.as
 */
export class WiredFurniMoveData
{
    // AS3: _SafeCls_2481.as::_SafeCls_2481()
    constructor(
        private readonly _furniId: number,
        private readonly _source: Vector3d,
        private readonly _target: Vector3d,
        private readonly _animationTime: number,
        private readonly _rotation: number,
        private readonly _overshootingDistance: number,
        private readonly _curveStrength: number
    )
    {
    }

    // AS3: _SafeCls_2481.as::get furniId()
    get furniId(): number
    {
        return this._furniId;
    }

    // AS3: _SafeCls_2481.as::get source()
    get source(): Vector3d
    {
        return this._source;
    }

    // AS3: _SafeCls_2481.as::get target()
    get target(): Vector3d
    {
        return this._target;
    }

    // AS3: _SafeCls_2481.as::get animationTime()
    get animationTime(): number
    {
        return this._animationTime;
    }

    // AS3: _SafeCls_2481.as::get rotation()
    get rotation(): number
    {
        return this._rotation;
    }

    // AS3: _SafeCls_2481.as::get overshootingDistance()
    get overshootingDistance(): number
    {
        return this._overshootingDistance;
    }

    // AS3: _SafeCls_2481.as::get curveStrength()
    get curveStrength(): number
    {
        return this._curveStrength;
    }
}
