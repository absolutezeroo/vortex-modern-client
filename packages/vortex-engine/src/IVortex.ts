import type {CoreComponentContext} from '@core/runtime/CoreComponentContext';
import type {ICoreCommunicationManager} from '@core/communication/ICoreCommunicationManager';
import type {IDisposable} from '@core/runtime/IDisposable';
import type {Application, Renderer} from 'pixi.js';
import type {IHabboConfigurationManager} from '@habbo/configuration';
import type {HabboCommunicationManager} from '@habbo/communication';
import type {RoomEngine} from '@habbo/room';
import type {IRoomSessionManager, ISessionDataManager} from '@habbo/session';
import type {IHabboNavigator, IHabboNewNavigator} from '@habbo/navigator';
import type {IHabboInventory} from '@habbo/inventory';
import type {IHabboCatalog} from '@habbo/catalog';
import type {IHabboLocalizationManager} from '@habbo/localization';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IHabboToolbar} from '@habbo/toolbar/IHabboToolbar';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IVortexConfig} from './Vortex';
import type {IVortexLoadingScreen} from './IVortexLoadingScreen';

export interface IVortex extends IDisposable
{
    readonly context: CoreComponentContext;
    readonly application: Application<Renderer>;
    readonly communication: ICoreCommunicationManager;
    readonly isReady: boolean;
    readonly configuration: IHabboConfigurationManager;
    readonly habboCommunication: HabboCommunicationManager;
    readonly roomEngine: RoomEngine;
    readonly sessionDataManager: ISessionDataManager;
    readonly roomSessionManager: IRoomSessionManager;
    readonly navigator: IHabboNavigator;
    readonly newNavigator: IHabboNewNavigator;
    readonly inventory: IHabboInventory;
    readonly catalog: IHabboCatalog;
    readonly localization: IHabboLocalizationManager;
    readonly windowManager: IHabboWindowManager;
    readonly toolbar: IHabboToolbar;
    readonly assets: IAssetLibrary;

    /**
	 * Connect to the Habbo server
	 */
    connect(): Promise<void>;

    /**
	 * Disconnect from the server
	 */
    disconnect(): void;

    /**
	 * Initialize the application
	 */
    init(config?: IVortexConfig, loadingScreen?: IVortexLoadingScreen): Promise<void>;
}
