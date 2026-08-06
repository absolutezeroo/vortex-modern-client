/**
 * Search context containing search code and filtering
 *
 */
export class SearchContext
{
    constructor(searchCode: string, filtering: string)
    {
        this._searchCode = searchCode;
        this._filtering = filtering;
    }

    // AS3: .../src/com/sulake/habbo/navigator/context/SearchContext.as::_searchCode
    private _searchCode: string;

    // AS3: .../src/com/sulake/habbo/navigator/context/SearchContext.as::get searchCode()
    get searchCode(): string
    {
        return this._searchCode;
    }

    // AS3: .../src/com/sulake/habbo/navigator/context/SearchContext.as::_filtering
    private _filtering: string;

    // AS3: .../src/com/sulake/habbo/navigator/context/SearchContext.as::get filtering()
    get filtering(): string
    {
        return this._filtering;
    }

    // AS3: .../src/com/sulake/habbo/navigator/context/SearchContext.as::toString()
    toString(): string
    {
        return `${this._searchCode} : ${this._filtering}`;
    }
}
