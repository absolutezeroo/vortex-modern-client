import {EventEmitter} from 'eventemitter3';
import {Application} from 'pixi.js';
import {Core} from '@core/Core';
import {HeliumMain} from './HeliumMain';
import {IID_CoreCommunicationManager} from '@iid/IIDCoreCommunicationManager';
import {Logger} from '@core/utils/Logger';
import type {CoreComponentContext} from '@core/runtime/CoreComponentContext';
import type {ICoreCommunicationManager} from '@core/communication/ICoreCommunicationManager';
import type {IHabboConfigurationManager} from '@habbo/configuration/IHabboConfigurationManager';
import type {ISessionDataManager} from '@habbo/session/ISessionDataManager';
import type {IRoomSessionManager} from '@habbo/session/IRoomSessionManager';
import type {HabboCommunicationManager} from '@habbo/communication/HabboCommunicationManager';
import type {RoomEngine} from '@habbo/room';
import type {IAvatarRenderManager} from '@habbo/avatar/IAvatarRenderManager';
import type {IHabboNavigator} from '@habbo/navigator/IHabboNavigator';
import type {IHabboNewNavigator} from '@habbo/navigator/IHabboNewNavigator';
import type {IHabboInventory} from '@habbo/inventory/IHabboInventory';
import type {IHabboCatalog} from '@habbo/catalog/IHabboCatalog';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IHabboToolbar} from '@habbo/toolbar/IHabboToolbar';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IRoomUI} from '@habbo/ui/IRoomUI';
import type {IHelium} from './IHelium';
import type {IHeliumLoadingScreen} from './IHeliumLoadingScreen';

const log = Logger.getLogger('Helium');

/**
 * PixiJS application configuration options.
 */
export interface IHeliumCoreConfig
{
    /** Background color */
    background?: string;
    /** Element to resize to */
    resizeTo?: HTMLElement | Window;
    /** Enable antialiasing */
    antialias?: boolean;
    /** Pixel resolution */
    resolution?: number;
    /** Canvas container element */
    canvas?: HTMLElement;
}

/**
 * Connection configuration
 */
export interface IConnectionConfig
{
    /** Server host (can include ws:// or wss://) */
    host: string;

    /** Server ports to try */
    ports: number[];

    /** SSO ticket for authentication */
    ssoTicket?: string;

    /** Auto-connect on initialization */
    autoConnect?: boolean;
}

/**
 * Helium configuration
 */
export interface IHeliumConfig extends IHeliumCoreConfig
{
    /** Connection configuration */
    connection?: IConnectionConfig;

    /** URL to load external configuration from (external_variables.txt) */
    configurationUrl?: string;

    /** Configuration object (alternative to URL) */
    configuration?: Record<string, string>;

    /** AS3 embedded text/XML asset contents keyed by asset name. */
    embeddedConfigurations?: Record<string, string>;

    /** Allow arbitrary configuration properties at the top level */
    [key: string]: unknown;
}

/**
 * Crash report data
 */
export interface ICrashReport
{
    message: string;
    category: string;
    isFatal: boolean;
    timestamp: number;
    error?: Error;
}

/**
 * Helium
 *
 * Application shell for the Helium Habbo client.
 * Equivalent to HabboAir.as in AS3.
 *
 * Owns the PixiJS Application (= Flash stage) and HeliumMain (= HabboAirMain).
 * Handles singleton lifecycle, crash reporting, and connection management.
 *
 * @see sources/win63_2021_version/HabboAir.as
 */
export class Helium implements IHelium
{
    // Engine orchestrator (= HabboAirMain)
    private _habboMain: HeliumMain | null = null;

    /**
	 * Loading screen reference.
	 *
	 * @see sources/win63_2021_version/HabboAir.as _loadingScreen
	 */
    private _loadingScreen: IHeliumLoadingScreen | null = null;

    /**
	 * PixiJS Application — equivalent to the Flash stage.
	 * Owned directly by Helium (not by a separate core layer).
	 *
	 * @see sources/win63_2021_version/HabboAir.as (stage setup in tryInit)
	 */
    private _application: Application | null = null;

    // State
    private _ready: boolean = false;

    // Event emitter for progress, ready, crash, unload, heartbeat
    private _events: EventEmitter = new EventEmitter();

    // Unload handler reference for cleanup
    private _unloadHandler: (() => void) | null = null;

    // Singleton
    private static _instance: Helium;

    protected _disposed: boolean = false;

    /**
	 * Get the singleton instance
	 */
    public static get instance(): Helium
    {
        if(!this._instance)
        {
            this._instance = new Helium();
        }

        return this._instance;
    }

    get disposed(): boolean
    {
        return this._disposed;
    }

    /**
	 * Get the CoreComponentContext (= ICore).
	 *
	 * In AS3, HabboAirMain stored _core: ICore which was the CoreComponentContext
	 * created by Core.instantiate(). Here we expose it from Core.instance.
	 */
    get context(): CoreComponentContext
    {
        const ctx = Core.instance;

        if(!ctx)
        {
            throw new Error('[Helium] Core not initialized');
        }

        return ctx as CoreComponentContext;
    }

    /**
	 * Get the PixiJS Application.
	 */
    get application(): Application
    {
        if(!this._application)
        {
            throw new Error('[Helium] Not initialized');
        }

        return this._application;
    }

    get communication(): ICoreCommunicationManager
    {
        return this.context.queueInterface(IID_CoreCommunicationManager)!;
    }

    get isReady(): boolean
    {
        return this._ready;
    }

    /**
	 * Event emitter for lifecycle events.
	 */
    get heliumEvents(): EventEmitter
    {
        return this._events;
    }

    get configuration(): IHabboConfigurationManager
    {
        return this._habboMain!.configurationManager;
    }

    get habboCommunication(): HabboCommunicationManager
    {
        return this._habboMain!.habboCommunication;
    }

    get avatarRenderManager(): IAvatarRenderManager
    {
        return this._habboMain!.avatarRenderManager;
    }

    get roomEngine(): RoomEngine
    {
        return this._habboMain!.roomEngine;
    }

    get sessionDataManager(): ISessionDataManager
    {
        return this._habboMain!.sessionDataManager;
    }

    get roomSessionManager(): IRoomSessionManager
    {
        return this._habboMain!.roomSessionManager;
    }

    get navigator(): IHabboNavigator
    {
        return this._habboMain!.navigator;
    }

    get newNavigator(): IHabboNewNavigator
    {
        return this._habboMain!.newNavigator;
    }

    get inventory(): IHabboInventory
    {
        return this._habboMain!.inventory;
    }

    get catalog(): IHabboCatalog
    {
        return this._habboMain!.catalog;
    }

    get localization(): IHabboLocalizationManager
    {
        return this._habboMain!.localization;
    }

    get windowManager(): IHabboWindowManager
    {
        return this._habboMain!.windowManager;
    }

    get toolbar(): IHabboToolbar
    {
        return this._habboMain!.toolbar;
    }

    get assets(): IAssetLibrary
    {
        return this._habboMain!.assets;
    }

    get roomUI(): IRoomUI
    {
        return this._habboMain!.roomUI;
    }

    /**
	 * Bootstrap the application.
	 *
	 * @param config - Optional configuration
	 * @param loadingScreen - Optional loading screen (passed to HeliumMain like AS3)
	 *
	 * @see sources/win63_2021_version/HabboAir.as finalizePreloading()
	 */
    public static async bootstrap(config?: IHeliumConfig, loadingScreen?: IHeliumLoadingScreen): Promise<Helium>
    {
        const instance = this.instance;

        await instance.init(config, loadingScreen);

        return instance;
    }

    /**
	 * Track a login step for analytics and debugging.
	 *
	 * @see sources/win63_2021_version/HabboAir.as trackLoginStep()
	 */
    public static trackLoginStep(step: string, extra?: string): void
    {
        const message = extra ? `${step} (${extra})` : step;

        log.debug(`Login step: ${message}`);

        if(this._instance)
        {
            this._instance._events.emit('loginStep', step, extra);
        }
    }

    /**
	 * Report a crash or error.
	 *
	 * @see sources/win63_2021_version/HabboAir.as reportCrash()
	 */
    public static reportCrash(message: string, category: string, isFatal: boolean, error?: Error): void
    {
        const report: ICrashReport = {
            message,
            category,
            isFatal,
            timestamp: Date.now(),
            error,
        };

        log.error(`Crash [${category}]: ${message}${isFatal ? ' (FATAL)' : ''}`);

        if(error)
        {
            log.error(error.stack ?? error.message);
        }

        if(this._instance)
        {
            this._instance._events.emit('crash', report);
        }
    }

    /**
	 * Initialize the Friend Bar (landing view, etc.)
	 * Must be called AFTER window layouts are registered.
	 */
    initFriendBar(): void
    {
        this._habboMain!.initFriendBar();
    }

    /**
	 * Connect to the Habbo server (manual).
	 *
	 * @see sources/win63_version/habbo/communication/demo/class_467.as::initWithSSO()
	 * @see sources/win63_version/habbo/communication/demo/class_1762.as::onAuthenticationOK()
	 */
    async connect(): Promise<void>
    {
        if(!this._habboMain)
        {
            throw new Error('[Helium] Not initialized');
        }

        const comm = this._habboMain.habboCommunication;
        const demo = this._habboMain.communicationDemo;
        const ssoTicket = comm.ssoTicket;

        if(!ssoTicket || ssoTicket.length === 0)
        {
            throw new Error('[Helium] Login without an SSO ticket is not supported');
        }

        log.info('Connecting to server...');

        demo.startConnectionWithSSO(ssoTicket);
        await demo.waitForAuthentication();

        this.wireRoomMessageHandler();
    }

    /**
	 * Disconnect from the server
	 */
    disconnect(): void
    {
        this._habboMain?.habboCommunication.disconnect();
    }

    /**
	 * Dispose the application.
	 *
	 * @see sources/win63_2021_version/HabboAir.as dispose()
	 */
    public dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;

        log.info('Disposing Helium...');

        // Remove unload listener
        if(this._unloadHandler)
        {
            window.removeEventListener('beforeunload', this._unloadHandler);
            this._unloadHandler = null;
        }

        // 1. Dispose engine orchestrator
        this._habboMain?.dispose();
        this._habboMain = null;

        // 2. Dispose core (disposes context and all components)
        Core.dispose();

        // 3. Dispose PixiJS application
        this._application?.destroy(true);
        this._application = null;

        this._ready = false;

        this._events.removeAllListeners();
    }

    /**
	 * Initialize the application.
	 *
	 * AS3 flow:
	 * 1. HabboAir.tryInit() — stage setup, loading screen, start preloading
	 * 2. HabboAir.finalizePreloading() — create HabboAirMain, add to stage
	 * 3. HabboAirMain.prepareCore() — create Core, register all components
	 * 4. HabboAirMain.addInitializationProgressListeners() — track progress
	 *
	 * @see sources/win63_2021_version/HabboAir.as tryInit(), finalizePreloading()
	 * @see sources/win63_2021_version/HabboAirMain.as prepareCore()
	 */
    async init(config?: IHeliumConfig, loadingScreen?: IHeliumLoadingScreen): Promise<void>
    {
        if(this._ready)
        {
            log.warn('Already initialized');
            return;
        }

        this._loadingScreen = loadingScreen ?? null;

        Helium.trackLoginStep('client.init.start');

        try
        {
            log.info('Initializing Helium...');

            // 1. Create PixiJS application (= AS3 stage setup in HabboAir.tryInit)
            this._application = new Application();

            await this._application.init({
                background: config?.background ?? '#000000',
                resizeTo: config?.resizeTo ?? window,
                // AS3 Flash stage renders at logical pixel resolution. Defaulting Pixi to
                // devicePixelRatio + antialias makes the room canvas much heavier and blurs
                // pixel-art assets; callers can still override both via config.
                antialias: config?.antialias ?? false,
                resolution: config?.resolution ?? 1,
                autoDensity: true,
                // Several widgets read pixels back off-screen via renderer.extract.canvas()
                // (AvatarImageWidget avatar/badge previews, RoomEngine.pixiTextureToCanvas()
                // room icons, RoomRenderingCanvas.takeScreenShot()) - each of those is, from
                // WebGL's point of view, "another canvas" sharing this one GL context. Without
                // multiView, PixiJS's GlContextSystem.ensureCanvasSize() warns every time
                // ("multiView is disabled, but targetCanvas is not the main canvas") because it
                // only expects the single view canvas. multiView is PixiJS's documented flag for
                // exactly this "one context, several canvases" case.
                multiView: true,
            });

            // Append canvas to target
            const target = config?.canvas ?? document.body;
            target.appendChild(this._application.canvas);

            // 2. Create and init engine orchestrator (= HabboAirMain)
            this._habboMain = new HeliumMain(this._loadingScreen);

            await this._habboMain.init(this._application, config);

            this._ready = true;

            // Register unload handler
            this._unloadHandler = () => this.unloading();

            window.addEventListener('beforeunload', this._unloadHandler);

            this._events.emit('ready');

            log.success('Ready!');
        }
        catch (error)
        {
            Helium.trackLoginStep('client.init.core.fail');
            Helium.reportCrash(
                error instanceof Error ? error.message : String(error),
                'init',
                true,
                error instanceof Error ? error : undefined
            );

            throw error;
        }
    }

    /**
	 * Handle browser unload event.
	 *
	 * @see sources/win63_2021_version/HabboAirMain.as unloading()
	 */
    unloading(): void
    {
        try
        {
            if(Core.instance && !this._disposed)
            {
                this._events.emit('unload');
            }
        }
        catch (error)
        {
            // AS3: catch(error:Error) {} — silently ignore errors during unload
        }

        this.dispose();
    }

    /**
	 * Wire the RoomMessageHandler to the connection.
	 */
    private wireRoomMessageHandler(): void
    {
        if(!this._habboMain) return;

        const comm = this._habboMain.habboCommunication;
        const handler = this._habboMain.roomMessageHandler;

        if(comm.connection)
        {
            handler.connection = comm.connection;
            this._habboMain.roomEngine.connection = comm.connection;
        }
    }
}
