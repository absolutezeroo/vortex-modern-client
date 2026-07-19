import type {IFurniModel} from './furni/IFurniModel';
import type {IBadgesModel} from './badges/IBadgesModel';
import type {IEffectsModel} from './effects/IEffectsModel';
import type {IPetsModel} from './pets/IPetsModel';
import type {IBotsModel} from './bots/IBotsModel';
import type {ITradingModel} from './trading/ITradingModel';
import type {IPurse} from './purse/IPurse';
import type {UnseenItemTracker} from './UnseenItemTracker';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IHabboCatalog} from '@habbo/catalog/IHabboCatalog';
import type {IFurnitureData} from '@habbo/session/furniture/IFurnitureData';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {InventoryMainView} from './InventoryMainView';
import type {IRoomSession} from '@habbo/session/IRoomSession';

/**
 * Inventory categories
 */
export const InventoryCategory = {
    FURNI: 'furni',
    RENTABLES: 'rentables',
    BADGES: 'badges',
    EFFECTS: 'effects',
    PETS: 'pets',
    BOTS: 'bots',
    TRADING: 'trading',
} as const;

export type InventoryCategoryType = typeof InventoryCategory[keyof typeof InventoryCategory];

/**
 * Interface for HabboInventory controller
 *
 * Based on AS3 com.sulake.habbo.inventory.HabboInventory (ENGINE only)
 */
export interface IHabboInventory
{
    readonly isInitialized: boolean;
    readonly currentCategory: InventoryCategoryType | null;

    // Models
    readonly furniModel: IFurniModel;
    readonly badgesModel: IBadgesModel;
    readonly effectsModel: IEffectsModel;
    readonly petsModel: IPetsModel;
    readonly botsModel: IBotsModel;
    readonly tradingModel: ITradingModel;

    // Purse & Tracking
    readonly purse: IPurse;
    readonly clubLevel: number;
    readonly unseenItemTracker: UnseenItemTracker;

    // Room session state
    hasRoomSession: boolean;

    // AS3: sources/win63_version/habbo/inventory/HabboInventory.as::get roomSession()
    readonly roomSession: IRoomSession | null;

    // AS3: sources/win63_version/habbo/inventory/HabboInventory.as::windowManager
    readonly windowManager: IHabboWindowManager | null;

    // AS3: sources/win63_version/habbo/inventory/HabboInventory.as::catalog
    readonly catalog: IHabboCatalog | null;

    // AS3: sources/win63_version/habbo/inventory/HabboInventory.as::view
    readonly view: InventoryMainView;

    // AS3: sources/win63_version/habbo/inventory/HabboInventory.as::get isVisible()
    readonly isVisible: boolean;

    // AS3: sources/win63_version/habbo/inventory/HabboInventory.as::get isMainViewActive()
    readonly isMainViewActive: boolean;

    // AS3: sources/win63_version/habbo/inventory/HabboInventory.as::get mergeRentFurni()
    readonly mergeRentFurni: boolean;

    // AS3: sources/win63_version/habbo/inventory/HabboInventory.as::get web3tradeEnabled()
    readonly web3tradeEnabled: boolean;

    // TS-only: exposed so InventoryMainView (a plain class, not a Component) can
    // read configuration without its own IContext.
    getBoolean(key: string): boolean;

    // TS-only: same rationale as getBoolean() above.
    getInteger(key: string, defaultValue: number): number;

    /**
	 * Initialize all models
	 */
    init(): void;

    /**
	 * Switch to a category
	 */
    switchCategory(category: InventoryCategoryType): void;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/HabboInventory.as::getFurnitureData()
    getFurnitureData(classId: number, type: string): IFurnitureData | null;

    // AS3: sources/win63_version/habbo/inventory/HabboInventory.as::getSubCategoryViewId()
    getSubCategoryViewId(): string | null;

    // AS3: sources/win63_version/habbo/inventory/HabboInventory.as::closeView()
    closeView(): void;

    // AS3: sources/win63_version/habbo/inventory/HabboInventory.as::showView()
    showView(): void;

    // AS3: sources/win63_version/habbo/inventory/HabboInventory.as::preparingInventoryView()
    preparingInventoryView(): void;

    // AS3: sources/win63_version/habbo/inventory/HabboInventory.as::closingInventoryView()
    closingInventoryView(): void;

    // AS3: sources/win63_version/habbo/inventory/HabboInventory.as::inventoryViewOpened()
    inventoryViewOpened(category: string): void;

    // AS3: sources/win63_version/habbo/inventory/HabboInventory.as::toggleInventoryPage()
    toggleInventoryPage(category: string, itemId?: string | null, forceSwitch?: boolean): void;

    // AS3: sources/win63_version/habbo/inventory/HabboInventory.as::toggleInventorySubPage()
    toggleInventorySubPage(category: string): void;

    // AS3: sources/win63_version/habbo/inventory/HabboInventory.as::updateSubView()
    updateSubView(): void;

    // AS3: sources/win63_version/habbo/inventory/HabboInventory.as::updateUnseenItemCounts()
    updateUnseenItemCounts(): void;

    // AS3: sources/win63_version/habbo/inventory/HabboInventory.as::getCategoryWindowContainer()
    getCategoryWindowContainer(category: string): IWindowContainer | null;

    // AS3: sources/win63_version/habbo/inventory/HabboInventory.as::getCategorySubWindowContainer()
    getCategorySubWindowContainer(category: string): IWindowContainer | null;

    // AS3: sources/win63_version/habbo/inventory/HabboInventory.as::updateView()
    updateView(category: string): void;

    // AS3: sources/win63_version/habbo/inventory/HabboInventory.as::isInventoryCategoryInit()
    isInventoryCategoryInit(category: string): boolean;

    // AS3: sources/win63_version/habbo/inventory/HabboInventory.as::setInventoryCategoryInit()
    setInventoryCategoryInit(category: string, init?: boolean): boolean;

    // AS3: sources/win63_version/habbo/inventory/HabboInventory.as::checkCategoryInitilization()
    checkCategoryInitilization(category: string): boolean;

    // AS3: sources/win63_version/habbo/inventory/HabboInventory.as::requestInventoryCategoryInit()
    requestInventoryCategoryInit(category: string): void;

    /**
	 * Update club/subscription status
	 */
    setClubStatus(
        periods: number,
        days: number,
        hasEverBeenMember: boolean,
        isVIP: boolean,
        isExpiring: boolean,
        citizenshipVipIsExpiring: boolean,
        minutesUntilExpiration: number,
        minutesSinceLastModified: number
    ): void;

    /**
	 * Request furniture inventory from server
	 */
    requestFurni(): void;

    /**
	 * Request badges from server
	 */
    requestBadges(): void;

    /**
	 * Request pets from server
	 */
    requestPets(): void;

    /**
	 * Request bots from server
	 */
    requestBots(): void;
}
