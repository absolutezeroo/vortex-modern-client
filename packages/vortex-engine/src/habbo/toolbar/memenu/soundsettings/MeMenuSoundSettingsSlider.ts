import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('MeMenuSoundSettingsSlider');

/**
 * Sound settings slider for the me menu
 *
 * In AS3 this manages a draggable slider button within a movement area,
 * converts pixel position to a value between min and max, and calls
 * saveVolume on the parent item when relocated. In Vortex, the actual
 * slider rendering is handled by SolidJS; this manages the value logic.
 *
 * @see sources/win63_version/habbo/toolbar/memenu/soundsettings/MeMenuSoundSettingsSlider.as
 */
export class MeMenuSoundSettingsSlider
{
    private _owner: { saveVolume(value: number, preview: boolean): void } | null;
    private _referenceWidth: number = 100;
    private _currentValue: number = 0;

    constructor(
        owner: { saveVolume(value: number, preview: boolean): void },
        minValue: number = 0,
        maxValue: number = 1
    )
    {
        this._owner = owner;
        this._minValue = minValue;
        this._maxValue = maxValue;

        log.debug('MeMenuSoundSettingsSlider constructed');
    }

    private _minValue: number;

    /**
	 * The minimum value
	 */
    get minValue(): number
    {
        return this._minValue;
    }

    private _maxValue: number;

    /**
	 * The maximum value
	 */
    get maxValue(): number
    {
        return this._maxValue;
    }

    /**
	 * The current slider value
	 */
    get value(): number
    {
        return this._currentValue;
    }

    /**
	 * Set the slider value
	 *
	 * @param value The value to set (between min and max)
	 */
    public setValue(value: number): void
    {
        this._currentValue = Math.max(this._minValue, Math.min(this._maxValue, value));
    }

    /**
	 * Set the reference width for position calculations
	 *
	 * @param width The reference width in pixels
	 */
    public setReferenceWidth(width: number): void
    {
        this._referenceWidth = width;
    }

    /**
	 * Get the slider position in pixels for a given value
	 *
	 * @param value The value
	 * @returns Position in pixels
	 */
    public getSliderPosition(value: number): number
    {
        return Math.trunc(this._referenceWidth * ((value - this._minValue) / (this._maxValue - this._minValue)));
    }

    /**
	 * Convert a pixel position to a value
	 *
	 * @param position Position in pixels
	 * @returns The corresponding value
	 */
    public getValueFromPosition(position: number): number
    {
        return (position / this._referenceWidth) * (this._maxValue - this._minValue) + this._minValue;
    }

    /**
	 * Handle slider relocation (drag)
	 *
	 * @param position The new position in pixels
	 */
    public onRelocated(position: number): void
    {
        const value = this.getValueFromPosition(position);
        this._currentValue = value;

        if(this._owner)
        {
            this._owner.saveVolume(value, false);
        }
    }

    /**
	 * Dispose of this slider
	 */
    public dispose(): void
    {
        this._owner = null;
    }
}
