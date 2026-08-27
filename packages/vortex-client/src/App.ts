import type {IVortexConfig, IVortexWindowAssets} from 'vortex-engine';
import {Vortex} from 'vortex-engine';
import {FRAME_CHANNEL_UI, FrameTimings} from '@core/utils/FrameTimings';
import {AssetTypeDeclaration} from '@core/assets/AssetTypeDeclaration';
import {UnknownAsset} from '@core/assets/UnknownAsset';
import {SoundAsset} from '@core/assets/SoundAsset';
import {SoundContext} from '@habbo/sound/SoundContext';
import {HabboToolbarEnum} from '@habbo/toolbar/HabboToolbarEnum';
import {RoomEngineEvent} from '@habbo/room/events/RoomEngineEvent';
import type {AssetUrlSource} from '@core/window/IResourceManager';
import type {ISkinData} from '@core/window';
import type {IWindow} from '@core/window/IWindow';
import type {WindowController} from '@core/window/WindowController';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {NativeWheelDelta} from '@core/window/utils/NativeWheelDelta';
import type {WindowMouseOperator} from '@core/window/services/WindowMouseOperator';
import {Logger} from '@core/utils/Logger';
import type {IElementDescriptionData} from '@habbo/window';
import type {RoomUI} from '@habbo/ui/RoomUI';
import type {RoomDesktop} from '@habbo/ui/RoomDesktop';
import {VortexLoadingScreen} from './VortexLoadingScreen';
import {AssetBundle} from './AssetBundle';
import {LoginFlow} from './login/LoginFlow';
import {OnBoardingHcFlow} from './onBoardingHc/OnBoardingHcFlow';
import {Stage} from './onBoardingHcUi/display/Stage';
import {LoginAssets} from './onBoardingHcUi/LoginAssets';
import {ChangelogWindow} from './changelog/ChangelogWindow';
import {installWindowDebugger} from './debugger/WindowDebuggerOverlay';
import {
    type IWindowLayoutXmlData,
    parseElementDescriptionXml,
    parseSkinXml,
    parseWindowLayoutXml
} from './window/WindowXmlAssetParser';
import './_index.scss';

const log = Logger.getLogger('client.App');

/**
 * The element description's asset name.
 *
 * Derived name: `init` is declared in no AS3 tree — the trace points
 * at the class it belongs to, but the identifier itself is this port's.
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/HabboWindowManagerComponent.as::init()
 * asks for it by this exact name; build-window-assets.mjs emits it under the same name, so the
 * bundle key and the AS3 asset name are the one string.
 */
const ELEMENT_DESCRIPTION_ASSET = 'habbo_element_description_xml';

const EMBEDDED_AVATAR_XML_ASSET_NAMES = [
    'action_offset_lay',
    'action_offset_swim',
    'dance_sixseven_animation',
    'HabboAvatarAnimation',
    'HabboAvatarFigure',
    'HabboAvatarGeometry',
    'HabboAvatarPartSets',
];

/**
 * The `default_localizations*` embeds declared by `HabboLocalizationCom.as`, by asset name.
 *
 * `default_localizations` is the english-only global file; the rest are per-language and are
 * layered on top of it (see HabboLocalizationManager.loadDefaultEmbedLocalizations()).
 */
const EMBEDDED_LOCALIZATION_ASSET_NAMES = [
    'default_localizations',
    'default_localizations_de',
    'default_localizations_dk',
    'default_localizations_en',
    'default_localizations_es',
    'default_localizations_fi',
    'default_localizations_fr',
    'default_localizations_it',
    'default_localizations_nl',
    'default_localizations_no',
    'default_localizations_pt',
    'default_localizations_tr',
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

    // AS3: HabboLocalizationCom's default_localizations* embeds, read by
    // HabboLocalizationManager.loadDefaultEmbedLocalizations(). These are the only texts the login
    // flow has — it runs before any external text file is fetched — so without them every login
    // caption renders as its raw ${key}.
    for(const assetName of EMBEDDED_LOCALIZATION_ASSET_NAMES)
    {
        const content = bundle.getText(`configurations/${assetName}_txt.txt`);

        if(content !== null)
        {
            assets[assetName] = content;
        }
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
 * the standard image/png -> BitmapDataAsset pipeline (readImageAssets() below, blob
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

/**
 * Registers the client's embedded sound effects, decoded, under the exact names
 * `HabboSoundManagerFlash10.getSoundByAssetName()` asks for.
 *
 * The mp3s ride in the non-image bundle (like the webfonts above) and are extracted from
 * the dump by `tools/import-crypted-sounds.mjs`, which names each file after its *Com.as
 * field — so the bundle key's stem *is* the asset name, with no `_mp3` suffix. Decoding is
 * done here rather than lazily because `SoundAsset.content` is read synchronously at the
 * moment a sound plays; 21 short files is well under a frame's worth of work in parallel.
 *
 * AS3 has no equivalent: there the mp3s are `[Embed]`s inside HabboSoundManagerFlash10Com,
 * already `flash.media.Sound` objects by the time the library is handed over.
 */
/**
 * Reads every window layout for the *asset library*, keyed by its file basename.
 *
 * The layouts already go into the window manager's widget-layout registry (see
 * `readWindowAssets()`), which serves `buildWidgetLayout(name)`. But a whole family of ported
 * views does what AS3 does and reads the layout out of its component's asset library instead —
 * `assets.getAssetByName("settings_xml").content` — and nothing ever put a layout there: the
 * library only held images, sounds, the avatar configurations and the chat styles. Every one of
 * those lookups returned null, and each site turned that into "Missing layout X" and gave up.
 *
 * Handed to `Vortex.bootstrap()` rather than pushed in afterwards, which is what this used to do:
 * WiredChestController builds its whole window the moment the window-manager IID resolves, inside
 * prepareCore(), and asked for `chest_generic_xml` before this had run.
 *
 * The name is the **file basename**, which `tools/build-window-assets.mjs` takes from the
 * `*Com.as` field name — the exact string AS3 passes to `getAssetByName()`. Deliberately *not*
 * the internal `<layout name="...">`: that is a Flash-authoring label AS3 never reads, it differs
 * from the real name for 633 of 783 layouts, and 86 of those internal names are shared by two or
 * more files (see CLAUDE.md → Assets).
 */
/**
 * Reads every bundled image twice over: once as a blob URL for the window manager's
 * `ResourceManager` (what an `asset_uri` resolves against), and once — for a scoped subset — as a
 * decoded `ImageBitmap` for the asset library.
 *
 * Both halves are handed to `Vortex.bootstrap()` instead of pushed in after it returns, which is
 * what this used to do from `initClientUi()`, two steps *after* `connect()`. Components built
 * during prepareCore() read from both: HabboGroupsManager's badge editor wants `badge_part_add`
 * out of the library in its own constructor, and the chest window's every `asset_uri` wants the
 * URL registry. Neither existed yet, and both failed silently.
 *
 * The library half is scoped rather than covering the whole images/ bundle, because it eagerly
 * decodes an ImageBitmap per entry and nothing else needs library access today:
 * - ctlg_*: catalog swatches/slot backgrounds, read by every CatalogWidget.getAssetBitmapData()
 *   caller — ColourGridCatalogWidget's swatches, RecyclerCatalogWidget's slot background.
 * - fx_icon_* / memenu_fx_*: the me-menu EffectsWidget rows read these programmatically
 *   (effect icon + play/pause hilite) via assets.getAssetByName(...).content.
 * - color_chooser_* / badge_part_* / position_*: the group creation wizard - every
 *   ColorGridCtrl swatch cell, and the badge editor's empty/add/picker markers and
 *   3x3 position grid, all via HabboGroupsManager.getButtonImage().
 * - avatar_editor_*: the whole avatar editor reads bitmaps programmatically -
 *   AvatarEditorGridColorItem tints the shared `..._clr_13x21_2` chip per swatch,
 *   HabboAvatarEditor sets the remove-selection and get-more icons on its two synthetic
 *   tiles, AvatarEditorGridPartItem paints the download icon and the selection hilite,
 *   and WardrobeSlot asks for the empty-slot artwork. Without these the palettes render
 *   white and the remove tile renders nothing - exactly the silent failure this comment
 *   warns about.
 * - LIBRARY_IMAGE_NAMES: the rest, one-off lookups by exact name.
 *
 * That list grows once per feature that reads a bitmap from the library, which is a standing
 * trap: a missing entry does not fail loudly, it just renders nothing. The current set was found
 * by grepping every getAssetByName('<literal>') call against the images/ bundle; re-run that when
 * a bitmap comes out blank.
 *
 * @see sources/win63_version/habbo/window/ResourceManager.as
 */
async function readImageAssets(imageBundle: AssetBundle): Promise<{
    imageUrls: Map<string, AssetUrlSource>;
    libraryImages: Map<string, ImageBitmap>;
}>
{
    const imageUrls = new Map<string, AssetUrlSource>();
    const libraryImages = new Map<string, ImageBitmap>();
    const decodes: Promise<void>[] = [];

    for(const key of imageBundle.listKeys('images/'))
    {
        // Extract asset name: 'images/icons_toolbar_reception_normal.png' → 'icons_toolbar_reception_normal'
        const name = key.split('/').pop()!.replace('.png', '');

        // Registered as a thunk, not a URL. Every *name* still goes in before the engine boots
        // (that is what `hasAsset()` and the pre-bootstrap registration need — see
        // registerWindowAssetLibraryContent()), but `getUrl()` builds a Blob and an object URL,
        // and doing that for all 2,891 entries measured 583 ms of main thread and a 9.1 MB copy
        // of the bundle in blob storage. Deferred, it is ~200 us on the first request for the
        // handful of assets a session actually shows. `AssetBundle.getUrl()` caches, so a second
        // request for the same name costs nothing.
        imageUrls.set(name, () => imageBundle.getUrl(key));

        if(name.startsWith('ctlg_') || name.startsWith('fx_icon_') || name.startsWith('memenu_fx_')
            || name.startsWith('color_chooser_') || name.startsWith('badge_part_') || name.startsWith('position_')
            || name.startsWith('avatar_editor_')
            || LIBRARY_IMAGE_NAMES.has(name))
        {
            decodes.push(imageBundle.getImageBitmap(key).then((bitmap) =>
            {
                if(bitmap) libraryImages.set(name, bitmap);
            }));
        }
    }

    // Awaited, unlike the fire-and-forget `.then()` this replaces: `getAssetByName(...).content` is
    // read synchronously, so a bitmap that is still decoding is indistinguishable from one that
    // does not exist. That race is what made `add_friends_icon` miss even though it was registered
    // — the friend-list packet landed first.
    await Promise.all(decodes);

    log.debug(`Read ${imageUrls.size} image URLs and decoded ${libraryImages.size} library bitmaps`);

    return {imageUrls, libraryImages};
}

function readLibraryLayouts(xmlBundle: AssetBundle): Map<string, string>
{
    const keys = xmlBundle.listKeys('window-layouts/').filter((key) => key.endsWith('.xml'));
    const layouts = new Map<string, string>();

    if(keys.length === 0)
    {
        log.warn('No window layouts in the bundle - every layout lookup will fail.');

        return layouts;
    }

    for(const key of keys)
    {
        const xml = xmlBundle.getText(key);

        if(!xml) continue;

        layouts.set(key.slice('window-layouts/'.length, -'.xml'.length), xml);
    }

    log.debug(`Read ${layouts.size} window layout assets`);

    return layouts;
}

async function registerSoundAssets(vortex: Vortex, xmlBundle: AssetBundle): Promise<void>
{
    const keys = xmlBundle.listKeys('sounds/').filter((key) => key.endsWith('.mp3'));

    if(keys.length === 0)
    {
        log.warn('No sound assets in the bundle - the client will be silent. Run `pnpm import:crypted-sounds`, then rebuild the bundle.');

        return;
    }

    const declaration = vortex.assets.getAssetTypeDeclarationByMimeType('sound/mp3')
        ?? new AssetTypeDeclaration('sound/mp3', SoundAsset);

    await Promise.all(keys.map(async (key) =>
    {
        const bytes = xmlBundle.getBytes(key);

        if(bytes === null) return;

        // decodeAudioData() detaches the buffer it is given, and the bundle's bytes are a
        // view onto one shared ArrayBuffer holding every asset - so it gets a copy.
        const buffer = await SoundContext.decode(bytes.slice().buffer as ArrayBuffer);

        if(buffer === null) return;

        const assetName = key.slice('sounds/'.length, -'.mp3'.length);
        const asset = new SoundAsset(declaration, assetName);

        asset.setUnknownContent(buffer);
        vortex.assets.setAsset(assetName, asset, true);
    }));

    log.debug(`Registered ${keys.length} sound assets`);
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
/**
 * Images that some ported class fetches from the asset library by exact name, rather than
 * through the window manager's URL registry. Prefix families are handled inline in
 * readImageAssets(); this is for the one-offs.
 *
 * - dimmer_slider_*: BackgroundColorWidgetSlider's track and thumb.
 * - stickie_*: StickieFurniWidget's blank note, close and delete buttons.
 * - icon_nft: InfoStandFurniView's NFT marker.
 * - thumb_up: ExtraInfoPromoItem in the catalog's bundle purchase display.
 * - the friend list block: every bitmap HabboFriendList.getButtonImage() resolves, which is
 *   every `*_png` field of `binaryData/HabboFriendListCom.as` — that file is the authority,
 *   not a grep of call sites, because AS3 loads them from that component's own library.
 *   Tab headers (hdr_*), the category arrows, the footer buttons and the row buttons.
 */
const LIBRARY_IMAGE_NAMES: ReadonlySet<string> = new Set([
    // Second sweep, over `refreshButton(container, name, ...)` rather than
    // `getAssetByName('<literal>')`. The prescribed grep cannot see these: the
    // name is an argument that HabboNavigator.getButtonImage() resolves, so no
    // literal lookup exists to grep. Every icon in the in-room room-info view
    // is in here.
    'create_room',
    'doormode_doorbell_small',
    'doormode_invisible_small',
    'doormode_password_small',
    'favourite',
    'group_base_icon',
    'home',
    'icon_weblink',
    'make_favourite',
    'make_home',
    'navi_room_icon',
    'popup_arrow_down',
    'remove_rights',

    // Found by the sweep this file's own comment prescribes — every literal
    // getAssetByName() in the monorepo, intersected with the images bundle,
    // minus what was already listed. Twenty names came back: each of them had
    // a PNG shipping, a call site reading it, and no library entry, so each
    // rendered nothing at all. The infostand's house icon is what exposed them.
    'breed_pets_preview_bg',
    'camera_fx_slider_bottom_active',
    'camera_fx_slider_button',
    'dimmer_color_button',
    'dimmer_color_frame',
    'dimmer_color_selected',
    'dimmer_info',
    'extend_hilite',
    'gift_icon_background',
    'gift_incognito',
    'icon_home',
    'inventory_furni_icon_credits',
    'memenu_settings_slider_base',
    'memenu_settings_slider_button',
    'small_pen',
    'sounds_off_color',
    'sounds_off_white',
    'sounds_on_color',
    'sounds_on_white',
    'use_product_preview_bg',

    'dimmer_slider_base',
    'dimmer_slider_button',
    'icon_nft',

    // HabboCatalog.getSubscriptionProductIcon() / getMintTokenProductIcon(): the two icons every
    // subscription and mint-token product renders with. `fx_icon_*` (its third sibling) is
    // already covered by the prefix rule above.
    'icon_hc',
    'minting_token_large',
    'stickie_blanco',
    'stickie_close',
    'stickie_remove',
    'thumb_up',

    // HabboFriendListCom.as
    'arrow_down_black',
    'arrow_down_white',
    'arrow_right_black',
    'arrow_right_white',
    'ask_for_friend',
    'follow_friend',
    'hdr_friend_requests',
    'hdr_friends',
    'hdr_hilite',
    'hdr_search',
    'minimail',
    'offline',
    'open_edit_ctgs',
    'open_homepage',
    'open_inbox',
    'open_minimail',
    'opened_to_web',
    'popup_arrow_left',
    'popup_arrow_right',
    'remove_friend',
    'room_invite',
    'search',
    'start_chat',

    // HabboFriendBarCom.as — the icons the bar's slots read by exact name.
    // `find_friends_icon` is declared in that component but was never extracted into
    // src/assets/images/, so AddFriendsTab shows no icon; AS3 guards the lookup the same
    // way, so this is a missing asset rather than a code gap.
    'add_friends_icon',
    'plus_friend_icon',
    'find_friends_icon',

    // HabboNotificationsCom.as — the icons `habbo_notifications_config_xml` names per
    // notification type. SingularNotificationController resolves each one to a bitmap at
    // startup and hands it to the bubble; a missing entry costs the notification its icon and
    // nothing else, which is the silent failure this list exists to prevent.
    'if_icon_temp',
    'if_icon_hc',
    'if_icon_vip',
    'if_icon_recycler',
    'if_icon_ltd',
    'if_icon_earning',
]);

export class VortexApp 
{
    /**
    * Atlas spritesheet names that need to be decoded as ImageBitmaps.
    *
    * Every compiled window-skin template references one of these by name (the
    * `templates[].asset` field in `window-skins/*.xml`) — this must cover every
    * distinct name any compiled skin uses, or that skin's pieces silently never render.
    */
    private static readonly ATLAS_NAMES = [
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
    private static readonly ATLAS_FILE_OVERRIDES: Record<string, string> = {
        skin_ubuntu_bg_9: 'ubuntu_bg_9',
    };

    private _canvas: HTMLCanvasElement | null = null;
    private _ctx: CanvasRenderingContext2D | null = null;
    private _animFrameId: number = 0;
    private _uiCompositeDirty: boolean = true;
    private _lastUiRenderVersion: number = -1;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/ResourceManager.as::_disposed
    private _disposed: boolean = false;
    // AS3: .../src/binaryData/HabboAir.as::_loadingScreen
    private _loadingScreen: VortexLoadingScreen | null;

    /** Memoized engine boot — see bootstrapEngine(). */
    private _enginePromise: Promise<typeof Vortex.instance> | null = null;
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
     * @see sources/WIN63-202607011411-782849652/src/binaryData/HabboAir.as
     */
    // AS3: .../src/login/LoginFlow.as::init()
    public async init(): Promise<void>
    {
        // INFO in dev, WARN in production, then the `vortex:log` localStorage key and the `?log=`
        // query parameter layered on top — `__log.set('habbo.room', 'debug')` at runtime, no
        // rebuild. See docs/STYLEGUIDE.md → Logging.
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

        // BASE_URL, not a leading `/`: these two live in `public/`, so they are served under
        // whatever base the client is mounted at. Addressed from the ORIGIN root they were fetched
        // from the proxying site instead when vortex-web serves the client at /client — and a Vite
        // dev server answers an unknown path with its own index.html, 200. The bundle then parsed
        // `<!DO` as its header and died on "Unsupported bundle version: 1008821359", which is that
        // text read as a big-endian int. BASE_URL is `/client/` in dev and `/` in a build.
        const [imageBundle, xmlBundle] = await Promise.all([
            AssetBundle.load(`${import.meta.env.BASE_URL}assets-images.bundle`, (ratio: number) =>
            {
                bundleProgress.images = ratio;
                updateBundleProgress();
            }),
            AssetBundle.load(`${import.meta.env.BASE_URL}assets-xml.bundle`, (ratio: number) =>
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

        this._imageBundle = imageBundle;
        this._xmlBundle = xmlBundle;

        // Mount the "What's New" changelog button now, not after login/connect —
        // it's an independent DOM overlay (not a room/toolbar window) and should stay
        // visible even while stuck on the login flow or waiting on the backend.
        this._changelogWindow = new ChangelogWindow();
        this._changelogWindow.mount();

        // AS3: HabboAir.as::createLoginFlowOrLoadingScreen() — with no SSO ticket the login
        // flow is shown and _loadingScreen is never created, which makes the very next call,
        // startCoreInitializationIfPossible(), return on `if(_loadingScreen == null)`. Nothing
        // of the game loads until a ticket exists; in particular SessionDataManager (and its
        // furnidata/productdata downloads) is only constructed once the core starts. So the
        // engine boot lives *after* this gate, not before it.
        const configuredTicket = window.VortexConfig?.connection?.ssoTicket;

        if(!configuredTicket)
        {
            // AS3 shows one or the other, never both: createLoginFlowOrLoadingScreen() returns
            // before createLoadingScreen() when the login flow takes over, and
            // onLoginFlowFinished() then does `_loadingScreen = null; createLoadingScreen();`.
            // Ours is already on screen (index.ts puts it up while the bundles download), so
            // drop it for the duration of the login and stand a fresh one up afterwards.
            this._loadingScreen?.dispose();
            this._loadingScreen = null;

            await this.showLoginFlow(vortexConfig);

            // AS3: onLoginFlowFinished() -> createLoadingScreen()
            this._loadingScreen = new VortexLoadingScreen();
        }

        const vortex = await this.bootstrapEngine(vortexConfig);

        // AS3: the SSO ticket reaches the client through FlashVars either way — HabboAir
        // writes the one the login flow produced back into the same Dictionary
        // (`_SafeStr_4998["sso.token"] = _loginFlow.ssoToken`) before starting the core.
        const ssoTicket = window.VortexConfig?.connection?.ssoTicket;

        if(ssoTicket)
        {
            vortex.habboCommunication.ssoTicket = ssoTicket;
        }

        this.installConnectionActions(vortex);

        // 5. Create the canvas and set desktop sizes BEFORE creating windows.
        //
        // This used to run after connect(), behind an unconditional dispose of the loading
        // screen. That dispose was a second, ungated owner: VortexMain.onExitFrame() already
        // implements AS3's real condition (`if(_SafeStr_8656 && _SafeStr_9943)` in
        // HabboAir.as — room engine ready AND core running), and AS3 never waits on the
        // connection for it. Doing it here as well meant the loader's lifetime was decided by
        // whichever fired first. The engine now owns it alone, so the canvas has to exist by
        // the time that gate opens — hence before connect() rather than after.
        this.createCanvas();

        await vortex.connect();

        await this.initClientUi(vortex);
    }

    /**
     * Boots the engine and loads everything that depends on it (fonts, chat styles, window
     * skins, layouts). Idempotent: the login flow's avatar creator calls it too, so the two
     * entry points share one boot rather than racing a second one.
     *
     * AS3: HabboAir.as::startCoreInitializationIfPossible() -> prepareCore(). Nothing in here
     * may run before an SSO ticket exists — see the gate in init().
     */
    private bootstrapEngine(vortexConfig: IVortexConfig): Promise<typeof Vortex.instance>
    {
        if(!this._enginePromise)
        {
            this._enginePromise = this.doBootstrapEngine(vortexConfig);
        }

        return this._enginePromise;
    }

    private async doBootstrapEngine(vortexConfig: IVortexConfig): Promise<typeof Vortex.instance>
    {
        const imageBundle = this._imageBundle!;
        const xmlBundle = this._xmlBundle!;

        // The window assets are parsed BEFORE the engine boots and handed to it, so
        // HabboWindowManager owns them at construction the way AS3's does (its third
        // constructor argument is the already-filled AssetLibrary). See IVortexWindowAssets.
        const vortex = await Vortex.bootstrap(
            {...vortexConfig, windowAssets: await this.readWindowAssets(imageBundle, xmlBundle)},
            this._loadingScreen ?? undefined
        );

        if(import.meta.env.DEV)
        {
            // Dev-only console access, e.g. Vortex.instance.configuration.getProperty('...').
            // Vortex is only ever ES-module-imported elsewhere, so without this the class
            // (and its `instance` singleton getter) isn't reachable from the browser console.
            (window as unknown as { Vortex: typeof Vortex }).Vortex = Vortex;
        }

        // Register bundled webfonts (Volter/Ubuntu) before anything renders text —
        // see loadWebFonts() for why this was previously silently missing.
        await loadWebFonts(xmlBundle);

        // Chat-style bitmaps need real ImageBitmaps (not the standard image/png ->
        // BitmapDataAsset/Texture pipeline) - see registerChatStyleImageAssets()'s own
        // header comment for why. chatstyles_xml/regpoints text already went in above via
        // embeddedConfigurations.
        await registerChatStyleImageAssets(vortex, imageBundle, xmlBundle);

        // The sound manager reads these synchronously through Component.assets the first
        // time anything calls playSound().
        await registerSoundAssets(vortex, xmlBundle);

        return vortex;
    }

    /**
     * Parses the window skins, atlases and layouts out of the asset bundles.
     *
     * Kept separate from the engine boot on purpose: the result is passed *into*
     * Vortex.bootstrap() (IVortexConfig.windowAssets) rather than pushed onto a live window
     * manager afterwards, which is what AS3 does by handing HabboWindowManagerComponent its
     * AssetLibrary as a constructor argument.
     */
    private async readWindowAssets(imageBundle: AssetBundle, xmlBundle: AssetBundle): Promise<IVortexWindowAssets>
    {
        const windowAssets: IVortexWindowAssets = {};

        // 2. Load element descriptions + atlas bitmaps from bundle
        try
        {
            const elementDescriptionKey = `window-skins/${ELEMENT_DESCRIPTION_ASSET}.xml`;
            const elementDescriptionXml = xmlBundle.getText(elementDescriptionKey);

            if(elementDescriptionXml)
            {
                windowAssets.elementDescription = parseElementDescriptionFromBundle(
                    elementDescriptionXml,
                    elementDescriptionKey
                );
            }

            // Decode atlas spritesheets as ImageBitmaps
            const bitmaps = await Promise.all(
                VortexApp.ATLAS_NAMES.map(name => imageBundle.getImageBitmap(`images/${VortexApp.ATLAS_FILE_OVERRIDES[name] ?? name}.png`))
            );

            const atlases = new Map<string, ImageBitmap>();

            for(let i = 0; i < VortexApp.ATLAS_NAMES.length; i++) 
            {
                const bmp = bitmaps[i];

                if(bmp) atlases.set(VortexApp.ATLAS_NAMES[i], bmp);
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

            // 2b. Vortex's own authored skins (src/vortex-skins/*.xml), registered last so a file
            // named after a dump skin replaces it. Same reasoning as readVortexLayouts() below:
            // src/assets/window-skins/ is gitignored and rebuilt from the dump by
            // tools/build-window-assets.mjs, so a hand-authored file placed there would be wiped
            // on the next asset build.
            const vortexElementDescription = this.readVortexSkins(skins);

            if(vortexElementDescription)
            {
                windowAssets.elementDescription = vortexElementDescription;
            }

            windowAssets.skins = skins;
            windowAssets.atlases = atlases;
        }
        catch (error)
        {
            log.warn('Failed to load skin/element assets:', error);
        }

        const layoutsByName = new Map<string, string>();

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
                    layoutsByName.set(name, layout.xml);
                }
            }
        }

        // 3b. Vortex's own authored layouts (src/vortex-layouts/*.xml). These are not from
        // the dump and deliberately do not live in src/assets/window-layouts/, which is gitignored
        // and rebuilt by tools/build-window-assets.mjs — a file placed there would be wiped on the
        // next asset build. Registered under their file basename, the same way vortex-glaze
        // registers its editor layouts.
        this.readVortexLayouts(layoutsByName);

        windowAssets.layouts = layoutsByName;

        // 3c. The asset library's own copy of each layout, keyed by the file basename and holding
        // the whole file — see IVortexWindowAssets.libraryLayouts for why this is not `layouts`.
        // Only the dump's layouts, as before: Vortex's own authored ones (3b) are reached through
        // buildWidgetLayout() alone, and nothing looks them up by name in the library.
        windowAssets.libraryLayouts = readLibraryLayouts(xmlBundle);

        // 4. Images. Both halves go in before the engine boots, because components built during
        // prepareCore() read from both — see registerWindowAssetLibraryContent() in VortexMain.
        const {imageUrls, libraryImages} = await readImageAssets(imageBundle);

        windowAssets.imageUrls = imageUrls;
        windowAssets.libraryImages = libraryImages;

        return windowAssets;
    }

    /**
     * Everything that only makes sense once the client is authenticated and on screen.
     */
    /**
     * Gives the communication manager somewhere to report connection state.
     *
     * Nothing ever called `setConnectionActions()`, so `_connectionActions` stayed null
     * and every state change — including the server going away — was logged and dropped.
     * That is why the client sat there fully rendered after the emulator stopped.
     *
     * Only `setDisconnected()` does anything today, and it only fires on a peer-initiated
     * close (see HabboCommunicationManager.connectionClosed): a frozen background tab
     * must not log the player out.
     *
     * AS3 hands this to the login flow (`loginFlow.showDisconnected()`), but this port
     * disposes its LoginFlow once boot is done — there is no live instance to show. A
     * reload is the honest equivalent: it lands on the same login screen the client
     * starts from, with no half-torn-down engine left behind.
     *
     * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/demo/_SafeCls_98.as::disconnected()
     */
    private installConnectionActions(vortex: typeof Vortex.instance): void
    {
        vortex.habboCommunication.setConnectionActions({
            setConnecting: () => undefined,
            setConnected: () => undefined,
            setAuthenticated: () => undefined,
            setError: () => undefined,
            setLoginStep: () => undefined,
            reset: () => undefined,
            setDisconnected: () =>
            {
                log.warn('Server closed the connection - returning to the login screen');

                window.location.reload();
            }
        });
    }

    private async initClientUi(vortex: typeof Vortex.instance): Promise<void>
    {
        // Dev-only visual window debugger (Ctrl+Shift+D). Never bundled in
        // production — import.meta.env.DEV is statically stripped by Vite.
        if(import.meta.env.DEV && this._canvas)
        {
            this._uninstallWindowDebugger = installWindowDebugger(this._canvas);
        }

        // 7. Images and layouts are no longer registered here: they ride in on
        // IVortexWindowAssets and are in place before the first component is constructed.
        // See readImageAssets()/readLibraryLayouts().

        // 8. Initialize the Friend Bar (landing view) — desktops are now sized
        vortex.initFriendBar();

        // 8b. Initialize the friend list window component. Separate from the friend bar,
        // and its own SWF in AS3 (HabboFriendListCom). Same ordering constraint: its views
        // are built from registered layouts.
        vortex.initFriendList();

        // 9. Activate the toolbar (hotel view by default)
        vortex.toolbar.setToolbarState(HabboToolbarEnum.TOOLBAR_STATE_HOTEL_VIEW);

        // 10. Listen for room state changes to track when we are in a room
        this.setupRoomStateTracking();

        // 11. Flush microtasks
        await Promise.resolve();

        // 12. Start input and render loop
        this.setupMouseEvents();
        this.startRenderLoop();

        // 13. New-user flow, if the server asked for it.
        this.startOnBoardingIfRequired(vortex);
    }

    /**
     * Runs the onboarding flow when the server's login actions call for it.
     *
     * AS3: HabboLandingView.as::onAvatarRendererReady() — `isOnboardingRequired(suggestedLoginActions)`
     * is `actions.indexOf(0) >= 0 || actions.indexOf(1) >= 0`, i.e. "change your name" or "pick a
     * room". AS3 hangs this off the landing view because that is the component holding the avatar
     * renderer; here it lives with the other client-side flows, since the flow is display code and
     * the engine may not reach into it.
     *
     * The toolbar is hidden for the duration, as `HabboLandingView.activate()` does.
     */
    private startOnBoardingIfRequired(vortex: typeof Vortex.instance): void
    {
        const actions = (vortex.habboCommunication.suggestedLoginActions ?? []) as number[];

        if(actions.indexOf(OnBoardingHcFlow.AVATAR_NAME_CHANGE) < 0
            && actions.indexOf(OnBoardingHcFlow.NEW_ROOM_SELECT) < 0)
        {
            return;
        }

        const container = document.getElementById('vortex-ui');

        if(!container)
        {
            log.warn('No #vortex-ui container to mount the onboarding flow in');

            return;
        }

        void LoginAssets.load(this._imageBundle!).then(() =>
        {
            const stage = new Stage(container);
            const flow = new OnBoardingHcFlow(
                vortex.windowManager.avatarRenderer,
                vortex.localization,
                vortex.habboCommunication
            );

            vortex.toolbar.setToolbarState(HabboToolbarEnum.TOOLBAR_STATE_HIDDEN);
            stage.addChild(flow);
            flow.setHcVisibility(false);
            flow.init(actions);
            flow.flowEvents.once(OnBoardingHcFlow.NEW_USER_FLOW_FINISHED_EVENT, () =>
            {
                flow.dispose();
                stage.dispose();
                vortex.toolbar.setToolbarState(HabboToolbarEnum.TOOLBAR_STATE_HOTEL_VIEW);
            });
        });
    }

    /**
     * Registers Vortex's own authored window skins (src/vortex-skins/*.xml) under their file
     * basename, bundled at build time via import.meta.glob — the skin counterpart of
     * readVortexLayouts().
     *
     * The basename is the skin id, which is what an element descriptor's `asset` field points at
     * (HabboWindowManager.loadSkinAssets()). So a file named after a dump skin — e.g.
     * `habbo_skin_frame.xml` — replaces that skin wholesale for every descriptor using it, while a
     * brand-new id renders nothing until some descriptor asks for it: skins are only ever reached
     * through the element description, never by name from a layout.
     *
     * That is what the `habbo_element_description_xml.xml` override is for. A file under that name
     * replaces the dump's element description entirely (it is one XML, not a merge), which is the
     * only way to bind a new skin id to a type/style/intent triplet.
     *
     * Templates still resolve their bitmaps out of the atlases decoded above, so a skin here can
     * only reference an atlas listed in ATLAS_NAMES — a new spritesheet needs a new entry there
     * plus the PNG in the image bundle.
     *
     * @param sink - the skin map being built, mutated in place
     * @returns the element-description override if one was authored, otherwise null
     */
    private readVortexSkins(sink: Map<string, ISkinData>): IElementDescriptionData | null
    {
        const modules = import.meta.glob('./vortex-skins/*.xml', {
            query: '?raw',
            import: 'default',
            eager: true
        }) as Record<string, string>;

        let elementDescription: IElementDescriptionData | null = null;

        for(const [path, xml] of Object.entries(modules))
        {
            const name = path.split('/').pop()!.replace(/\.xml$/, '');

            // Parsed per file: a malformed hand-authored skin must not take the dump's skins down
            // with it, the way the bundle loop above would (its throw unwinds to the outer catch).
            try
            {
                if(name === ELEMENT_DESCRIPTION_ASSET)
                {
                    elementDescription = parseElementDescriptionFromBundle(xml, path);
                    continue;
                }

                const skin = parseSkinFromBundle(xml, name, path);

                if(skin) sink.set(skin.id, skin);
                else log.warn(`Vortex skin has no <skin> root element, ignored: ${path}`);
            }
            catch (error)
            {
                log.warn(`Failed to parse Vortex skin: ${path}`, error);
            }
        }

        return elementDescription;
    }

    /**
     * Registers Vortex's own authored window layouts (src/vortex-layouts/*.xml) under their file
     * basename, bundled at build time via import.meta.glob.
     *
     * These are not Habbo assets: they belong to Vortex-only tools (the furni editor) and have no
     * counterpart in the dump.
     */
    private readVortexLayouts(sink: Map<string, string>): void
    {
        const modules = import.meta.glob('./vortex-layouts/*.xml', {
            query: '?raw',
            import: 'default',
            eager: true
        }) as Record<string, string>;

        for(const [path, xml] of Object.entries(modules))
        {
            const name = path.split('/').pop()!.replace(/\.xml$/, '');

            sink.set(name, xml);
        }
    }

    /**
     * Disposes the application and cleans up resources.
     */
    // AS3: .../src/com/sulake/habbo/window/HabboWindowManagerComponent.as::dispose()
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
        document.removeEventListener('visibilitychange', this._onVisibilityChange);

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
     * It runs on its own embedded-only configuration (LoginFlow.createConfiguration), so the
     * engine is still unbooted here — connecting is the caller's job, once init() has booted
     * it. The one screen that needs an engine boots it through the ensureEngine callback.
     *
     * @see sources/WIN63-202607011411-782849652/src/login/LoginFlow.as
     * @returns Promise that resolves when the login flow finishes
     */
    private async showLoginFlow(vortexConfig: IVortexConfig): Promise<void>
    {
        const container = document.getElementById('vortex-ui');

        if(!container)
        {
            throw new Error('[VortexApp] No #vortex-ui container to mount the login flow in');
        }

        // AS3 reaches its login artwork through [Embed]ed classes, which are ready as soon as the
        // SWF loads. Ours has to be decoded out of the image bundle first — the bundle is already
        // downloaded by this point, so this only costs the decode.
        if(this._imageBundle)
        {
            await LoginAssets.load(this._imageBundle);
        }

        const stage = new Stage(container);

        return new Promise((resolve, reject) =>
        {
            const loginFlow = new LoginFlow(vortexConfig.embeddedConfigurations ?? {}, container);

            // AS3: HabboAir adds the flow to the stage, then calls init() — which reads `stage`.
            stage.addChild(loginFlow);

            void loginFlow.mount().then(() => loginFlow.init());

            loginFlow.loginEvents.once(LoginFlow.LOGIN_FLOW_FINISHED_EVENT, () =>
            {
                try
                {
                    const token = loginFlow.ssoToken;

                    if(!token)
                    {
                        throw new Error('[VortexApp] Login flow finished without SSO ticket');
                    }

                    // Hand the ticket over the same way AS3 does — back into the FlashVars-equivalent
                    // config, which init() reads once the engine is up.
                    if(!window.VortexConfig?.connection)
                    {
                        // connect() reads host/ports from here too, so a missing block is a
                        // misconfiguration, not something to paper over with a partial object.
                        throw new Error('[VortexApp] No connection configuration to attach the SSO ticket to');
                    }

                    window.VortexConfig.connection.ssoTicket = token;

                    loginFlow.dispose();
                    stage.dispose();
                    LoginAssets.dispose();
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
        document.addEventListener('visibilitychange', this._onVisibilityChange);
    }

    /** Bound resize handler. */
    private _onResize = (): void =>
    {
        this.resizeCanvas();
    };

    /**
     * Forces a full recomposite when the tab returns to the foreground.
     *
     * requestAnimationFrame (which drives both the Pixi ticker and this render loop) is paused
     * entirely by the browser while the tab is hidden, so the last painted frame is stale on
     * return. The network model itself was kept current by SocketConnection processing packets on
     * the WebSocket 'message' event (which keeps firing while hidden), so here we only need to
     * force the first resumed frame to recomposite the UI; the room canvas repaints from its own
     * resumed ticker.
     */
    private _onVisibilityChange = (): void =>
    {
        if(document.visibilityState === 'visible')
        {
            this._uiCompositeDirty = true;
        }
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

        // Everything below is the `ui` channel of the `:showstats` frame budget: the skin
        // re-render of every dirty window, the full-tree composite, and the blit. It opens past
        // the dirty gate above, so frames that change nothing bill zero and are still folded into
        // the mean — the reported figure is therefore the UI's **share of an average frame**, not
        // the cost of one repaint. That is the comparable quantity: `room` and `pixi` are billed
        // every frame, so the three lines add up to where the frame actually goes. A UI repaint
        // costing 8ms but running every other frame reads as 4ms here, by design.
        FrameTimings.begin(FRAME_CHANNEL_UI);

        try
        {
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
        finally
        {
            FrameTimings.end(FRAME_CHANNEL_UI);
        }
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

                        this.synthesizeClick(clickHit, ux - cp.x, uy - cp.y, ev.clientX, ev.clientY, ev.altKey, ev.ctrlKey, ev.shiftKey);
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

        // Update cursor: pointer on mouse-event-enabled windows.
        //
        // With nothing hit, the rule is *cleared* rather than set to 'default': the room engine
        // writes the document cursor (RoomEngine.updateMouseCursor(), the hand over a usable
        // furni or an avatar) and a canvas rule of its own would win over it across the whole
        // room area. A window that is hit still wins, so the hand cannot bleed onto the UI.
        if(this._canvas)
        {
            this._canvas.style.cursor = hit ? (hit.testParamFlag(1) ? 'pointer' : 'default') : '';
        }
    };

    /**
     * Dispatches a CLICK to the hit window, and — when this is the second click on the same window
     * within DOUBLE_CLICK_MS/DIST — a DOUBLE_CLICK too. The browser gives us no dblclick here because
     * clicks are synthesized from mousedown/mouseup, so this reconstructs it. RoomDesktop maps the
     * WME_DOUBLE_CLICK to the room 'doubleClick' event (e.g. FurnitureLogic.useObject → open wired),
     * mirroring Flash's doubleClick firing after two clicks.
     */
    private synthesizeClick(
        clickHit: IWindow, localX: number, localY: number, clientX: number, clientY: number,
        altKey: boolean = false, ctrlKey: boolean = false, shiftKey: boolean = false
    ): void
    {
        // The modifier state MUST be threaded through: a click on a mouse-enabled window (which
        // includes the room canvas wrapper) is synthesized here, and the room's CTRL/SHIFT+click
        // furniture shortcuts read event.ctrlKey/shiftKey off this event. Dropping them (the old
        // default-false behaviour) is exactly why CTRL/SHIFT+click did nothing while ALT+drag —
        // which flows through the modifier-carrying mouse-DOWN path — worked.
        const clickEvent = WindowMouseEvent.allocateMouse(
            WindowMouseEvent.CLICK, clickHit, null,
            localX, localY, clientX, clientY,
            altKey, ctrlKey, shiftKey, false
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
                localX, localY, clientX, clientY,
                altKey, ctrlKey, shiftKey, false
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
        this.synthesizeClick(hit, x - globalPos.x, y - globalPos.y, e.clientX, e.clientY, e.altKey, e.ctrlKey, e.shiftKey);
    };

    /** Canvas wheel handler. */
    private _onWheel = (e: WheelEvent): void =>
    {
        const {x, y} = this.getCanvasCoords(e);
        const vortex = Vortex.instance;

        // AS3: RoomDesktop.as::mouseWheelHandler() — a plain wheel (no modifier) while a floor-
        // furniture placement/move preview is active rotates the ghost in place. This must be
        // tried BEFORE the window-hit branching: the room canvas is itself a mouse-enabled window,
        // so findWindowAtPoint() returns it (non-null) over the room and the old `!hit`-gated
        // version never ran. rotateActiveObjectPreview self-gates (returns false when no cat-10
        // preview is active), so normal wheel scrolling is untouched outside placement/move.
        // Flash delta>0 is scroll-up = "forward"; the DOM's deltaY is inverted, so scroll-up is deltaY<0.
        if(this._isInRoom && !e.ctrlKey && !e.altKey && !e.shiftKey)
        {
            try
            {
                if(vortex.roomEngine.rotateActiveObjectPreview(this._activeRoomId, e.deltaY < 0))
                {
                    return;
                }
            }
            catch
            {
                // RoomEngine not yet initialized
            }
        }

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

        // Flash raised two distinct stage events, `mouseWheel` and `mouseWheelHorizontal`,
        // and ItemList/ItemGrid branch on the resulting WME type to pick the horizontal
        // scroller. The DOM has one `wheel` event carrying both axes, so the axis is
        // resolved here and the matching WME type dispatched.
        const isHorizontal = NativeWheelDelta.isHorizontal(e);
        const wheelType = isHorizontal ? WindowMouseEvent.WHEEL_HORIZONTAL : WindowMouseEvent.WHEEL;
        const wheelDelta = isHorizontal
            ? NativeWheelDelta.horizontalFromWheelEvent(e)
            : NativeWheelDelta.fromWheelEvent(e);

        while(target && !target.disposed)
        {
            const globalPos = this._globalPosScratch;

            target.getGlobalPosition(globalPos);

            // NativeWheelDelta converts the DOM's deltaY (pixels/lines/pages, positive
            // downwards) into the Flash line unit the window system is built on (positive
            // upwards, 25px per line) - see its header for why the raw deltaY made lists
            // jump straight to the top or the bottom.
            const event = WindowMouseEvent.allocateMouse(
                wheelType, target, null,
                x - globalPos.x, y - globalPos.y, e.clientX, e.clientY,
                e.altKey, e.ctrlKey, e.shiftKey, false,
                wheelDelta
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
