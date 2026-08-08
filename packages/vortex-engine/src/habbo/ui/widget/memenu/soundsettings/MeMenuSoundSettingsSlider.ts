import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {IWindow} from '@core/window/IWindow';
import type {MeMenuSoundSettingsItem} from './MeMenuSoundSettingsItem';

/**
 * One volume slider, driven entirely by the drag of its own button.
 *
 * There is no drag handling here: the button is a draggable window and the slider only listens for
 * `WE_RELOCATED`, converting the button's x back into a volume. The travel is measured once, at
 * build time, as the movement area's width minus the button's — so a slider whose bitmaps failed
 * to load has a reference width of 0 and every position maps to the minimum.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/memenu/soundsettings/MeMenuSoundSettingsSlider.as
 */
export class MeMenuSoundSettingsSlider
{
    // AS3: .../soundsettings/MeMenuSoundSettingsSlider.as::_item
    // Name DERIVED (`_SafeStr_7997`): the item this slider reports its value to.
    private _item: MeMenuSoundSettingsItem | null;

    // AS3: .../soundsettings/MeMenuSoundSettingsSlider.as::_container
    // Name DERIVED (`_SafeStr_5368`): the `volume_container` child the slider lives in.
    private _container: IWindowContainer | null;

    // AS3: .../soundsettings/MeMenuSoundSettingsSlider.as::_baseBitmap
    // Name DERIVED (`_SafeStr_5960`): the track.
    private _baseBitmap: ImageBitmap | null = null;

    // AS3: .../soundsettings/MeMenuSoundSettingsSlider.as::_buttonBitmap
    // Name DERIVED (`_SafeStr_5888`): the knob.
    private _buttonBitmap: ImageBitmap | null = null;

    // AS3: .../soundsettings/MeMenuSoundSettingsSlider.as::_referenceWidth
    // The usable travel, measured once in `displaySlider()`.
    private _referenceWidth: number = 0;

    // AS3: .../soundsettings/MeMenuSoundSettingsSlider.as::_minimum
    // Name DERIVED (`_SafeStr_6132`): the volume at x = 0.
    private _minimum: number = 0;

    // AS3: .../soundsettings/MeMenuSoundSettingsSlider.as::_maximum
    // Name DERIVED (`_SafeStr_6583`): the volume at the far end of the travel.
    private _maximum: number = 1;

    // AS3: .../soundsettings/MeMenuSoundSettingsSlider.as::MeMenuSoundSettingsSlider()
    constructor(
        item: MeMenuSoundSettingsItem,
        container: IWindowContainer | null,
        assets: IAssetLibrary | null,
        minimum: number = 0,
        maximum: number = 1
    )
    {
        this._item = item;
        this._container = container;
        this._minimum = minimum;
        this._maximum = maximum;

        this.storeAssets(assets);
        this.displaySlider();
    }

    // AS3: .../soundsettings/MeMenuSoundSettingsSlider.as::setValue()
    // Moves the knob only — it does not report back, so this cannot loop with `buttonProcedure`.
    public setValue(value: number): void
    {
        if(this._container === null) return;

        const button = this._container.findChildByName('slider_button');

        if(button !== null) button.x = this.getSliderPosition(value);
    }

    // AS3: .../soundsettings/MeMenuSoundSettingsSlider.as::dispose()
    // Drops its references without disposing the container — the view owns that.
    public dispose(): void
    {
        this._item = null;
        this._container = null;
        this._baseBitmap = null;
        this._buttonBitmap = null;
    }

    // AS3: .../soundsettings/MeMenuSoundSettingsSlider.as::getSliderPosition()
    private getSliderPosition(value: number): number
    {
        return Math.trunc(this._referenceWidth * ((value - this._minimum) / (this._maximum - this._minimum)));
    }

    // AS3: .../soundsettings/MeMenuSoundSettingsSlider.as::getValue()
    private getValue(position: number): number
    {
        if(this._referenceWidth === 0) return this._minimum;

        return position / this._referenceWidth * (this._maximum - this._minimum) + this._minimum;
    }

    /**
     * `false` for the second argument means *preview*, not store — dragging is heard immediately
     * and only committed when the view is disposed.
     */
    // AS3: .../soundsettings/MeMenuSoundSettingsSlider.as::buttonProcedure()
    private buttonProcedure = (event: WindowEvent, target: IWindow): void =>
    {
        if(event.type !== 'WE_RELOCATED') return;

        this._item?.saveVolume(this.getValue(target.x), false);
    };

    /**
     * The reference width is set **inside** the innermost branch, so a missing knob bitmap leaves
     * it at 0 and the slider becomes inert rather than jumping. Kept.
     */
    // AS3: .../soundsettings/MeMenuSoundSettingsSlider.as::displaySlider()
    private displaySlider(): void
    {
        if(this._container === null) return;

        const base = this._container.findChildByName('slider_base') as IBitmapWrapperWindow | null;

        if(base !== null && base !== undefined && this._baseBitmap !== null)
        {
            base.bitmap = this._baseBitmap;
        }

        const area = this._container.findChildByName('slider_movement_area') as IWindowContainer | null;

        if(area === null || area === undefined) return;

        const button = area.findChildByName('slider_button') as IWindowContainer | null;

        if(button === null || button === undefined) return;

        const knob = button.findChildByName('slider_bitmap') as IBitmapWrapperWindow | null;

        if(knob === null || knob === undefined || this._buttonBitmap === null) return;

        knob.bitmap = this._buttonBitmap;
        button.procedure = this.buttonProcedure;
        this._referenceWidth = area.width - knob.width;
    }

    /**
     * AS3 casts both assets unguarded — a missing one throws. Guarded here, because a missing
     * image should leave the slider inert rather than take the settings page down; the `!== null`
     * checks in `displaySlider()` already anticipate exactly that.
     */
    // AS3: .../soundsettings/MeMenuSoundSettingsSlider.as::storeAssets()
    private storeAssets(assets: IAssetLibrary | null): void
    {
        if(assets === null) return;

        this._baseBitmap = (assets.getAssetByName('memenu_settings_slider_base')?.content ?? null) as ImageBitmap | null;
        this._buttonBitmap = (assets.getAssetByName('memenu_settings_slider_button')?.content ?? null) as ImageBitmap | null;
    }
}
