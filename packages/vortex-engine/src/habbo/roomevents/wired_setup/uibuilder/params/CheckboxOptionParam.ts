import type {WiredUIPreset} from '../presets/WiredUIPreset';

/**
 * CheckboxOptionParam — value object describing one checkbox option in a CheckboxGroupPreset: label
 * text, optional id, an optional icon asset, and up to two extra presets shown alongside the option.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/params/CheckboxOptionParam.as
 */
export class CheckboxOptionParam
{
    // AS3: CheckboxOptionParam.as::_text
    private _text: string;

    // AS3: CheckboxOptionParam.as::id (backing field)
    private _id: number = -1;

    // AS3: CheckboxOptionParam.as::_iconAssetName
    private _iconAssetName: string | null = null;

    // AS3: CheckboxOptionParam.as::_extra1
    private _extra1: WiredUIPreset | null;

    // AS3: CheckboxOptionParam.as::_extra2
    private _extra2: WiredUIPreset | null;

    // AS3: CheckboxOptionParam.as::CheckboxOptionParam()
    constructor(text: string, id: number = -1, extra1: WiredUIPreset | null = null, extra2: WiredUIPreset | null = null)
    {
        this._text = text;
        this._id = id;
        this._extra1 = extra1;
        this._extra2 = extra2;
    }

    // AS3: CheckboxOptionParam.as::get text()
    get text(): string
    {
        return this._text;
    }

    // AS3: CheckboxOptionParam.as::get iconAssetName()
    get iconAssetName(): string | null
    {
        return this._iconAssetName;
    }

    // AS3: CheckboxOptionParam.as::set iconAssetName()
    set iconAssetName(value: string | null)
    {
        this._iconAssetName = value;
    }

    // AS3: CheckboxOptionParam.as::get extra1()
    get extra1(): WiredUIPreset | null
    {
        return this._extra1;
    }

    // AS3: CheckboxOptionParam.as::set extra1()
    set extra1(value: WiredUIPreset | null)
    {
        this._extra1 = value;
    }

    // AS3: CheckboxOptionParam.as::get extra2()
    get extra2(): WiredUIPreset | null
    {
        return this._extra2;
    }

    // AS3: CheckboxOptionParam.as::set extra2()
    set extra2(value: WiredUIPreset | null)
    {
        this._extra2 = value;
    }

    // AS3: CheckboxOptionParam.as::get id()
    get id(): number
    {
        return this._id;
    }

    // AS3: CheckboxOptionParam.as::set id()
    set id(value: number)
    {
        this._id = value;
    }
}
