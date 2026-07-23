/**
 * SubVariableParam — one row descriptor for SubVariableCreatorPreset: the sub-variable's bit id, its
 * default variable name, and whether it carries an extra explanatory line of text.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/params/applications/SubVariableParam.as
 */
export class SubVariableParam
{
    // AS3: SubVariableParam.as::_SafeStr_4872 (name derived from getter id)
    private readonly _id: number;

    // AS3: SubVariableParam.as::_name
    private readonly _name: string;

    // AS3: SubVariableParam.as::_SafeStr_10079 (name derived from getter hasExtraText)
    private readonly _hasExtraText: boolean;

    // AS3: SubVariableParam.as::SubVariableParam()
    constructor(id: number, name: string, hasExtraText: boolean = false)
    {
        this._id = id;
        this._name = name;
        this._hasExtraText = hasExtraText;
    }

    // AS3: SubVariableParam.as::get id()
    get id(): number
    {
        return this._id;
    }

    // AS3: SubVariableParam.as::get name()
    get name(): string
    {
        return this._name;
    }

    // AS3: SubVariableParam.as::get hasExtraText()
    get hasExtraText(): boolean
    {
        return this._hasExtraText;
    }
}
