import type {IMessageDataWrapper} from '@core/communication';

/**
 * Saved search in the navigator
 *
 * Based on AS3 class_1706
 */
export class NavigatorSavedSearch
{
    constructor(wrapper: IMessageDataWrapper)
    {
        this._id = wrapper.readInt();
        this._searchCode = wrapper.readString();
        this._filter = wrapper.readString();
        this._localization = wrapper.readString();
    }

    private _id: number = 0;

    get id(): number
    {
        return this._id;
    }

    private _searchCode: string = '';

    get searchCode(): string
    {
        return this._searchCode;
    }

    private _filter: string = '';

    get filter(): string
    {
        return this._filter;
    }

    private _localization: string = '';

    get localization(): string
    {
        return this._localization;
    }
}
