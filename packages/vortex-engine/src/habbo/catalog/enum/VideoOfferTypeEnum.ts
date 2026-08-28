/**
 * What a rewarded-video offer pays out in.
 *
 * AS3 makes this an instance-based enum — two singletons wrapping an int, compared with
 * `equals()` — rather than the bare constants its siblings use. The shape is kept because
 * `VideoOfferManager` passes the instances around and compares them by identity, not by number.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/enum/VideoOfferTypeEnum.as
 */
export class VideoOfferTypeEnum
{
    // AS3: VideoOfferTypeEnum.as::CREDIT
    public static readonly CREDIT: VideoOfferTypeEnum = new VideoOfferTypeEnum(0);

    // AS3: VideoOfferTypeEnum.as::SNOWWAR
    public static readonly SNOWWAR: VideoOfferTypeEnum = new VideoOfferTypeEnum(1);

    // AS3: VideoOfferTypeEnum.as::_SafeStr_4717 (backing field of value)
    private _value: number;

    // AS3: VideoOfferTypeEnum.as::VideoOfferTypeEnum()
    constructor(value: number)
    {
        this._value = value;
    }

    // AS3: VideoOfferTypeEnum.as::get value()
    get value(): number
    {
        return this._value;
    }

    /** Null-safe by AS3's own definition: `param1 && param1._value == _value`. */
    // AS3: VideoOfferTypeEnum.as::equals()
    equals(other: VideoOfferTypeEnum | null): boolean
    {
        return other !== null && other._value === this._value;
    }
}
