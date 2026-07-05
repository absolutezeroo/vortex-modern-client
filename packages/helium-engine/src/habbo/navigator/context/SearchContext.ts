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

    private _searchCode: string;

    get searchCode(): string
    {
        return this._searchCode;
    }

    private _filtering: string;

    get filtering(): string
    {
        return this._filtering;
    }

    toString(): string
    {
        return `${this._searchCode} : ${this._filtering}`;
    }
}
