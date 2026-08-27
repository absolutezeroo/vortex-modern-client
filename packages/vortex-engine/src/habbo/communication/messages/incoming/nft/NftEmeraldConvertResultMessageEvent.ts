import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    NftEmeraldConvertResultMessageEventParser
} from '../../parser/nft/NftEmeraldConvertResultMessageEventParser';

/**
 * One of the few message classes the primary tree leaves unobfuscated — it is
 * `unknowns/_SafePkg_3435/NftEmeraldConvertResultMessageEvent.as` there, under its real name.
 *
 * @see sources/win63_version/habbo/communication/messages/incoming/nft/NftEmeraldConvertResultMessageEvent.as
 */
export class NftEmeraldConvertResultMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, NftEmeraldConvertResultMessageEventParser);
    }
}
