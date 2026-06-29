import type {IMessageDataWrapper} from '@core/communication';

/**
 * Popular room tag
 *
 * Based on AS3 com.sulake.habbo.communication.messages.incoming.navigator.class_1767
 */
export class RoomTagData
{
	constructor(wrapper: IMessageDataWrapper)
	{
		this._tagName = wrapper.readString();
		this._userCount = wrapper.readInt();
	}

	private _tagName: string = '';

	get tagName(): string
	{
		return this._tagName;
	}

	private _userCount: number = 0;

	get userCount(): number
	{
		return this._userCount;
	}
}
