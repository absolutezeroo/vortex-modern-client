/**
 * A Habbo Mall offer.
 *
 * Unlike `TargetedOffer` this never comes over the wire: the surrounding web page pushes it in
 * through the ExternalInterface bridge, which is why the constructor reads loosely-typed fields
 * off a plain object and parses two of them out of strings. Only the state reports go back to the
 * server, on `ShopTargetedOfferViewedComposer`.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/targetedoffers/data/HabboMallOffer.as
 */
export class HabboMallOffer
{
    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/data/HabboMallOffer.as::_SafeStr_9365 (name from `get targetedOfferId()`)
    private _targetedOfferId: number;

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/data/HabboMallOffer.as::_SafeStr_7608 (name from `get identifier()`)
    private _identifier: string;

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/data/HabboMallOffer.as::_SafeStr_5263 (name from `get title()`)
    private _title: string;

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/data/HabboMallOffer.as::_highlight
    private _highlight: string;

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/data/HabboMallOffer.as::_description
    private _description: string;

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/data/HabboMallOffer.as::_SafeStr_4899 (name from `get imageUrl()`)
    private _imageUrl: string;

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/data/HabboMallOffer.as::_smallImageUrl
    private _smallImageUrl: string;

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/data/HabboMallOffer.as::_SafeStr_7563 (name from `get trackingState()`)
    private _trackingState: number;

    /**
     * The field the AS3 reads for the title is `header`, not `title`, and the tracking state comes
     * in as `trackingStateCode` — both kept verbatim, since the names are the bridge's contract
     * with the page and renaming them here would simply read undefined.
     */
    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/data/HabboMallOffer.as::HabboMallOffer()
    constructor(source: Record<string, unknown>)
    {
        this._targetedOfferId = parseInt(String(source.targetedOfferId), 10);
        this._identifier = String(source.identifier ?? '');
        this._title = String(source.header ?? '');
        this._highlight = String(source.highlight ?? '');
        this._description = String(source.description ?? '');
        this._imageUrl = String(source.imageUrl ?? '');
        this._smallImageUrl = String(source.smallImageUrl ?? '');
        this._trackingState = parseInt(String(source.trackingStateCode), 10);
    }

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/data/HabboMallOffer.as::get targetedOfferId()
    get targetedOfferId(): number
    {
        return this._targetedOfferId;
    }

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/data/HabboMallOffer.as::get identifier()
    get identifier(): string
    {
        return this._identifier;
    }

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/data/HabboMallOffer.as::get title()
    get title(): string
    {
        return this._title;
    }

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/data/HabboMallOffer.as::get highlight()
    get highlight(): string
    {
        return this._highlight;
    }

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/data/HabboMallOffer.as::get description()
    get description(): string
    {
        return this._description;
    }

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/data/HabboMallOffer.as::get imageUrl()
    get imageUrl(): string
    {
        return this._imageUrl;
    }

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/data/HabboMallOffer.as::get smallImageUrl()
    get smallImageUrl(): string
    {
        return this._smallImageUrl;
    }

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/data/HabboMallOffer.as::get trackingState()
    get trackingState(): number
    {
        return this._trackingState;
    }
}
