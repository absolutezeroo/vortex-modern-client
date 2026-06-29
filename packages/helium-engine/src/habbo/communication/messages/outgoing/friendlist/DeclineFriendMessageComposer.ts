import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Declines one or more friend requests.
 * If no request IDs are given, declines all pending requests.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/friendlist/DeclineFriendMessageComposer.as
 */
export class DeclineFriendMessageComposer implements IMessageComposer<unknown[]>
{
	private _declineAll: boolean;
	private _requestIds: number[];

	constructor(declineAll: boolean, ...requestIds: number[])
	{
		this._declineAll = declineAll;
		this._requestIds = requestIds;
	}

	get disposed(): boolean
	{
		return false;
	}

	getMessageArray(): unknown[]
	{
		const result: unknown[] = [];

		if (this._declineAll)
		{
			result.push(true);
			result.push(0);
		}
		else
		{
			result.push(false);
			result.push(this._requestIds.length);

			for (let i = 0; i < this._requestIds.length; i++)
			{
				result.push(this._requestIds[i]);
			}
		}

		return result;
	}

	dispose(): void
	{
		return;
	}
}
