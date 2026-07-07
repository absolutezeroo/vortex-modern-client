import type {IHeliumConfig} from 'helium-engine';
import {Helium} from 'helium-engine';
import {HabboToolbarEnum} from '@habbo/toolbar/HabboToolbarEnum';
import {RoomEngineEvent} from '@habbo/room/events/RoomEngineEvent';
import type {ISkinData} from '@core/window';
import type {IWindow} from '@core/window/IWindow';
import type {WindowController} from '@core/window/WindowController';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {WindowMouseOperator} from '@core/window/services/WindowMouseOperator';
import type {IElementDescriptionData, IWindowLayout, IWindowLayoutFilter, IWindowLayoutNode} from '@habbo/window';
import type {RoomUI} from '@habbo/ui/RoomUI';
import type {RoomDesktop} from '@habbo/ui/RoomDesktop';
import type {HeliumLoadingScreen} from './HeliumLoadingScreen';
import {AssetBundle} from './AssetBundle';
import {LoginFlow} from './login/LoginFlow';
import {ChangelogWindow} from './changelog/ChangelogWindow';
import {
    type IWindowLayoutXmlData,
    parseElementDescriptionXml,
    parseSkinXml,
    parseWindowLayoutXml
} from './window/WindowXmlAssetParser';
import './_index.scss';

/** Atlas spritesheet names that need to be decoded as ImageBitmaps. */
const ATLAS_NAMES = [
    'habbo_blue_skin',
    'habbo_skin_ubuntu',
    'habbo_skin_illumina_dark',
    'habbo_skin_illumina_light',
    'habbo_icons',
    'skin_ubuntu_bg_9',
];

const EMBEDDED_AVATAR_XML_ASSET_NAMES = [
    'action_offset_lay',
    'action_offset_swim',
    'HabboAvatarAnimation',
    'HabboAvatarFigure',
    'HabboAvatarGeometry',
    'HabboAvatarPartSets',
];

interface IWindowLayoutJsonNode extends IWindowLayoutNode {
    vars?: Record<string, unknown>;
    children: IWindowLayoutJsonNode[];
}

interface IWindowLayoutJson extends IWindowLayout {
    window: IWindowLayoutJsonNode;
    layoutWidth?: number;
    layoutHeight?: number;
}

function isXmlText(value: string): boolean 
{
    const trimmed = value.trim();

    return trimmed.startsWith('<');
}

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
    if(isXmlText(raw)) 
    {
        return parseElementDescriptionXml(raw, 'habbo_element_description', source);
    }

    return parseJson<IElementDescriptionData>(raw);
}

function parseSkinFromBundle(raw: string, skinId: string, source: string): ISkinData | null 
{
    if(isXmlText(raw)) 
    {
        return parseSkinXml(raw, skinId, source);
    }

    return parseJson<ISkinData>(raw);
}

function isPointValue(value: unknown): value is { x: number; y: number } 
{
    return (
        typeof value === 'object'
        && value !== null
        && 'x' in value
        && 'y' in value
        && !('width' in value)
        && !('height' in value)
    );
}

function isRectangleValue(value: unknown): value is { x: number; y: number; width: number; height: number } 
{
    return (
        typeof value === 'object'
        && value !== null
        && 'x' in value
        && 'y' in value
        && 'width' in value
        && 'height' in value
    );
}

function escapeXmlValue(value: string): string 
{
    return value
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\r/g, '&#13;')
        .replace(/\n/g, '&#10;');
}

function serializeAttributes(attributes: Record<string, string | undefined>): string 
{
    const parts = [];

    for(const [name, value] of Object.entries(attributes)) 
    {
        if(value === undefined) 
        {
            continue;
        }

        parts.push(`${name}="${escapeXmlValue(value)}"`);
    }

    return parts.length > 0 ? ` ${parts.join(' ')}` : '';
}

function serializeVariablesMap(vars: Record<string, unknown> | undefined): string 
{
    if(!vars) 
    {
        return '';
    }

    const entries = Object.entries(vars)
        .map(([key, value]) => serializeVarNode(key, value))
        .filter((entry) => entry.length > 0)
        .join('');

    return entries.length > 0 ? `<variables>${entries}</variables>` : '';
}

function serializeVarNode(key: string, value: unknown): string 
{
    const keyAttr = ` key="${escapeXmlValue(key)}"`;

    if(value === null || value === undefined) 
    {
        return `<var${keyAttr} />`;
    }

    if(typeof value === 'string') 
    {
        return `<var${keyAttr} type="String" value="${escapeXmlValue(value)}" />`;
    }

    if(typeof value === 'number') 
    {
        const numericType = Number.isInteger(value) ? 'int' : 'number';

        return `<var${keyAttr} type="${numericType}" value="${String(value)}" />`;
    }

    if(typeof value === 'boolean') 
    {
        return `<var${keyAttr} type="Boolean" value="${String(value)}" />`;
    }

    if(Array.isArray(value)) 
    {
        const serialized = value
            .map((entry, i) => serializeVarNode(String(i), entry))
            .join('');

        return `<var${keyAttr}><value><Array>${serialized}</Array></value></var>`;
    }

    if(isPointValue(value)) 
    {
        const point = value as { x: number; y: number };

        return `<var${keyAttr}><value><Point x="${point.x}" y="${point.y}" /></value></var>`;
    }

    if(isRectangleValue(value)) 
    {
        const rect = value as { x: number; y: number; width: number; height: number };

        return `<var${keyAttr}><value><Rectangle x="${rect.x}" y="${rect.y}" width="${rect.width}" height="${rect.height}" /></value></var>`;
    }

    if(typeof value === 'object') 
    {
        const entries = Object.entries(value as Record<string, unknown>)
            .map(([varKey, varValue]) => serializeVarNode(varKey, varValue))
            .join('');

        return `<var${keyAttr}><value><Map>${entries}</Map></value></var>`;
    }

    return '';
}

function serializeFilters(filters: IWindowLayoutFilter[] | undefined): string 
{
    if(!filters || filters.length === 0) 
    {
        return '';
    }

    const serialized = filters
        .map((filter) => 
        {
            return `<${filter.type}${serializeAttributes(
                Object.fromEntries(
                    Object.entries(filter.attributes)
                        .map(([name, value]) => [name, String(value)] as const)
                )
            )} />`;
        })
        .join('');

    return `<filters>${serialized}</filters>`;
}

function serializeWindowLayoutNode(node: IWindowLayoutJsonNode): string 
{
    let xml = `<${node.tag}${serializeAttributes(node.attributes as Record<string, string>)}`;
    const varsXml = serializeVariablesMap(node.vars as Record<string, unknown> | undefined);
    const childrenXml = node.children.map((child) => serializeWindowLayoutNode(child)).join('');

    if(varsXml.length === 0 && childrenXml.length === 0) 
    {
        return `${xml} />`;
    }

    xml += `>${varsXml}`;

    if(childrenXml.length > 0) 
    {
        xml += `<children>${childrenXml}</children>`;
    }

    return `${xml}</${node.tag}>`;
}

function serializeWindowLayoutToXml(layout: IWindowLayoutJson): string 
{
    let xml = `<layout`;

    const layoutAttrs: Record<string, string> = {};

    if(layout.layoutWidth !== undefined) 
    {
        layoutAttrs.width = String(layout.layoutWidth);
    }

    if(layout.layoutHeight !== undefined) 
    {
        layoutAttrs.height = String(layout.layoutHeight);
    }

    xml += `${serializeAttributes(layoutAttrs)}>`;

    const varsXml = serializeVariablesMap(layout.vars as Record<string, unknown> | undefined);
    const filtersXml = serializeFilters(layout.filters);

    xml += `${varsXml}${filtersXml}${serializeWindowLayoutNode(layout.window)}`;

    return `${xml}</layout>`;
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
 */
const WEBFONT_FACES: Array<{ family: string; file: string; weight?: string; style?: string }> = [
    {family: 'Volter (Goldfish)', file: 'webfonts/Volter.ttf', weight: 'normal'},
    {family: 'Volter (Goldfish)', file: 'webfonts/Volter Bold.ttf', weight: 'bold'},
    {family: 'Ubuntu', file: 'webfonts/Ubuntu.ttf', weight: 'normal', style: 'normal'},
    {family: 'Ubuntu', file: 'webfonts/Ubuntu-b.ttf', weight: 'bold'},
    {family: 'Ubuntu', file: 'webfonts/Ubuntu-i.ttf', style: 'italic'},
    {family: 'Ubuntu', file: 'webfonts/Ubuntu-ib.ttf', weight: 'bold', style: 'italic'},
    {family: 'Ubuntu Condensed', file: 'webfonts/Ubuntu-C.ttf', weight: 'normal'},
];

async function loadWebFonts(bundle: AssetBundle): Promise<void> 
{
    await Promise.all(WEBFONT_FACES.map(async ({family, file, weight, style}) => 
    {
        const bytes = bundle.getBytes(file);

        if(!bytes) 
        {
            console.warn(`[HeliumApp] Webfont not found in bundle: ${file}`);

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
            console.warn(`[HeliumApp] Failed to load webfont ${file}:`, error);
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

    return assets;
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
    if(isXmlText(raw)) 
    {
        return parseWindowLayoutXml(raw, baseName, source);
    }

    const parsed = parseJson<IWindowLayoutJson>(raw);

    if(!parsed) 
    {
        return [];
    }

    if(Array.isArray(parsed)) 
    {
        const result: IWindowLayoutXmlData[] = [];

        for(const layout of parsed) 
        {
            if(!layout || !layout.window) 
            {
                continue;
            }

            const layoutName = layout.name || baseName;
            const xml = serializeWindowLayoutToXml(layout);
            result.push(...parseWindowLayoutXml(xml, layoutName, source));
        }

        return result;
    }

    if(!parsed.window) 
    {
        return [];
    }

    const layoutName = parsed.name || baseName;

    return parseWindowLayoutXml(serializeWindowLayoutToXml(parsed), layoutName, source);
}

declare global 
{
    interface Window {
        HeliumConfig?: IHeliumConfig;
    }
}

/**
 * HeliumApp — Canvas-based application shell.
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
export class HeliumApp 
{
    private _canvas: HTMLCanvasElement | null = null;
    private _ctx: CanvasRenderingContext2D | null = null;
    private _animFrameId: number = 0;
    private _uiCompositeDirty: boolean = true;
    private _lastUiRenderVersion: number = -1;
    private _disposed: boolean = false;
    private _loadingScreen: HeliumLoadingScreen | null;
    private _imageBundle: AssetBundle | null = null;
    private _xmlBundle: AssetBundle | null = null;
    private _changelogWindow: ChangelogWindow | null = null;

    /** Last hovered window for OVER/OUT tracking. */
    private _lastHoveredWindow: IWindow | null = null;

    /** Whether the mouse button is currently down. */
    private _mouseDown: boolean = false;

    /** The window that received the last DOWN event (for drag/UP tracking). */
    private _mouseDownWindow: IWindow | null = null;

    /** Document-level mousemove handler (for drag/scale). */
    private _docMoveHandler: ((e: MouseEvent) => void) | null = null;

    /** Document-level mouseup handler (for drag/scale). */
    private _docUpHandler: ((e: MouseEvent) => void) | null = null;

    /** Whether we are currently in a room (for mouse event routing). */
    private _isInRoom: boolean = false;

    /** Active room ID for mouse routing. */
    private _activeRoomId: number = -1;

    constructor(loadingScreen?: HeliumLoadingScreen) 
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
        const heliumConfig: IHeliumConfig = {
            ...(window.HeliumConfig ?? {}),
            embeddedConfigurations: {
                ...bundledConfigurations,
                ...(window.HeliumConfig?.embeddedConfigurations ?? {}),
            },
        };
        const helium = await Helium.bootstrap(heliumConfig, this._loadingScreen ?? undefined);

        if(import.meta.env.DEV) 
        {
            // Dev-only console access, e.g. Helium.instance.configuration.getProperty('...').
            // Helium is only ever ES-module-imported elsewhere, so without this the class
            // (and its `instance` singleton getter) isn't reachable from the browser console.
            (window as unknown as { Helium: typeof Helium }).Helium = Helium;
        }

        this._imageBundle = imageBundle;
        this._xmlBundle = xmlBundle;

        // Register bundled webfonts (Volter/Ubuntu) before anything renders text —
        // see loadWebFonts() for why this was previously silently missing.
        await loadWebFonts(xmlBundle);

        // Mount the "What's New" changelog button now, not after login/connect —
        // it's an independent overlay (not a room/toolbar window) and should stay
        // visible even while stuck on the login flow or waiting on the backend.
        this._changelogWindow = new ChangelogWindow();
        this._changelogWindow.mount();

        // 2. Load element descriptions + atlas bitmaps from bundle
        try 
        {
            const elementDescriptionXml = xmlBundle.getText('window-skins/element-description.xml')
                ?? xmlBundle.getText('window-skins/element-description.json');

            if(elementDescriptionXml) 
            {
                const elementDescription = parseElementDescriptionFromBundle(
                    elementDescriptionXml,
                    'window-skins/element-description.xml'
                );

                if(elementDescription) 
                {
                    helium.windowManager.loadElementDescription(elementDescription);
                }
            }

            // Decode atlas spritesheets as ImageBitmaps
            const bitmaps = await Promise.all(
                ATLAS_NAMES.map(name => imageBundle.getImageBitmap(`images/${name}.png`))
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
                if(key.endsWith('element-description.xml') || key.endsWith('element-description.json')) 
                {
                    continue;
                }

                const skinXml = xmlBundle.getText(key);

                if(!skinXml) 
                {
                    continue;
                }

                const skinId = key.split('/').pop()!.replace('.xml', '').replace('.json', '');
                const skin = parseSkinFromBundle(skinXml, skinId, key);

                if(skin) skins.set(skin.id, skin);
            }

            helium.windowManager.loadSkinAssets(skins, atlases);
        }
        catch (error) 
        {
            console.warn('[HeliumApp] Failed to load skin/element assets:', error);
        }

        // 3. Register all window layouts from XML bundle
        for(const key of xmlBundle.listKeys('window-layouts/')) 
        {
            const layoutXml = xmlBundle.getText(key);

            if(!layoutXml) 
            {
                continue;
            }

            const layoutBaseName = key.split('/').pop()!.replace('.xml', '').replace('.json', '');
            let layouts = [];

            try 
            {
                layouts = parseLayoutEntries(layoutXml, key, layoutBaseName);
            }
            catch (error) 
            {
                console.warn(`[HeliumApp] Failed to parse layout XML: ${key}`, error);
                continue;
            }

            for(const layout of layouts) 
            {
                const name = layout.name;

                if(typeof name === 'string' && name.length > 0) 
                {
                    helium.windowManager.registerWidgetLayout(name, layout.xml);
                }
            }
        }

        // 4. Wait for AS3 authentication before creating the visible client UI.
        const ssoTicket = window.HeliumConfig?.connection?.ssoTicket;

        if(!ssoTicket) 
        {
            await this.showLoginFlow();
        }
        else 
        {
            await helium.connect();
        }

        // 5. Dispose loading screen before creating canvas (prevents white flash)
        if(this._loadingScreen) 
        {
            this._loadingScreen.dispose();
            this._loadingScreen = null;
        }

        // 6. Create the canvas and set desktop sizes BEFORE creating windows
        this.createCanvas();

        // 7. Register all image blob URLs with the resource manager
        this.registerImageAssets();

        // 8. Initialize the Friend Bar (landing view) — desktops are now sized
        helium.initFriendBar();

        // 9. Activate the toolbar (hotel view by default)
        helium.toolbar.setToolbarState(HabboToolbarEnum.TOOLBAR_STATE_HOTEL_VIEW);

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
            const helium = Helium.instance;
            const loginFlow = new LoginFlow(helium.configuration);

            loginFlow.init();

            loginFlow.loginEvents.once(LoginFlow.LOGIN_FLOW_FINISHED_EVENT, async () => 
            {
                try 
                {
                    const token = loginFlow.ssoToken;

                    if(!token) 
                    {
                        throw new Error('[HeliumApp] Login flow finished without SSO ticket');
                    }

                    // Set the SSO ticket on the communication manager
                    helium.habboCommunication.ssoTicket = token;

                    // Update the global config so connect() picks it up
                    if(window.HeliumConfig?.connection) 
                    {
                        window.HeliumConfig.connection.ssoTicket = token;
                    }

                    // Trigger the connection and wait for AS3 AUTHENTICATED before continuing.
                    await helium.connect();

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
        const helium = Helium.instance;

        helium.roomEngine.events.on(RoomEngineEvent.REE_INITIALIZED, (event: any) => 
        {
            this._isInRoom = true;
            this._activeRoomId = event.roomId;
        });

        helium.roomEngine.events.on(RoomEngineEvent.REE_DISPOSED, (_event: any) => 
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
        const helium = Helium.instance;

        try 
        {
            const roomUI = helium.roomUI as RoomUI;
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

        const helium = Helium.instance;

        for(const key of this._imageBundle.listKeys('images/')) 
        {
            // Extract asset name: 'images/icons_toolbar_reception_normal.png' → 'icons_toolbar_reception_normal'
            const name = key.split('/').pop()!.replace('.png', '');
            const url = this._imageBundle.getUrl(key);

            if(url) 
            {
                helium.windowManager.registerAssetUrl(name, url);
            }
        }
    }

    /**
     * Creates the canvas element and appends it to the DOM.
     */
    private createCanvas(): void 
    {
        const container = document.getElementById('helium-ui');

        if(!container) return;

        // Clear any loading content
        container.innerHTML = '';

        this._canvas = document.createElement('canvas');
        this._canvas.id = 'helium-canvas';
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
        const helium = Helium.instance;

        for(let i = 0; i < 4; i++) 
        {
            const desktop = helium.windowManager.getDesktop(i);

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

            const helium = Helium.instance;

            if(helium.disposed || !helium.isReady) 
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

        const helium = Helium.instance;

        if(helium.disposed || !helium.isReady) 
        {
            return;
        }

        const windowManager = helium.windowManager;
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
        const {x, y} = this.getCanvasCoords(e);
        const helium = Helium.instance;
        const hit = helium.windowManager.findWindowAtPoint(x, y);

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
        const serviceManager = helium.windowManager.getServiceManager();

        if(serviceManager) 
        {
            (serviceManager.getMouseDraggingService() as WindowMouseOperator).setMousePosition(x, y);
            (serviceManager.getMouseScalingService() as WindowMouseOperator).setMousePosition(x, y);
        }

        // Compute local coordinates
        const globalPos = {x: 0, y: 0};

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
                    const gp = {x: 0, y: 0};

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
                    const clickHit = helium.windowManager.findWindowAtPoint(ux, uy);

                    if(clickHit) 
                    {
                        const cp = {x: 0, y: 0};

                        clickHit.getGlobalPosition(cp);

                        const clickEvent = WindowMouseEvent.allocateMouse(
                            WindowMouseEvent.CLICK, clickHit, null,
                            ux - cp.x, uy - cp.y, ev.clientX, ev.clientY
                        );
                        (clickHit as WindowController).update(clickHit as WindowController, clickEvent);
                        clickEvent.recycle();
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
        const helium = Helium.instance;
        const hit = helium.windowManager.findWindowAtPoint(x, y);

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
                const globalPos = {x: 0, y: 0};

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
            const globalPos = {x: 0, y: 0};

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

    /** Canvas mouseup handler (fallback for non-drag scenarios). */
    private _onMouseUp = (e: MouseEvent): void => 
    {
        // If doc-level handlers are active, they handle the UP
        if(this._docUpHandler) return;

        const {x, y} = this.getCanvasCoords(e);
        const helium = Helium.instance;
        const hit = helium.windowManager.findWindowAtPoint(x, y);

        if(!hit) 
        {
            // Forward click to room engine if in a room
            if(this._isInRoom) 
            {
                this.forwardToRoomEngine(x, y, 'click', e);
            }

            return;
        }

        const globalPos = {x: 0, y: 0};

        hit.getGlobalPosition(globalPos);

        const upEvent = WindowMouseEvent.allocateMouse(
            WindowMouseEvent.UP, hit, null,
            x - globalPos.x, y - globalPos.y, e.clientX, e.clientY
        );
        (hit as WindowController).update(hit as WindowController, upEvent);
        upEvent.recycle();

        // Synthesize CLICK
        const clickEvent = WindowMouseEvent.allocateMouse(
            WindowMouseEvent.CLICK, hit, null,
            x - globalPos.x, y - globalPos.y, e.clientX, e.clientY
        );
        (hit as WindowController).update(hit as WindowController, clickEvent);
        clickEvent.recycle();
    };

    /** Canvas wheel handler. */
    private _onWheel = (e: WheelEvent): void => 
    {
        const {x, y} = this.getCanvasCoords(e);
        const helium = Helium.instance;
        const hit = helium.windowManager.findWindowAtPoint(x, y);

        if(!hit) 
        {
            // Forward wheel to room desktop for zoom if in a room and Ctrl held
            if(this._isInRoom && e.ctrlKey) 
            {
                try 
                {
                    const roomUI = helium.roomUI as RoomUI;
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

        const globalPos = {x: 0, y: 0};

        hit.getGlobalPosition(globalPos);

        const event = WindowMouseEvent.allocateMouse(
            WindowMouseEvent.WHEEL, hit, null,
            x - globalPos.x, y - globalPos.y, e.clientX, e.clientY,
            e.altKey, e.ctrlKey, e.shiftKey, false,
            e.deltaY
        );
        (hit as WindowController).update(hit as WindowController, event);
        event.recycle();
    };

    /** Prevent right-click context menu on the canvas. */
    private _onContextMenu = (e: Event): void => 
    {
        e.preventDefault();
    };
}
