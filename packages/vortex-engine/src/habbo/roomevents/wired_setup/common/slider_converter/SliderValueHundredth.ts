import type {ISliderConverter} from './ISliderConverter';

/**
 * SliderValueHundredth — a converter for values stored in hundredths, displayed with two decimals.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/common/slider_converter/SliderValueHundredth.as
 */
export class SliderValueHundredth implements ISliderConverter
{
    // AS3: SliderValueHundredth.as::toIntParam()
    toIntParam(value: string): number
    {
        return Math.round(Number(value) * 100);
    }

    // AS3: SliderValueHundredth.as::toString()
    toString(value: number): string
    {
        return (value / 100).toFixed(2);
    }

    // AS3: SliderValueHundredth.as::get precision()
    get precision(): number
    {
        return 2;
    }

    // AS3: SliderValueHundredth.as::get endsWithFive()
    get endsWithFive(): boolean
    {
        return false;
    }
}
