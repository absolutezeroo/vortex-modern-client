import type {ISliderConverter} from './ISliderConverter';

/**
 * SliderValueSeconds5 — a converter for second values stored in 5-second steps (displayed as seconds).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/common/slider_converter/SliderValueSeconds5.as
 */
export class SliderValueSeconds5 implements ISliderConverter
{
    // AS3: SliderValueSeconds5.as::toIntParam()
    toIntParam(value: string): number
    {
        return Math.round(Number(value) / 5);
    }

    // AS3: SliderValueSeconds5.as::toString()
    toString(value: number): string
    {
        return String(value * 5);
    }

    // AS3: SliderValueSeconds5.as::get precision()
    get precision(): number
    {
        return 0;
    }

    // AS3: SliderValueSeconds5.as::get endsWithFive()
    get endsWithFive(): boolean
    {
        return true;
    }
}
