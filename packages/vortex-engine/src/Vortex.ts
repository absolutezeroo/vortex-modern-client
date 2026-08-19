import {EventEmitter} from 'eventemitter3';
import {Application, TextureSource} from 'pixi.js';
import {Core} from '@core/Core';
import {VortexMain} from './VortexMain';
import {IID_CoreCommunicationManager} from '@iid/IIDCoreCommunicationManager';
import {Logger} from '@core/utils/Logger';
import {FRAME_CHANNEL_PIXI, FrameTimings} from '@core/utils/FrameTimings';
import type {CoreComponentContext} from '@core/runtime/CoreComponentContext';
import type {IElementDescriptionData} from '@habbo/window/IElementDescriptor';
import type {ISkinData} from '@core/window/graphics/renderer/BitmapSkinParser';
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
import type {IHabboFurniEditor} from '@habbo/vortex/furnieditor/IHabboFurniEditor';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IRoomUI} from '@habbo/ui/IRoomUI';
import type {IVortex} from './IVortex';
import type {IVortexLoadingScreen} from './IVortexLoadingScreen';

const log = Logger.getLogger('Vortex');

/**
 * PixiJS application configuration options.
 */
export interface IVortexCoreConfig
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
 * The window manager's asset library, supplied at construction.
 *
 * AS3 equivalent: the `_SafeCls_76` (AssetLibrary) third argument of
 * HabboWindowManagerComponent, loaded from the embedded HabboWindowManagerCom resource.
 */
export interface IVortexWindowAssets
{
    /** Parsed element-description XML (window type -> skin/renderer descriptors). */
    elementDescription?: IElementDescriptionData | null;

    /** Skin definitions keyed by skin id. */
    skins?: Map<string, ISkinData>;

    /** Decoded atlas spritesheets keyed by atlas name. */
    atlases?: Map<string, ImageBitmap>;

    /** Widget layout XML keyed by asset name. */
    layouts?: Map<string, string>;

    /**
     * Whole-file layout XML keyed by its `*Com.as` field name, for the *asset library*.
     *
     * Distinct from `layouts` above, which is the window manager's `buildWidgetLayout()` registry
     * and splits a multi-window file into one `name#0`, `name#1`, … entry per `<window>`. A whole
     * family of ported views does what AS3 does and reads the layout out of the library instead —
     * `assets.getAssetByName("settings_xml").content` — where the name is the file's and the
     * content is all of it, `<layout>` root included.
     */
    libraryLayouts?: Map<string, string>;

    /**
     * Image blob URLs keyed by asset name, for the window manager's `ResourceManager` — the
     * registry every `asset_uri` in a layout resolves against.
     */
    imageUrls?: Map<string, string>;

    /**
     * Decoded bitmaps for the images that ported code reads straight out of the *asset library*
     * by name (`getAssetByName("badge_part_add").content`) rather than through an `asset_uri`.
     *
     * Decoded up front, not lazily, because those reads are synchronous — in AS3 they resolve an
     * `[Embed]` that is already a `BitmapData` by the time the component owning it exists.
     */
    libraryImages?: Map<string, ImageBitmap>;
}

/**
 * Vortex configuration
 */
export interface IVortexConfig extends IVortexCoreConfig
{
    /** Connection configuration */
    connection?: IConnectionConfig;

    /** URL to load external configuration from (external_variables.txt) */
    configurationUrl?: string;

    /** Configuration object (alternative to URL) */
    configuration?: Record<string, string>;

    /** AS3 embedded text/XML asset contents keyed by asset name. */
    embeddedConfigurations?: Record<string, string>;

    /**
     * Window skins and layouts, handed to HabboWindowManager at construction.
     *
     * AS3's HabboWindowManagerComponent(context, flags, assets) takes its asset library as a
     * constructor argument, already filled from the embedded HabboWindowManagerCom resource —
     * so the component owns its layouts from the instant it exists. Pushing them in afterwards
     * (which is what the client used to do, once the bundle had been parsed) leaves a window
     * in which the manager is alive but empty: the socket opens during component init, so an
     * early server message could reach buildWidgetLayout() before the layouts landed and get
     * null back — intermittently, depending on who won the race.
     */
    windowAssets?: IVortexWindowAssets;

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
 * Vortex
 *
 * Application shell for the Vortex Habbo client.
 * Equivalent to HabboAir.as in AS3.
 *
 * Owns the PixiJS Application (= Flash stage) and VortexMain (= HabboAirMain).
 * Handles singleton lifecycle, crash reporting, and connection management.
 *
 * @see sources/win63_2021_version/HabboAir.as
 */
export class Vortex implements IVortex
{
    // Engine orchestrator (= HabboAirMain)
    private _habboMain: VortexMain | null = null;

    /**
	 * Loading screen reference.
	 *
	 * @see sources/win63_2021_version/HabboAir.as _loadingScreen
	 */
    // AS3: .../src/binaryData/HabboAir.as::_loadingScreen
    private _loadingScreen: IVortexLoadingScreen | null = null;

    /**
	 * PixiJS Application — equivalent to the Flash stage.
	 * Owned directly by Vortex (not by a separate core layer).
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
    private static _instance: Vortex;

    protected _disposed: boolean = false;

    /**
	 * Get the singleton instance
	 */
    public static get instance(): Vortex
    {
        if(!this._instance)
        {
            this._instance = new Vortex();
        }

        return this._instance;
    }

    /**
     * Whether a fully initialized engine exists.
     *
     * `instance` lazily constructs an *unbooted* Vortex, so it can never answer this: every
     * accessor on that object (windowManager, communication, ...) reaches into a context that
     * init() has not built yet. Callers that may run before the boot — the login flow, which
     * AS3 gates the whole core behind (HabboAir.as::startCoreInitializationIfPossible) — must
     * test this instead of null-checking `instance`.
     */
    public static get hasInstance(): boolean
    {
        return !!this._instance && this._instance._ready;
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
            throw new Error('[Vortex] Core not initialized');
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
            throw new Error('[Vortex] Not initialized');
        }

        return this._application;
    }

    // AS3: sources/win63_version/habbo/communication/demo/class_467.as::get communication()
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
    get vortexEvents(): EventEmitter
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

    // AS3: sources/win63_version/habbo/communication/demo/class_467.as::get localization()
    get localization(): IHabboLocalizationManager
    {
        return this._habboMain!.localization;
    }

    // AS3: sources/win63_version/habbo/communication/demo/class_467.as::get windowManager()
    get windowManager(): IHabboWindowManager
    {
        return this._habboMain!.windowManager;
    }

    /**
     * The Vortex furni editor (staff tool, not from AS3). Null before bootstrap completes, and
     * inert until the server grants `room.furni.edit` during the handshake.
     */
    get furniEditor(): IHabboFurniEditor | null
    {
        return this._habboMain?.furniEditor ?? null;
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
	 * @param loadingScreen - Optional loading screen (passed to VortexMain like AS3)
	 *
	 * @see sources/win63_2021_version/HabboAir.as finalizePreloading()
	 */
    public static async bootstrap(config?: IVortexConfig, loadingScreen?: IVortexLoadingScreen): Promise<Vortex>
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
    // AS3: .../src/binaryData/HabboAir.as::trackLoginStep()
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
    // AS3: .../src/binaryData/HabboAir.as::reportCrash()
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
	 * Initialize the friend list window component (friends, requests, search).
	 * Must be called AFTER window layouts are registered.
	 */
    initFriendList(): void
    {
        this._habboMain!.initFriendList();
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
            throw new Error('[Vortex] Not initialized');
        }

        const comm = this._habboMain.habboCommunication;
        const demo = this._habboMain.communicationDemo;
        const ssoTicket = comm.ssoTicket;

        if(!ssoTicket || ssoTicket.length === 0)
        {
            throw new Error('[Vortex] Login without an SSO ticket is not supported');
        }

        log.debug('Connecting to server...');

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
    // AS3: sources/win63_version/habbo/communication/demo/class_467.as::dispose()
    public dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;

        log.info('Disposing Vortex...');

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
    async init(config?: IVortexConfig, loadingScreen?: IVortexLoadingScreen): Promise<void>
    {
        if(this._ready)
        {
            log.warn('Already initialized');
            return;
        }

        this._loadingScreen = loadingScreen ?? null;

        Vortex.trackLoginStep('client.init.start');

        try
        {
            log.info('Initializing Vortex...');

            // Flash's `Bitmap.smoothing` defaults to **false**, and every canvas2D path in this
            // port already sets `imageSmoothingEnabled = false` to match. The PixiJS layer was the
            // one that did not: its textures defaulted to linear filtering, which is invisible
            // while a surface is drawn 1:1 and turns to mush the moment one is scaled — the room
            // previewer upscales its canvas by `room_previewer:zoom` (2 in the avatar editor), and
            // that preview came out blurred.
            //
            // Set before the Application so every texture created afterwards inherits it.
            TextureSource.defaultOptions.scaleMode = 'nearest';

            // 1. Create PixiJS application (= AS3 stage setup in HabboAir.tryInit)
            this._application = new Application();

            await this._application.init({
                background: config?.background ?? '#000000',
                resizeTo: config?.resizeTo ?? window,
                // AS3 Flash stage renders at logical pixel resolution. Defaulting Pixi to
                // devicePixelRatio + antialias makes the room canvas much heavier and blurs
                // pixel-art assets; callers can still override both via config.
                antialias: config?.antialias ?? true,
                resolution: config?.resolution ?? 1,
                autoDensity: true,
                // `multiView: true` used to be set here, to silence
                // GlContextSystem.ensureCanvasSize()'s "multiView is disabled, but targetCanvas is
                // not the main canvas" warning on the widgets that read pixels back via
                // renderer.extract.canvas(). It was removed on 2026-08-16: it cost a full-viewport
                // composite on *every* frame and bought nothing.
                //
                // What the flag actually does (PixiJS 8.16): GlContextSystem.init() moves the GL
                // context onto a private offscreen canvas, and GlRenderTargetAdaptor.postrender()
                // then runs `canvasSource.context2D.drawImage(contextCanvas, ...)` after every
                // render targeting a CanvasSource - i.e. the visible canvas becomes a 2D canvas
                // repainted from the GL one once per frame.
                //
                // What it does *not* do is make the readback correct. GlRenderTargetAdaptor
                // .initGpuRenderTarget() takes its `colorTexture instanceof CanvasSource` branch
                // and leaves `framebuffer = null` in both modes, so getPixels() reads the default
                // framebuffer - the screen - rather than the texture. Measured on this exact PixiJS
                // build, extracting a canvas-backed texture over a blue screen:
                //
                //   extract.canvas(Texture.from({resource: canvas}))  multiView on/off -> blue (wrong)
                //   extract.canvas(Texture.from(imageBitmap))         multiView on/off -> correct
                //   extract.canvas(Container)                         multiView on/off -> correct
                //   drawImage() off texture.source.resource           multiView on/off -> correct
                //
                // The single behavioural difference between the two modes is that one warning. The
                // callers that hit the broken case already avoid extract for exactly this reason
                // (AvatarImageWidget.textureToImageBitmap(), AvatarTextureUtils.toCanvasSource(),
                // RoomEngine.blitTextureFrame(), RoomObjectSpriteVisualization
                // .textureFrameToCanvas()) - which is also what AS3 did, since BitmapData
                // .getVector() is a plain CPU read with no renderer involved.
            });

            this.instrumentRendererTimings(this._application);

            // Append canvas to target
            const target = config?.canvas ?? document.body;
            target.appendChild(this._application.canvas);

            // 2. Create and init engine orchestrator (= HabboAirMain)
            this._habboMain = new VortexMain(this._loadingScreen);

            await this._habboMain.init(this._application, config);

            this._ready = true;

            // Register unload handler
            this._unloadHandler = () => this.unloading();

            window.addEventListener('beforeunload', this._unloadHandler);

            this._events.emit('ready');

            log.info('Ready!');
        }
        catch (error)
        {
            Vortex.trackLoginStep('client.init.core.fail');
            Vortex.reportCrash(
                error instanceof Error ? error.message : String(error),
                'init',
                true,
                error instanceof Error ? error : undefined
            );

            throw error;
        }
    }

    /**
     * Brackets every PixiJS draw submission so the `:showstats` overlay can report it.
     *
     * `runners.prerender` / `runners.postrender` wrap the whole of `AbstractRenderer.render()`, and
     * they fire for render-to-texture passes too, so a frame's `pixi` figure is the sum of every
     * pass in it. FrameTimings.begin()/end() nest, which keeps a pass triggered from inside another
     * from being counted twice.
     *
     * Left on unconditionally: it costs two `performance.now()` calls per render, and gating it on
     * the overlay would mean toggling `:showstats` shows a number that needs ~50 frames to mean
     * anything.
     */
    // TS-only: no AS3 counterpart; Flash had no separate draw-submission stage to measure.
    private instrumentRendererTimings(application: Application): void
    {
        const {renderer} = application;

        if(!renderer?.runners?.prerender || !renderer.runners.postrender) return;

        renderer.runners.prerender.add({prerender: () => FrameTimings.begin(FRAME_CHANNEL_PIXI)});
        renderer.runners.postrender.add({postrender: () => FrameTimings.end(FRAME_CHANNEL_PIXI)});
    }

    /**
	 * Handle browser unload event.
	 *
	 * @see sources/win63_2021_version/HabboAirMain.as unloading()
	 */
    // AS3: .../src/binaryData/HabboAir.as::unloading()
    unloading(): void
    {
        try
        {
            if(Core.instance && !this._disposed)
            {
                this._events.emit('unload');
            }
        }
        catch (_error)
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
