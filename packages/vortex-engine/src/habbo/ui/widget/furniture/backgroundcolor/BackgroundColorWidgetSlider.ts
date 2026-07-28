/**
 * BackgroundColorWidgetSlider
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/furniture/backgroundcolor/BackgroundColorWidgetSlider.as
 *
 * One of the toner's three sliders. Borrows the dimmer's slider art (`dimmer_slider_base` /
 * `dimmer_slider_button`) — AS3 does the same, the toner has no art of its own.
 */
import type {BitmapDataAsset} from '@core/assets/BitmapDataAsset';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {BackgroundColorFurniWidget} from './BackgroundColorFurniWidget';

/**
 * AS3: BackgroundColorWidgetSlider.as::_SafeStr_6132 / _SafeStr_6583
 *
 * Both obfuscated. They are the slider's value range, 0..255 — the names are DERIVED from how
 * `getSliderPosition()` and `getValue()` use them.
 */
const VALUE_MIN: number = 0;
const VALUE_MAX: number = 255;

export class BackgroundColorWidgetSlider
{
    // AS3: BackgroundColorWidgetSlider.as::_SafeStr_4549
    private _widget: BackgroundColorFurniWidget | null;

    // AS3: BackgroundColorWidgetSlider.as::_SafeStr_5368
    private _container: IWindowContainer | null;

    // AS3: BackgroundColorWidgetSlider.as::_SafeStr_6705
    private _parameter: string;

    // AS3: BackgroundColorWidgetSlider.as::_SafeStr_5960
    private _baseBitmap: ImageBitmap | null = null;

    // AS3: BackgroundColorWidgetSlider.as::_SafeStr_5888
    private _buttonBitmap: ImageBitmap | null = null;

    /**
     * AS3: BackgroundColorWidgetSlider.as::_referenceWidth
     *
     * The travel available to the knob — the movement area's width minus the knob's own. Set by
     * displaySlider(), and every value<->position conversion divides by it.
     */
    private _referenceWidth: number = 0;

    // AS3: BackgroundColorWidgetSlider.as::BackgroundColorWidgetSlider()
    constructor(widget: BackgroundColorFurniWidget, parameter: string, container: IWindowContainer | null, value: number = 0)
    {
        this._widget = widget;
        this._parameter = parameter;
        this._container = container;

        this._baseBitmap = (widget.assets?.getAssetByName('dimmer_slider_base') as BitmapDataAsset | null)?.content as ImageBitmap | null;
        this._buttonBitmap = (widget.assets?.getAssetByName('dimmer_slider_button') as BitmapDataAsset | null)?.content as ImageBitmap | null;

        this.displaySlider();
        this.setValue(value);
    }

    // AS3: BackgroundColorWidgetSlider.as::setValue()
    public setValue(value: number): void
    {
        if(this._container === null) return;

        const button = this._container.findChildByName('slider_button');

        if(button !== null)
        {
            button.x = this.getSliderPosition(value);
        }
    }

    // AS3: BackgroundColorWidgetSlider.as::getSliderPosition()
    private getSliderPosition(value: number): number
    {
        return Math.trunc(this._referenceWidth * ((value - VALUE_MIN) / (VALUE_MAX - VALUE_MIN)));
    }

    // AS3: BackgroundColorWidgetSlider.as::getValue()
    private getValue(position: number): number
    {
        return Math.trunc(position / this._referenceWidth * (VALUE_MAX - VALUE_MIN)) + VALUE_MIN;
    }

    /**
     * AS3: BackgroundColorWidgetSlider.as::buttonProcedure()
     *
     * AS3 reads the knob's x on every event without filtering by event type, so a drag reports
     * continuously — that is what makes the preview follow the knob rather than jump on release.
     */
    private buttonProcedure = (_event: WindowEvent, window: IWindow): void =>
    {
        this._widget?.setParameterCallback(this._parameter, this.getValue(window.x));
    };

    /**
     * AS3: BackgroundColorWidgetSlider.as::displaySlider()
     *
     * The knob lives inside `slider_movement_area`, not beside it, which is why the reference
     * width is measured from that container and not from the slider as a whole.
     */
    private displaySlider(): void
    {
        if(this._container === null) return;

        const base = this._container.findChildByName('slider_base') as IBitmapWrapperWindow | null;

        if(base !== null && this._baseBitmap !== null)
        {
            base.bitmap = this._baseBitmap;
        }

        const movementArea = this._container.findChildByName('slider_movement_area') as IWindowContainer | null;

        if(movementArea !== null)
        {
            const button = movementArea.findChildByName('slider_button') as IBitmapWrapperWindow | null;

            if(button !== null && this._buttonBitmap !== null)
            {
                button.bitmap = this._buttonBitmap;
                button.procedure = this.buttonProcedure;
                this._referenceWidth = movementArea.width - button.width;
            }
        }
    }

    // AS3: BackgroundColorWidgetSlider.as::dispose()
    public dispose(): void
    {
        this._widget = null;
        this._container = null;
        this._baseBitmap = null;
        this._buttonBitmap = null;
    }
}
