import type {IRoomSession} from '@habbo/session/IRoomSession';
import type {IInventoryModel} from '../IInventoryModel';
import type {Bot} from './Bot';

/**
 * IBotsModel — the bots-inventory category model.
 *
 * AS3 has no `IBotsModel`: `BotsModel` implements `IInventoryModel` and `HabboInventory` hands out
 * the concrete class (`get botsModel():BotsModel`). This interface is the port's equivalent of that
 * concrete type for consumers outside the package, and extends the same shared contract.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/bots/BotsModel.as
 */
export interface IBotsModel extends IInventoryModel
{
    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsModel.as::get disposed()
    readonly disposed: boolean;

    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsModel.as::get items()
    readonly items: Map<number, Bot>;

    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsModel.as::get roomSession()
    readonly roomSession: IRoomSession | null;

    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsModel.as::isListInitialized()
    isListInitialized(): boolean;

    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsModel.as::setListInitialized()
    setListInitialized(): void;

    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsModel.as::requestInventory()
    requestInventory(): void;

    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsModel.as::addItem()
    addItem(data: Bot): void;

    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsModel.as::updateItems()
    updateItems(items: Map<number, Bot>): void;

    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsModel.as::removeItem()
    removeItem(id: number): void;

    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsModel.as::getItemById()
    getItemById(id: number): Bot | null;

    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsModel.as::placeItemToRoom()
    placeItemToRoom(id: number, skipServer?: boolean): boolean;

    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsModel.as::resetUnseenItems()
    resetUnseenItems(): void;

    // AS3: .../src/com/sulake/habbo/inventory/bots/BotsModel.as::isUnseen()
    isUnseen(id: number): boolean;
}
