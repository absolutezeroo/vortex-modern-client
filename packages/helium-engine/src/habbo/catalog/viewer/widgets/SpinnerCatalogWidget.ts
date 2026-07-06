import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextFieldWindow} from '@core/window/components/ITextFieldWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowKeyboardEvent} from '@core/window/events/WindowKeyboardEvent';
import type {HabboCatalog} from '../../HabboCatalog';
import {CatalogWidgetSpinnerEvent} from './events/CatalogWidgetSpinnerEvent';
import {CatalogWidget} from './CatalogWidget';

const SPIN_BUTTONDOWN_HOLD_VALUE_STEP_DELAY_MS = 75;
const SPIN_ACCELERATE_AFTER_STEPS = 35;

/**
 * The purchase-quantity spinner shown for bundle offers (buy N units of a discount bundle).
 *
 * TODO(AS3): sources/win63_version/habbo/catalog/viewer/widgets/SpinnerCatalogWidget.as::refresh()
 * skips the "promo.info"/discountContainer bonus-items-count display (needs
 * HabboCatalogUtils.getDiscountItemsCount(), which isn't ported) - the count/discount text just
 * doesn't update, matching AS3's own null-guard (`if (_promoInfo)`) staying false-shaped.
 *
 * @see sources/win63_version/habbo/catalog/viewer/widgets/SpinnerCatalogWidget.as
 */
export class SpinnerCatalogWidget extends CatalogWidget
{
    private _catalog: HabboCatalog | null;

    private _value: number = 1;

    private _minValue: number = 1;

    private _maxValue: number = 100;

    private _spinTimer: ReturnType<typeof setInterval> | null = null;

    private _moreButtonDown: boolean = false;

    private _lessButtonDown: boolean = false;

    private _ignoreNextClickEvent: boolean = false;

    private _holdStartedAt: number = 1;

    private _skipSteps: number[] = [];

    private _promoInfo: IWindow | null = null;

    constructor(window: IWindowContainer, catalog: HabboCatalog)
    {
        super(window);
        this._catalog = catalog;
    }

    override dispose(): void
    {
        if(this.disposed) return;

        if(this._spinTimer != null)
        {
            clearInterval(this._spinTimer);
            this._spinTimer = null;
        }

        this.events.off(CatalogWidgetSpinnerEvent.RESET, this.onRequestResetEvent);
        this.events.off(CatalogWidgetSpinnerEvent.SHOW, this.onShowEvent);
        this.events.off(CatalogWidgetSpinnerEvent.HIDE, this.onHideEvent);
        this.events.off(CatalogWidgetSpinnerEvent.SET_MAX, this.onSetMaxEvent);
        this.events.off(CatalogWidgetSpinnerEvent.SET_MIN, this.onSetMinEvent);
        this._catalog = null;
        super.dispose();
    }

    override init(): boolean
    {
        if(!super.init()) return false;

        this.attachWidgetView('spinnerWidget');
        this.window.visible = false;

        if(!this._catalog!.multiplePurchaseEnabled) return true;

        this.window.procedure = this.spinnerWindowProcedure;

        const textValue = this.window.findChildByName('text_value') as unknown as ITextFieldWindow | null;

        textValue?.addEventListener(WindowKeyboardEvent.KEY_UP, this.onInputEvent);

        this.events.on(CatalogWidgetSpinnerEvent.RESET, this.onRequestResetEvent);
        this.events.on(CatalogWidgetSpinnerEvent.SHOW, this.onShowEvent);
        this.events.on(CatalogWidgetSpinnerEvent.HIDE, this.onHideEvent);
        this.events.on(CatalogWidgetSpinnerEvent.SET_MAX, this.onSetMaxEvent);
        this.events.on(CatalogWidgetSpinnerEvent.SET_MIN, this.onSetMinEvent);
        this._promoInfo = this.window.findChildByName('promo.info');

        return true;
    }

    private refresh(): void
    {
        this._value = Math.max(this._value, this._minValue);
        this._value = Math.min(this._value, this._maxValue);
        this.events.emit(CatalogWidgetSpinnerEvent.VALUE_CHANGED, new CatalogWidgetSpinnerEvent(CatalogWidgetSpinnerEvent.VALUE_CHANGED, this._value));
        this.setValueText(this._value.toString());

        // TODO(AS3): getDiscountItemsCount()/discountContainer bonus-count display - see class
        // doc comment. _promoInfo is never non-null yet since nothing ported sets it.
    }

    private onRequestResetEvent = (event: CatalogWidgetSpinnerEvent): void =>
    {
        this._value = event.value;

        if(event.skipSteps != null)
        {
            this._skipSteps = event.skipSteps;
        }

        this.refresh();
    };

    private onShowEvent = (_event: CatalogWidgetSpinnerEvent): void =>
    {
        this.window.visible = true;
    };

    private onHideEvent = (_event: CatalogWidgetSpinnerEvent): void =>
    {
        this.window.visible = false;
    };

    private onSetMaxEvent = (event: CatalogWidgetSpinnerEvent): void =>
    {
        this._maxValue = event.value;
    };

    private onSetMinEvent = (event: CatalogWidgetSpinnerEvent): void =>
    {
        this._minValue = event.value;
    };

    private onSpinnerTimerEvent = (): void =>
    {
        if(this.disposed) return;

        this._ignoreNextClickEvent = true;

        if(this._moreButtonDown)
        {
            this.increaseValue();

            if(this._value - this._holdStartedAt > SPIN_ACCELERATE_AFTER_STEPS)
            {
                this.increaseValue();
            }
        }

        if(this._lessButtonDown)
        {
            this.decreaseValue();

            if(this._holdStartedAt - this._value > SPIN_ACCELERATE_AFTER_STEPS)
            {
                this.decreaseValue();
            }
        }

        this.refresh();
    };

    private increaseValue(): void
    {
        let value = this._value + 1;

        while(this._skipSteps.indexOf(value) !== -1) value++;

        this._value = value;
    }

    private decreaseValue(): void
    {
        let value = this._value - 1;

        while(this._skipSteps.indexOf(value) !== -1) value--;

        this._value = value;
    }

    private setValueText(value: string): void
    {
        if(this.window == null) return;

        const textValue = this.window.findChildByName('text_value');

        if(textValue == null) return;

        // AS3 checks `is ITextFieldWindow` to avoid overwriting user-typed input; this port has
        // no reliable runtime type check for that distinction here, so this always writes -
        // matching the plain-label (non-input) branch, which is what "text_value" actually is
        // in every ported spinner layout (a label, not an editable field).
        textValue.caption = value;
    }

    // AS3: sources/win63_version/habbo/catalog/viewer/widgets/SpinnerCatalogWidget.as::spinnerWindowProcedure()
    private spinnerWindowProcedure = (event: WindowEvent): void =>
    {
        if(event == null) return;

        if(event.type !== 'WME_CLICK' && event.type !== 'WME_DOWN' && event.type !== 'WME_UP' && event.type !== 'WME_UP_OUTSIDE') return;

        switch(event.target?.name)
        {
            case 'button_less':
                switch(event.type)
                {
                    case 'WME_DOWN':
                        this._lessButtonDown = true;
                        this._holdStartedAt = this._value;
                        this.startSpinTimer();

                        break;
                    case 'WME_UP':
                    case 'WME_UP_OUTSIDE':
                        this._lessButtonDown = false;
                        this.stopSpinTimer();

                        break;
                    case 'WME_CLICK':
                        if(!this._ignoreNextClickEvent)
                        {
                            this.decreaseValue();
                        }

                        this.refresh();
                        this._ignoreNextClickEvent = false;
                }

                return;
            case 'button_more':
                switch(event.type)
                {
                    case 'WME_DOWN':
                        this._moreButtonDown = true;
                        this._holdStartedAt = this._value;
                        this.startSpinTimer();

                        break;
                    case 'WME_UP':
                    case 'WME_UP_OUTSIDE':
                        this._moreButtonDown = false;
                        this.stopSpinTimer();

                        break;
                    case 'WME_CLICK':
                        if(!this._ignoreNextClickEvent)
                        {
                            this.increaseValue();
                        }

                        this.refresh();
                        this._ignoreNextClickEvent = false;
                }
        }
    };

    private startSpinTimer(): void
    {
        this.stopSpinTimer();
        this._spinTimer = setInterval(this.onSpinnerTimerEvent, SPIN_BUTTONDOWN_HOLD_VALUE_STEP_DELAY_MS);
    }

    private stopSpinTimer(): void
    {
        if(this._spinTimer != null)
        {
            clearInterval(this._spinTimer);
            this._spinTimer = null;
        }
    }

    private onInputEvent = (event: WindowKeyboardEvent): void =>
    {
        this._value = parseInt(event.target?.caption ?? '1', 10);
        this.refresh();
    };
}
