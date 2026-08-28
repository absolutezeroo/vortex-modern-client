import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {CompetitionEntryMessageParser} from '../../parser/quest/CompetitionEntryMessageParser';

/**
 * Event fired when competition entry prizes are received.
 *
 * @see sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1976/_SafeCls_2772.as
 */
export class CompetitionEntryMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: MessageEventCallback)
    {
        super(callBack, CompetitionEntryMessageParser);
    }
}
