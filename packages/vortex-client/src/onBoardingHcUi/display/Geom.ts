/**
 * Geometry value types for the login display list.
 *
 * TS-only: stand-ins for `flash.geom.*`. The login flow is the one screen that runs before the
 * engine exists (see `login/LoginFlow.ts`), so it cannot borrow the engine's geometry helpers —
 * and `onBoardingHcUi`'s AS3 widgets use these types by value everywhere (`Rectangle` for button
 * bounds and scale9 grids, `Matrix` for `NineSplitSprite.renderOn()`, `ColorTransform` for the
 * balloon tint and `WaitIndicator`'s dot fade).
 */

/**
 * TS-only: `flash.geom.Point`.
 */
export class Point
{
    public x: number;
    public y: number;

    constructor(x: number = 0, y: number = 0)
    {
        this.x = x;
        this.y = y;
    }
}

/**
 * TS-only: `flash.geom.Rectangle`.
 */
export class Rectangle
{
    public x: number;
    public y: number;
    public width: number;
    public height: number;

    constructor(x: number = 0, y: number = 0, width: number = 0, height: number = 0)
    {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    public get left(): number
    {
        return this.x;
    }

    public get right(): number
    {
        return this.x + this.width;
    }

    public get top(): number
    {
        return this.y;
    }

    public get bottom(): number
    {
        return this.y + this.height;
    }

    public clone(): Rectangle
    {
        return new Rectangle(this.x, this.y, this.width, this.height);
    }
}

/**
 * TS-only: `flash.geom.Matrix`, reduced to the scale/translate form the widgets use.
 */
export class Matrix
{
    public a: number;
    public b: number;
    public c: number;
    public d: number;
    public tx: number;
    public ty: number;

    constructor(a: number = 1, b: number = 0, c: number = 0, d: number = 1, tx: number = 0, ty: number = 0)
    {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.tx = tx;
        this.ty = ty;
    }

    /**
     * TS-only: `Matrix.createGradientBox(width, height, rotation, tx, ty)`.
     *
     * Flash defines a gradient over a fixed 1638.4-unit box centred on the origin, and this maps
     * that box onto the requested rectangle — which is why `GRADIENT_BOX_EXTENT` below is what the
     * endpoints are derived from, not the width and height passed in here.
     */
    public createGradientBox(width: number, height: number, rotation: number = 0, tx: number = 0, ty: number = 0): void
    {
        this.a = width / 1638.4;
        this.b = 0;
        this.c = 0;
        this.d = height / 1638.4;

        if(rotation !== 0)
        {
            this.rotate(rotation);
        }

        this.tx = tx + width / 2;
        this.ty = ty + height / 2;
    }

    /** TS-only: `Matrix.rotate(angle)`. */
    public rotate(angle: number): void
    {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const a = this.a;
        const b = this.b;
        const c = this.c;
        const d = this.d;
        const tx = this.tx;
        const ty = this.ty;

        this.a = a * cos - b * sin;
        this.b = a * sin + b * cos;
        this.c = c * cos - d * sin;
        this.d = c * sin + d * cos;
        this.tx = tx * cos - ty * sin;
        this.ty = tx * sin + ty * cos;
    }

    /** TS-only: `Matrix.scale(sx, sy)`. */
    public scale(scaleX: number, scaleY: number): void
    {
        this.a *= scaleX;
        this.b *= scaleY;
        this.c *= scaleX;
        this.d *= scaleY;
        this.tx *= scaleX;
        this.ty *= scaleY;
    }

    /** TS-only: maps a point through this matrix. */
    public transformPoint(x: number, y: number): Point
    {
        return new Point(this.a * x + this.c * y + this.tx, this.b * x + this.d * y + this.ty);
    }
}

/**
 * TS-only: half of Flash's 1638.4-unit gradient box. A linear gradient runs from `-extent` to
 * `+extent` along the box's local x axis, so the two endpoints are these run through the matrix.
 */
export const GRADIENT_BOX_EXTENT = 819.2;

/**
 * TS-only: `flash.geom.ColorTransform`, multiplier-only.
 *
 * `LoaderUI.createBalloon()` tints with the multiplier form
 * (`new ColorTransform(r / 255, g / 255, b / 255)`) and `WaitIndicator.circleShade()` uses the
 * alpha multiplier, which is the whole of what the login flow needs.
 */
export class ColorTransform
{
    public redMultiplier: number;
    public greenMultiplier: number;
    public blueMultiplier: number;
    public alphaMultiplier: number;

    constructor(
        redMultiplier: number = 1,
        greenMultiplier: number = 1,
        blueMultiplier: number = 1,
        alphaMultiplier: number = 1
    )
    {
        this.redMultiplier = redMultiplier;
        this.greenMultiplier = greenMultiplier;
        this.blueMultiplier = blueMultiplier;
        this.alphaMultiplier = alphaMultiplier;
    }

    /**
     * AS3 exposes a writable `color` that replaces the multipliers with offsets; `ColorButton`
     * uses it that way (`_local_3.color = colour`), so the port keeps the same shorthand and
     * stores it as a straight replacement colour.
     */
    public set color(value: number)
    {
        this.redMultiplier = ((value >> 16) & 0xFF) / 255;
        this.greenMultiplier = ((value >> 8) & 0xFF) / 255;
        this.blueMultiplier = (value & 0xFF) / 255;
    }
}

/**
 * TS-only: `com.sulake.habbo.utils` rectangleTransformMatrix(), the source→destination scale
 * matrix `NineSplitSprite.renderOn()` passes to `BitmapData.draw()`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/_SafeCls_2916.as::rectangleTransformMatrix()
 */
export function rectangleTransformMatrix(source: Rectangle, destination: Rectangle): Matrix
{
    const matrix = new Matrix();

    matrix.a = destination.width / source.width;
    matrix.d = destination.height / source.height;
    matrix.tx = destination.x - source.x * matrix.a;
    matrix.ty = destination.y - source.y * matrix.d;

    return matrix;
}
