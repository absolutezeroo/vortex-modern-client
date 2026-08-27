import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    WiredTradeTransactionNotificationMessageParser
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/trade/WiredTradeTransactionNotificationMessageParser';

/**
 * Incoming: a wired trade went wrong (WIN63 header 655). Subscribed by the notification handler,
 * which shows it as a toast with the `chests_icon_trading_error` icon.
 *
 * Name DERIVED alongside its parser, from the handler that consumes it
 * (`notifications/_SafeCls_1951.as::onWiredTradeTransactionNotification()`); the AS3 event class is
 * obfuscated. It stays beside its sibling trade events here, whose parsers likewise live one
 * directory down in `wiredtrading/trade/`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3111/_SafeCls_3977.as
 */
export class WiredTradeTransactionNotificationMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, WiredTradeTransactionNotificationMessageParser);
    }
}
