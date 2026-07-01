import {Component, ComponentDependency, type IContext} from '@core/runtime';
import type {IHabboInventory, InventoryCategoryType} from './IHabboInventory';
import type {IFurniModel} from './furni/IFurniModel';
import type {IBadgesModel} from './badges/IBadgesModel';
import type {IEffectsModel} from './effects/IEffectsModel';
import type {IPetsModel} from './pets/IPetsModel';
import type {IBotsModel} from './bots/IBotsModel';
import type {ITradingModel} from './trading/ITradingModel';
import type {IPurse} from './purse/IPurse';
import type {IHabboCommunicationManager} from '../communication/IHabboCommunicationManager';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IHabboCatalog} from '@habbo/catalog/IHabboCatalog';
import type {IHabboToolbar} from '@habbo/toolbar/IHabboToolbar';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import {FurniModel} from './furni/FurniModel';
import {BadgesModel} from './badges/BadgesModel';
import {EffectsModel} from './effects/EffectsModel';
import {PetsModel} from './pets/PetsModel';
import {BotsModel} from './bots/BotsModel';
import {TradingModel} from './trading/TradingModel';
import {Purse} from './purse/Purse';
import {UnseenItemTracker} from './UnseenItemTracker';
import {InventoryMainView} from './InventoryMainView';
import {Logger} from '@core/utils/Logger';
import {IID_HabboCommunicationManager} from "@iid/IIDHabboCommunicationManager";
import {IID_HabboWindowManager} from '@iid/IIDHabboWindowManager';
import {IID_HabboCatalog} from '@iid/IIDHabboCatalog';
import {IID_HabboToolbar} from '@iid/IIDHabboToolbar';
import {HabboToolbarEvent} from '@habbo/toolbar/events/HabboToolbarEvent';
import {
	GetBadgesComposer,
	GetBotInventoryComposer,
	GetPetInventoryComposer,
	RequestFurniInventoryComposer,
} from '../communication/messages/outgoing/inventory';

const log = Logger.getLogger('Inventory');

/**
 * Main inventory controller
 *
 * Based on AS3 com.sulake.habbo.inventory.HabboInventory (ENGINE only)
 * UI is the ported window system (InventoryMainView), matching the AS3
 * class hierarchy — not SolidJS stores (SolidJS isn't a project dependency).
 */
export class HabboInventory extends Component implements IHabboInventory
{
	private _communication: IHabboCommunicationManager | null = null;
	private _windowManager: IHabboWindowManager | null = null;
	private _catalog: IHabboCatalog | null = null;
	private _toolbar: IHabboToolbar | null = null;
	private _initializedCategories: Set<string> = new Set();
	private _view!: InventoryMainView;

	constructor(context: IContext)
	{
		super(context);
	}

	get windowManager(): IHabboWindowManager | null
	{
		return this._windowManager;
	}

	get catalog(): IHabboCatalog | null
	{
		return this._catalog;
	}

	// AS3: sources/win63_version/habbo/inventory/HabboInventory.as::get view()
	get view(): InventoryMainView
	{
		return this._view;
	}

	// AS3: sources/win63_version/habbo/inventory/HabboInventory.as::get isVisible()
	get isVisible(): boolean
	{
		return this._view.isVisible;
	}

	// AS3: sources/win63_version/habbo/inventory/HabboInventory.as::get isMainViewActive()
	get isMainViewActive(): boolean
	{
		return this._view.isActive;
	}

	// AS3: sources/win63_version/habbo/inventory/HabboInventory.as::get mergeRentFurni()
	get mergeRentFurni(): boolean
	{
		return true;
	}

	// AS3: sources/win63_version/habbo/inventory/HabboInventory.as::get web3tradeEnabled()
	get web3tradeEnabled(): boolean
	{
		return this.getBoolean('web3trade.enabled');
	}

	private _isInitialized: boolean = false;

	get isInitialized(): boolean
	{
		return this._isInitialized;
	}

	private _currentCategory: InventoryCategoryType | null = null;

	get currentCategory(): InventoryCategoryType | null
	{
		return this._currentCategory;
	}

	private _hasRoomSession: boolean = false;

	get hasRoomSession(): boolean
	{
		return this._hasRoomSession;
	}

	set hasRoomSession(value: boolean)
	{
		this._hasRoomSession = value;
	}

	private _furniModel!: FurniModel;

	get furniModel(): IFurniModel
	{
		return this._furniModel;
	}

	private _badgesModel!: BadgesModel;

	get badgesModel(): IBadgesModel
	{
		return this._badgesModel;
	}

	private _effectsModel!: EffectsModel;

	get effectsModel(): IEffectsModel
	{
		return this._effectsModel;
	}

	private _petsModel!: PetsModel;

	get petsModel(): IPetsModel
	{
		return this._petsModel;
	}

	private _botsModel!: BotsModel;

	get botsModel(): IBotsModel
	{
		return this._botsModel;
	}

	private _tradingModel!: TradingModel;

	get tradingModel(): ITradingModel
	{
		return this._tradingModel;
	}

	private _purse: Purse = new Purse();

	get purse(): IPurse
	{
		return this._purse;
	}

	private _unseenItemTracker: UnseenItemTracker | null = null;

	get unseenItemTracker(): UnseenItemTracker
	{
		return this._unseenItemTracker!;
	}

	protected override get dependencies(): Array<ComponentDependency<any>>
	{
		return [
			new ComponentDependency(
				IID_HabboCommunicationManager,
				(manager: IHabboCommunicationManager | null) =>
				{
					this._communication = manager;
				},
				true
			),
			new ComponentDependency(
				IID_HabboWindowManager,
				(manager: IHabboWindowManager | null) =>
				{
					this._windowManager = manager;
				},
				true
			),
			new ComponentDependency(
				IID_HabboCatalog,
				(catalog: IHabboCatalog | null) =>
				{
					this._catalog = catalog;
				},
				false
			),
			new ComponentDependency(
				IID_HabboToolbar,
				(toolbar: IHabboToolbar | null) =>
				{
					// toolbarEvents is a dedicated EventEmitter (not Component.events —
					// see HabboToolbar.ts), so it can't use ComponentDependency's
					// built-in eventListeners param (that subscribes to .events).
					// Subscribe/unsubscribe manually, matching HabboNewNavigator.ts.
					if (this._toolbar)
					{
						this._toolbar.toolbarEvents.off(HabboToolbarEvent.TOOLBAR_CLICK, this.onHabboToolbarEvent);
					}

					this._toolbar = toolbar;

					if (toolbar)
					{
						toolbar.toolbarEvents.on(HabboToolbarEvent.TOOLBAR_CLICK, this.onHabboToolbarEvent);
					}
				},
				false
			),
		];
	}

	// AS3: sources/win63_version/habbo/inventory/HabboInventory.as::habboToolbarEventHandler()
	private onHabboToolbarEvent = (event: HabboToolbarEvent): void =>
	{
		this._view?.onHabboToolbarEvent(event);
	};

	override dispose(): void
	{
		if (this.disposed) return;

		this._toolbar?.toolbarEvents.off(HabboToolbarEvent.TOOLBAR_CLICK, this.onHabboToolbarEvent);
		this._furniModel?.dispose();
		this._badgesModel?.dispose();
		this._effectsModel?.dispose();
		this._petsModel?.dispose();
		this._botsModel?.dispose();
		this._tradingModel?.dispose();
		this._unseenItemTracker?.dispose();
		this._view?.dispose();

		this._initializedCategories.clear();

		log.info('Inventory disposed');
		super.dispose();
	}

	init(): void
	{
		if (this._isInitialized) return;

		this._furniModel = new FurniModel();
		this._badgesModel = new BadgesModel();
		this._effectsModel = new EffectsModel();
		this._petsModel = new PetsModel();
		this._botsModel = new BotsModel();
		this._tradingModel = new TradingModel();

		this._isInitialized = true;
	}

	switchCategory(category: InventoryCategoryType): void
	{
		if (!this._isInitialized)
		{
			this.init();
		}

		this._currentCategory = category;

		// Handle furni/rentables special case
		if (category === 'furni' || category === 'rentables')
		{
			this._furniModel.categorySwitch(category);
		}
	}

	// AS3: sources/win63_version/habbo/inventory/HabboInventory.as::getSubCategoryViewId()
	getSubCategoryViewId(): string | null
	{
		return this._view.getSubCategoryViewId();
	}

	// AS3: sources/win63_version/habbo/inventory/HabboInventory.as::closeView()
	closeView(): void
	{
		if (this._view?.isVisible)
		{
			this._view.hideInventory();
		}
	}

	// AS3: sources/win63_version/habbo/inventory/HabboInventory.as::showView()
	showView(): void
	{
		this._view?.showInventory();
	}

	// AS3: sources/win63_version/habbo/inventory/HabboInventory.as::preparingInventoryView()
	preparingInventoryView(): void
	{
		if (!this._isInitialized)
		{
			this.init();
		}
	}

	// AS3: sources/win63_version/habbo/inventory/HabboInventory.as::inventoryViewOpened()
	inventoryViewOpened(category: string): void
	{
		this._currentCategory = category as InventoryCategoryType;

		if (category === 'furni' || category === 'rentables')
		{
			this._furniModel.categorySwitch(category);
		}
	}

	// AS3: sources/win63_version/habbo/inventory/HabboInventory.as::closingInventoryView()
	// TODO(AS3): AS3 calls closingInventoryView() on every registered IInventoryModel;
	// only furni's equivalent effect (resetUnseenItems) is wired until the other
	// categories implement the shared contract.
	closingInventoryView(): void
	{
		this._furniModel?.resetUnseenItems();
		this.events.emit('HABBO_INVENTORY_TRACKING_EVENT_CLOSED');
	}

	// AS3: sources/win63_version/habbo/inventory/HabboInventory.as::toggleInventoryPage()
	toggleInventoryPage(category: string, itemId: string | null = null, forceSwitch: boolean = false): void
	{
		const opened = this._view.toggleCategoryView(category, false, forceSwitch);

		if (opened)
		{
			this.inventoryViewOpened(category);

			if (itemId !== null && category === 'furni')
			{
				// AS3: FurniModel.selectItemById() -> getItemById(-int(param1))
				const groupItem = this._furniModel.getItemById(-parseInt(itemId, 10));

				if (groupItem !== null)
				{
					this._furniModel.selectItem(groupItem);
				}
			}
		}
		else
		{
			this.events.emit('HABBO_INVENTORY_TRACKING_EVENT_CLOSED');
		}
	}

	// AS3: sources/win63_version/habbo/inventory/HabboInventory.as::toggleInventorySubPage()
	toggleInventorySubPage(category: string): void
	{
		this._view.toggleSubCategoryView(category, false);

		if (category === 'trading')
		{
			this._view.toggleCategoryView('furni', false);
		}
	}

	// AS3: sources/win63_version/habbo/inventory/HabboInventory.as::updateSubView()
	updateSubView(): void
	{
		this._view.updateSubCategoryView();
	}

	// AS3: sources/win63_version/habbo/inventory/HabboInventory.as::updateUnseenItemCounts()
	updateUnseenItemCounts(): void
	{
		if (!this._unseenItemTracker) return;

		this._view.updateUnseenFurniCount(this._unseenItemTracker.getCount(1));
		this._view.updateUnseenRentedFurniCount(this._unseenItemTracker.getCount(2));
		this._view.updateUnseenPetsCount(this._unseenItemTracker.getCount(3));
		this._view.updateUnseenBadgeCount(this._unseenItemTracker.getCount(4));
		this._view.updateUnseenBotCount(this._unseenItemTracker.getCount(5));
	}

	// AS3: sources/win63_version/habbo/inventory/HabboInventory.as::getCategoryWindowContainer()
	// TODO(AS3): only per-category View classes can return a real container.
	// FurniView/PetsView/BadgesView/BotsView/EffectsView/TradingView/CollectiblesView/
	// MarketplaceView are not ported yet (see FurniView port task) — every category
	// resolves to "no content" until its View lands, matching InventoryMainView's
	// existing null-guard (setViewToCategory returns early when this is null).
	getCategoryWindowContainer(_category: string): IWindowContainer | null
	{
		return null;
	}

	// AS3: sources/win63_version/habbo/inventory/HabboInventory.as::getCategorySubWindowContainer()
	getCategorySubWindowContainer(_category: string): IWindowContainer | null
	{
		return null;
	}

	// AS3: sources/win63_version/habbo/inventory/HabboInventory.as::updateView()
	// TODO(AS3): FurniModel.updateView() forwards to FurniView (not ported yet).
	updateView(_category: string): void
	{
		// Intentional no-op until per-category Views exist.
	}

	// AS3: sources/win63_version/habbo/inventory/HabboInventory.as::isInventoryCategoryInit()
	isInventoryCategoryInit(category: string): boolean
	{
		return this._initializedCategories.has(category);
	}

	// AS3: sources/win63_version/habbo/inventory/HabboInventory.as::setInventoryCategoryInit()
	setInventoryCategoryInit(category: string, init: boolean = true): boolean
	{
		if (init)
		{
			if (!this._initializedCategories.has(category))
			{
				this._initializedCategories.add(category);

				return true;
			}
		}
		else
		{
			this._initializedCategories.delete(category);

			if (this._view?.isVisible && category !== 'rentables')
			{
				this.requestInventoryCategoryInit(category);
			}
		}

		return false;
	}

	// AS3: sources/win63_version/habbo/inventory/HabboInventory.as::checkCategoryInitilization()
	checkCategoryInitilization(category: string): boolean
	{
		if (this.isInventoryCategoryInit(category))
		{
			return true;
		}

		this.requestInventoryCategoryInit(category);

		return false;
	}

	// AS3: sources/win63_version/habbo/inventory/HabboInventory.as::requestInventoryCategoryInit()
	requestInventoryCategoryInit(category: string): void
	{
		switch (category)
		{
			case 'furni':
			case 'rentables':
				this.requestFurni();
				break;
			case 'badges':
				this.requestBadges();
				break;
			case 'pets':
				this.requestPets();
				break;
			case 'bots':
				this.requestBots();
				break;
		}
	}

	setClubStatus(
		periods: number,
		days: number,
		hasEverBeenMember: boolean,
		isVIP: boolean,
		isExpiring: boolean,
		citizenshipVipIsExpiring: boolean,
		minutesUntilExpiration: number,
		minutesSinceLastModified: number
	): void
	{
		this._purse.clubPeriods = periods;
		this._purse.clubDays = days;
		this._purse.clubHasEverBeenMember = hasEverBeenMember;
		this._purse.isVIP = isVIP;
		this._purse.clubIsExpiring = isExpiring;
		this._purse.citizenshipVipIsExpiring = citizenshipVipIsExpiring;
		this._purse.minutesUntilExpiration = minutesUntilExpiration;
		this._purse.minutesSinceLastModified = minutesSinceLastModified;
	}

	requestFurni(): void
	{
		this._communication?.connection?.send(new RequestFurniInventoryComposer());
	}

	requestBadges(): void
	{
		this._communication?.connection?.send(new GetBadgesComposer());
	}

	requestPets(): void
	{
		this._communication?.connection?.send(new GetPetInventoryComposer());
	}

	requestBots(): void
	{
		this._communication?.connection?.send(new GetBotInventoryComposer());
	}

	// AS3: sources/win63_version/habbo/inventory/HabboInventory.as::initComponent()
	// AS3 creates `view` (var_18 = new InventoryMainView(...)) unconditionally
	// here, separately from the lazily-created models (init()) — the view must
	// exist before any toolbar click can reach it.
	protected override initComponent(): void
	{
		this._unseenItemTracker = new UnseenItemTracker(this._communication!);
		this._view = new InventoryMainView(this);
		log.info('Inventory initialized');
	}
}
