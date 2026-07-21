import type {ExpandableDropdownOption} from '../../common/advanced_dropdown/ExpandableDropdownOption';

/**
 * DropdownParam — value object configuring a dropdown: its caption, the (optionally advanced) option
 * list, an on-change callback, and the "show more" localization key for the advanced group.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/params/DropdownParam.as
 */
export class DropdownParam
{
    // AS3: DropdownParam.as::_caption
    private _caption: string;

    // AS3: DropdownParam.as::options (backing field)
    private _options: ExpandableDropdownOption[] | null;

    // AS3: DropdownParam.as::showMoreLocalization (backing field)
    private _showMoreLocalization: string;

    // AS3: DropdownParam.as::_onChangeCallback
    private _onChangeCallback: ((...args: unknown[]) => void) | null;

    // AS3: DropdownParam.as::DropdownParam()
    constructor(caption: string, options: ExpandableDropdownOption[] | null = null, onChangeCallback: ((...args: unknown[]) => void) | null = null, showMoreLocalization: string = '')
    {
        this._caption = caption;
        this._options = options;
        this._onChangeCallback = onChangeCallback;
        this._showMoreLocalization = showMoreLocalization;
    }

    // AS3: DropdownParam.as::get onChangeCallback()
    get onChangeCallback(): ((...args: unknown[]) => void) | null
    {
        return this._onChangeCallback;
    }

    // AS3: DropdownParam.as::get caption()
    get caption(): string
    {
        return this._caption;
    }

    // AS3: DropdownParam.as::get options()
    get options(): ExpandableDropdownOption[] | null
    {
        return this._options;
    }

    // AS3: DropdownParam.as::get showMoreLocalization()
    get showMoreLocalization(): string
    {
        return this._showMoreLocalization;
    }
}
