/**
 * ColorTransitioner
 *
 * @see sources/source_as_win63/room/utils/ColorTransitioner.as
 *
 * Smoothly transitions between two colors over time using HSL interpolation.
 * Used by RoomDesktop for room color and background color transitions.
 */
import {ColorConverter} from './ColorConverter';

export class ColorTransitioner
{
    private _lightness: number;
    private _originalColor: number;
    private _originalLightness: number;
    private _targetColor: number;
    private _targetLightness: number;
    private _colorChangedTime: number = 0;
    private _colorTransitionLength: number = 0;

    constructor(color: number = 0xFFFFFF, lightness: number = 255)
    {
        this._color = color;
        this._lightness = lightness;
        this._originalColor = color;
        this._originalLightness = lightness;
        this._targetColor = color;
        this._targetLightness = lightness;
    }

    private _color: number;

    /**
	 * Gets the current interpolated color after HSL conversion.
	 *
	 * Converts the current RGB to HSL, replaces the lightness component,
	 * then converts back to RGB.
	 */
    public get color(): number
    {
        const hsl = ColorConverter.rgbToHSL(this._color);
        const h = (hsl >> 16) & 0xFF;
        const s = (hsl >> 8) & 0xFF;
        const newHSL = (h << 16) | (s << 8) | (this._lightness & 0xFF);

        return ColorConverter.hslToRGB(newHSL);
    }

    /**
	 * Starts a color transition from the current color to the target.
	 *
	 * @param targetColor - Target RGB color
	 * @param targetLightness - Target lightness value (0-255)
	 * @param currentTime - Current time in milliseconds
	 * @param duration - Transition duration in milliseconds (default 1500)
	 */
    public startTransition(targetColor: number, targetLightness: number, currentTime: number, duration: number = 1500): void
    {
        this._originalColor = this._color;
        this._originalLightness = this._lightness;
        this._targetColor = targetColor;
        this._targetLightness = targetLightness;
        this._colorChangedTime = currentTime;
        this._colorTransitionLength = duration;
    }

    /**
	 * Updates the color interpolation.
	 *
	 * @param currentTime - Current time in milliseconds
	 * @returns true if the color changed or transition completed
	 */
    public updateColor(currentTime: number): boolean
    {
        if(this._colorTransitionLength <= 0)
        {
            return false;
        }

        const elapsed = currentTime - this._colorChangedTime;

        if(elapsed >= this._colorTransitionLength)
        {
            this._color = this._targetColor;
            this._lightness = this._targetLightness;
            this._colorTransitionLength = 0;

            return true;
        }

        const factor = elapsed / this._colorTransitionLength;

        const origR = (this._originalColor >> 16) & 0xFF;
        const origG = (this._originalColor >> 8) & 0xFF;
        const origB = this._originalColor & 0xFF;

        const targetR = (this._targetColor >> 16) & 0xFF;
        const targetG = (this._targetColor >> 8) & 0xFF;
        const targetB = this._targetColor & 0xFF;

        const r = Math.round(origR + (targetR - origR) * factor);
        const g = Math.round(origG + (targetG - origG) * factor);
        const b = Math.round(origB + (targetB - origB) * factor);

        this._color = (r << 16) | (g << 8) | b;
        this._lightness = Math.round(this._originalLightness + (this._targetLightness - this._originalLightness) * factor);

        return true;
    }
}
