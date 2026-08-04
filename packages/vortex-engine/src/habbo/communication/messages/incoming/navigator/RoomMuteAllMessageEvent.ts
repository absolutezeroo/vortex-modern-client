import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {RoomMuteAllMessageEventParser} from '../../parser/navigator/RoomMuteAllMessageEventParser';

/**
 * RoomMuteAllMessageEvent (header 1172)
 *
 * Everyone in the room was muted, or unmuted. The navigator writes the flag onto the
 * entered room and redraws the room-info buttons so the mute-all button flips.
 *
 * **Name DERIVED**, from the handler it feeds (`onMuteAllEvent`) and its single
 * `allMuted` field: the AS3 class is obfuscated in every tree and the emulator has no
 * constant for header 1172 at all.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1710/_SafeCls_3486.as
 */
export class RoomMuteAllMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, RoomMuteAllMessageEventParser);
    }
}
