import type {IDisposable} from '@core/runtime/IDisposable';
import type {TradingStateType} from './TradingState';
import type {ITradingUser} from './TradingUser';
import type {GroupItem} from '../items/GroupItem';
import type {IStuffData} from '@habbo/room/object/data/IStuffData';

/**
 * Interface for TradingModel
 *
 * Based on AS3 com.sulake.habbo.inventory.trading.TradingModel (ENGINE only)
 */
export interface ITradingModel extends IDisposable
{
    readonly isRunning: boolean;
    readonly state: TradingStateType;
    readonly ownUser: ITradingUser | null;
    readonly otherUser: ITradingUser | null;

    /**
	 * Start a trading session
	 */
    startTrading(
        ownUserId: number,
        ownUserName: string,
        ownUserCanTrade: boolean,
        otherUserId: number,
        otherUserName: string,
        otherUserCanTrade: boolean
    ): void;

    /**
	 * Close trading session
	 * Returns true if was running
	 */
    close(): boolean;

    /**
	 * Update trading state
	 * Returns true if state changed
	 */
    setState(newState: TradingStateType): boolean;

    /**
	 * Update item lists for both users
	 */
    updateItemLists(
        firstUserId: number,
        firstUserItems: Map<string, GroupItem>,
        firstUserNumItems: number,
        firstUserNumCredits: number,
        secondUserId: number,
        secondUserItems: Map<string, GroupItem>,
        secondUserNumItems: number,
        secondUserNumCredits: number
    ): void;

    /**
	 * Set user accept status
	 */
    setUserAccepts(userId: number, accepts: boolean): void;

    /**
	 * Get all item reference IDs that own user has in trade
	 */
    getOwnItemIdsInTrade(): number[];

    /**
	 * Check if can add more items to trade
	 *
	 * Past MAX_ITEMS_TO_TRADE groups, an item can still be added if it stacks onto an
	 * existing group of the same category-specific key (see TradingModel's own trace
	 * comments for the exact key rules).
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/trading/TradingModel.as::canAddItemToTrade()
    canAddMoreItems(isWallItem: boolean, classId: number, category: number, stackable: boolean, stuffData: IStuffData | null): boolean;

    /**
	 * Check if item type already exists in own items
	 */
    hasItemType(itemKey: string): boolean;
}
