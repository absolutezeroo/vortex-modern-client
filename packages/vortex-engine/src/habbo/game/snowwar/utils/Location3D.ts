import type {IDisposable} from '@core/runtime/IDisposable';
import {Direction360} from './Direction360';
import type {Direction8} from './Direction8';

/**
 * An integer point in the arena, and the small amount of geometry the game does with one.
 *
 * It is **mutable on purpose**: `changeLocation()` and friends write in place rather than returning
 * a new point, because the simulation moves thousands of these per second and AS3 allocates none of
 * them per step.
 *
 * `distanceTo()` is Manhattan (the sum of the absolute deltas, z included) while `isInDistance()` is
 * Euclidean in 2D and ignores z entirely. They are not two spellings of one idea — the first is a
 * cost, the second is a radius test — and both are AS3's.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/utils/Location3D.as
 */
export class Location3D implements IDisposable
{
    /** Derived name — `_SafeStr_4555`. */
    // AS3: Location3D.as::_SafeStr_4555
    private _x: number;

    /** Derived name — `_SafeStr_4557`. */
    // AS3: Location3D.as::_SafeStr_4557
    private _y: number;

    /** Derived name — `_SafeStr_4713`. */
    // AS3: Location3D.as::_SafeStr_4713
    private _z: number;

    /** Derived name — `_SafeStr_5769`. */
    // AS3: Location3D.as::_SafeStr_5769
    private _disposed: boolean = false;

    // AS3: Location3D.as::Location3D()
    constructor(x: number, y: number, z: number)
    {
        this._x = x;
        this._y = y;
        this._z = z;
    }

    /**
     * Euclidean radius test in 2D, with a cheap rectangular reject first.
     *
     * The comparison is **strictly less than**, so a point at exactly `radius` is *outside*. That
     * matters for the snowball hit test, which is the only caller.
     */
    // AS3: Location3D.as::isInDistanceStatic()
    public static isInDistanceStatic(
        fromX: number, fromY: number, toX: number, toY: number, radius: number
    ): boolean
    {
        let dx = toX - fromX;

        if(dx < 0) dx = -dx;

        let dy = toY - fromY;

        if(dy < 0) dy = -dy;

        if(dy > radius || dx > radius) return false;

        return dx * dx + dy * dy < radius * radius;
    }

    // AS3: Location3D.as::get x()
    public get x(): number
    {
        return this._x;
    }

    // AS3: Location3D.as::get y()
    public get y(): number
    {
        return this._y;
    }

    // AS3: Location3D.as::get z()
    public get z(): number
    {
        return this._z;
    }

    // AS3: Location3D.as::changeLocation()
    public changeLocation(x: number, y: number, z: number): void
    {
        this._x = x;
        this._y = y;
        this._z = z;
    }

    // AS3: Location3D.as::change2DLocation()
    public change2DLocation(x: number, y: number): void
    {
        this._x = x;
        this._y = y;
    }

    // AS3: Location3D.as::changeLocationToLocation()
    public changeLocationToLocation(other: Location3D): void
    {
        this._x = other._x;
        this._y = other._y;
        this._z = other._z;
    }

    /** Manhattan distance, z included. */
    // AS3: Location3D.as::distanceTo()
    public distanceTo(other: Location3D): number
    {
        return Math.trunc(
            Math.abs(other._x - this._x) + Math.abs(other._y - this._y) + Math.abs(other._z - this._z)
        );
    }

    /** Null for the same tile in 2D — z is not consulted, so a point directly above answers null. */
    // AS3: Location3D.as::directionTo()
    public directionTo(other: Location3D): Direction8 | null
    {
        if(other._x === this._x && other._y === this._y) return null;

        return Direction360.direction360ValueToDirection8(
            Direction360.getAngleFromComponents(other._x - this._x, other._y - this._y)
        );
    }

    // AS3: Location3D.as::equals()
    public equals(other: unknown): boolean
    {
        if(this === other) return true;
        if(!(other instanceof Location3D)) return false;

        return this._x === other._x && this._y === other._y && this._z === other._z;
    }

    // AS3: Location3D.as::hashCode()
    public hashCode(): number
    {
        return Math.trunc(29 * (29 * this._x + this._y) + this._z);
    }

    /** AS3's own string, typo included — `"yy:"` where the other two read `"_x:"`/`"_zz:"`. */
    // AS3: Location3D.as::toString()
    public toString(): string
    {
        return `_x:${this._x}yy:${this._y}_zz:${this._z}`;
    }

    // AS3: Location3D.as::isInDistance()
    public isInDistance(other: Location3D, radius: number): boolean
    {
        return Location3D.isInDistanceStatic(this._x, this._y, other._x, other._y, radius);
    }

    // AS3: Location3D.as::dispose()
    public dispose(): void
    {
        this._x = 0;
        this._y = 0;
        this._z = 0;
        this._disposed = true;
    }

    // AS3: Location3D.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }
}
