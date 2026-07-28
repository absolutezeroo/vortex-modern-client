/**
 * RoomWidgetStickieSendUpdateMessage
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/messages/RoomWidgetStickieSendUpdateMessage.as
 *
 * Sent by StickieFurniWidget back to its handler to save or delete a note. One class covers both:
 * the delete form leaves `text` and `colorHex` at their defaults.
 */
import {RoomWidgetMessage} from './RoomWidgetMessage';

export class RoomWidgetStickieSendUpdateMessage extends RoomWidgetMessage
{
    /**
     * AS3: RoomWidgetStickieSendUpdateMessage.as::_SafeStr_10719
     *
     * Obfuscated in every available tree; the member name is DERIVED from its value.
     */
    public static readonly STICKIE_SEND_UPDATE: string = 'RWSUM_STICKIE_SEND_UPDATE';

    /**
     * AS3: RoomWidgetStickieSendUpdateMessage.as::_SafeStr_11078
     *
     * Obfuscated in every available tree; the member name is DERIVED from its value.
     */
    public static readonly STICKIE_SEND_DELETE: string = 'RWSUM_STICKIE_SEND_DELETE';

    // AS3: RoomWidgetStickieSendUpdateMessage.as::_SafeStr_4841
    private _objectId: number;

    // AS3: RoomWidgetStickieSendUpdateMessage.as::_text
    private _text: string;

    // AS3: RoomWidgetStickieSendUpdateMessage.as::_SafeStr_5209
    private _colorHex: string;

    // AS3: RoomWidgetStickieSendUpdateMessage.as::RoomWidgetStickieSendUpdateMessage()
    constructor(type: string, objectId: number, text: string = '', colorHex: string = '')
    {
        super(type);

        this._objectId = objectId;
        this._text = text;
        this._colorHex = colorHex;
    }

    // AS3: RoomWidgetStickieSendUpdateMessage.as::get objectId()
    public get objectId(): number
    {
        return this._objectId;
    }

    // AS3: RoomWidgetStickieSendUpdateMessage.as::get text()
    public get text(): string
    {
        return this._text;
    }

    // AS3: RoomWidgetStickieSendUpdateMessage.as::get colorHex()
    public get colorHex(): string
    {
        return this._colorHex;
    }
}
