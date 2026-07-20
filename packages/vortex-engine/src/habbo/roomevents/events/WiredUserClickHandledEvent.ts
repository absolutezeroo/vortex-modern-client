/**
 * Dispatched by WiredEnvironment when the server acknowledges a user-click that was
 * routed to a "click user" wired trigger, telling the client which selection index was
 * handled and whether the wired menu should open.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/events/WiredUserClickHandledEvent.as
 */
export class WiredUserClickHandledEvent
{
    // AS3: WiredUserClickHandledEvent.as::WIRED_USER_CLICK_HANDLED
    static readonly WIRED_USER_CLICK_HANDLED: string = 'WIRED_USER_CLICK_HANDLED';

    private _type: string;

    private _index: number;

    private _openMenu: boolean;

    // AS3: WiredUserClickHandledEvent.as::WiredUserClickHandledEvent()
    constructor(type: string, index: number, openMenu: boolean)
    {
        this._type = type;
        this._index = index;
        this._openMenu = openMenu;
    }

    // AS3: WiredUserClickHandledEvent.as::get type()
    get type(): string
    {
        return this._type;
    }

    // AS3: WiredUserClickHandledEvent.as::get index()
    get index(): number
    {
        return this._index;
    }

    // AS3: WiredUserClickHandledEvent.as::get openMenu()
    get openMenu(): boolean
    {
        return this._openMenu;
    }
}
