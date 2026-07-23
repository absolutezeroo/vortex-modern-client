/**
 * AvatarExpressionEnum
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/enums/AvatarExpressionEnum.as
 *
 * Value-object enum of avatar expressions; the wire payload is `ordinal`.
 */
export class AvatarExpressionEnum
{
    // AS3: AvatarExpressionEnum.as::NONE
    public static readonly NONE: AvatarExpressionEnum = new AvatarExpressionEnum(0);

    // AS3: AvatarExpressionEnum.as::WAVE
    public static readonly WAVE: AvatarExpressionEnum = new AvatarExpressionEnum(1);

    // AS3: AvatarExpressionEnum.as::BLOW
    public static readonly BLOW: AvatarExpressionEnum = new AvatarExpressionEnum(2);

    // AS3: AvatarExpressionEnum.as::LAUGH
    public static readonly LAUGH: AvatarExpressionEnum = new AvatarExpressionEnum(3);

    // AS3: AvatarExpressionEnum.as::CRY
    public static readonly CRY: AvatarExpressionEnum = new AvatarExpressionEnum(4);

    // AS3: AvatarExpressionEnum.as::IDLE (obfuscated _SafeStr_7212)
    public static readonly IDLE: AvatarExpressionEnum = new AvatarExpressionEnum(5);

    // AS3: AvatarExpressionEnum.as::JUMP
    public static readonly JUMP: AvatarExpressionEnum = new AvatarExpressionEnum(6);

    // AS3: AvatarExpressionEnum.as::RESPECT
    public static readonly RESPECT: AvatarExpressionEnum = new AvatarExpressionEnum(7);

    // AS3: AvatarExpressionEnum.as::EXPRESSION_67 (config-gated avatar.expression.67.enabled)
    public static readonly EXPRESSION_67: AvatarExpressionEnum = new AvatarExpressionEnum(67);

    private _ordinal: number;

    // AS3: AvatarExpressionEnum.as::AvatarExpressionEnum()
    constructor(ordinal: number)
    {
        this._ordinal = ordinal;
    }

    // AS3: AvatarExpressionEnum.as::get ordinal()
    public get ordinal(): number
    {
        return this._ordinal;
    }

    // AS3: AvatarExpressionEnum.as::equals()
    public equals(other: AvatarExpressionEnum | null): boolean
    {
        return !!other && other._ordinal === this._ordinal;
    }
}
