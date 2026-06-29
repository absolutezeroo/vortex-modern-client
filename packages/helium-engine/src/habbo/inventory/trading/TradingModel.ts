import type {ITradingModel} from './ITradingModel';
import type {TradingStateType} from './TradingState';
import {MAX_ITEMS_TO_TRADE, TradingState} from './TradingState';
import type {TradingUser} from './TradingUser';
import {createTradingUser} from './TradingUser';
import type {GroupItem} from '../items/GroupItem';

/**
 * Manages trading session data
 *
 * Based on AS3 com.sulake.habbo.inventory.trading.TradingModel (ENGINE only)
 */
export class TradingModel implements ITradingModel
{
	private _disposed: boolean = false;

	get disposed(): boolean
	{
		return this._disposed;
	}

	private _state: TradingStateType = TradingState.READY;

	get state(): TradingStateType
	{
		return this._state;
	}

	private _ownUser: TradingUser | null = null;

	get ownUser(): TradingUser | null
	{
		return this._ownUser;
	}

	private _otherUser: TradingUser | null = null;

	get otherUser(): TradingUser | null
	{
		return this._otherUser;
	}

	get isRunning(): boolean
	{
		return this._state !== TradingState.READY;
	}

	dispose(): void
	{
		if (this._disposed) return;

		this.close();
		this._disposed = true;
	}

	startTrading(
		ownUserId: number,
		ownUserName: string,
		ownUserCanTrade: boolean,
		otherUserId: number,
		otherUserName: string,
		otherUserCanTrade: boolean
	): void
	{
		this._ownUser = createTradingUser(ownUserId, ownUserName, ownUserCanTrade);
		this._otherUser = createTradingUser(otherUserId, otherUserName, otherUserCanTrade);
		this._state = TradingState.RUNNING;
	}

	close(): boolean
	{
		if (this._state === TradingState.READY)
		{
			return false;
		}

		this._ownUser = null;
		this._otherUser = null;
		this._state = TradingState.READY;

		return true;
	}

	setState(newState: TradingStateType): boolean
	{
		if (this._state === newState)
		{
			return false;
		}

		// Validate state transitions based on AS3 logic
		const valid = this.isValidTransition(this._state, newState);

		if (valid)
		{
			this._state = newState;

			return true;
		}

		return false;
	}

	updateItemLists(
		firstUserId: number,
		firstUserItems: Map<string, GroupItem>,
		firstUserNumItems: number,
		firstUserNumCredits: number,
		secondUserId: number,
		secondUserItems: Map<string, GroupItem>,
		secondUserNumItems: number,
		secondUserNumCredits: number
	): void
	{
		if (!this._ownUser || !this._otherUser) return;

		if (firstUserId === this._ownUser.userId)
		{
			this._ownUser.items = firstUserItems;
			this._ownUser.numItems = firstUserNumItems;
			this._ownUser.numCredits = firstUserNumCredits;
			this._otherUser.items = secondUserItems;
			this._otherUser.numItems = secondUserNumItems;
			this._otherUser.numCredits = secondUserNumCredits;
		}
		else
		{
			this._ownUser.items = secondUserItems;
			this._ownUser.numItems = secondUserNumItems;
			this._ownUser.numCredits = secondUserNumCredits;
			this._otherUser.items = firstUserItems;
			this._otherUser.numItems = firstUserNumItems;
			this._otherUser.numCredits = firstUserNumCredits;
		}

		// Reset accept status when items change
		this._ownUser.accepts = false;
		this._otherUser.accepts = false;
	}

	setUserAccepts(userId: number, accepts: boolean): void
	{
		if (this._ownUser?.userId === userId)
		{
			this._ownUser.accepts = accepts;
		}
		else if (this._otherUser?.userId === userId)
		{
			this._otherUser.accepts = accepts;
		}
	}

	getOwnItemIdsInTrade(): number[]
	{
		const ids: number[] = [];

		if (!this._ownUser?.items) return ids;

		for (const groupItem of this._ownUser.items.values())
		{
			const count = groupItem.getTotalCount();

			for (let i = 0; i < count; i++)
			{
				const item = groupItem.getAt(i);

				if (item)
				{
					ids.push(item.ref);
				}
			}
		}

		return ids;
	}

	canAddMoreItems(): boolean
	{
		if (this._ownUser?.accepts)
		{
			return false;
		}

		if (!this._ownUser?.items)
		{
			return false;
		}

		return this._ownUser.items.size < MAX_ITEMS_TO_TRADE;
	}

	hasItemType(itemKey: string): boolean
	{
		return this._ownUser?.items.has(itemKey) ?? false;
	}

	private isValidTransition(from: TradingStateType, to: TradingStateType): boolean
	{
		switch (from)
		{
			case TradingState.READY:
				return to === TradingState.RUNNING || to === TradingState.COMPLETED;

			case TradingState.RUNNING:
				return to === TradingState.COUNTDOWN || to === TradingState.CANCELLED;

			case TradingState.COUNTDOWN:
				return to === TradingState.CONFIRMING || to === TradingState.CANCELLED || to === TradingState.RUNNING;

			case TradingState.CONFIRMING:
				return to === TradingState.CONFIRMED || to === TradingState.COMPLETED || to === TradingState.CANCELLED;

			case TradingState.CONFIRMED:
				return to === TradingState.COMPLETED || to === TradingState.CANCELLED;

			case TradingState.COMPLETED:
				return to === TradingState.READY;

			case TradingState.CANCELLED:
				return to === TradingState.READY || to === TradingState.RUNNING;

			default:
				return false;
		}
	}
}
