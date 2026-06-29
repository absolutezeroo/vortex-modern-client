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
import {FurniModel} from './furni/FurniModel';
import {BadgesModel} from './badges/BadgesModel';
import {EffectsModel} from './effects/EffectsModel';
import {PetsModel} from './pets/PetsModel';
import {BotsModel} from './bots/BotsModel';
import {TradingModel} from './trading/TradingModel';
import {Purse} from './purse/Purse';
import {UnseenItemTracker} from './UnseenItemTracker';
import {Logger} from '@core/utils/Logger';
import {IID_HabboCommunicationManager} from "@iid/IIDHabboCommunicationManager";
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
 * UI is handled by SolidJS stores
 */
export class HabboInventory extends Component implements IHabboInventory
{
	private _communication: IHabboCommunicationManager | null = null;
	private _initializedCategories: Set<string> = new Set();

	constructor(context: IContext)
	{
		super(context);
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
		];
	}

	override dispose(): void
	{
		if (this.disposed) return;

		this._furniModel?.dispose();
		this._badgesModel?.dispose();
		this._effectsModel?.dispose();
		this._petsModel?.dispose();
		this._botsModel?.dispose();
		this._tradingModel?.dispose();
		this._unseenItemTracker?.dispose();

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

	setCategoryInitialized(category: string): boolean
	{
		if (this._initializedCategories.has(category))
		{
			return false;
		}

		this._initializedCategories.add(category);

		return true;
	}

	isCategoryInitialized(category: string): boolean
	{
		return this._initializedCategories.has(category);
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

	protected override initComponent(): void
	{
		this._unseenItemTracker = new UnseenItemTracker(this._communication!);
		log.info('Inventory initialized');
	}
}
