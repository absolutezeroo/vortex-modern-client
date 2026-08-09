/**
 * GuildFurniContextMenuInfoMessageEvent
 *
 * The server's answer to `GetGuildFurniContextMenuInfoMessageComposer` — header 3220 in WIN63's
 * own registry (`_SafeStr_4546[3220] = _SafeCls_2773`), corroborated by the emulator's
 * `GuildFurniContextMenuInfoMessageComposer`.
 *
 * Class name DERIVED — the AS3 event is `_SafePkg_2437::_SafeCls_2773`, obfuscated in every tree.
 *
 * @see sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2437/_SafeCls_2773.as
 */
import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    GuildFurniContextMenuInfoParser
} from '@habbo/communication/messages/parser/room/furniture/GuildFurniContextMenuInfoParser';

export class GuildFurniContextMenuInfoMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, GuildFurniContextMenuInfoParser);
    }
}
