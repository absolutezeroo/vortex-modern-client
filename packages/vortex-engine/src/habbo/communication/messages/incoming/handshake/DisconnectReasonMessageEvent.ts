import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {DisconnectReasonMessageParser} from '../../parser/handshake/DisconnectReasonMessageParser';

/**
 * Event handler for Disconnect reason message
 * Message ID: 4000
 *
 * @see source_as_win63/habbo/communication/messages/incoming/handshake/DisconnectReasonEvent.as
 */
export class DisconnectReasonMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, DisconnectReasonMessageParser);
    }

    /**
     * Maps a disconnect reason code to the localization key describing it.
     *
     * The AS3 class is `_SafeCls_1707`, identified as this event by its parser
     * (`_SafeCls_3893`, the one exposing `reason`) — it declares the whole reason-code table
     * plus this resolver. Only the resolver is ported: the constants have no other reader
     * here, and `getReasonName()` (which reflects over them) has no counterpart.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1708/_SafeCls_1707.as::resolveDisconnectedReasonLocalizationKey()
    static resolveDisconnectedReasonLocalizationKey(reason: number): string
    {
        switch(reason)
        {
            case -2:
                return '${disconnected.maintenance}';
            case 0:
                return '${disconnected.logged_out}';
            case 1:
                return '${disconnected.just_banned}';
            case 10:
                return '${disconnected.still_banned}';
            case 2:
            case 13:
            case 11:
            case 18:
                return '${disconnected.concurrent_login}';
            case 12:
            case 19:
                return '${disconnected.hotel_closed}';
            case 20:
                return '${disconnected.incorrect_password}';
            case 112:
                return '${disconnected.idle}';
            case 122:
                return '${disconnected.incompatible_client_version}';
            default:
                return '${disconnected.generic}';
        }
    }
}
