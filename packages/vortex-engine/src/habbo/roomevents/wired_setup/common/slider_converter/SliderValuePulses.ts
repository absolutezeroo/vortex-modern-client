import type {ISliderConverter} from './ISliderConverter';

/**
 * SliderValuePulses — a converter for pulse durations stored in half-pulse units (0.5 granularity),
 * displayed as whole or ".5" values.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/common/slider_converter/SliderValuePulses.as
 */
export class SliderValuePulses implements ISliderConverter
{
    // AS3: SliderValuePulses.as::toIntParam()
    toIntParam(value: string): number
    {
        return Math.round(Number(value) * 2);
    }

    // AS3: SliderValuePulses.as::toString()
    toString(value: number): string
    {
        const half = Math.floor(value / 2);

        if(value % 2 === 0)
        {
            return '' + half;
        }

        return half + '.5';
    }

    // AS3: SliderValuePulses.as::get precision()
    get precision(): number
    {
        return 1;
    }

    // AS3: SliderValuePulses.as::get endsWithFive()
    get endsWithFive(): boolean
    {
        return true;
    }
}
