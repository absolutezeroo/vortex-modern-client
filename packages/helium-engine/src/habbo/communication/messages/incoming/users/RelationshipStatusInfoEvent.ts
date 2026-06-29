import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import type {RelationshipStatusInfo} from './RelationshipStatusInfo';
import {RelationshipStatusInfoMessageParser} from '../../parser/users/RelationshipStatusInfoMessageParser';

/**
 * RelationshipStatusInfoEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.users.RelationshipStatusInfoEvent
 */
export class RelationshipStatusInfoEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, RelationshipStatusInfoMessageParser);
	}

	get userId(): number
	{
		return (this._parser as RelationshipStatusInfoMessageParser).userId;
	}

	get relationshipStatusMap(): Map<number, RelationshipStatusInfo>
	{
		return (this._parser as RelationshipStatusInfoMessageParser).relationshipStatusMap;
	}
}
