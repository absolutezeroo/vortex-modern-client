import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Notify that user stopped typing
 *
 * Based on AS3: com.sulake.habbo.communication.messages.outgoing.room.chat.CancelTypingMessageComposer
 */
export class CancelTypingMessageComposer extends MessageComposer<[]>
{
    constructor()
    {
        super();
    }

    getMessageArray(): []
    {
        return [];
    }
}
