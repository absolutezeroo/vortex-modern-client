import {Direction8} from './Direction8';
import {MathUtils} from './MathUtils';

/**
 * A heading in whole degrees, 0..359, with N at 0 and the angle increasing clockwise.
 *
 * Everything here is integer arithmetic against three lookup tables, and that is the point: Snow
 * War is lock-step deterministic, so the client has to land on the same degree the server did.
 * `Math.atan2`/`Math.sin` would agree *almost* always, and almost is a desync.
 *
 *  - `BASE_VECTOR_X`/`BASE_VECTOR_Y` are sine and cosine scaled by 256, one entry per degree. They
 *    peak at exactly 256 (index 90 for x, 270 for y) rather than 255, which is why a caller
 *    dividing by 256 gets a clean unit vector.
 *  - `COMPONENT_TO_ANGLE` is the arctangent of a 0..255 ratio, giving 0..45°; the quadrant comes
 *    from the signs afterwards.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/utils/Direction360.as
 */
export class Direction360
{
    /**
     * Derived name — `_SafeStr_11700`. Declared, never read: no member of this class or any other
     * in the AS3 tree references it.
     */
    // AS3: Direction360.as::_SafeStr_11700
    private static readonly UNUSED_SCALE: number = 1;

    // AS3: Direction360.as::N
    public static readonly N: number = 0;

    // AS3: Direction360.as::NE
    public static readonly NE: number = 45;

    // AS3: Direction360.as::E
    public static readonly E: number = 90;

    // AS3: Direction360.as::SE
    public static readonly SE: number = 135;

    // AS3: Direction360.as::S
    public static readonly S: number = 180;

    // AS3: Direction360.as::SW
    public static readonly SW: number = 225;

    // AS3: Direction360.as::W
    public static readonly W: number = 270;

    // AS3: Direction360.as::NW
    public static readonly NW: number = 315;

    /**
     * Derived names — AS3 keeps both as one `_SafeStr_7394[2][360]`. Split in two here because a
     * pair of flat arrays is what every reader of it actually wants, and the accessors below are
     * the only way in either way.
     */
    // AS3: Direction360.as::_SafeStr_7394 (first row)
    private static readonly BASE_VECTOR_X: readonly number[] = [
        0, 4, 8, 13, 17, 22, 26, 31, 35, 40, 44, 48, 53, 57, 61, 66, 70, 74, 79, 83, 87, 91, 95, 100, 104, 108,
        112, 116, 120, 124, 127, 131, 135, 139, 143, 146, 150, 154, 157, 161, 164, 167, 171, 174, 177, 181, 184,
        187, 190, 193, 196, 198, 201, 204, 207, 209, 212, 214, 217, 219, 221, 223, 226, 228, 230, 232, 233, 235,
        237, 238, 240, 242, 243, 244, 246, 247, 248, 249, 250, 251, 252, 252, 253, 254, 254, 255, 255, 255, 255,
        255, 256, 255, 255, 255, 255, 255, 254, 254, 253, 252, 252, 251, 250, 249, 248, 247, 246, 244, 243, 242,
        240, 238, 237, 235, 233, 232, 230, 228, 226, 223, 221, 219, 217, 214, 212, 209, 207, 204, 201, 198, 196,
        193, 190, 187, 184, 181, 177, 174, 171, 167, 164, 161, 157, 154, 150, 146, 143, 139, 135, 131, 127, 124,
        120, 116, 112, 108, 104, 100, 95, 91, 87, 83, 79, 74, 70, 66, 61, 57, 53, 48, 44, 40, 35, 31, 26, 22,
        17, 13, 8, 4, 0, -4, -8, -13, -17, -22, -26, -31, -35, -40, -44, -48, -53, -57, -61, -66, -70, -74, -79,
        -83, -87, -91, -95, -100, -104, -108, -112, -116, -120, -124, -128, -131, -135, -139, -143, -146, -150,
        -154, -157, -161, -164, -167, -171, -174, -177, -181, -184, -187, -190, -193, -196, -198, -201, -204,
        -207, -209, -212, -214, -217, -219, -221, -223, -226, -228, -230, -232, -233, -235, -237, -238, -240,
        -242, -243, -244, -246, -247, -248, -249, -250, -251, -252, -252, -253, -254, -254, -255, -255, -255,
        -255, -255, -256, -255, -255, -255, -255, -255, -254, -254, -253, -252, -252, -251, -250, -249, -248,
        -247, -246, -244, -243, -242, -240, -238, -237, -235, -233, -232, -230, -228, -226, -223, -221, -219,
        -217, -214, -212, -209, -207, -204, -201, -198, -196, -193, -190, -187, -184, -181, -177, -174, -171,
        -167, -164, -161, -157, -154, -150, -146, -143, -139, -135, -131, -128, -124, -120, -116, -112, -108,
        -104, -100, -95, -91, -87, -83, -79, -74, -70, -66, -61, -57, -53, -48, -44, -40, -35, -31, -26, -22,
        -17, -13, -8, -4
    ];

    // AS3: Direction360.as::_SafeStr_7394 (second row)
    private static readonly BASE_VECTOR_Y: readonly number[] = [
        -256, -255, -255, -255, -255, -255, -254, -254, -253, -252, -252, -251, -250, -249, -248, -247, -246,
        -244, -243, -242, -240, -238, -237, -235, -233, -232, -230, -228, -226, -223, -221, -219, -217, -214,
        -212, -209, -207, -204, -201, -198, -196, -193, -190, -187, -184, -181, -177, -174, -171, -167, -164,
        -161, -157, -154, -150, -146, -143, -139, -135, -131, -128, -124, -120, -116, -112, -108, -104, -100,
        -95, -91, -87, -83, -79, -74, -70, -66, -61, -57, -53, -48, -44, -40, -35, -31, -26, -22, -17, -13, -8,
        -4, 0, 4, 8, 13, 17, 22, 26, 31, 35, 40, 44, 48, 53, 57, 61, 66, 70, 74, 79, 83, 87, 91, 95, 100, 104,
        108, 112, 116, 120, 124, 127, 131, 135, 139, 143, 146, 150, 154, 157, 161, 164, 167, 171, 174, 177, 181,
        184, 187, 190, 193, 196, 198, 201, 204, 207, 209, 212, 214, 217, 219, 221, 223, 226, 228, 230, 232, 233,
        235, 237, 238, 240, 242, 243, 244, 246, 247, 248, 249, 250, 251, 252, 252, 253, 254, 254, 255, 255, 255,
        255, 255, 256, 255, 255, 255, 255, 255, 254, 254, 253, 252, 252, 251, 250, 249, 248, 247, 246, 244, 243,
        242, 240, 238, 237, 235, 233, 232, 230, 228, 226, 223, 221, 219, 217, 214, 212, 209, 207, 204, 201, 198,
        196, 193, 190, 187, 184, 181, 177, 174, 171, 167, 164, 161, 157, 154, 150, 146, 143, 139, 135, 131, 128,
        124, 120, 116, 112, 108, 104, 100, 95, 91, 87, 83, 79, 74, 70, 66, 61, 57, 53, 48, 44, 40, 35, 31, 26,
        22, 17, 13, 8, 4, 0, -4, -8, -13, -17, -22, -26, -31, -35, -40, -44, -48, -53, -57, -61, -66, -70, -74,
        -79, -83, -87, -91, -95, -100, -104, -108, -112, -116, -120, -124, -128, -131, -135, -139, -143, -146,
        -150, -154, -157, -161, -164, -167, -171, -174, -177, -181, -184, -187, -190, -193, -196, -198, -201,
        -204, -207, -209, -212, -214, -217, -219, -221, -223, -226, -228, -230, -232, -233, -235, -237, -238,
        -240, -242, -243, -244, -246, -247, -248, -249, -250, -251, -252, -252, -253, -254, -254, -255, -255,
        -255, -255, -255
    ];

    // AS3: Direction360.as::componentToAngleArray
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

    /** Derived name — `_SafeStr_5035`: this instance's heading. */
    // AS3: Direction360.as::_SafeStr_5035
    private _value: number = 0;

    /** Derived name — `_SafeStr_5769`. */
    // AS3: Direction360.as::_SafeStr_5769
    private _disposed: boolean = false;

    // AS3: Direction360.as::Direction360()
    constructor(value: number)
    {
        this._value = value;
    }

    /**
     * Wraps any integer into 0..359. Note the negative branch is `360 + (v % 360)`, so -360 comes
     * back as 360 rather than 0 — transcribed as written, and harmless because every caller feeds
     * it a small offset.
     */
    // AS3: Direction360.as::validateDirection360Value()
    public static validateDirection360Value(value: number): number
    {
        if(value > 359) return value % 360;
        if(value < 0) return 360 + (value % 360);

        return value;
    }

    /**
     * The nearest eighth. The `- 22` before the divide is what makes each 45° sector centre on its
     * direction instead of starting at it, and the `+ 1` after it is the off-by-one that pairs with
     * it — together they map 338..22 to N.
     */
    // AS3: Direction360.as::direction360ValueToDirection8()
    public static direction360ValueToDirection8(value: number): Direction8 | null
    {
        return Direction8.getDirection8(
            Direction8.validateDirection8Value(
                MathUtils.javaDiv(Direction360.validateDirection360Value(value - 22) / 45) + 1
            )
        );
    }

    // AS3: Direction360.as::direction8ToDirection360Value()
    public static direction8ToDirection360Value(direction: Direction8): number
    {
        switch(direction.intValue())
        {
            case 0: return 0;
            case 1: return 45;
            case 2: return 90;
            case 3: return 135;
            case 4: return 180;
            case 5: return 225;
            case 6: return 270;
            case 7: return 315;
            default: return -1;
        }
    }

    // AS3: Direction360.as::getBaseVectorXComponent()
    public static getBaseVectorXComponent(value: number): number
    {
        return Direction360.BASE_VECTOR_X[Direction360.validateDirection360Value(value)];
    }

    // AS3: Direction360.as::getBaseVectorYComponent()
    public static getBaseVectorYComponent(value: number): number
    {
        return Direction360.BASE_VECTOR_Y[Direction360.validateDirection360Value(value)];
    }

    /**
     * AS3: Direction360.as::getAngleFromComponents()
     *
     * Scales the shorter component by 256, divides by the longer, clamps the ratio to 0..255 and
     * reads the angle off the table, then places it in the right quadrant by the two signs.
     * `Direction8` carries a private copy of this and of the table; that duplication is AS3's.
     */
    // AS3: Direction360.as::getAngleFromComponents()
    public static getAngleFromComponents(x: number, y: number): number
    {
        let index: number;

        if(Direction360.absoluteValue(x) <= Direction360.absoluteValue(y))
        {
            if(y === 0) y = 1;

            x *= 256;
            index = MathUtils.javaDiv(x / y);

            if(index < 0) index = -index;
            if(index > 255) index = 255;

            if(y < 0)
            {
                if(x > 0) return Direction360.COMPONENT_TO_ANGLE[index];

                return 360 - Direction360.COMPONENT_TO_ANGLE[index];
            }

            if(x > 0) return 180 - Direction360.COMPONENT_TO_ANGLE[index];

            return 180 + Direction360.COMPONENT_TO_ANGLE[index];
        }

        if(x === 0) x = 1;

        y *= 256;
        index = MathUtils.javaDiv(y / x);

        if(index < 0) index = -index;
        if(index > 255) index = 255;

        if(y < 0)
        {
            if(x > 0) return 90 - Direction360.COMPONENT_TO_ANGLE[index];

            return 270 + Direction360.COMPONENT_TO_ANGLE[index];
        }

        if(x > 0) return 90 + Direction360.COMPONENT_TO_ANGLE[index];

        return 270 - Direction360.COMPONENT_TO_ANGLE[index];
    }

    // AS3: Direction360.as::absoluteValue()
    public static absoluteValue(value: number): number
    {
        if(value < 0) return -value;

        return value;
    }

    /**
     * Dead in AS3 too — nothing calls it, and it is wrong if anything ever did: the arguments are
     * the wrong way round for `atan2` and the radian conversion is applied to the second one.
     * Transcribed rather than quietly dropped, because a reader looking for the float path should
     * find it and see why it is not used.
     */
    // AS3: Direction360.as::getAngleAtan()
    private static getAngleAtan(x: number, y: number): number
    {
        return Math.trunc(Math.atan2(x, y * 57.295 + 0.5));
    }

    // AS3: Direction360.as::dispose()
    public dispose(): void
    {
        this._disposed = true;
    }

    // AS3: Direction360.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: Direction360.as::intValue()
    public intValue(): number
    {
        return this._value;
    }

    // AS3: Direction360.as::setIntValue()
    public setIntValue(value: number): void
    {
        this._value = Direction360.validateDirection360Value(value);
    }

    // AS3: Direction360.as::rotateDirection()
    public rotateDirection(degrees: number): void
    {
        this._value = Direction360.validateDirection360Value(this._value + degrees);
    }

    // AS3: Direction360.as::toString()
    public toString(): string
    {
        return `[${this._value}]`;
    }

    // AS3: Direction360.as::direction8Value()
    public direction8Value(): Direction8 | null
    {
        return Direction360.direction360ValueToDirection8(this._value);
    }

    /** The instance accessors skip `validateDirection360Value()`, as AS3's do — the field is
     * already normalised by every writer. */
    // AS3: Direction360.as::getBaseVectorXComponent()
    public getBaseVectorXComponent(): number
    {
        return Direction360.BASE_VECTOR_X[this._value];
    }

    // AS3: Direction360.as::getBaseVectorYComponent()
    public getBaseVectorYComponent(): number
    {
        return Direction360.BASE_VECTOR_Y[this._value];
    }
}
