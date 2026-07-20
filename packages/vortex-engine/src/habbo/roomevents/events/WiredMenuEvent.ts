/**
 * Dispatched when the user's wired-menu button preference changes (whether the toolbar
 * wired-menu button is shown).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/events/WiredMenuEvent.as
 */
export class WiredMenuEvent
{
    // AS3: WiredMenuEvent.as::WIRED_MENU_BUTTON_PREFERENCE_CHANGED
    static readonly WIRED_MENU_BUTTON_PREFERENCE_CHANGED: string = 'WIRED_MENU_BUTTON_PREFERENCE_CHANGED';

    private _type: string;

    // AS3: WiredMenuEvent.as::WiredMenuEvent()
    constructor(type: string)
    {
        this._type = type;
    }

    // AS3: WiredMenuEvent.as::get type()
    get type(): string
    {
        return this._type;
    }
}
