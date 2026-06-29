import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Notify that user started typing
 *
 * Based on AS3: com.sulake.habbo.communication.messages.outgoing.room.chat.StartTypingMessageComposer
 */
export class StartTypingMessageComposer extends MessageComposer<[]>
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
