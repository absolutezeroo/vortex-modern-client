/**
 * Tracks a catalog page open request made before the navigator/index was ready.
 *
 * @see sources/win63_version/habbo/catalog/navigation/RequestedPage.as
 */
export class RequestedPage
{
    static readonly REQUEST_TYPE_NONE: number = 0;
    static readonly REQUEST_TYPE_ID: number = 1;
    static readonly REQUEST_TYPE_NAME: number = 2;

    private _requestType: number = RequestedPage.REQUEST_TYPE_NONE;

    private _requestId: number = 0;

    private _requestedOfferId: number = 0;

    private _requestName: string = '';

    set requestById(id: number)
    {
        this._requestType = RequestedPage.REQUEST_TYPE_ID;
        this._requestId = id;
    }

    set requestByName(name: string)
    {
        this._requestType = RequestedPage.REQUEST_TYPE_NAME;
        this._requestName = name;
    }

    resetRequest(): void
    {
        this._requestType = RequestedPage.REQUEST_TYPE_NONE;
        this._requestedOfferId = -1;
    }

    get requestType(): number
    {
        return this._requestType;
    }

    get requestId(): number
    {
        return this._requestId;
    }

    get requestedOfferId(): number
    {
        return this._requestedOfferId;
    }

    set requestedOfferId(offerId: number)
    {
        this._requestedOfferId = offerId;
    }

    get requestName(): string
    {
        return this._requestName;
    }
}
