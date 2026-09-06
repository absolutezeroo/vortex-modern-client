import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    CitizenshipQuestPromoEnabledMessageEventParser
} from '../../parser/quest/CitizenshipQuestPromoEnabledMessageEventParser';

/**
 * Header 1584 — "show the citizenship VIP-quests promo".
 *
 * Payload-less; `CitizenshipVipQuestsPromoExtension` is the only subscriber and answers it by
 * building its strip. **Name derived** from that subscriber's handler; see the parser for why no
 * tree carries a readable one.
 *
 * @see sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2037/_SafeCls_3105.as
 */
export class CitizenshipQuestPromoEnabledMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, CitizenshipQuestPromoEnabledMessageEventParser);
    }
}
