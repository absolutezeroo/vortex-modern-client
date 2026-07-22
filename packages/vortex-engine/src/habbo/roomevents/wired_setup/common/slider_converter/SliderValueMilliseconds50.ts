import type {ISliderConverter} from './ISliderConverter';

/**
 * SliderValueMilliseconds50 — a converter for millisecond values stored in 50ms steps (displayed as
 * milliseconds; negative precision means the input is snapped to whole steps).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/common/slider_converter/SliderValueMilliseconds50.as
 */
export class SliderValueMilliseconds50 implements ISliderConverter
{
    // AS3: SliderValueMilliseconds50.as::toIntParam()
    toIntParam(value: string): number
    {
        return Math.trunc(Number(value) / 50);
    }

    // AS3: SliderValueMilliseconds50.as::toString()
    toString(value: number): string
    {
        return '' + value * 50;
    }

    // AS3: SliderValueMilliseconds50.as::get precision()
    get precision(): number
    {
        return -1;
    }

    // AS3: SliderValueMilliseconds50.as::get endsWithFive()
    get endsWithFive(): boolean
    {
        return true;
    }
}
