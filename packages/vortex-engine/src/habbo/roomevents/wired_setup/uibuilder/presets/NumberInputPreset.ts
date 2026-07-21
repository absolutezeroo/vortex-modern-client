import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextFieldWindow} from '@core/window/components/ITextFieldWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';

import type {PresetManager} from '../PresetManager';
import type {WiredStyle} from '../styles/WiredStyle';
import type {NumberInputParam} from '../params/NumberInputParam';
import {WiredUIPreset} from './WiredUIPreset';

/**
 * NumberInputPreset — a numeric text field enforcing a min/max range, decimal precision (fixed-point
 * stored as an integer), optional "ends with 0/5" stepping, and optional binary/hex entry. Invalid
 * edits are reverted to the last valid value; valid edits clamp and notify via onValueChange.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/NumberInputPreset.as
 */
export class NumberInputPreset extends WiredUIPreset
{
    // AS3: NumberInputPreset.as::_input (the input template window)
    private _input: IWindowContainer;

    // AS3: NumberInputPreset.as::_field
    private _field: ITextFieldWindow;

    // AS3: NumberInputPreset.as::_param
    private _param: NumberInputParam;

    // AS3: NumberInputPreset.as::_value (last value passed to setValue)
    private _value: number = 0;

    // AS3: NumberInputPreset.as::_validValue (latest valid value)
    private _validValue: number = 0;

    // AS3: NumberInputPreset.as::_latestValidValueStr
    private _latestValidValueStr: string = '';

    // AS3: NumberInputPreset.as::_min
    private _min: number;

    // AS3: NumberInputPreset.as::_max
    private _max: number;

    // AS3: NumberInputPreset.as::_precision
    private _precision: number;

    // AS3: NumberInputPreset.as::_endsWithFive
    private _endsWithFive: boolean;

    // AS3: NumberInputPreset.as::_widthDelta
    private _widthDelta: number;

    // AS3: NumberInputPreset.as::_onValueChange
    private _onValueChange: ((value: number) => void) | null = null;

    // AS3: NumberInputPreset.as::_ignoreListeners
    private _ignoreListeners: boolean = false;

    // AS3: NumberInputPreset.as::NumberInputPreset()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, param: NumberInputParam)
    {
        super(roomEvents, presetManager, wiredStyle);

        this._input = wiredStyle.createTextInputView() as unknown as IWindowContainer;
        this._field = this._input.findChildByName('field') as unknown as ITextFieldWindow;
        this._param = param;
        this._widthDelta = this._input.width - this._field.width;

        if(param.width >= 0)
        {
            this._input.width = param.width + this._widthDelta;
        }

        // TODO(AS3): AS3 sets `_field.restrict` to a digit/sign/decimal/hex character mask. The port's
        // ITextFieldWindow has no `restrict`, so the mask is not applied — onTextChange still validates
        // and reverts invalid input, so the field stays numeric.
        this._endsWithFive = param.endsWithFive;
        this._min = this._endsWithFive ? param.min * 5 : param.min;
        this._max = this._endsWithFive ? param.max * 5 : param.max;
        this._precision = param.precision;

        if(param.tooltip != null)
        {
            this._field.toolTipCaption = param.tooltip;
        }

        this.setValue(param.initialValue);
        this._field.addEventListener('WE_CHANGE', this._onTextChange);
    }

    // AS3: NumberInputPreset.as::swapChars()
    private static swapChars(value: string, a: number, b: number): string
    {
        const chars = value.split('');
        const tmp = chars[a];

        chars[a] = chars[b];
        chars[b] = tmp;

        return chars.join('');
    }

    // AS3: NumberInputPreset.as::isValidInt()
    private static isValidInt(value: string): boolean
    {
        return /^-?\d+$/.test(value);
    }

    // AS3: NumberInputPreset.as::set onValueChange()
    set onValueChange(callback: (value: number) => void)
    {
        this._onValueChange = callback;
    }

    // AS3: NumberInputPreset.as::displayValue()
    private displayValue(value: number): string
    {
        let text = value.toString();

        if(this._precision > 0)
        {
            while(text.length < this._precision + 1)
            {
                text = '0' + text;
            }

            text = text.substring(0, text.length - this._precision) + '.' + text.substring(text.length - this._precision);

            while(text.charAt(text.length - 1) === '0')
            {
                text = text.substring(0, text.length - 1);
            }

            if(text.charAt(text.length - 1) === '.')
            {
                text = text.substring(0, text.length - 1);
            }
        }

        if(this._precision < 0)
        {
            let j = 0;

            while(j > this._precision)
            {
                text += '0';
                j -= 1;
            }
        }

        return text;
    }

    // AS3: NumberInputPreset.as::setValue()
    private setValue(value: number): void
    {
        this._ignoreListeners = true;
        this._value = value;
        this._validValue = value;
        this._latestValidValueStr = this.displayValue(this._endsWithFive ? value * 5 : value);
        this._field.text = this._latestValidValueStr;
        this._ignoreListeners = false;
    }

    // AS3: NumberInputPreset.as::set value()
    set value(value: number)
    {
        this.setValue(value);
    }

    // AS3: NumberInputPreset.as::reset()
    reset(): void
    {
        this.setValue(this._param.initialValue);
    }

    // AS3: NumberInputPreset.as::onTextChange()
    private _onTextChange = (_event: WindowEvent): void =>
    {
        if(this._ignoreListeners)
        {
            return;
        }

        const text = this._field.text;

        if(text === '' || (text === '-' && this._param.min < 0))
        {
            return;
        }

        const lastChar = text.charAt(text.length - 1);

        if(this._precision === 0 && this._endsWithFive && lastChar !== '0' && lastChar !== '5')
        {
            return;
        }

        if(this._precision < 0 && lastChar === '0')
        {
            return;
        }

        if(this._param.nonDecimalNotations && (text.indexOf('0b') === 0 || text.indexOf('0x') === 0))
        {
            const parsedRadix = text.indexOf('0b') === 0 ? parseInt(text.substr(2), 2) : parseInt(text.substr(2), 16);

            this.setValidValueAndNotify(parsedRadix < this._min ? this._min : (parsedRadix > this._max ? this._max : parsedRadix));

            return;
        }

        let normalized = text.replace(',', '.');

        if(this._precision > 0)
        {
            if(normalized.charAt(normalized.length - 1) === '.')
            {
                normalized = normalized.substring(0, normalized.length - 1);
            }

            if(!/^-?([0-9]*[.])?[0-9]+$/.test(normalized))
            {
                this._ignoreListeners = true;
                this._field.text = this._latestValidValueStr;
                this._ignoreListeners = false;

                return;
            }

            let i = 0;

            while(i < this._precision)
            {
                const dotIndex = normalized.indexOf('.');

                if(dotIndex === -1)
                {
                    normalized += '0';
                }
                else
                {
                    normalized = NumberInputPreset.swapChars(normalized, dotIndex, dotIndex + 1);

                    if(normalized.charAt(normalized.length - 1) === '.')
                    {
                        normalized = normalized.substring(0, normalized.length - 1);
                    }
                }

                i++;
            }
        }
        else if(this._precision < 0)
        {
            let i = 0;

            while(i > this._precision)
            {
                if(normalized === '0' || normalized === '-0' || normalized === '')
                {
                    break;
                }

                if(normalized.charAt(normalized.length - 1) === '0')
                {
                    normalized = normalized.substring(0, normalized.length - 1);
                }
                else
                {
                    this._ignoreListeners = true;
                    this._field.text = this._latestValidValueStr;
                    this._ignoreListeners = false;
                }

                i -= 1;
            }
        }

        if(this._endsWithFive && normalized.charAt(normalized.length - 1) !== '0' && normalized.charAt(normalized.length - 1) !== '5')
        {
            this._field.text = this._latestValidValueStr;

            return;
        }

        let parsed = Math.trunc(Number(normalized));

        if(!isNaN(parsed) && NumberInputPreset.isValidInt(normalized))
        {
            if(String(parsed).length <= String(this._param.min).length && parsed < this._param.min && String(this._param.max).length > String(this._param.min).length)
            {
                return;
            }

            if(parsed >= this._min && parsed <= this._max)
            {
                this._latestValidValueStr = this._field.text;
            }
            else if(parsed < this._min)
            {
                parsed = this._min;
                this._latestValidValueStr = this.displayValue(this._min);
                this._field.text = this._latestValidValueStr;
            }
            else
            {
                parsed = this._max;
                this._latestValidValueStr = this.displayValue(this._max);
                this._field.text = this._latestValidValueStr;
            }

            this.setValidValueAndNotify(this._endsWithFive ? Math.trunc(parsed / 5) : parsed);
        }
        else
        {
            this._field.text = this._latestValidValueStr;
        }
    };

    // AS3: NumberInputPreset.as::setValidValueAndNotify()
    private setValidValueAndNotify(value: number): void
    {
        this._validValue = value;

        if(this._onValueChange != null)
        {
            this._onValueChange(value);
        }
    }

    // AS3: NumberInputPreset.as::get value()
    get value(): number
    {
        return this._validValue;
    }

    // AS3: NumberInputPreset.as::get number()
    get number(): number
    {
        return Number(this._latestValidValueStr);
    }

    // AS3: NumberInputPreset.as::hasStaticWidth()
    override hasStaticWidth(): boolean
    {
        return this._param.width >= 0;
    }

    // AS3: NumberInputPreset.as::get staticWidth()
    override get staticWidth(): number
    {
        if(this._param.width >= 0)
        {
            return this._param.width + this._widthDelta;
        }

        throw new Error('Number input with -1 width has no static width');
    }

    // AS3: NumberInputPreset.as::resizeToWidth()
    override resizeToWidth(width: number): void
    {
        super.resizeToWidth(width);

        const inputWidth = this._param.width >= 0 ? this._param.width + this._widthDelta : width;

        this._input.width = inputWidth;
    }

    // AS3: NumberInputPreset.as::get window()
    override get window(): IWindow
    {
        return this._input;
    }

    // AS3: NumberInputPreset.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        super.dispose();
        this._input.dispose();
        this._input = null as unknown as IWindowContainer;
        this._param = null as unknown as NumberInputParam;
    }
}
