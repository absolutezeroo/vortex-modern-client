/**
 * Math utility functions.
 *
 * Provides static helper methods for common math operations
 * such as normalization, interpolation, clamping, and mapping.
 *
 * The class name is obfuscated in every tree (`_SafeCls_2916` here, `class_419` in
 * win63_version), so `MathUtils` is derived; the member names below are real.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/_SafeCls_2916.as
 */
export class MathUtils
{
    /**
	 * Normalize a value to a 0-1 range between min and max.
	 *
	 * @param value The value to normalize
	 * @param min The minimum of the range
	 * @param max The maximum of the range
	 * @returns The normalized value (0-1)
	 */
    // AS3: .../src/com/sulake/habbo/utils/_SafeCls_2916.as::normalize()
    static normalize(value: number, min: number, max: number): number
    {
        return (value - min) / (max - min);
    }

    /**
	 * Linearly interpolate between min and max by t.
	 *
	 * @param t The interpolation factor (0-1)
	 * @param min The start value
	 * @param max The end value
	 * @returns The interpolated value
	 */
    // AS3: .../src/com/sulake/habbo/utils/_SafeCls_2916.as::lerp()
    static lerp(t: number, min: number, max: number): number
    {
        return t * (max - min) + min;
    }

    /**
	 * Clamp a value between min and max.
	 *
	 * @param value The value to clamp
	 * @param min The minimum bound (default 0)
	 * @param max The maximum bound (default 1)
	 * @returns The clamped value
	 */
    // AS3: .../src/com/sulake/habbo/utils/_SafeCls_2916.as::clamp()
    static clamp(value: number, min: number = 0, max: number = 1): number
    {
        return Math.max(min, Math.min(max, value));
    }

    /**
	 * Map a value from one range to another.
	 *
	 * @param value The input value
	 * @param inMin The input range minimum
	 * @param inMax The input range maximum
	 * @param outMin The output range minimum
	 * @param outMax The output range maximum
	 * @returns The mapped value
	 */
    // AS3: .../src/com/sulake/habbo/utils/_SafeCls_2916.as::map()
    static map(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number
    {
        return MathUtils.lerp(MathUtils.normalize(value, inMin, inMax), outMin, outMax);
    }

    // TODO(AS3): .../src/com/sulake/habbo/utils/_SafeCls_2916.as::rectangleTransformMatrix() builds
    // the `flash.geom.Matrix` that maps one rectangle onto another. Nothing in this port draws
    // through a Flash matrix — the equivalent scaling happens on the PixiJS transform — so there is
    // no matrix type to return.
}
