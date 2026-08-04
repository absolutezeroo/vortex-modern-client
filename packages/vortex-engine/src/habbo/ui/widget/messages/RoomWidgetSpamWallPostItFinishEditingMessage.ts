import {RoomWidgetMessage} from './RoomWidgetMessage';

/**
 * RoomWidgetSpamWallPostItFinishEditingMessage
 *
 * The note as the player left it, on its way from the widget to the handler that puts it
 * on the wire.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/messages/RoomWidgetSpamWallPostItFinishEditingMessage.as
 */
export class RoomWidgetSpamWallPostItFinishEditingMessage extends RoomWidgetMessage
{
    // AS3: RoomWidgetSpamWallPostItFinishEditingMessage.as::SEND_POSTIT_DATA
    public static readonly SEND_POSTIT_DATA: string = 'RWSWPFEE_SEND_POSTIT_DATA';

    // AS3: RoomWidgetSpamWallPostItFinishEditingMessage.as::_SafeStr_4841
    private _objectId: number;

    // AS3: RoomWidgetSpamWallPostItFinishEditingMessage.as::_SafeStr_5184
    private _location: string;

    // AS3: RoomWidgetSpamWallPostItFinishEditingMessage.as::_text
    private _text: string;

    // AS3: RoomWidgetSpamWallPostItFinishEditingMessage.as::_SafeStr_5209
    private _colorHex: string;

    // AS3: RoomWidgetSpamWallPostItFinishEditingMessage.as::RoomWidgetSpamWallPostItFinishEditingMessage()
    constructor(type: string, objectId: number, location: string, text: string, colorHex: string)
    {
        super(type);

        this._objectId = objectId;
        this._location = location;
        this._text = text;
        this._colorHex = colorHex;
    }

    // AS3: RoomWidgetSpamWallPostItFinishEditingMessage.as::get location()
    get location(): string
    {
        return this._location;
    }

    // AS3: RoomWidgetSpamWallPostItFinishEditingMessage.as::get objectId()
    get objectId(): number
    {
        return this._objectId;
    }

    // AS3: RoomWidgetSpamWallPostItFinishEditingMessage.as::get text()
    get text(): string
    {
        return this._text;
    }

    // AS3: RoomWidgetSpamWallPostItFinishEditingMessage.as::get colorHex()
    get colorHex(): string
    {
        return this._colorHex;
    }
}
