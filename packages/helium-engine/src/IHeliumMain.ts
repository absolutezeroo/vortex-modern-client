import type {IDisposable} from "@core";
import type {IHabboCommunicationDemo, IHabboCommunicationManager} from "@habbo/communication";
import type {IHabboLocalizationManager} from "@habbo/localization";
import type {IHabboNavigator, IHabboNewNavigator} from "@habbo/navigator";
import type {IHabboInventory} from "@habbo/inventory";
import type {IHabboCatalog} from "@habbo/catalog";
import type {IHabboConfigurationManager} from "@habbo/configuration";
import type {IRoomManager} from "@room";
import type {IRoomSessionManager, ISessionDataManager} from "@habbo/session";
import type {IRoomEngine} from "@habbo/room";
import type {IHeliumConfig} from "./Helium";
import type {IRoomMessageHandler} from "@habbo/room/IRoomMessageHandler";
import type {IHabboWindowManager} from "@habbo/window/IHabboWindowManager";
import type {IHabboToolbar} from "@habbo/toolbar/IHabboToolbar";
import type {Application} from 'pixi.js';

export interface IHeliumMain extends IDisposable
{
    readonly navigator: IHabboNavigator;
    readonly newNavigator: IHabboNewNavigator;
    readonly inventory: IHabboInventory;
    readonly catalog: IHabboCatalog;
    readonly configurationManager: IHabboConfigurationManager;
    readonly communicationDemo: IHabboCommunicationDemo;
    readonly roomManager: IRoomManager;
    readonly roomMessageHandler: IRoomMessageHandler;
    readonly roomSessionManager: IRoomSessionManager;
    readonly localization: IHabboLocalizationManager;
    readonly roomEngine: IRoomEngine;
    readonly sessionDataManager: ISessionDataManager;
    readonly habboCommunication: IHabboCommunicationManager;
    readonly windowManager: IHabboWindowManager;
    readonly toolbar: IHabboToolbar;

    /**
	 * Initialize the engine orchestrator.
	 *
	 * @param application - The PixiJS Application (created by Helium shell)
	 * @param config - Optional Helium configuration
	 *
	 * @see sources/win63_2021_version/HabboAirMain.as prepareCore()
	 */
    init(application: Application, config?: IHeliumConfig): Promise<void>;

    /**
	 * Create Core and prepare all components.
	 *
	 * Order follows AS3 HabboAirMain.as prepareCore() sequence:
	 * Config → Communication → Demo → Localization → RoomManager → RoomSessionManager
	 * → SessionDataManager → Navigator → Inventory → RoomEngine → RoomMessageHandler
	 *
	 * @see sources/win63_2021_version/HabboAirMain.as prepareCore()
	 */
    prepareCore(config?: IHeliumConfig): Promise<void>;

    /**
	 * Initialize localization
	 */
    initLocalization(): void;

    /**
	 * Initialize the Friend Bar (landing view, etc.)
	 * Must be called AFTER window layouts are registered.
	 */
    initFriendBar(): void;
}
