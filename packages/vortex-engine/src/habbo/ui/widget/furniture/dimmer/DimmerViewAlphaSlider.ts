import type {BitmapDataAsset} from '@core/assets/BitmapDataAsset';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {DimmerView} from './DimmerView';

/**
 * DimmerViewAlphaSlider
 *
 * The moodlight's brightness slider. Same art and the same value↔position arithmetic as the
 * toner's sliders (`BackgroundColorWidgetSlider`, which borrows this one's assets), but its
 * minimum moves: switching effect type re-reads `minLights[type - 1]`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/furniture/dimmer/DimmerViewAlphaSlider.as
 */
export class DimmerViewAlphaSlider
{
    // AS3: .../dimmer/DimmerViewAlphaSlider.as::DimmerViewAlphaSlider()
    constructor(
        view: DimmerView,
        container: IWindowContainer | null,
        assets: IAssetLibrary | null,
        min: number = 0,
        max: number = 255
    )
    {
        this._view = view;
        this._container = container;
        this._min = min;
        this._max = max;

        this.storeAssets(assets);
        this.displaySlider();
    }

    // AS3: .../dimmer/DimmerViewAlphaSlider.as::_SafeStr_4550
    private _view: DimmerView | null;

    // AS3: .../dimmer/DimmerViewAlphaSlider.as::_SafeStr_5368
    private _container: IWindowContainer | null;

    // AS3: .../dimmer/DimmerViewAlphaSlider.as::_SafeStr_5960
    private _baseBitmap: ImageBitmap | null = null;

    // AS3: .../dimmer/DimmerViewAlphaSlider.as::_SafeStr_5888
    private _buttonBitmap: ImageBitmap | null = null;

    /** Knob travel: the movement area's width minus the knob's own. */
    // AS3: .../dimmer/DimmerViewAlphaSlider.as::_referenceWidth
    private _referenceWidth: number = 0;

    // AS3: .../dimmer/DimmerViewAlphaSlider.as::_SafeStr_6132
    private _min: number = 0;

    // AS3: .../dimmer/DimmerViewAlphaSlider.as::_SafeStr_6583
    private _max: number = 255;

    // AS3: .../dimmer/DimmerViewAlphaSlider.as::setValue()
    public setValue(value: number): void
    {
        if(this._container === null) return;

        const button = this._container.findChildByName('slider_button');

        if(button !== null)
        {
            button.x = this.getSliderPosition(value);
        }
    }

    /** Re-seats the knob for the new range — the stored brightness has not changed, its position has. */
    // AS3: .../dimmer/DimmerViewAlphaSlider.as::set min()
    public set min(value: number)
    {
        this._min = value;

        this.setValue(this._view?.selectedBrightness ?? 0);
    }

    // AS3: .../dimmer/DimmerViewAlphaSlider.as::set max()
    public set max(value: number)
    {
        this._max = value;

        this.setValue(this._view?.selectedBrightness ?? 0);
    }

    // AS3: .../dimmer/DimmerViewAlphaSlider.as::getSliderPosition()
    private getSliderPosition(value: number): number
    {
        return Math.trunc(this._referenceWidth * ((value - this._min) / (this._max - this._min)));
    }

    // AS3: .../dimmer/DimmerViewAlphaSlider.as::getValue()
    private getValue(position: number): number
    {
        return Math.trunc(position / this._referenceWidth * (this._max - this._min)) + this._min;
    }

    /**
     * Release-only, unlike the toner's slider which reports on every event: the moodlight
     * previews through the server-visible state, so AS3 waits for the drag to end.
     */
    // AS3: .../dimmer/DimmerViewAlphaSlider.as::buttonProcedure()
    private buttonProcedure = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type !== 'WME_UP' && event.type !== 'WME_UP_OUTSIDE') return;

        if(this._view !== null)
        {
            this._view.selectedBrightness = this.getValue(window.x);
        }
    };

    // AS3: .../dimmer/DimmerViewAlphaSlider.as::displaySlider()
    private displaySlider(): void
    {
        if(this._container === null) return;

        const base = this._container.findChildByName('slider_base') as IBitmapWrapperWindow | null;

        if(base !== null && this._baseBitmap !== null)
        {
            base.bitmap = this._baseBitmap;
        }

        const movementArea = this._container.findChildByName('slider_movement_area') as IWindowContainer | null;

        if(movementArea === null) return;

        const button = movementArea.findChildByName('slider_button') as IBitmapWrapperWindow | null;

        if(button !== null && this._buttonBitmap !== null)
        {
            button.bitmap = this._buttonBitmap;
            button.procedure = this.buttonProcedure;

            this._referenceWidth = movementArea.width - button.width;
        }
    }

    // AS3: .../dimmer/DimmerViewAlphaSlider.as::storeAssets()
    private storeAssets(assets: IAssetLibrary | null): void
    {
        if(assets === null) return;

        this._baseBitmap = (assets.getAssetByName('dimmer_slider_base') as BitmapDataAsset | null)?.content as ImageBitmap | null;
        this._buttonBitmap = (assets.getAssetByName('dimmer_slider_button') as BitmapDataAsset | null)?.content as ImageBitmap | null;
    }

    // AS3: .../dimmer/DimmerViewAlphaSlider.as::dispose()
    public dispose(): void
    {
        this._view = null;
        this._container = null;
        this._baseBitmap = null;
        this._buttonBitmap = null;
    }
}
