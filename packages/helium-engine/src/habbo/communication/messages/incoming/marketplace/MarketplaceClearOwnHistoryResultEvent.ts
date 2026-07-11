import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {MarketplaceClearOwnHistoryResultEventParser} from '../../parser/marketplace/MarketplaceClearOwnHistoryResultEventParser';

/**
 * TS-derived name: newer feature absent from win63_version/flash_version
 * entirely (no readable-name counterpart in any secondary/tertiary tree).
 *
 * @see sources/win63_2026_crypted_version/src/unknowns/_SafePkg_1899/_SafeCls_2225.as
 */
export class MarketplaceClearOwnHistoryResultEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, MarketplaceClearOwnHistoryResultEventParser);
    }
}
