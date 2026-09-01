/**
 * A colour taken apart into its four channels, so it can be tweened one step at a time.
 *
 * `SnowWarUI` uses exactly one instance of it for the staff-only checksum indicator: an error paints
 * it red or green, and every frame after that it crawls back toward white by a twenty-fourth of the
 * remaining distance.
 *
 * AS3 declares this at file scope in `SnowWarUI.as` — a private class outside the package block,
 * which AS3 allows and TypeScript does not, so it gets its own module here. The name is AS3's own.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/ui/SnowWarUI.as
 */
export class RGBColor
{
    // AS3: SnowWarUI.as::RGBColor::_r
    private _r: number = 0;

    // AS3: SnowWarUI.as::RGBColor::_g
    private _g: number = 0;

    // AS3: SnowWarUI.as::RGBColor::_b
    private _b: number = 0;

    // AS3: SnowWarUI.as::RGBColor::_a
    private _a: number = 0;

    // AS3: SnowWarUI.as::RGBColor::RGBColor()
    constructor(value: number = 0)
    {
        this.fromInt(value);
    }

    // AS3: SnowWarUI.as::RGBColor::get r()
    public get r(): number
    {
        return this._r;
    }

    // AS3: SnowWarUI.as::RGBColor::get g()
    public get g(): number
    {
        return this._g;
    }

    // AS3: SnowWarUI.as::RGBColor::get b()
    public get b(): number
    {
        return this._b;
    }

    // AS3: SnowWarUI.as::RGBColor::get a()
    public get a(): number
    {
        return this._a;
    }

    // AS3: SnowWarUI.as::RGBColor::fromInt()
    public fromInt(value: number): void
    {
        this._a = (value >>> 24) & 0xFF;
        this._r = (value >>> 16) & 0xFF;
        this._g = (value >>> 8) & 0xFF;
        this._b = value & 0xFF;
    }

    // AS3: SnowWarUI.as::RGBColor::get rgb()
    public get rgb(): number
    {
        return ((this._a << 24) | (this._r << 16) | (this._g << 8) | this._b) >>> 0;
    }

    /**
     * One step of a 24-step fade. AS3's channels are `uint`, so each `+=` truncates — a difference
     * smaller than 24 contributes nothing and the channel simply stops, which is why the fade
     * settles a little short of the target rather than reaching it.
     */
    // AS3: SnowWarUI.as::RGBColor::tweenTo()
    public tweenTo(target: RGBColor): void
    {
        this._a = (this._a + Math.trunc((target.a - this._a) / 24)) >>> 0;
        this._r = (this._r + Math.trunc((target.r - this._r) / 24)) >>> 0;
        this._g = (this._g + Math.trunc((target.g - this._g) / 24)) >>> 0;
        this._b = (this._b + Math.trunc((target.b - this._b) / 24)) >>> 0;
    }
}
