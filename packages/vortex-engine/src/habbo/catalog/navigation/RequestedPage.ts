/**
 * Tracks a catalog page open request made before the navigator/index was ready.
 *
 * @see sources/win63_version/habbo/catalog/navigation/RequestedPage.as
 */
export class RequestedPage
{
    // AS3: sources/win63_version/habbo/catalog/navigation/RequestedPage.as::REQUEST_TYPE_NONE
    static readonly REQUEST_TYPE_NONE: number = 0;
    // AS3: sources/win63_version/habbo/catalog/navigation/RequestedPage.as::REQUEST_TYPE_ID
    static readonly REQUEST_TYPE_ID: number = 1;
    // AS3: sources/win63_version/habbo/catalog/navigation/RequestedPage.as::REQUEST_TYPE_NAME
    static readonly REQUEST_TYPE_NAME: number = 2;

    private _requestType: number = RequestedPage.REQUEST_TYPE_NONE;

    private _requestId: number = 0;

    private _requestedOfferId: number = 0;

    // AS3: sources/win63_version/habbo/catalog/navigation/RequestedPage.as::_requestName
    private _requestName: string = '';

    // AS3: sources/win63_version/habbo/catalog/navigation/RequestedPage.as::set requestById()
    set requestById(id: number)
    {
        this._requestType = RequestedPage.REQUEST_TYPE_ID;
        this._requestId = id;
    }

    // AS3: sources/win63_version/habbo/catalog/navigation/RequestedPage.as::set requestByName()
    set requestByName(name: string)
    {
        this._requestType = RequestedPage.REQUEST_TYPE_NAME;
        this._requestName = name;
    }

    // AS3: sources/win63_version/habbo/catalog/navigation/RequestedPage.as::resetRequest()
    resetRequest(): void
    {
        this._requestType = RequestedPage.REQUEST_TYPE_NONE;
        this._requestedOfferId = -1;
    }

    // AS3: sources/win63_version/habbo/catalog/navigation/RequestedPage.as::get requestType()
    get requestType(): number
    {
        return this._requestType;
    }

    // AS3: sources/win63_version/habbo/catalog/navigation/RequestedPage.as::get requestId()
    get requestId(): number
    {
        return this._requestId;
    }

    // AS3: sources/win63_version/habbo/catalog/navigation/RequestedPage.as::get requestedOfferId()
    get requestedOfferId(): number
    {
        return this._requestedOfferId;
    }

    // AS3: sources/win63_version/habbo/catalog/navigation/RequestedPage.as::set requestedOfferId()
    set requestedOfferId(offerId: number)
    {
        this._requestedOfferId = offerId;
    }

    // AS3: sources/win63_version/habbo/catalog/navigation/RequestedPage.as::get requestName()
    get requestName(): string
    {
        return this._requestName;
    }
}
