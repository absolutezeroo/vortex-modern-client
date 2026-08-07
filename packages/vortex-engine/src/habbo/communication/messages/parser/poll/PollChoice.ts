/**
 * One selectable answer of a poll question.
 *
 * `choiceType` is what makes an NPS poll branch: after a radio answer the dialog remembers the
 * chosen choice's type and looks for a follow-up question in the same category.
 *
 * Class name DERIVED: the AS3 file is `_SafeCls_4101.as` and the identifier exists in no tree.
 * Named after its three members, which are readable.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2704/_SafeCls_4101.as
 */
export class PollChoice
{
    // AS3: .../_SafePkg_2704/_SafeCls_4101.as::_value
    private _value: string;

    // AS3: .../_SafePkg_2704/_SafeCls_4101.as::_choiceText
    private _choiceText: string;

    // AS3: .../_SafePkg_2704/_SafeCls_4101.as::_choiceType
    private _choiceType: number;

    // AS3: .../_SafePkg_2704/_SafeCls_4101.as::_SafeCls_4101()
    constructor(value: string, choiceText: string, choiceType: number)
    {
        this._value = value;
        this._choiceText = choiceText;
        this._choiceType = choiceType;
    }

    // AS3: .../_SafePkg_2704/_SafeCls_4101.as::get value()
    get value(): string
    {
        return this._value;
    }

    // AS3: .../_SafePkg_2704/_SafeCls_4101.as::set value()
    set value(v: string)
    {
        this._value = v;
    }

    // AS3: .../_SafePkg_2704/_SafeCls_4101.as::get choiceText()
    get choiceText(): string
    {
        return this._choiceText;
    }

    // AS3: .../_SafePkg_2704/_SafeCls_4101.as::set choiceText()
    set choiceText(v: string)
    {
        this._choiceText = v;
    }

    // AS3: .../_SafePkg_2704/_SafeCls_4101.as::get choiceType()
    get choiceType(): number
    {
        return this._choiceType;
    }

    // AS3: .../_SafePkg_2704/_SafeCls_4101.as::set choiceType()
    set choiceType(v: number)
    {
        this._choiceType = v;
    }
}
