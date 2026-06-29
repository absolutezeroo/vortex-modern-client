import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Data class for room data within moderator room info.
 * Contains the room name, description, and tags.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/moderation/class_1769.as
 */
export class RoomDataData
{
	constructor(wrapper: IMessageDataWrapper)
	{
		this._exists = wrapper.readBoolean();

		if (!this._exists)
		{
			return;
		}

		this._name = wrapper.readString();
		this._desc = wrapper.readString();

		const tagCount = wrapper.readInt();

		for (let i = 0; i < tagCount; i++)
		{
			this._tags.push(wrapper.readString());
		}
	}

	private _exists: boolean;

	get exists(): boolean
	{
		return this._exists;
	}

	private _name: string = '';

	get name(): string
	{
		return this._name;
	}

	private _desc: string = '';

	get desc(): string
	{
		return this._desc;
	}

	private _tags: string[] = [];

	get tags(): string[]
	{
		return this._tags;
	}
}
