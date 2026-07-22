import type {WiredUIPreset} from '../presets/WiredUIPreset';

/**
 * RadioButtonParam — value object describing one radio option in a RadioGroupPreset: id, label text,
 * an optional icon asset, up to two extra presets, and whether the option starts a new line.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/params/RadioButtonParam.as
 */
export class RadioButtonParam
{
    // AS3: RadioButtonParam.as::id (backing field)
    private _id: number;

    // AS3: RadioButtonParam.as::_text
    // Nullable in AS3: icon-only radio options are constructed with a null label (e.g. the MoveFurni /
    // MoveUser direction grids), and RadioButtonPreset guards with `param.text != null`.
    private _text: string | null;

    // AS3: RadioButtonParam.as::_iconAssetName
    private _iconAssetName: string | null = null;

    // AS3: RadioButtonParam.as::_extra1
    private _extra1: WiredUIPreset | null;

    // AS3: RadioButtonParam.as::_extra2
    private _extra2: WiredUIPreset | null;

    // AS3: RadioButtonParam.as::newLine (backing field)
    private _newLine: boolean;

    // AS3: RadioButtonParam.as::RadioButtonParam()
    constructor(id: number, text: string | null, extra1: WiredUIPreset | null = null, extra2: WiredUIPreset | null = null, newLine: boolean = false)
    {
        this._id = id;
        this._text = text;
        this._extra1 = extra1;
        this._extra2 = extra2;
        this._newLine = newLine;
    }

    // AS3: RadioButtonParam.as::get id()
    get id(): number
    {
        return this._id;
    }

    // AS3: RadioButtonParam.as::get text()
    get text(): string | null
    {
        return this._text;
    }

    // AS3: RadioButtonParam.as::get iconAssetName()
    get iconAssetName(): string | null
    {
        return this._iconAssetName;
    }

    // AS3: RadioButtonParam.as::set iconAssetName()
    set iconAssetName(value: string | null)
    {
        this._iconAssetName = value;
    }

    // AS3: RadioButtonParam.as::get extra1()
    get extra1(): WiredUIPreset | null
    {
        return this._extra1;
    }

    // AS3: RadioButtonParam.as::set extra1()
    set extra1(value: WiredUIPreset | null)
    {
        this._extra1 = value;
    }

    // AS3: RadioButtonParam.as::get extra2()
    get extra2(): WiredUIPreset | null
    {
        return this._extra2;
    }

    // AS3: RadioButtonParam.as::set extra2()
    set extra2(value: WiredUIPreset | null)
    {
        this._extra2 = value;
    }

    // AS3: RadioButtonParam.as::get newLine()
    get newLine(): boolean
    {
        return this._newLine;
    }

    // AS3: RadioButtonParam.as::set newLine()
    set newLine(value: boolean)
    {
        this._newLine = value;
    }
}
