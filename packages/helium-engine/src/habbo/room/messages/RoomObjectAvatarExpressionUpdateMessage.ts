/**
 * RoomObjectAvatarExpressionUpdateMessage
 *
 * Based on AS3: com.sulake.habbo.room.messages.RoomObjectAvatarExpressionUpdateMessage
 *
 * Update message for avatar expression (emotions).
 */
import {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';

export class RoomObjectAvatarExpressionUpdateMessage extends RoomObjectUpdateMessage
{
	constructor(expressionType: number)
	{
		super(null, null);
		this._expressionType = expressionType;
	}

	private _expressionType: number;

	get expressionType(): number
	{
		return this._expressionType;
	}
}
