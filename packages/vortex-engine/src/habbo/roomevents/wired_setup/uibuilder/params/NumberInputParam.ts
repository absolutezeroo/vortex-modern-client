import {TextInputParam} from './TextInputParam';

/**
 * NumberInputParam — value object configuring a NumberInputPreset: initial value, min/max bounds,
 * width, precision, "ends with five" stepping, non-decimal notations, and tooltip.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/params/NumberInputParam.as
 */
export class NumberInputParam
{
    // AS3: NumberInputParam.as::DEFAULT
    public static readonly DEFAULT: TextInputParam = new TextInputParam();

    // AS3: NumberInputParam.as::initialValue (backing field)
    private _initialValue: number;

    // AS3: NumberInputParam.as::_min
    private _min: number;

    // AS3: NumberInputParam.as::max (backing field)
    private _max: number;

    // AS3: NumberInputParam.as::_width
    private _width: number;

    // AS3: NumberInputParam.as::precision (backing field)
    private _precision: number;

    // AS3: NumberInputParam.as::endsWithFive (backing field)
    private _endsWithFive: boolean;

    // AS3: NumberInputParam.as::nonDecimalNotations (backing field)
    private _nonDecimalNotations: boolean;

    // AS3: NumberInputParam.as::tooltip (backing field)
    private _tooltip: string | null;

    // AS3: NumberInputParam.as::NumberInputParam()
    constructor(initialValue: number, min: number, max: number, width: number = 45, precision: number = 0, endsWithFive: boolean = false, nonDecimalNotations: boolean = false, tooltip: string | null = null)
    {
        this._initialValue = initialValue;
        this._min = min;
        this._max = max;
        this._precision = precision;
        this._endsWithFive = endsWithFive;
        this._width = width;
        this._nonDecimalNotations = nonDecimalNotations;
        this._tooltip = tooltip;
    }

    // AS3: NumberInputParam.as::get initialValue()
    get initialValue(): number
    {
        return this._initialValue;
    }

    // AS3: NumberInputParam.as::get min()
    get min(): number
    {
        return this._min;
    }

    // AS3: NumberInputParam.as::get max()
    get max(): number
    {
        return this._max;
    }

    // AS3: NumberInputParam.as::get precision()
    get precision(): number
    {
        return this._precision;
    }

    // AS3: NumberInputParam.as::get endsWithFive()
    get endsWithFive(): boolean
    {
        return this._endsWithFive;
    }

    // AS3: NumberInputParam.as::get width()
    get width(): number
    {
        return this._width;
    }

    // AS3: NumberInputParam.as::get nonDecimalNotations()
    get nonDecimalNotations(): boolean
    {
        return this._nonDecimalNotations;
    }

    // AS3: NumberInputParam.as::get tooltip()
    get tooltip(): string | null
    {
        return this._tooltip;
    }
}
