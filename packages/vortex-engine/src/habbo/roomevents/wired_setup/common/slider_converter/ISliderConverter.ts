/**
 * ISliderConverter — converts between a wired slider's integer value and its text representation, and
 * reports the decimal precision and whether values step in 0.5 units (endsWithFive).
 *
 * Name derived: the AS3 interface is obfuscated as `_SafeCls_4330` with no readable counterpart; the
 * name follows its role (a slider value converter).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/common/slider_converter/_SafeCls_4330.as
 */
export interface ISliderConverter
{
    // AS3: _SafeCls_4330.as::toIntParam()
    toIntParam(value: string): number;

    // AS3: _SafeCls_4330.as::toString()
    toString(value: number): string;

    // AS3: _SafeCls_4330.as::get precision()
    readonly precision: number;

    // AS3: _SafeCls_4330.as::get endsWithFive()
    readonly endsWithFive: boolean;
}
