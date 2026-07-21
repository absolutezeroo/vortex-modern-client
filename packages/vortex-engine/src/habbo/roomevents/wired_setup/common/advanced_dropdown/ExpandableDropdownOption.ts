/**
 * ExpandableDropdownOption — one option in an expandable (advanced) dropdown: its id, the string
 * shown to the user, and whether it belongs to the "advanced" (initially hidden) group.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/common/advanced_dropdown/ExpandableDropdownOption.as
 */
export class ExpandableDropdownOption
{
    // AS3: ExpandableDropdownOption.as::id (backing field)
    private _id: number;

    // AS3: ExpandableDropdownOption.as::_displayString
    private _displayString: string;

    // AS3: ExpandableDropdownOption.as::isAdvanced (backing field)
    private _isAdvanced: boolean;

    // AS3: ExpandableDropdownOption.as::ExpandableDropdownOption()
    constructor(id: number, displayString: string, isAdvanced: boolean = false)
    {
        this._id = id;
        this._displayString = displayString;
        this._isAdvanced = isAdvanced;
    }

    // AS3: ExpandableDropdownOption.as::get id()
    get id(): number
    {
        return this._id;
    }

    // AS3: ExpandableDropdownOption.as::get displayString()
    get displayString(): string
    {
        return this._displayString;
    }

    // AS3: ExpandableDropdownOption.as::get isAdvanced()
    get isAdvanced(): boolean
    {
        return this._isAdvanced;
    }
}
