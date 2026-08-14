import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {CompetitionStatusMessageParser} from '@habbo/communication/messages/parser/camera/CompetitionStatusMessageParser';

/**
 * The outcome of entering a photo into the competition.
 *
 * AS3: sources/win63_version/habbo/communication/messages/incoming/camera/CompetitionStatusMessageEvent.as
 * (`_SafePkg_3032/_SafeCls_3602` in the primary tree; header 2622 from WIN63's registry)
 */
export class CompetitionStatusMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, CompetitionStatusMessageParser);
    }
}
