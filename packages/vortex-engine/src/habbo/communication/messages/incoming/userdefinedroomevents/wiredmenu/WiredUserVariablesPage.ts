import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {WiredUserVariablesElement} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredmenu/WiredUserVariablesElement';

/**
 * WiredUserVariablesPage — one page of the variable-management overview for a single variable: the
 * variable id, paging metadata, the holder rows, and the active user-type / sort filters echoed back.
 * The field read order below is authoritative for the wire format.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4074/WiredUserVariablesPage.as
 */
export class WiredUserVariablesPage
{
    // AS3: WiredUserVariablesPage.as::_SafeStr_9014 (name derived: variable id)
    private _variableId: string;

    // AS3: WiredUserVariablesPage.as::_totalEntries
    private _totalEntries: number;

    // AS3: WiredUserVariablesPage.as::_SafeStr_4846 (name derived: current page)
    private _currentPage: number;

    // AS3: WiredUserVariablesPage.as::_amount
    private _amount: number;

    // AS3: WiredUserVariablesPage.as::_SafeStr_5134 (name derived: rows)
    private _elements: WiredUserVariablesElement[];

    // AS3: WiredUserVariablesPage.as::_SafeStr_9598 (name derived: user-type filter)
    private _userTypeFilter: number;

    // AS3: WiredUserVariablesPage.as::_SafeStr_8792 (name derived: sort-type filter)
    private _sortTypeFilter: number;

    // AS3: WiredUserVariablesPage.as::WiredUserVariablesPage()
    constructor(wrapper: IMessageDataWrapper)
    {
        this._variableId = wrapper.readString();
        this._totalEntries = wrapper.readInt();
        this._currentPage = wrapper.readInt();
        this._amount = wrapper.readInt();
        this._elements = [];
        const count: number = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            this._elements.push(new WiredUserVariablesElement(wrapper));
        }

        this._userTypeFilter = wrapper.readInt();
        this._sortTypeFilter = wrapper.readInt();
    }

    // AS3: WiredUserVariablesPage.as::get variableId()
    get variableId(): string
    {
        return this._variableId;
    }

    // AS3: WiredUserVariablesPage.as::get totalEntries()
    get totalEntries(): number
    {
        return this._totalEntries;
    }

    // AS3: WiredUserVariablesPage.as::get currentPage()
    get currentPage(): number
    {
        return this._currentPage;
    }

    // AS3: WiredUserVariablesPage.as::get amount()
    get amount(): number
    {
        return this._amount;
    }

    // AS3: WiredUserVariablesPage.as::get elements()
    get elements(): WiredUserVariablesElement[]
    {
        return this._elements;
    }

    // AS3: WiredUserVariablesPage.as::get userTypeFilter()
    get userTypeFilter(): number
    {
        return this._userTypeFilter;
    }

    // AS3: WiredUserVariablesPage.as::get sortTypFilter()
    get sortTypFilter(): number
    {
        return this._sortTypeFilter;
    }
}
