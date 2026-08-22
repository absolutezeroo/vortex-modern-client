import {CatalogEvent} from './CatalogEvent';

/**
 * A room avatar was clicked while the catalog was listening.
 *
 * Raised from `HabboCatalog.onObjectSelected()` for category 100 (user) selections only; the
 * catalog itself does nothing with it — it is the hook a "buy a gift for this user" flow attaches
 * to, and AS3 ships it unconsumed for the same reason.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/event/CatalogUserEvent.as
 */
export class CatalogUserEvent extends CatalogEvent
{
    // AS3: .../src/com/sulake/habbo/catalog/event/CatalogUserEvent.as::_SafeStr_5971
    private _userId: number;

    // AS3: .../src/com/sulake/habbo/catalog/event/CatalogUserEvent.as::_userName
    private _userName: string;

    // AS3: .../src/com/sulake/habbo/catalog/event/CatalogUserEvent.as::CatalogUserEvent()
    // AS3's trailing `bubbles`/`cancelable` params are dropped: they exist to feed
    // `flash.events.Event`, and this port's bus is a plain EventEmitter with neither notion.
    constructor(type: string, userId: number, userName: string)
    {
        super(type);

        this._userId = userId;
        this._userName = userName;
    }

    // AS3: .../src/com/sulake/habbo/catalog/event/CatalogUserEvent.as::get userId()
    get userId(): number
    {
        return this._userId;
    }

    // AS3: .../src/com/sulake/habbo/catalog/event/CatalogUserEvent.as::get userName()
    get userName(): string
    {
        return this._userName;
    }
}
