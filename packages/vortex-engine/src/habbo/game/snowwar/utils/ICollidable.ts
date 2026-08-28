import type {IDisposable} from '@core/runtime/IDisposable';
import type {Direction360} from './Direction360';
import type {Location3D} from './Location3D';

/**
 * Anything the collision tests can be run against: a bounding shape, its numbers, where it is and
 * which way it faces.
 *
 * Interface name DERIVED — obfuscated in every tree as `_SafeCls_2823`, named from its only use.
 *
 * `boundingData` is a bare number array whose meaning depends on `boundingType`, and the indices
 * are the `BOUNDING_DATA_*` constants on `CollisionUtils`. A triple-circle uses all six; a circle
 * uses one; a point uses none.
 *
 * `direction360` matters because the two offset circles of a triple-circle rotate with the object —
 * that is what makes a player's shape longer in the direction they face.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/utils/_SafeCls_2823.as
 */
export interface ICollidable extends IDisposable
{
    // AS3: _SafeCls_2823.as::get boundingType()
    readonly boundingType: number;

    // AS3: _SafeCls_2823.as::get boundingData()
    readonly boundingData: number[];

    // AS3: _SafeCls_2823.as::get location3D()
    readonly location3D: Location3D;

    // AS3: _SafeCls_2823.as::get direction360()
    readonly direction360: Direction360;
}
