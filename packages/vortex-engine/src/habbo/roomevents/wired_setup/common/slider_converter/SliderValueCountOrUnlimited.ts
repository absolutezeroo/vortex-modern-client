import type {ISliderConverter} from './ISliderConverter';

/**
 * SliderValueCountOrUnlimited — a count converter whose top value renders as "∞" (unlimited).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/common/slider_converter/SliderValueCountOrUnlimited.as
 */
export class SliderValueCountOrUnlimited implements ISliderConverter
{
    // AS3: SliderValueCountOrUnlimited.as::_unlimitedValue
    private _unlimitedValue: number;

    // AS3: SliderValueCountOrUnlimited.as::SliderValueCountOrUnlimited()
    constructor(unlimitedValue: number)
    {
        this._unlimitedValue = unlimitedValue;
    }

    // AS3: SliderValueCountOrUnlimited.as::toIntParam()
    toIntParam(value: string): number
    {
        return Math.trunc(Number(value));
    }

    // AS3: SliderValueCountOrUnlimited.as::toString()
    toString(value: number): string
    {
        if(value === this._unlimitedValue)
        {
            return '∞';
        }

        return '' + value;
    }

    // AS3: SliderValueCountOrUnlimited.as::get precision()
    get precision(): number
    {
        return 0;
    }

    // AS3: SliderValueCountOrUnlimited.as::get endsWithFive()
    get endsWithFive(): boolean
    {
        return false;
    }
}
