import {MathUtils} from './MathUtils';

/**
 * One of the eight compass directions, as an instance-based enum: eight singletons that register
 * themselves into `ALL_DIRECTIONS` from their own constructor, so `getDirection8(n)` is a lookup
 * rather than a switch.
 *
 * Rotation is arithmetic on the ordinal masked to 3 bits (`& 7`), which is why the order N, NE, E,
 * SE, S, SW, W, NW matters: +1 is 45° clockwise and +4 is the opposite direction, always.
 *
 * The angle-from-components maths is duplicated here and in `Direction360`, privately in both. That
 * is AS3's, not a porting slip — the two classes each keep their own copy of the 256-entry table
 * and of the function that reads it.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/utils/Direction8.as
 */
export class Direction8
{
    // AS3: Direction8.as::ALL_DIRECTIONS
    public static readonly ALL_DIRECTIONS: Direction8[] = [];

    // AS3: Direction8.as::N
    public static readonly N: Direction8 = new Direction8(0, 'N', 0, -1);

    // AS3: Direction8.as::NE
    public static readonly NE: Direction8 = new Direction8(1, 'NE', 1, -1);

    // AS3: Direction8.as::E
    public static readonly E: Direction8 = new Direction8(2, 'E', 1, 0);

    // AS3: Direction8.as::SE
    public static readonly SE: Direction8 = new Direction8(3, 'SE', 1, 1);

    // AS3: Direction8.as::S
    public static readonly S: Direction8 = new Direction8(4, 'S', 0, 1);

    // AS3: Direction8.as::SW
    public static readonly SW: Direction8 = new Direction8(5, 'SW', -1, 1);

    // AS3: Direction8.as::W
    public static readonly W: Direction8 = new Direction8(6, 'W', -1, 0);

    // AS3: Direction8.as::NW
    public static readonly NW: Direction8 = new Direction8(7, 'NW', -1, -1);

    // AS3: Direction8.as::DEFAULT_ITEM_DIRECTION_8
    public static readonly DEFAULT_ITEM_DIRECTION_8: Direction8 = Direction8.S;

    // AS3: Direction8.as::DEFAULT_AVATAR_DIRECTION_8
    public static readonly DEFAULT_AVATAR_DIRECTION_8: Direction8 = Direction8.SW;

    // AS3: Direction8.as::componentToAngleArray
    private static readonly COMPONENT_TO_ANGLE: readonly number[] = [
        0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6, 6, 7, 7, 7, 7, 8,
        8, 8, 8, 8, 9, 9, 9, 9, 10, 10, 10, 10, 10, 11, 11, 11, 11, 12, 12, 12, 12, 12, 13, 13, 13, 13, 13, 14,
        14, 14, 14, 15, 15, 15, 15, 15, 16, 16, 16, 16, 16, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 19, 19, 19,
        19, 19, 20, 20, 20, 20, 20, 21, 21, 21, 21, 21, 22, 22, 22, 22, 22, 23, 23, 23, 23, 23, 24, 24, 24, 24,
        24, 24, 25, 25, 25, 25, 25, 26, 26, 26, 26, 26, 26, 27, 27, 27, 27, 27, 28, 28, 28, 28, 28, 28, 29, 29,
        29, 29, 29, 29, 30, 30, 30, 30, 30, 30, 31, 31, 31, 31, 31, 31, 32, 32, 32, 32, 32, 32, 33, 33, 33, 33,
        33, 33, 34, 34, 34, 34, 34, 34, 34, 35, 35, 35, 35, 35, 35, 36, 36, 36, 36, 36, 36, 36, 37, 37, 37, 37,
        37, 37, 37, 38, 38, 38, 38, 38, 38, 38, 39, 39, 39, 39, 39, 39, 39, 39, 40, 40, 40, 40, 40, 40, 40, 41,
        41, 41, 41, 41, 41, 41, 41, 42, 42, 42, 42, 42, 42, 42, 42, 43, 43, 43, 43, 43, 43, 43, 43, 44, 44, 44,
        44, 44, 44, 44, 44, 44, 45, 45, 45, 45, 45
    ];

    /** Derived name — `_SafeStr_4615`: the ordinal, 0..7. */
    // AS3: Direction8.as::_SafeStr_4615
    private _value: number;

    /** Derived name — `_SafeStr_9902`: the two-letter label. */
    // AS3: Direction8.as::_SafeStr_9902
    private _name: string;

    /** Derived name — `_SafeStr_10230`. */
    // AS3: Direction8.as::_SafeStr_10230
    private _unitX: number;

    /** Derived name — `_SafeStr_10236`. */
    // AS3: Direction8.as::_SafeStr_10236
    private _unitY: number;

    // AS3: Direction8.as::Direction8()
    constructor(value: number, name: string, unitX: number, unitY: number)
    {
        this._value = value;
        this._name = name;
        this._unitX = unitX;
        this._unitY = unitY;

        Direction8.ALL_DIRECTIONS[value] = this;
    }

    // AS3: Direction8.as::getDirection8()
    public static getDirection8(value: number): Direction8 | null
    {
        if(value < 0 || value > 7) return null;

        return Direction8.ALL_DIRECTIONS[value] ?? null;
    }

    /** Wrapping into 0..7 by masking, which is also what makes a negative rotation work. */
    // AS3: Direction8.as::validateDirection8Value()
    public static validateDirection8Value(value: number): number
    {
        return value & 7;
    }

    /**
     * The direction from one tile to another by sign alone — no angles, no table. Answers null for
     * the same tile, which is the caller's cue that there is no direction to face.
     */
    // AS3: Direction8.as::compatibleCalculateDirectionTo()
    public static compatibleCalculateDirectionTo(
        fromX: number, fromY: number, toX: number, toY: number
    ): Direction8 | null
    {
        const dx = toX - fromX;
        const dy = toY - fromY;

        if(dx === 0 && dy < 0) return Direction8.N;
        if(dx === 0 && dy > 0) return Direction8.S;
        if(dx > 0 && dy < 0) return Direction8.NE;
        if(dx > 0 && dy === 0) return Direction8.E;
        if(dx > 0 && dy > 0) return Direction8.SE;
        if(dx < 0 && dy < 0) return Direction8.NW;
        if(dx < 0 && dy === 0) return Direction8.W;
        if(dx < 0 && dy > 0) return Direction8.SW;

        return null;
    }

    // AS3: Direction8.as::validateDirection360Value()
    private static validateDirection360Value(value: number): number
    {
        if(value > 359) return value % 360;
        if(value < 0) return 360 + (value % 360);

        return value;
    }

    /**
     * AS3: Direction8.as::getAngleFromComponents()
     *
     * A table-driven atan2 that never touches floating point beyond the one division: it scales the
     * shorter component by 256, divides, clamps the index to 0..255 and reads the angle off
     * `COMPONENT_TO_ANGLE`, then places it in the right quadrant by the signs. The whole point is
     * that it produces the same integer the server does — `Math.atan2` would not.
     *
     * Nothing in the AS3 tree calls it; `Direction360`'s public copy is what the game uses. Ported
     * because it is half of what makes the two classes' duplication worth recording.
     */
    // AS3: Direction8.as::getAngleFromComponents()
    private static getAngleFromComponents(x: number, y: number): number
    {
        let index: number;

        if(Math.abs(x) <= Math.abs(y))
        {
            if(y === 0) y = 1;

            x *= 256;
            index = MathUtils.javaDiv(x / y);

            if(index < 0) index = -index;
            if(index > 255) index = 255;

            if(y < 0)
            {
                if(x > 0) return Direction8.COMPONENT_TO_ANGLE[index];

                return 360 - Direction8.COMPONENT_TO_ANGLE[index];
            }

            if(x > 0) return 180 - Direction8.COMPONENT_TO_ANGLE[index];

            return 180 + Direction8.COMPONENT_TO_ANGLE[index];
        }

        if(x === 0) x = 1;

        y *= 256;
        index = MathUtils.javaDiv(y / x);

        if(index < 0) index = -index;
        if(index > 255) index = 255;

        if(y < 0)
        {
            if(x > 0) return 90 - Direction8.COMPONENT_TO_ANGLE[index];

            return 270 + Direction8.COMPONENT_TO_ANGLE[index];
        }

        if(x > 0) return 90 + Direction8.COMPONENT_TO_ANGLE[index];

        return 270 - Direction8.COMPONENT_TO_ANGLE[index];
    }

    // AS3: Direction8.as::intValue()
    public intValue(): number
    {
        return this._value;
    }

    // AS3: Direction8.as::oppositeDirection()
    public oppositeDirection(): Direction8
    {
        return this.rotateDirection(4);
    }

    // AS3: Direction8.as::rotateDirection45Degrees()
    public rotateDirection45Degrees(clockwise: boolean): Direction8
    {
        return this.rotateDirection(clockwise ? 1 : -1);
    }

    // AS3: Direction8.as::rotateDirection90Degrees()
    public rotateDirection90Degrees(clockwise: boolean): Direction8
    {
        return this.rotateDirection(clockwise ? 2 : -2);
    }

    /**
     * **AS3 has this backwards and it is transcribed as written**: an even ordinal is N/E/S/W, the
     * *cardinal* directions, so this answers true for exactly the four that are not diagonal.
     * Nothing in the AS3 tree reads it, which is presumably how the mistake survived.
     */
    // AS3: Direction8.as::isDiagonal()
    public isDiagonal(): boolean
    {
        return this._value % 2 === 0;
    }

    // AS3: Direction8.as::hashCode()
    public hashCode(): number
    {
        return this._value;
    }

    // AS3: Direction8.as::rotateDirection()
    public rotateDirection(steps: number): Direction8
    {
        return Direction8.ALL_DIRECTIONS[Direction8.validateDirection8Value(this._value + steps)];
    }

    // AS3: Direction8.as::toString()
    public toString(): string
    {
        return `${this._name}(${this._value})`;
    }

    // AS3: Direction8.as::directionString()
    public directionString(): string
    {
        return this._name;
    }

    // AS3: Direction8.as::getUnitVectorXcomponent()
    public getUnitVectorXcomponent(): number
    {
        return this._unitX;
    }

    // AS3: Direction8.as::getUnitVectorYcomponent()
    public getUnitVectorYcomponent(): number
    {
        return this._unitY;
    }
}
