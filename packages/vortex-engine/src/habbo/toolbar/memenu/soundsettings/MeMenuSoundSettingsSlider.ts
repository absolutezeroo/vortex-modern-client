import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {WindowEvent} from '@core/window/events/WindowEvent';

/**
 * MeMenuSoundSettingsSlider
 *
 * A volume slider built out of two windows the layout already carries: a movement area
 * and the button dragged inside it. The slider owns no drag logic of its own — the window
 * system moves the button and reports `WE_RELOCATED`, and this turns the resulting x into
 * a value.
 *
 * Its travel is therefore the movement area minus the button's own width, which is what
 * makes the far right read exactly `maxValue` rather than overshooting by a button.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/toolbar/memenu/soundsettings/MeMenuSoundSettingsSlider.as
 */
export class MeMenuSoundSettingsSlider
{
    // AS3: .../MeMenuSoundSettingsSlider.as::_SafeStr_7997
    private _owner: {saveVolume(value: number, save: boolean): void} | null;

    // AS3: .../MeMenuSoundSettingsSlider.as::_SafeStr_5368
    private _container: IWindowContainer | null;

    // AS3: .../MeMenuSoundSettingsSlider.as::_referenceWidth
    private _referenceWidth: number = 0;

    // AS3: .../MeMenuSoundSettingsSlider.as::_SafeStr_6132
    private _minValue: number;

    // AS3: .../MeMenuSoundSettingsSlider.as::_SafeStr_6583
    private _maxValue: number;

    /**
     * AS3 takes an asset library it never reads — neither the constructor nor any method
     * touches it. Kept so both call sites match.
     */
    // AS3: .../MeMenuSoundSettingsSlider.as::MeMenuSoundSettingsSlider()
    constructor(
        owner: {saveVolume(value: number, save: boolean): void},
        container: IWindowContainer | null,
        _assets: IAssetLibrary | null = null,
        minValue: number = 0,
        maxValue: number = 1
    )
    {
        this._owner = owner;
        this._container = container;
        this._minValue = minValue;
        this._maxValue = maxValue;

        this.displaySlider();
    }

    // AS3: .../MeMenuSoundSettingsSlider.as::get minValue()
    get minValue(): number
    {
        return this._minValue;
    }

    // AS3: .../MeMenuSoundSettingsSlider.as::get maxValue()
    get maxValue(): number
    {
        return this._maxValue;
    }

    /**
     * Note AS3 looks the button up on the CONTAINER here, where `displaySlider()` looks
     * it up under `slider_movement_area`. Both find it — the lookup is recursive — so the
     * inconsistency is harmless and is preserved rather than tidied.
     */
    // AS3: .../MeMenuSoundSettingsSlider.as::setValue()
    setValue(value: number): void
    {
        if(this._container === null) return;

        const button = this._container.findChildByName('slider_button');

        if(button !== null) button.x = this.getSliderPosition(value);
    }

    // AS3: .../MeMenuSoundSettingsSlider.as::getSliderPosition()
    private getSliderPosition(value: number): number
    {
        return Math.trunc(this._referenceWidth * ((value - this._minValue) / (this._maxValue - this._minValue)));
    }

    // AS3: .../MeMenuSoundSettingsSlider.as::getValue()
    private getValue(position: number): number
    {
        return position / this._referenceWidth * (this._maxValue - this._minValue) + this._minValue;
    }

    /** `false` — the drag previews the volume; the value is only committed on close. */
    // AS3: .../MeMenuSoundSettingsSlider.as::buttonProcedure()
    private buttonProcedure = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type !== 'WE_RELOCATED') return;

        this._owner?.saveVolume(this.getValue(window.x), false);
    };

    // AS3: .../MeMenuSoundSettingsSlider.as::displaySlider()
    private displaySlider(): void
    {
        if(this._container === null) return;

        const area = this._container.findChildByName('slider_movement_area') as IWindowContainer | null;

        if(area === null) return;

        const button = area.findChildByName('slider_button') as IWindowContainer | null;

        if(button === null) return;

        button.procedure = this.buttonProcedure;
        this._referenceWidth = area.width - button.width;
    }

    // AS3: .../MeMenuSoundSettingsSlider.as::dispose()
    dispose(): void
    {
        this._owner = null;
        this._container = null;
    }
}
