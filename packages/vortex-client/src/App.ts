import type {IVortexConfig} from 'vortex-engine';
import {Vortex} from 'vortex-engine';
import {AssetTypeDeclaration} from '@core/assets/AssetTypeDeclaration';
import {UnknownAsset} from '@core/assets/UnknownAsset';
import {HabboToolbarEnum} from '@habbo/toolbar/HabboToolbarEnum';
import {RoomEngineEvent} from '@habbo/room/events/RoomEngineEvent';
import type {ISkinData} from '@core/window';
import type {IWindow} from '@core/window/IWindow';
import type {WindowController} from '@core/window/WindowController';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {WindowMouseOperator} from '@core/window/services/WindowMouseOperator';
import {Logger} from '@core/utils/Logger';
import type {IElementDescriptionData} from '@habbo/window';
import type {RoomUI} from '@habbo/ui/RoomUI';
import type {RoomDesktop} from '@habbo/ui/RoomDesktop';
import type {VortexLoadingScreen} from './VortexLoadingScreen';
import {AssetBundle} from './AssetBundle';
import {LoginFlow} from './login/LoginFlow';
import {ChangelogWindow} from './changelog/ChangelogWindow';
import {installWindowDebugger} from './debugger/WindowDebuggerOverlay';
import {
    type IWindowLayoutXmlData,
    parseElementDescriptionXml,
    parseSkinXml,
    parseWindowLayoutXml
} from './window/WindowXmlAssetParser';
import './_index.scss';

const log = Logger.getLogger('VortexApp');

/**
 * The element description's asset name.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/HabboWindowManagerComponent.as::init()
 * asks for it by this exact name; build-window-assets.mjs emits it under the same name, so the
 * bundle key and the AS3 asset name are the one string.
 */
const ELEMENT_DESCRIPTION_ASSET = 'habbo_element_description_xml';

/**
 * Atlas spritesheet names that need to be decoded as ImageBitmaps.
 *
 * Every compiled window-skin template references one of these by name (the
 * `templates[].asset` field in `window-skins/*.xml`) — this must cover every
 * distinct name any compiled skin uses, or that skin's pieces silently never render.
 */
const ATLAS_NAMES = [
    'habbo_blue_skin',
    'habbo_skin_ubuntu',
    'habbo_skin_illumina_dark',
    'habbo_skin_illumina_light',
    'habbo_icons',
    'skin_ubuntu_bg_9',
    'habbo_border_hsv_layers',
    'habbo_border_hsv_layers2',
    'leaderboard_button_close',
    'ubuntu_frame_leaderboard_ach',
    'ubuntu_frame_leaderboard_all',
    'ubuntu_frame_leaderboard_rarity_1',
    'ubuntu_frame_leaderboard_rarity_2',
    'ubuntu_frame_leaderboard_rarity_3',
    'ubuntu_frame_leaderboard_rarity_4',
    'ubuntu_frame_leaderboard_rarity_5',
    'ubuntu_frame_leaderboard_rarity_uncommon',
    'illumina_dark_scrollbar_horizontal',
    'illumina_dark_scrollbar_vertical',
    'illumina_light_balloon',
    'illumina_light_border_etched',
    'illumina_light_border_frame',
    'illumina_light_border_infobox',
    'illumina_light_border_light',
    'illumina_light_border_raised',
    'illumina_light_border_sunk',
    'illumina_light_bubble_chat_bg',
    'illumina_light_button_default',
    'illumina_light_button_dark_recolorable',
    'illumina_light_button_frame_close',
    'illumina_light_button_frame_menu',
    'illumina_light_button_frame_minimize',
    'illumina_light_button_multi',
    'illumina_light_button_unetched',
    'illumina_light_checkbox_basic',
    'illumina_light_input_chat',
    'illumina_light_radio_button',
    'illumina_light_scrollbar_horizontal',
    'illumina_light_scrollbar_vertical',
    'illumina_light_switch',
    'illumina_purple_border_frame',
    'illumina_purple_button_default',
    'illumina_purple_button_frame_close',
];

/**
 * Atlas names whose embedded-asset name doesn't match its file on disk.
 * `skin_ubuntu_bg_9` is the AS3 variable name (`HabboWindowManagerCom.as`); the
 * actual bundled file is `ubuntu_bg_9.png` (the embedded resource's own name).
 */
const ATLAS_FILE_OVERRIDES: Record<string, string> = {
    skin_ubuntu_bg_9: 'ubuntu_bg_9',
};

const EMBEDDED_AVATAR_XML_ASSET_NAMES = [
    'action_offset_lay',
    'action_offset_swim',
    'HabboAvatarAnimation',
    'HabboAvatarFigure',
    'HabboAvatarGeometry',
    'HabboAvatarPartSets',
];

function parseJson<T>(value: string): T | null 
{
    try 
    {
        return JSON.parse(value) as T;
    }
    catch (_error) 
    {
        return null;
    }
}

function parseElementDescriptionFromBundle(raw: string, source: string): IElementDescriptionData | null
{
    return parseElementDescriptionXml(raw, ELEMENT_DESCRIPTION_ASSET, source);
}

function parseSkinFromBundle(raw: string, skinId: string, source: string): ISkinData | null
{
    return parseSkinXml(raw, skinId, source);
}

/**
 * Registers the bundled webfonts with the browser's FontFace API.
 *
 * The .ttf files are bundled (they land in the "xml"/other-binary bundle
 * alongside XML/text assets — anything that isn't an image extension), but
 * nothing was ever loading them: `TextStyleManager.mapFontFace()` emits CSS
 * `font-family: "Volter (Goldfish)", Ubuntu, Arial, sans-serif` (and plain
 * "Ubuntu"), expecting those families to already be registered. Without this,
 * every window/button caption silently falls back to Arial/sans-serif — no
 * console warning, since an unregistered CSS font-family is just skipped.
 *
 * Two more real mismatches of the same kind, both previously unregistered
 * under any name:
 * - Chat bubbles use the plain family `"Volter"` (`ChatStyleLibrary.as`'s
 *   real default — verified byte-for-byte at `ChatStyleLibrary.as:114` in
 *   the primary `WIN63-202607011411-782849652` source — no "(Goldfish)"
 *   suffix, and none of the 89 real chat styles in `chatstyles_xml.xml`
 *   override it), which never matched the `"Volter (Goldfish)"` registration
 *   above, so chat text silently rendered in the browser default font.
 * - `"UbuntuThick"` is used verbatim as a literal `font_face` in real AS3
 *   layout XML (`games_main`, `snowwar_*`) but isn't derived from
 *   `TextStyleManager` at all, so it was never registered under any name.
 */
const WEBFONT_FACES: Array<{ family: string; file: string; weight?: string; style?: string }> = [
    {family: 'Volter (Goldfish)', file: 'webfonts/Volter.ttf', weight: 'normal'},
    {family: 'Volter (Goldfish)', file: 'webfonts/Volter Bold.ttf', weight: 'bold'},
    {family: 'Volter', file: 'webfonts/Volter.ttf', weight: 'normal'},
    {family: 'Volter', file: 'webfonts/Volter Bold.ttf', weight: 'bold'},
    {family: 'Ubuntu', file: 'webfonts/Ubuntu.ttf', weight: 'normal', style: 'normal'},
    {family: 'Ubuntu', file: 'webfonts/Ubuntu-b.ttf', weight: 'bold'},
    {family: 'Ubuntu', file: 'webfonts/Ubuntu-i.ttf', style: 'italic'},
    {family: 'Ubuntu', file: 'webfonts/Ubuntu-ib.ttf', weight: 'bold', style: 'italic'},
    {family: 'Ubuntu Condensed', file: 'webfonts/Ubuntu-C.ttf', weight: 'normal'},
    {family: 'UbuntuThick', file: 'webfonts/Ubuntu-thick-b.ttf', weight: 'normal'},
];

async function loadWebFonts(bundle: AssetBundle): Promise<void> 
{
    await Promise.all(WEBFONT_FACES.map(async ({family, file, weight, style}) => 
    {
        const bytes = bundle.getBytes(file);

        if(!bytes) 
        {
            log.warn(`Webfont not found in bundle: ${file}`);

            return;
        }

        try 
        {
            const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
            const face = new FontFace(family, buffer, {weight, style});

            await face.load();
            document.fonts.add(face);
        }
        catch (error) 
        {
            log.warn(`Failed to load webfont ${file}:`, error);
        }
    }));
}

function readEmbeddedConfigurationAssets(bundle: AssetBundle): Record<string, string>
{
    const assets: Record<string, string> = {};
    const commonConfiguration = bundle.getText('configurations/common_configuration_txt.txt');
    const localizationConfiguration = bundle.getText('configurations/localization_configuration_txt.txt');

    if(commonConfiguration !== null)
    {
        assets.common_configuration = commonConfiguration;
    }

    if(localizationConfiguration !== null)
    {
        assets.localization_configuration = localizationConfiguration;
    }

    const bundleKeys = bundle.listKeys();

    for(const assetName of EMBEDDED_AVATAR_XML_ASSET_NAMES)
    {
        const content = readEmbeddedAvatarXmlAsset(bundle, bundleKeys, assetName);

        if(content !== null)
        {
            assets[assetName] = content;
        }
    }

    const chatStylesXml = bundle.getText('configurations/chatstyles_xml.xml');

    if(chatStylesXml !== null)
    {
        assets.chatstyles_xml = chatStylesXml;
    }

    const chatStylesManifest = readChatStylesManifest(bundle);

    if(chatStylesManifest)
    {
        for(const [styleId, flags] of Object.entries(chatStylesManifest))
        {
            if(!flags.hasRegpoints) continue;

            const content = bundle.getText(`configurations/style_${styleId}_regpoints.txt`);

            if(content !== null) assets[`style_${styleId}_regpoints`] = content;
        }
    }

    return assets;
}

interface IChatStyleAssetFlags
{
    hasBase: boolean;
    hasPointer: boolean;
    hasEmblem: boolean;
    hasEmblemMultiline: boolean;
    hasIcon: boolean;
    hasColor: boolean;
    hasSelectorPreview: boolean;
    hasRegpoints: boolean;
}

const CHAT_STYLE_IMAGE_SUFFIX_BY_FLAG: Record<string, string> = {
    hasBase: 'chat_bubble_base',
    hasPointer: 'chat_bubble_pointer',
    hasEmblem: 'chat_bubble_emblem',
    hasEmblemMultiline: 'chat_bubble_emblem_multiline',
    hasIcon: 'icon',
    hasColor: 'chat_bubble_color',
    hasSelectorPreview: 'selector_preview',
};

function readChatStylesManifest(bundle: AssetBundle): Record<string, IChatStyleAssetFlags> | null
{
    const raw = bundle.getText('configurations/chatstyles-manifest.json');

    if(raw === null) return null;

    return parseJson<Record<string, IChatStyleAssetFlags>>(raw);
}

/**
 * Registers every extracted chat-style bitmap (packages/vortex-client/tools/
 * import-chatstyles.mjs's output) into AssetLibrary as a raw ImageBitmap - NOT through
 * the standard image/png -> BitmapDataAsset pipeline (registerImageAssets() below, blob
 * URLs consumed by WindowManager), because ChatStyle.ts::getNewBackgroundSprite() draws
 * these directly via OffscreenCanvas.drawImage(), which needs a real ImageBitmap, not the
 * PixiJS Texture BitmapDataAsset.content would return.
 *
 * TS-only: no AS3 equivalent, this is infrastructure for the web port's asset bundling.
 */
async function registerChatStyleImageAssets(vortex: Vortex, imageBundle: AssetBundle, xmlBundle: AssetBundle): Promise<void>
{
    const manifest = readChatStylesManifest(xmlBundle);

    if(!manifest) return;

    const declaration = vortex.assets.getAssetTypeDeclarationByMimeType('application/octet-stream')
		?? new AssetTypeDeclaration('application/octet-stream', UnknownAsset);

    const tasks: Promise<void>[] = [];

    for(const [styleId, flags] of Object.entries(manifest))
    {
        for(const [flagKey, suffix] of Object.entries(CHAT_STYLE_IMAGE_SUFFIX_BY_FLAG))
        {
            if(!flags[flagKey as keyof IChatStyleAssetFlags]) continue;

            const assetName = `style_${styleId}_${suffix}`;

            tasks.push(imageBundle.getImageBitmap(`images/${assetName}.png`).then((bitmap) =>
            {
                if(!bitmap) return;

                const asset = new UnknownAsset(declaration, assetName);

                asset.setUnknownContent(bitmap);
                vortex.assets.setAsset(assetName, asset, true);
            }));
        }
    }

    await Promise.all(tasks);
}

function readEmbeddedAvatarXmlAsset(bundle: AssetBundle, bundleKeys: string[], assetName: string): string | null 
{
    const candidates = [
        `configurations/${assetName}.xml`,
        `configurations/${assetName}_xml.xml`,
        `configurations/${assetName}.json`,
        `avatar/${assetName}.xml`,
        `avatar/${assetName}_xml.xml`,
        `${assetName}.xml`,
        `${assetName}_xml.xml`,
    ];

    for(const candidate of candidates) 
    {
        const content = bundle.getText(candidate);

        if(content !== null) 
        {
            return content;
        }
    }

    const suffixMatch = bundleKeys.find((key) => 
    {
        return key.endsWith(`/${assetName}.xml`)
            || key.endsWith(`/${assetName}_xml.xml`)
            || key.endsWith(`/${assetName}.json`);
    });

    return suffixMatch ? bundle.getText(suffixMatch) : null;
}

function parseLayoutEntries(raw: string, source: string, baseName: string): IWindowLayoutXmlData[]
{
    return parseWindowLayoutXml(raw, baseName, source);
}

declare global 
{
    interface Window {
        VortexConfig?: IVortexConfig;
    }
}

/**
 * VortexApp — Canvas-based application shell.
 *
 * Replaces the SolidJS rendering pipeline with a single `<canvas>` element.
 * The engine's WindowRenderer composites all window layers into an OffscreenCanvas,
 * which is then drawn onto the DOM canvas via requestAnimationFrame. Mouse events
 * on the canvas are hit-tested against the window tree and dispatched to the
 * appropriate WindowController.
 *
 * This mirrors the AS3 pattern where WindowRenderer composed everything into a
 * single BitmapData displayed as a Bitmap on the Stage.
 */
export class VortexApp 
{
    private _canvas: HTMLCanvasElement | null = null;
    private _ctx: CanvasRenderingContext2D | null = null;
    private _animFrameId: number = 0;
    private _uiCompositeDirty: boolean = true;
    private _lastUiRenderVersion: number = -1;
    private _disposed: boolean = false;
    private _loadingScreen: VortexLoadingScreen | null;
    private _imageBundle: AssetBundle | null = null;
    private _xmlBundle: AssetBundle | null = null;
    private _changelogWindow: ChangelogWindow | null = null;
    private _uninstallWindowDebugger: (() => void) | null = null;

    /** Last hovered window for OVER/OUT tracking. */
    private _lastHoveredWindow: IWindow | null = null;

    /** Whether the mouse button is currently down. */
    private _mouseDown: boolean = false;

    /** The window that received the last DOWN event (for drag/UP tracking). */
    private _mouseDownWindow: IWindow | null = null;

    /** Double-click detection: timestamp/window/position of the last synthesized CLICK. */
    private _lastClickTime: number = 0;
    private _lastClickWindow: IWindow | null = null;
    private _lastClickX: number = 0;
    private _lastClickY: number = 0;

    /** Max gap (ms) and pointer travel (px) between two clicks to count as a double-click. */
    private static readonly DOUBLE_CLICK_MS: number = 350;
    private static readonly DOUBLE_CLICK_DIST: number = 8;

    /** Document-level mousemove handler (for drag/scale). */
    private _docMoveHandler: ((e: MouseEvent) => void) | null = null;

    /** Document-level mouseup handler (for drag/scale). */
    private _docUpHandler: ((e: MouseEvent) => void) | null = null;

    /** Whether we are currently in a room (for mouse event routing). */
    private _isInRoom: boolean = false;

    /** Active room ID for mouse routing. */
    private _activeRoomId: number = -1;

    /**
     * Reusable scratch point for getGlobalPosition() in the mouse handlers.
     * The mouse-move/wheel paths run per DOM event (and per parent-chain step),
     * so a shared scratch avoids allocating a fresh {x, y} on every hit-test.
     * getGlobalPosition() overwrites x/y and the caller consumes them
     * synchronously before the next use, so a single instance is safe.
     */
    private readonly _globalPosScratch = {x: 0, y: 0};

    constructor(loadingScreen?: VortexLoadingScreen)
    {
        this._loadingScreen = loadingScreen ?? null;
    }

    /**
     * Initializes the application.
     *
     * Bootstraps the engine, loads the asset bundle, configures skins/layouts,
     * creates the canvas, and starts the render loop.
     *
     * @see sources/win63_2021_version/HabboAir.as
     */
    public async init(): Promise<void>
    {
        // DEBUG in dev, WARN in production; overridable per-logger via localStorage
        // (see Logger.configureFromEnvironment) without a rebuild.
        Logger.configureFromEnvironment(import.meta.env.DEV);

        // 1. Load bundles, then bootstrap engine with AS3 embedded configuration assets
        const CORE_RATIO = 0.6;
        const bundleProgress =
            {
                images: 0,
                xml: 0
            };
        const updateBundleProgress = (): void => 
        {
            const ratio = (bundleProgress.images + bundleProgress.xml) / 2;

            this._loadingScreen?.updateLoadingBar(ratio * CORE_RATIO);
        };

        const [imageBundle, xmlBundle] = await Promise.all([
            AssetBundle.load('/assets-images.bundle', (ratio: number) => 
            {
                bundleProgress.images = ratio;
                updateBundleProgress();
            }),
            AssetBundle.load('/assets-xml.bundle', (ratio: number) => 
            {
                bundleProgress.xml = ratio;
                updateBundleProgress();
            }),
        ]);

        const bundledConfigurations = readEmbeddedConfigurationAssets(xmlBundle);
        const vortexConfig: IVortexConfig = {
            ...(window.VortexConfig ?? {}),
            embeddedConfigurations: {
                ...bundledConfigurations,
                ...(window.VortexConfig?.embeddedConfigurations ?? {}),
            },
        };
        const vortex = await Vortex.bootstrap(vortexConfig, this._loadingScreen ?? undefined);

        if(import.meta.env.DEV) 
        {
            // Dev-only console access, e.g. Vortex.instance.configuration.getProperty('...').
            // Vortex is only ever ES-module-imported elsewhere, so without this the class
            // (and its `instance` singleton getter) isn't reachable from the browser console.
            (window as unknown as { Vortex: typeof Vortex }).Vortex = Vortex;
        }

        this._imageBundle = imageBundle;
        this._xmlBundle = xmlBundle;

        // Register bundled webfonts (Volter/Ubuntu) before anything renders text —
        // see loadWebFonts() for why this was previously silently missing.
        await loadWebFonts(xmlBundle);

        // Chat-style bitmaps need real ImageBitmaps (not the standard image/png ->
        // BitmapDataAsset/Texture pipeline) - see registerChatStyleImageAssets()'s own
        // header comment for why. chatstyles_xml/regpoints text already went in above via
        // embeddedConfigurations.
        await registerChatStyleImageAssets(vortex, imageBundle, xmlBundle);

        // Mount the "What's New" changelog button now, not after login/connect —
        // it's an independent overlay (not a room/toolbar window) and should stay
        // visible even while stuck on the login flow or waiting on the backend.
        this._changelogWindow = new ChangelogWindow();
        this._changelogWindow.mount();

        // 2. Load element descriptions + atlas bitmaps from bundle
        try 
        {
            const elementDescriptionKey = `window-skins/${ELEMENT_DESCRIPTION_ASSET}.xml`;
            const elementDescriptionXml = xmlBundle.getText(elementDescriptionKey);

            if(elementDescriptionXml)
            {
                const elementDescription = parseElementDescriptionFromBundle(
                    elementDescriptionXml,
                    elementDescriptionKey
                );

                if(elementDescription) 
                {
                    vortex.windowManager.loadElementDescription(elementDescription);
                }
            }

            // Decode atlas spritesheets as ImageBitmaps
            const bitmaps = await Promise.all(
                ATLAS_NAMES.map(name => imageBundle.getImageBitmap(`images/${ATLAS_FILE_OVERRIDES[name] ?? name}.png`))
            );

            const atlases = new Map<string, ImageBitmap>();

            for(let i = 0; i < ATLAS_NAMES.length; i++) 
            {
                const bmp = bitmaps[i];

                if(bmp) atlases.set(ATLAS_NAMES[i], bmp);
            }

            // Load all skin XMLs from bundle
            const skins = new Map<string, ISkinData>();

            for(const key of xmlBundle.listKeys('window-skins/'))
            {
                if(key === elementDescriptionKey)
                {
                    continue;
                }

                const skinXml = xmlBundle.getText(key);

                if(!skinXml)
                {
                    continue;
                }

                // The bundle key's basename is the AS3 asset name (build-window-assets.mjs).
                const skinId = key.split('/').pop()!.replace(/\.xml$/, '');
                const skin = parseSkinFromBundle(skinXml, skinId, key);

                if(skin) skins.set(skin.id, skin);
            }

            vortex.windowManager.loadSkinAssets(skins, atlases);
        }
        catch (error) 
        {
            log.warn('Failed to load skin/element assets:', error);
        }

        // 3. Register all window layouts from XML bundle
        for(const key of xmlBundle.listKeys('window-layouts/')) 
        {
            const layoutXml = xmlBundle.getText(key);

            if(!layoutXml) 
            {
                continue;
            }

            // The bundle key's basename is the AS3 asset name (build-window-assets.mjs).
            const layoutBaseName = key.split('/').pop()!.replace(/\.xml$/, '');
            let layouts: IWindowLayoutXmlData[];

            try
            {
                layouts = parseLayoutEntries(layoutXml, key, layoutBaseName);
            }
            catch (error) 
            {
                log.warn(`Failed to parse layout XML: ${key}`, error);
                continue;
            }

            for(const layout of layouts) 
            {
                const name = layout.name;

                if(typeof name === 'string' && name.length > 0) 
                {
                    vortex.windowManager.registerWidgetLayout(name, layout.xml);
                }
            }
        }

        // 4. Wait for AS3 authentication before creating the visible client UI.
        const ssoTicket = window.VortexConfig?.connection?.ssoTicket;

        if(!ssoTicket) 
        {
            await this.showLoginFlow();
        }
        else 
        {
            await vortex.connect();
        }

        // 5. Dispose loading screen before creating canvas (prevents white flash)
        if(this._loadingScreen) 
        {
            this._loadingScreen.dispose();
            this._loadingScreen = null;
        }

        // 6. Create the canvas and set desktop sizes BEFORE creating windows
        this.createCanvas();

        // Dev-only visual window debugger (Ctrl+Shift+D). Never bundled in
        // production — import.meta.env.DEV is statically stripped by Vite.
        if(import.meta.env.DEV && this._canvas)
        {
            this._uninstallWindowDebugger = installWindowDebugger(this._canvas);
        }

        // 7. Register all image blob URLs with the resource manager
        this.registerImageAssets();

        // 8. Initialize the Friend Bar (landing view) — desktops are now sized
        vortex.initFriendBar();

        // 9. Activate the toolbar (hotel view by default)
        vortex.toolbar.setToolbarState(HabboToolbarEnum.TOOLBAR_STATE_HOTEL_VIEW);

        // 10. Listen for room state changes to track when we are in a room
        this.setupRoomStateTracking();

        // 11. Flush microtasks
        await Promise.resolve();

        // 12. Start input and render loop
        this.setupMouseEvents();
        this.startRenderLoop();
    }

    /**
     * Disposes the application and cleans up resources.
     */
    public dispose(): void 
    {
        if(this._disposed) return;

        this._disposed = true;

        this._uninstallWindowDebugger?.();
        this._uninstallWindowDebugger = null;

        if(this._changelogWindow)
        {
            this._changelogWindow.dispose();
            this._changelogWindow = null;
        }

        // Stop render loop
        if(this._animFrameId) 
        {
            cancelAnimationFrame(this._animFrameId);
            this._animFrameId = 0;
        }

        // Remove event listeners
        window.removeEventListener('resize', this._onResize);

        if(this._canvas) 
        {
            this._canvas.removeEventListener('mousedown', this._onMouseDown);
            this._canvas.removeEventListener('mousemove', this._onMouseMove);
            this._canvas.removeEventListener('mouseup', this._onMouseUp);
            this._canvas.removeEventListener('wheel', this._onWheel);
            this._canvas.removeEventListener('contextmenu', this._onContextMenu);
        }

        if(this._docMoveHandler) 
        {
            document.removeEventListener('mousemove', this._docMoveHandler);
        }

        if(this._docUpHandler) 
        {
            document.removeEventListener('mouseup', this._docUpHandler);
        }

        // Revoke blob URLs
        if(this._imageBundle) 
        {
            this._imageBundle.dispose();
            this._imageBundle = null;
        }

        if(this._xmlBundle) 
        {
            this._xmlBundle.dispose();
            this._xmlBundle = null;
        }

        // Remove canvas from DOM
        this._canvas?.remove();
        this._canvas = null;
        this._ctx = null;
        this._lastHoveredWindow = null;
        this._mouseDownWindow = null;
        this._isInRoom = false;
        this._activeRoomId = -1;
    }

    /**
     * Shows the login flow overlay and waits for the user to complete login.
     *
     * AS3: HabboAir creates LoginFlow when no SSO ticket is in FlashVars.
     * The LoginFlow runs as a standalone Sprite before the main client starts.
     * When complete, it provides an SSO token that is passed to the engine.
     *
     * @see sources/win63_2021_version/login/LoginFlow.as
     * @returns Promise that resolves when the login flow finishes
     */
    private showLoginFlow(): Promise<void> 
    {
        return new Promise((resolve, reject) => 
        {
            const vortex = Vortex.instance;
            const loginFlow = new LoginFlow(vortex.configuration);

            loginFlow.init();

            loginFlow.loginEvents.once(LoginFlow.LOGIN_FLOW_FINISHED_EVENT, async () => 
            {
                try 
                {
                    const token = loginFlow.ssoToken;

                    if(!token) 
                    {
                        throw new Error('[VortexApp] Login flow finished without SSO ticket');
                    }

                    // Set the SSO ticket on the communication manager
                    vortex.habboCommunication.ssoTicket = token;

                    // Update the global config so connect() picks it up
                    if(window.VortexConfig?.connection) 
                    {
                        window.VortexConfig.connection.ssoTicket = token;
                    }

                    // Trigger the connection and wait for AS3 AUTHENTICATED before continuing.
                    await vortex.connect();

                    loginFlow.dispose();
                    resolve();
                }
                catch (error) 
                {
                    const message = error instanceof Error ? error.message : String(error);

                    loginFlow.showErrorMessage(message);
                    reject(error);
                }
            });
        });
    }

    /**
     * Sets up room state tracking by listening to room engine events.
     * Updates `_isInRoom` to control mouse event routing.
     */
    private setupRoomStateTracking(): void 
    {
        const vortex = Vortex.instance;

        vortex.roomEngine.events.on(RoomEngineEvent.REE_INITIALIZED, (event: RoomEngineEvent) =>
        {
            this._isInRoom = true;
            this._activeRoomId = event.roomId;
        });

        vortex.roomEngine.events.on(RoomEngineEvent.REE_DISPOSED, (_event: RoomEngineEvent) =>
        {
            this._isInRoom = false;
            this._activeRoomId = -1;
        });
    }

    /**
     * Forwards a mouse event to the room engine via RoomDesktop.
     * Called when no UI window intercepted the event and we are in a room.
     */
    private forwardToRoomEngine(x: number, y: number, type: string, e: MouseEvent): void 
    {
        const vortex = Vortex.instance;

        try 
        {
            const roomUI = vortex.roomUI as RoomUI;
            const desktop = roomUI.getDesktopForRoom(this._activeRoomId) as RoomDesktop | null;

            if(desktop) 
            {
                desktop.canvasMouseHandler(
                    x, y, type,
                    e.altKey, e.ctrlKey, e.shiftKey,
                    e.buttons > 0
                );
            }
        }
        catch
        {
            // RoomUI not yet initialized
        }
    }

    /**
     * Registers all image asset blob URLs with the engine's ResourceManager.
     *
     * Creates blob URLs from the bundle for each PNG image and registers
     * them with the WindowManager. The ResourceManager will lazily decode
     * the ImageBitmap on first request.
     *
     * @see sources/win63_version/habbo/window/ResourceManager.as
     */
    private registerImageAssets(): void 
    {
        if(!this._imageBundle) return;

        const vortex = Vortex.instance;

        for(const key of this._imageBundle.listKeys('images/')) 
        {
            // Extract asset name: 'images/icons_toolbar_reception_normal.png' → 'icons_toolbar_reception_normal'
            const name = key.split('/').pop()!.replace('.png', '');
            const url = this._imageBundle.getUrl(key);

            if(url)
            {
                vortex.windowManager.registerAssetUrl(name, url);
            }

            // registerAssetUrl() only feeds the window manager's *URL* registry, which serves window
            // skins. Anything that reads a bitmap out of the asset library instead - every
            // CatalogWidget.getAssetBitmapData() caller, e.g. ColourGridCatalogWidget's swatches and
            // RecyclerCatalogWidget's slot background - looks the name up in vortex.assets and got
            // null, so those bitmaps rendered blank/white.
            //
            // Decode and register the catalog bitmaps into the asset library too, the same way the
            // chat-style images already are. Scoped to a few prefixes rather than the whole
            // images/ bundle: this eagerly decodes an ImageBitmap per entry, and nothing else needs
            // library access today.
            // - ctlg_*: catalog swatches/slot backgrounds.
            // - fx_icon_* / memenu_fx_*: the me-menu EffectsWidget rows read these programmatically
            //   (effect icon + play/pause hilite) via assets.getAssetByName(...).content.
            if(name.startsWith('ctlg_') || name.startsWith('fx_icon_') || name.startsWith('memenu_fx_'))
            {
                const declaration = vortex.assets.getAssetTypeDeclarationByMimeType('application/octet-stream')
                    ?? new AssetTypeDeclaration('application/octet-stream', UnknownAsset);

                void this._imageBundle.getImageBitmap(key).then((bitmap) =>
                {
                    if(!bitmap) return;

                    const asset = new UnknownAsset(declaration, name);

                    asset.setUnknownContent(bitmap);
                    vortex.assets.setAsset(name, asset, true);
                });
            }
        }
    }

    /**
     * Creates the canvas element and appends it to the DOM.
     */
    private createCanvas(): void 
    {
        const container = document.getElementById('vortex-ui');

        if(!container) return;

        // Clear any loading content
        container.innerHTML = '';

        this._canvas = document.createElement('canvas');
        this._canvas.id = 'vortex-canvas';
        this._canvas.style.position = 'absolute';
        this._canvas.style.top = '0';
        this._canvas.style.left = '0';
        this._canvas.style.imageRendering = 'pixelated';

        container.appendChild(this._canvas);

        this._ctx = this._canvas.getContext('2d');

        this.resizeCanvas();

        window.addEventListener('resize', this._onResize);
    }

    /** Bound resize handler. */
    private _onResize = (): void =>
    {
        this.resizeCanvas();
    };

    /**
     * Resizes the canvas to match the viewport.
     *
     * Sets the canvas width/height attributes directly to the viewport size.
     * No DPR scaling — the canvas pixel buffer matches CSS pixels 1:1.
     */
    private resizeCanvas(): void 
    {
        if(!this._canvas) return;

        const w = window.innerWidth;
        const h = window.innerHeight;

        this._canvas.width = w;
        this._canvas.height = h;
        this._uiCompositeDirty = true;

        // Update desktop sizes in each context layer
        const vortex = Vortex.instance;

        for(let i = 0; i < 4; i++) 
        {
            const desktop = vortex.windowManager.getDesktop(i);

            if(desktop) 
            {
                desktop.width = w;
                desktop.height = h;
            }
        }
    }

    /**
     * Starts the render loop using requestAnimationFrame.
     */
    private startRenderLoop(): void 
    {
        const loop = (): void => 
        {
            if(this._disposed) return;

            const vortex = Vortex.instance;

            if(vortex.disposed || !vortex.isReady) 
            {
                this._animFrameId = 0;
                return;
            }

            this.renderFrame();

            this._animFrameId = requestAnimationFrame(loop);
        };

        this._animFrameId = requestAnimationFrame(loop);
    }

    /**
     * Renders a single frame.
     *
     * Renders all dirty windows, composites the full tree,
     * then blits the result onto the DOM canvas.
     */
    private renderFrame(): void 
    {
        if(!this._canvas || !this._ctx) return;

        const vortex = Vortex.instance;

        if(vortex.disposed || !vortex.isReady) 
        {
            return;
        }

        const windowManager = vortex.windowManager;
        const renderer = windowManager.getWindowRenderer();

        if(!renderer) return;

        if(!this._uiCompositeDirty &&
            !renderer.hasPendingUpdates() &&
            renderer.renderVersion === this._lastUiRenderVersion) 
        {
            return;
        }

        // Process any pending render queue
        renderer.render();

        // Composite all layers into the buffer
        const w = this._canvas.width;
        const h = this._canvas.height;

        const buffer = windowManager.compositeToBuffer(w, h);

        if(!buffer) return;

        // Blit composite buffer onto the DOM canvas
        const ctx = this._ctx;

        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(buffer, 0, 0);
        this._uiCompositeDirty = false;
        this._lastUiRenderVersion = renderer.renderVersion;
    }

    /**
     * Sets up mouse event listeners on the canvas.
     */
    private setupMouseEvents(): void 
    {
        if(!this._canvas) return;

        this._canvas.addEventListener('mousedown', this._onMouseDown);
        this._canvas.addEventListener('mousemove', this._onMouseMove);
        this._canvas.addEventListener('mouseup', this._onMouseUp);
        this._canvas.addEventListener('wheel', this._onWheel, {passive: true});
        this._canvas.addEventListener('contextmenu', this._onContextMenu);
    }

    /**
     * Converts a DOM mouse event to canvas-local coordinates.
     */
    private getCanvasCoords(e: MouseEvent): { x: number; y: number } 
    {
        if(!this._canvas) return {x: 0, y: 0};

        const rect = this._canvas.getBoundingClientRect();

        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    }

    /** Canvas mousedown handler. */
    private _onMouseDown = (e: MouseEvent): void =>
    {
        // <canvas> isn't natively focusable, so the browser's default mousedown
        // action blurs whatever currently has DOM focus (moving it to <body>)
        // once every listener on this event has run. That happens *after* the
        // window-system dispatch below, which can synchronously call
        // TextFieldController.focus() -> HTMLInputElement.focus() on a text
        // field's hidden input — so without suppressing the browser's default,
        // that focus call is immediately undone: the caret still renders (it's
        // driven by this port's own internal focus flag) but document.activeElement
        // reverts to <body>, so keystrokes never reach the hidden input at all.
        e.preventDefault();

        const {x, y} = this.getCanvasCoords(e);
        const vortex = Vortex.instance;
        const hit = vortex.windowManager.findWindowAtPoint(x, y);

        if(!hit) 
        {
            // No UI window hit — forward to room engine if in a room
            if(this._isInRoom) 
            {
                this.forwardToRoomEngine(x, y, 'mouse_down', e);
            }

            return;
        }

        this._mouseDown = true;
        this._mouseDownWindow = hit;

        // Pre-seed drag/scale services with current canvas-local coords
        // so that begin() (triggered inside update() below) computes the correct offset.
        const serviceManager = vortex.windowManager.getServiceManager();

        if(serviceManager) 
        {
            (serviceManager.getMouseDraggingService() as WindowMouseOperator).setMousePosition(x, y);
            (serviceManager.getMouseScalingService() as WindowMouseOperator).setMousePosition(x, y);
        }

        // Compute local coordinates
        const globalPos = this._globalPosScratch;

        hit.getGlobalPosition(globalPos);

        const localX = x - globalPos.x;
        const localY = y - globalPos.y;

        const event = WindowMouseEvent.allocateMouse(
            WindowMouseEvent.DOWN, hit, null,
            localX, localY, e.clientX, e.clientY,
            e.altKey, e.ctrlKey, e.shiftKey, true
        );
        (hit as WindowController).update(hit as WindowController, event);
        event.recycle();

        // Register document-level handlers for drag/scale
        if(serviceManager) 
        {
            const dragger = serviceManager.getMouseDraggingService() as WindowMouseOperator;
            const scaler = serviceManager.getMouseScalingService() as WindowMouseOperator;

            this._docMoveHandler = (ev: MouseEvent): void => 
            {
                const coords = this.getCanvasCoords(ev);

                dragger.handleMouseMove(coords.x, coords.y);
                scaler.handleMouseMove(coords.x, coords.y);
            };

            this._docUpHandler = (ev: MouseEvent): void => 
            {
                dragger.handleMouseUp();
                scaler.handleMouseUp();

                // Dispatch UP event to window
                if(this._mouseDownWindow) 
                {
                    const {x: ux, y: uy} = this.getCanvasCoords(ev);
                    const gp = this._globalPosScratch;

                    this._mouseDownWindow.getGlobalPosition(gp);

                    const upEvent = WindowMouseEvent.allocateMouse(
                        WindowMouseEvent.UP, this._mouseDownWindow, null,
                        ux - gp.x, uy - gp.y, ev.clientX, ev.clientY
                    );
                    (this._mouseDownWindow as WindowController).update(
                        this._mouseDownWindow as WindowController, upEvent
                    );
                    upEvent.recycle();

                    // Synthesize CLICK if mouseup is on same window as mousedown
                    const clickHit = vortex.windowManager.findWindowAtPoint(ux, uy);

                    if(clickHit) 
                    {
                        const cp = this._globalPosScratch;

                        clickHit.getGlobalPosition(cp);

                        this.synthesizeClick(clickHit, ux - cp.x, uy - cp.y, ev.clientX, ev.clientY);
                    }
                }

                this._mouseDown = false;
                this._mouseDownWindow = null;

                document.removeEventListener('mousemove', this._docMoveHandler!);
                document.removeEventListener('mouseup', this._docUpHandler!);
                this._docMoveHandler = null;
                this._docUpHandler = null;
            };

            document.addEventListener('mousemove', this._docMoveHandler);
            document.addEventListener('mouseup', this._docUpHandler);
        }
    };

    /** Canvas mousemove handler. */
    private _onMouseMove = (e: MouseEvent): void =>
    {
        const {x, y} = this.getCanvasCoords(e);
        const vortex = Vortex.instance;
        const hit = vortex.windowManager.findWindowAtPoint(x, y);

        // Hover tracking: OVER/OUT
        if(hit !== this._lastHoveredWindow) 
        {
            // Send OUT to the old window
            if(this._lastHoveredWindow && !this._lastHoveredWindow.disposed) 
            {
                const outEvent = WindowMouseEvent.allocateMouse(
                    WindowMouseEvent.OUT, this._lastHoveredWindow, hit,
                    0, 0, e.clientX, e.clientY
                );
                (this._lastHoveredWindow as WindowController).update(
                    this._lastHoveredWindow as WindowController, outEvent
                );
                outEvent.recycle();
            }

            // Send OVER to the new window
            if(hit) 
            {
                const globalPos = this._globalPosScratch;

                hit.getGlobalPosition(globalPos);

                const overEvent = WindowMouseEvent.allocateMouse(
                    WindowMouseEvent.OVER, hit, this._lastHoveredWindow,
                    x - globalPos.x, y - globalPos.y, e.clientX, e.clientY
                );
                (hit as WindowController).update(hit as WindowController, overEvent);
                overEvent.recycle();
            }

            this._lastHoveredWindow = hit;
        }

        // Send MOVE event to the hovered window
        if(hit) 
        {
            const globalPos = this._globalPosScratch;

            hit.getGlobalPosition(globalPos);

            const moveEvent = WindowMouseEvent.allocateMouse(
                WindowMouseEvent.MOVE, hit, null,
                x - globalPos.x, y - globalPos.y, e.clientX, e.clientY
            );
            (hit as WindowController).update(hit as WindowController, moveEvent);
            moveEvent.recycle();
        }

        // Forward to room engine if no UI window hit and in a room
        if(!hit && this._isInRoom) 
        {
            this.forwardToRoomEngine(x, y, 'mouse_move', e);
        }

        // Update cursor: pointer on mouse-event-enabled windows
        if(this._canvas) 
        {
            this._canvas.style.cursor = (hit && hit.testParamFlag(1)) ? 'pointer' : 'default';
        }
    };

    /**
     * Dispatches a CLICK to the hit window, and — when this is the second click on the same window
     * within DOUBLE_CLICK_MS/DIST — a DOUBLE_CLICK too. The browser gives us no dblclick here because
     * clicks are synthesized from mousedown/mouseup, so this reconstructs it. RoomDesktop maps the
     * WME_DOUBLE_CLICK to the room 'doubleClick' event (e.g. FurnitureLogic.useObject → open wired),
     * mirroring Flash's doubleClick firing after two clicks.
     */
    private synthesizeClick(clickHit: IWindow, localX: number, localY: number, clientX: number, clientY: number): void
    {
        const clickEvent = WindowMouseEvent.allocateMouse(
            WindowMouseEvent.CLICK, clickHit, null,
            localX, localY, clientX, clientY
        );
        (clickHit as WindowController).update(clickHit as WindowController, clickEvent);
        clickEvent.recycle();

        const now = performance.now();
        const isDoubleClick = clickHit === this._lastClickWindow
            && (now - this._lastClickTime) <= VortexApp.DOUBLE_CLICK_MS
            && Math.abs(clientX - this._lastClickX) <= VortexApp.DOUBLE_CLICK_DIST
            && Math.abs(clientY - this._lastClickY) <= VortexApp.DOUBLE_CLICK_DIST;

        if(isDoubleClick)
        {
            const dblEvent = WindowMouseEvent.allocateMouse(
                WindowMouseEvent.DOUBLE_CLICK, clickHit, null,
                localX, localY, clientX, clientY
            );
            (clickHit as WindowController).update(clickHit as WindowController, dblEvent);
            dblEvent.recycle();

            // Reset so a third rapid click doesn't chain into another double-click.
            this._lastClickTime = 0;
            this._lastClickWindow = null;
        }
        else
        {
            this._lastClickTime = now;
            this._lastClickWindow = clickHit;
            this._lastClickX = clientX;
            this._lastClickY = clientY;
        }
    }

    /** Canvas mouseup handler (fallback for non-drag scenarios). */
    private _onMouseUp = (e: MouseEvent): void =>
    {
        // If doc-level handlers are active, they handle the UP
        if(this._docUpHandler) return;

        const {x, y} = this.getCanvasCoords(e);
        const vortex = Vortex.instance;
        const hit = vortex.windowManager.findWindowAtPoint(x, y);

        if(!hit) 
        {
            // Forward click to room engine if in a room
            if(this._isInRoom) 
            {
                this.forwardToRoomEngine(x, y, 'click', e);
            }

            return;
        }

        const globalPos = this._globalPosScratch;

        hit.getGlobalPosition(globalPos);

        const upEvent = WindowMouseEvent.allocateMouse(
            WindowMouseEvent.UP, hit, null,
            x - globalPos.x, y - globalPos.y, e.clientX, e.clientY
        );
        (hit as WindowController).update(hit as WindowController, upEvent);
        upEvent.recycle();

        // Synthesize CLICK (+ DOUBLE_CLICK on a rapid second click)
        this.synthesizeClick(hit, x - globalPos.x, y - globalPos.y, e.clientX, e.clientY);
    };

    /** Canvas wheel handler. */
    private _onWheel = (e: WheelEvent): void =>
    {
        const {x, y} = this.getCanvasCoords(e);
        const vortex = Vortex.instance;
        const hit = vortex.windowManager.findWindowAtPoint(x, y);

        if(!hit) 
        {
            // Forward wheel to room desktop for zoom if in a room and Ctrl held
            if(this._isInRoom && e.ctrlKey) 
            {
                try 
                {
                    const roomUI = vortex.roomUI as RoomUI;
                    const desktop = roomUI.getDesktopForRoom(this._activeRoomId) as RoomDesktop | null;

                    if(desktop) 
                    {
                        desktop.handleMouseWheel(e.deltaY, x, y);
                    }
                }
                catch
                {
                    // RoomUI not yet initialized
                }
            }

            return;
        }

        // WindowController.update() returns false for WHEEL by default - only
        // ItemListController/ScrollBarController override it to actually scroll.
        // findWindowAtPoint() returns the deepest (leaf) window under the cursor, which
        // inside a scrollable box is usually a list item/icon/label rather than the
        // scrollable container itself, so the event must bubble up the parent chain
        // (mirroring MouseEventProcessor.passMouseEvent()'s bubbling for other mouse
        // events) until an ancestor actually handles it.
        let target: WindowController | null = hit as WindowController;

        while(target && !target.disposed)
        {
            const globalPos = this._globalPosScratch;

            target.getGlobalPosition(globalPos);

            // Flash's MouseEvent.delta is positive when the wheel scrolls up; the DOM's
            // WheelEvent.deltaY is positive when it scrolls down - the opposite sign
            // convention. SmoothScroller.wheelDeltaToScrollDelta() negates this value to
            // get a scroll offset (faithfully ported from AS3, see its own header comment),
            // so feeding it deltaY unconverted inverted every scrollable list/grid in the
            // app relative to normal browser/OS scroll direction.
            const event = WindowMouseEvent.allocateMouse(
                WindowMouseEvent.WHEEL, target, null,
                x - globalPos.x, y - globalPos.y, e.clientX, e.clientY,
                e.altKey, e.ctrlKey, e.shiftKey, false,
                -e.deltaY
            );

            const handled = target.update(target, event);

            event.recycle();

            if(handled) break;

            target = target.parent as WindowController | null;
        }
    };

    /** Prevent right-click context menu on the canvas. */
    private _onContextMenu = (e: Event): void =>
    {
        e.preventDefault();
    };
}
