import type {ITradingModel} from './ITradingModel';
import type {TradingStateType} from './TradingState';
import {MAX_ITEMS_TO_TRADE, TradingState} from './TradingState';
import type {ITradingUser} from './TradingUser';
import {createTradingUser} from './TradingUser';
import type {GroupItem} from '../items/GroupItem';
import type {IConnection} from '@core/communication/connection/IConnection';
import {CloseTradingComposer} from '../../communication/messages/outgoing/inventory/CloseTradingComposer';
import type {IStuffData} from '@habbo/room/object/data/IStuffData';
import {StringArrayStuffData} from '@habbo/room/object/data/StringArrayStuffData';
import {FurnitureCategory} from '../enum';

/**
 * Manages trading session data
 *
 * Based on AS3 com.sulake.habbo.inventory.trading.TradingModel (ENGINE only)
 */
export class TradingModel implements ITradingModel
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/trading/TradingModel.as::_communication
    private _connection: IConnection | null;

    constructor(connection: IConnection | null = null)
    {
        this._connection = connection;
    }

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

    private _ownUser: ITradingUser | null = null;

    get ownUser(): ITradingUser | null
    {
        return this._ownUser;
    }

    private _otherUser: ITradingUser | null = null;

    get otherUser(): ITradingUser | null
    {
        return this._otherUser;
    }

    get isRunning(): boolean
    {
        return this._state !== TradingState.READY;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/trading/TradingModel.as::dispose()
    // AS3 does NOT call close() here - it only disposes the trading/name-scam-warning
    // views (not ported - this class is engine-only) and nulls its references. It
    // deliberately never sends a network cancel from dispose().
    dispose(): void
    {
        if(this._disposed) return;

        this._connection = null;
        this._ownUser = null;
        this._otherUser = null;
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

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/trading/TradingModel.as::close()
    // TODO(AS3): AS3 also calls inventory.toggleInventorySubPage("empty") here and hides/
    // un-minimizes the trading/name-scam-warning views - left to the caller (no Trading
    // UI window exists in this port yet to own that call), and there is currently no
    // caller of close() at all (matches AS3's own view classes, not yet ported, being
    // the only callers) - this fixes the method's own body to be ready for one.
    close(): boolean
    {
        if(!this.isRunning)
        {
            return false;
        }

        if(this._state !== TradingState.READY && this._state !== TradingState.COMPLETED)
        {
            this.requestCancelTrading();
            this._state = TradingState.CANCELLED;
        }

        this._state = TradingState.READY;
        this._ownUser = null;
        this._otherUser = null;

        return true;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/trading/TradingModel.as::requestCancelTrading()
    // AS3 also guards this with `!isConfirmingWeb3Trade()` (requires NFT/silver-fee
    // tracking not ported in this model) - since web3 trading state can never be true
    // here, the guard degenerates to always-true, so the composer always sends.
    private requestCancelTrading(): void
    {
        this._connection?.send(new CloseTradingComposer());
    }

    setState(newState: TradingStateType): boolean
    {
        if(this._state === newState)
        {
            return false;
        }

        // Validate state transitions based on AS3 logic
        const valid = this.isValidTransition(this._state, newState);

        if(valid)
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
        if(!this._ownUser || !this._otherUser) return;

        if(firstUserId === this._ownUser.userId)
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
        if(this._ownUser?.userId === userId)
        {
            this._ownUser.accepts = accepts;
        }
        else if(this._otherUser?.userId === userId)
        {
            this._otherUser.accepts = accepts;
        }
    }

    getOwnItemIdsInTrade(): number[]
    {
        const ids: number[] = [];

        if(!this._ownUser?.items) return ids;

        for(const groupItem of this._ownUser.items.values())
        {
            const count = groupItem.getTotalCount();

            for(let i = 0; i < count; i++)
            {
                const item = groupItem.getAt(i);

                if(item)
                {
                    ids.push(item.ref);
                }
            }
        }

        return ids;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/trading/TradingModel.as::canAddItemToTrade()
    // Past MAX_ITEMS_TO_TRADE (9) groups, AS3 still allows adding to an EXISTING group of
    // the same stackable item (matched by a category-specific key) rather than rejecting
    // outright - the port previously only checked the group count.
    canAddMoreItems(isWallItem: boolean, classId: number, category: number, stackable: boolean, stuffData: IStuffData | null): boolean
    {
        if(this._ownUser?.accepts)
        {
            return false;
        }

        if(!this._ownUser?.items)
        {
            return false;
        }

        if(this._ownUser.items.size < MAX_ITEMS_TO_TRADE)
        {
            return true;
        }

        if(!stackable)
        {
            return false;
        }

        return this._ownUser.items.has(TradingModel.buildItemKey(isWallItem, classId, category, stuffData));
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/trading/TradingModel.as::canAddItemToTrade()
    // The category-specific grouping key used above and by getGuildFurniType().
    private static buildItemKey(isWallItem: boolean, classId: number, category: number, stuffData: IStuffData | null): string
    {
        if(category === FurnitureCategory.POSTER)
        {
            return `${classId}poster${stuffData?.getLegacyString() ?? ''}`;
        }

        if(category === FurnitureCategory.GUILD_FURNI)
        {
            return TradingModel.getGuildFurniType(classId, stuffData);
        }

        return (isWallItem ? 'I' : 'S') + classId;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/trading/TradingModel.as::getGuildFurniType()
    static getGuildFurniType(classId: number, stuffData: IStuffData | null): string
    {
        let key = classId.toString();

        if(!(stuffData instanceof StringArrayStuffData))
        {
            return key;
        }

        for(let i = 1; i < 5; i++)
        {
            key += ',' + stuffData.getValue(i);
        }

        return key;
    }

    hasItemType(itemKey: string): boolean
    {
        return this._ownUser?.items.has(itemKey) ?? false;
    }

    private isValidTransition(from: TradingStateType, to: TradingStateType): boolean
    {
        switch(from)
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
