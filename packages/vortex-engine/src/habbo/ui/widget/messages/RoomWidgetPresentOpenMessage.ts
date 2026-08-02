import {RoomWidgetMessage} from './RoomWidgetMessage';

/**
 * RoomWidgetPresentOpenMessage
 *
 * Asks the server to open a gift. The handler ignores it unless the object id matches the
 * present it last opened a card for, so a stale dialog cannot open somebody else's box.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/messages/RoomWidgetPresentOpenMessage.as
 */
export class RoomWidgetPresentOpenMessage extends RoomWidgetMessage
{
    /** The identifier is obfuscated in every tree (`_SafeStr_11709`); only the value is recovered, and this name is derived from it. */
    // AS3: .../messages/RoomWidgetPresentOpenMessage.as::_SafeStr_11709
    public static readonly OPEN_PRESENT: string = 'RWPOM_OPEN_PRESENT';

    /** AS3 takes the type as an argument rather than hard-coding it, and every caller passes `OPEN_PRESENT`. */
    // AS3: .../messages/RoomWidgetPresentOpenMessage.as::RoomWidgetPresentOpenMessage()
    constructor(type: string, objectId: number)
    {
        super(type);

        this._objectId = objectId;
    }

    // AS3: .../messages/RoomWidgetPresentOpenMessage.as::_SafeStr_4841
    private _objectId: number;

    // AS3: .../messages/RoomWidgetPresentOpenMessage.as::get objectId()
    public get objectId(): number
    {
        return this._objectId;
    }
}
