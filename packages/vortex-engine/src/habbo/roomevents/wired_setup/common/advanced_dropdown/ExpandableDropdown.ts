import type {IDropMenuWindow} from '@core/window/components/IDropMenuWindow';
import type {IDisposable} from '@core/runtime/IDisposable';
import type {WindowEvent} from '@core/window/events/WindowEvent';

import type {ExpandableDropdownOption} from './ExpandableDropdownOption';

/**
 * ExpandableDropdown — drives a string-populated drop MENU (IDropMenuWindow) for the wired UI,
 * adding a two-level "advanced" behaviour on top of a flat dropdown: options flagged isAdvanced are
 * hidden behind a "show more" row (the showMoreLocalization string). Picking "show more" re-populates
 * the menu with the advanced options and re-opens it; collapsing without choosing an advanced option
 * folds the advanced options away again.
 *
 * The AS3 class wraps a `_SafeCls_2308` (IDropMenuWindow) and calls its `populateWithVector` — the
 * port renamed that method to `populateWithStrings` on DropMenuController, so this port calls that.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/common/advanced_dropdown/ExpandableDropdown.as
 */
export class ExpandableDropdown implements IDisposable
{
    // AS3: ExpandableDropdown.as::_disposed
    private _disposed: boolean = false;

    // AS3: ExpandableDropdown.as::_dropdown
    private _dropdown: IDropMenuWindow;

    // AS3: ExpandableDropdown.as::_onChangeCallback
    private _onChangeCallback: ((...args: unknown[]) => void) | null;

    // AS3: ExpandableDropdown.as::_SafeStr_5982 (name derived: whether the advanced options are shown)
    private _showingAdvanced: boolean = false;

    // AS3: ExpandableDropdown.as::_SafeStr_6785 (name derived: suppress the next WE_COLLAPSE — populate
    // opens/closes the menu, firing a spurious collapse we must ignore)
    private _ignoreNextCollapse: boolean = false;

    // AS3: ExpandableDropdown.as::_SafeStr_6076 (name derived: the currently selected option id)
    private _currentSelectedId: number = 0;

    // AS3: ExpandableDropdown.as::_SafeStr_5343 (name derived: the full option list, incl. advanced)
    private _allOptions: ExpandableDropdownOption[] = [];

    // AS3: ExpandableDropdown.as::_SafeStr_7650 (name derived: the "show more" localization string)
    private _showMoreLocalization: string;

    // AS3: ExpandableDropdown.as::_SafeStr_5466 (name derived: the currently displayed options)
    private _displayedOptions: ExpandableDropdownOption[] = [];

    // AS3: ExpandableDropdown.as::ExpandableDropdown()
    constructor(dropdown: IDropMenuWindow, showMoreLocalization: string, onChangeCallback: ((...args: unknown[]) => void) | null = null)
    {
        this._dropdown = dropdown;
        this._showMoreLocalization = showMoreLocalization;
        this._onChangeCallback = onChangeCallback;
        this._dropdown.addEventListener('WE_SELECTED', this._onSelectAction);
        this._dropdown.addEventListener('WE_COLLAPSE', this._onDropdownCollapse);
    }

    // AS3: ExpandableDropdown.as::init()
    init(options: ExpandableDropdownOption[], selectedId: number): void
    {
        this._allOptions = options;
        this._ignoreNextCollapse = false;
        this._showingAdvanced = false;
        this._currentSelectedId = 0;
        this.populate(selectedId);
    }

    // AS3: ExpandableDropdown.as::get dropdownOptions()
    get dropdownOptions(): ExpandableDropdownOption[]
    {
        return this._displayedOptions;
    }

    // AS3: ExpandableDropdown.as::populate()
    private populate(id: number, showAdvanced: boolean = false): void
    {
        let selectedIndex: number = -1;

        this._displayedOptions.length = 0;

        const displayStrings: string[] = [];

        for(const option of this._allOptions)
        {
            if(id === option.id)
            {
                selectedIndex = this._displayedOptions.length;

                if(option.isAdvanced && !showAdvanced)
                {
                    this._showingAdvanced = true;
                    this.populate(id, true);
                    return;
                }
            }

            if(!option.isAdvanced || showAdvanced)
            {
                this._displayedOptions.push(option);
                displayStrings.push(option.displayString);
            }
        }

        if(this.advancedOptionsAvailable && !showAdvanced)
        {
            displayStrings.push(this._showMoreLocalization);
        }

        this._ignoreNextCollapse = true;
        this._dropdown.populateWithStrings(displayStrings);

        if(selectedIndex !== -1)
        {
            this._dropdown.selection = selectedIndex;
            this._currentSelectedId = id;
        }
        else
        {
            this._currentSelectedId = -1;
        }
    }

    // AS3: ExpandableDropdown.as::get advancedOptionsAvailable()
    private get advancedOptionsAvailable(): boolean
    {
        for(const option of this._allOptions)
        {
            if(option.isAdvanced)
            {
                return true;
            }
        }

        return false;
    }

    // AS3: ExpandableDropdown.as::onSelectAction() — bound so it can be passed as an event listener.
    private _onSelectAction = (_event: WindowEvent): void =>
    {
        if(this._dropdown.selection >= this._displayedOptions.length)
        {
            this._showingAdvanced = true;
            this.populate(this._currentSelectedId, true);
            this._dropdown.openMenu();
            return;
        }

        this._currentSelectedId = this.selectedOptionId;

        if(this._onChangeCallback !== null)
        {
            this._onChangeCallback(this.selectedOption);
        }
    };

    // AS3: ExpandableDropdown.as::onDropdownCollapse() — bound so it can be passed as an event listener.
    private _onDropdownCollapse = (_event: WindowEvent): void =>
    {
        if(this._ignoreNextCollapse)
        {
            this._ignoreNextCollapse = false;
            return;
        }

        if(this._showingAdvanced && (this.selectedOption === null || !this.selectedOption.isAdvanced))
        {
            this._showingAdvanced = false;
            this.populate(this.selectedOptionId, false);
        }
    };

    // AS3: ExpandableDropdown.as::get selectedOption()
    get selectedOption(): ExpandableDropdownOption | null
    {
        const selection = this._dropdown.selection;

        if(selection < 0 || selection >= this._displayedOptions.length)
        {
            return null;
        }

        return this._displayedOptions[selection];
    }

    // AS3: ExpandableDropdown.as::get selectedOptionId() — `selectedOption?.id`; when nothing is
    // selected the optional-chain yields undefined, which the AS3 Number return coerces to NaN.
    get selectedOptionId(): number
    {
        return this.selectedOption?.id ?? NaN;
    }

    // AS3: ExpandableDropdown.as::set selectedOptionId()
    set selectedOptionId(id: number)
    {
        this.init(this._allOptions, id);
    }

    // AS3: ExpandableDropdown.as::dispose()
    dispose(): void
    {
        if(this._disposed)
        {
            return;
        }

        this._dropdown.dispose();
        this._dropdown = null as unknown as IDropMenuWindow;
        this._onChangeCallback = null;
        this._allOptions = null as unknown as ExpandableDropdownOption[];
        this._showMoreLocalization = null as unknown as string;
        this._displayedOptions = null as unknown as ExpandableDropdownOption[];
        this._disposed = true;
    }

    // AS3: ExpandableDropdown.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }
}
