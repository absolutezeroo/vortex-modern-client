import type {IMenuElement} from './IMenuElement';

/**
 * MenuItem — one quick-menu entry: a label, a click callback, an optional tooltip, and an optional
 * checkbox with a selection-change callback.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/menu/elements/MenuItem.as
 */
export class MenuItem implements IMenuElement
{
    // AS3: MenuItem.as::_name
    private _name: string;

    // AS3: MenuItem.as::_onClick
    private _onClick: (() => void) | null;

    // AS3: MenuItem.as::_tooltip
    private _tooltip: string;

    // AS3: MenuItem.as::_hasCheckbox
    private _hasCheckbox: boolean;

    // AS3: MenuItem.as::_selectedChange
    private _selectedChange: ((selected: boolean) => void) | null;

    // AS3: MenuItem.as::MenuItem()
    constructor(name: string, onClick: (() => void) | null, tooltip: string = '', hasCheckbox: boolean = false, selectedChange: ((selected: boolean) => void) | null = null)
    {
        this._name = name;
        this._onClick = onClick;
        this._tooltip = tooltip;
        this._hasCheckbox = hasCheckbox;
        this._selectedChange = selectedChange;
    }

    // AS3: MenuItem.as::get name()
    get name(): string
    {
        return this._name;
    }

    // AS3: MenuItem.as::get onClick()
    get onClick(): (() => void) | null
    {
        return this._onClick;
    }

    // AS3: MenuItem.as::get tooltip()
    get tooltip(): string
    {
        return this._tooltip;
    }

    // AS3: MenuItem.as::get hasCheckbox()
    get hasCheckbox(): boolean
    {
        return this._hasCheckbox;
    }

    // AS3: MenuItem.as::get selectedChange()
    get selectedChange(): ((selected: boolean) => void) | null
    {
        return this._selectedChange;
    }
}
