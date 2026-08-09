import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {FavoriteMembershipUpdateMessageEventParser} from '../../../parser/room/engine/FavoriteMembershipUpdateMessageEventParser';

/**
 * A room occupant's favourite group changed - the badge shown beside their name in the infostand.
 *
 * Header 1259, from WIN63's own registry (`habbo/communication/_SafeCls_2046.as:1215`, where the
 * class is `_SafeCls_3475`) and corroborated by the emulator, which implements the composer.
 *
 * @see sources/win63_version/habbo/communication/messages/incoming/room/engine/FavoriteMembershipUpdateMessageEvent.as
 */
export class FavoriteMembershipUpdateMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, FavoriteMembershipUpdateMessageEventParser);
    }
}
