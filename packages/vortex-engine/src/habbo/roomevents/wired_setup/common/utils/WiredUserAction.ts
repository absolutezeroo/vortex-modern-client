/**
 * WiredUserAction — value object describing one selectable "user action" (emote/pose) in the wired
 * action/dance/sign dropdowns: a localization name, its server code, and — for the two actions that
 * carry an extra parameter (sign #10, dance #11) — the conversion between the extra id and the
 * stringParam encoding it. `allWiredUserActions` is the fixed catalogue.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/common/utils/WiredUserAction.as
 */
export class WiredUserAction
{
    // AS3: WiredUserAction.as::asInt equivalent — AS3 int(String): Number()→truncate, non-numeric→0.
    // (dance's `value.split(' ')[1]` can be missing at runtime; Number(undefined)→NaN→0 preserves that.)
    private static asInt(value: string): number
    {
        const parsed = Math.trunc(Number(value));

        return Number.isNaN(parsed) ? 0 : parsed;
    }

    // AS3: WiredUserAction.as::allWiredUserActions (real AS3 public member name — camelCase in source)
    // eslint-disable-next-line @typescript-eslint/naming-convention -- keep the AS3 identifier verbatim
    public static readonly allWiredUserActions: WiredUserAction[] = [
        new WiredUserAction('wave', 0),
        new WiredUserAction('blow', 1),
        new WiredUserAction('laugh', 2),
        new WiredUserAction('respect', 3),
        new WiredUserAction('awake', 4),
        new WiredUserAction('sleep', 5),
        new WiredUserAction('sit', 6),
        new WiredUserAction('stand', 7),
        new WiredUserAction('lay', 8),
        new WiredUserAction('sign', 10, true, (id: number): string => id.toString(), (value: string): number => WiredUserAction.asInt(value)),
        new WiredUserAction('dance', 11, true, (id: number): string => 'dance ' + id, (value: string): number => WiredUserAction.asInt(value.split(' ')[1])),
        new WiredUserAction('67', 67)
    ];

    // AS3: WiredUserAction.as::_name
    private _name: string;

    // AS3: WiredUserAction.as::_code
    private _code: number;

    // AS3: WiredUserAction.as::_SafeStr_9897 (name derived: whether the action carries an extra param)
    private _hasExtra: boolean;

    // AS3: WiredUserAction.as::_extraIdToString
    private _extraIdToString: ((id: number) => string) | null;

    // AS3: WiredUserAction.as::_SafeStr_9699 (name derived: extra-string → extra-id converter)
    private _extraStringToCode: ((value: string) => number) | null;

    // AS3: WiredUserAction.as::WiredUserAction()
    constructor(name: string, code: number, hasExtra: boolean = false, extraIdToString: ((id: number) => string) | null = null, extraStringToCode: ((value: string) => number) | null = null)
    {
        this._name = name;
        this._code = code;
        this._hasExtra = hasExtra;
        this._extraIdToString = extraIdToString;
        this._extraStringToCode = extraStringToCode;
    }

    // AS3: WiredUserAction.as::get name()
    get name(): string
    {
        return this._name;
    }

    // AS3: WiredUserAction.as::get code()
    get code(): number
    {
        return this._code;
    }

    // AS3: WiredUserAction.as::get hasExtra()
    get hasExtra(): boolean
    {
        return this._hasExtra;
    }

    // AS3: WiredUserAction.as::convertCodeToExtraString() — only valid for hasExtra actions (AS3 would
    // NPE otherwise; callers guard on hasExtra).
    convertCodeToExtraString(id: number): string
    {
        return this._extraIdToString!(id);
    }

    // AS3: WiredUserAction.as::convertExtraStringToCode()
    convertExtraStringToCode(value: string): number
    {
        return this._extraStringToCode!(value);
    }
}
