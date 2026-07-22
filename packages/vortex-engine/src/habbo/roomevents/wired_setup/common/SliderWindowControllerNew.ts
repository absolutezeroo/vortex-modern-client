import {EventEmitter} from 'eventemitter3';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';

/**
 * SliderWindowControllerNew — drives a slider window: tracks the current value within [min, max],
 * positions the slider button, handles drag (snapping to `step`), and fires a "change" event.
 *
 * AS3 extends the Flash EventDispatcherWrapper; the port has no Flash IEventDispatcher, so this holds
 * an eventemitter3 EventEmitter and exposes addEventListener/removeEventListener over it (dispatching
 * a bare "change" event) — a documented adaptation to the port's event system.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/common/SliderWindowControllerNew.as
 */
export class SliderWindowControllerNew
{
    // AS3: SliderWindowControllerNew.as::_value
    private _value: number = 0;

    // AS3: SliderWindowControllerNew.as::_slider
    private _slider: IWindowContainer;

    // AS3: SliderWindowControllerNew.as::_dragging
    private _dragging: boolean = false;

    // AS3: SliderWindowControllerNew.as::_min
    private _min: number = 0;

    // AS3: SliderWindowControllerNew.as::_max
    private _max: number = 1;

    // AS3: SliderWindowControllerNew.as::_step
    private _step: number = 0;

    // Adaptation of the AS3 EventDispatcherWrapper base to the port's event system.
    private _emitter: EventEmitter = new EventEmitter();

    // AS3: SliderWindowControllerNew.as::SliderWindowControllerNew()
    constructor(slider: IWindowContainer, min: number = 0, max: number = 1, step: number = 0)
    {
        this._slider = slider;
        this._min = min;
        this._max = max;
        this._step = step;
        this._value = 0;
        this.sliderButton.procedure = this._sliderProcedure;
    }

    // AS3: SliderWindowControllerNew.as::addEventListener()
    addEventListener(type: string, listener: (...args: unknown[]) => void): void
    {
        this._emitter.on(type, listener);
    }

    // AS3: SliderWindowControllerNew.as::removeEventListener()
    removeEventListener(type: string, listener: (...args: unknown[]) => void): void
    {
        this._emitter.off(type, listener);
    }

    // AS3: SliderWindowControllerNew.as::dispose()
    dispose(): void
    {
        this._emitter.removeAllListeners();
        this._slider.dispose();
        this._slider = null as unknown as IWindowContainer;
    }

    // AS3: SliderWindowControllerNew.as::setValue()
    setValue(value: number, updatePosition: boolean = true, dispatch: boolean = true): void
    {
        value = Math.max(this._min, value);
        value = Math.min(this._max, value);
        this._value = value;

        if(updatePosition)
        {
            this.updateSliderPosition();
        }

        if(dispatch)
        {
            this._emitter.emit('change');
        }
    }

    // AS3: SliderWindowControllerNew.as::getValue()
    getValue(): number
    {
        return this._value;
    }

    // AS3: SliderWindowControllerNew.as::set min()
    set min(value: number)
    {
        this._min = value;
    }

    // AS3: SliderWindowControllerNew.as::set max()
    set max(value: number)
    {
        this._max = value;
    }

    // AS3: SliderWindowControllerNew.as::updateSliderPosition()
    private updateSliderPosition(): void
    {
        if(this._slider == null)
        {
            return;
        }

        const button = this._slider.findChildByName('slider_button');

        if(button != null)
        {
            button.x = this.getSliderPosition(this._value);
            button.parent?.invalidate();
        }
    }

    // AS3: SliderWindowControllerNew.as::getSliderPosition()
    private getSliderPosition(value: number): number
    {
        return Math.trunc(this.referenceWidth * ((value - this._min) / (this._max - this._min)));
    }

    // AS3: SliderWindowControllerNew.as::getValueAtPosition()
    private getValueAtPosition(position: number): number
    {
        return position / this.referenceWidth * (this._max - this._min) + this._min;
    }

    // AS3: SliderWindowControllerNew.as::sliderProcedure()
    private _sliderProcedure = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type === 'WME_DOWN')
        {
            this._dragging = true;
        }

        if(this._dragging)
        {
            if(event.type === 'WME_UP' || event.type === 'WME_UP_OUTSIDE')
            {
                this._dragging = false;
            }
        }

        if(!this._dragging || event.type !== 'WE_RELOCATED')
        {
            return;
        }

        if(this._step !== 0)
        {
            const value = this.getValueAtPosition(window.x);
            const rounded = Math.round(value / this._step) * this._step;

            this.setValue(rounded, false);
        }
    };

    // AS3: SliderWindowControllerNew.as::moveSliderToRight()
    moveSliderToRight(): void
    {
        this._dragging = false;

        if(this._step !== 0)
        {
            this.setValue(this._value + this._step);
        }
    }

    // AS3: SliderWindowControllerNew.as::moveSliderToLeft()
    moveSliderToLeft(): void
    {
        this._dragging = false;

        if(this._step !== 0)
        {
            this.setValue(this._value - this._step);
        }
    }

    // AS3: SliderWindowControllerNew.as::get referenceWidth()
    private get referenceWidth(): number
    {
        return this.sliderMovementArea.width - this.sliderButton.width;
    }

    // AS3: SliderWindowControllerNew.as::get sliderMovementArea()
    private get sliderMovementArea(): IWindowContainer
    {
        return this._slider.findChildByName('slider_movement_area') as unknown as IWindowContainer;
    }

    // AS3: SliderWindowControllerNew.as::get sliderButton()
    private get sliderButton(): IStaticBitmapWrapperWindow
    {
        return this._slider.findChildByName('slider_button') as unknown as IStaticBitmapWrapperWindow;
    }
}
