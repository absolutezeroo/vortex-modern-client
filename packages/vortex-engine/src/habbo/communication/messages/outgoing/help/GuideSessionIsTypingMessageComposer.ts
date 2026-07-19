import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Sends typing indicator within a guide session.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/help/GuideSessionIsTypingMessageComposer.as
 */
export class GuideSessionIsTypingMessageComposer extends MessageComposer<ConstructorParameters<typeof GuideSessionIsTypingMessageComposer>>
{
    private _data: ConstructorParameters<typeof GuideSessionIsTypingMessageComposer>;

    constructor(isTyping: boolean)
    {
        super();
        this._data = [isTyping];
    }

    getMessageArray()
    {
        return this._data;
    }
}
