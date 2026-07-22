import type {ISliderConverter} from './ISliderConverter';

/**
 * SliderValueEcho — the identity slider converter: the integer value is its own text (no scaling).
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4331` with no readable counterpart; the name
 * follows its role (an echo/identity converter).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/common/slider_converter/_SafeCls_4331.as
 */
export class SliderValueEcho implements ISliderConverter
{
    // AS3: _SafeCls_4331.as::toIntParam()
    toIntParam(value: string): number
    {
        return Math.trunc(Number(value));
    }

    // AS3: _SafeCls_4331.as::toString()
    toString(value: number): string
    {
        return value.toString();
    }

    // AS3: _SafeCls_4331.as::get precision()
    get precision(): number
    {
        return 0;
    }

    // AS3: _SafeCls_4331.as::get endsWithFive()
    get endsWithFive(): boolean
    {
        return false;
    }
}
