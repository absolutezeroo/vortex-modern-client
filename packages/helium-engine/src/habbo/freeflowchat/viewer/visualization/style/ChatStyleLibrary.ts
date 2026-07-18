import {Point, Rectangle} from 'pixi.js';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IDisposable} from '@core/runtime';
import {Logger} from '@core/utils/Logger';
import type {IChatTextFormat} from '@habbo/freeflowchat/style/IChatStyle';
import type {IChatStyleLibrary} from '@habbo/freeflowchat/style/IChatStyleLibrary';
import type {IChatLinkStyleSheet} from './IChatStyleInternal';
import {ChatStyle, type IChatStyleDescriptor} from './ChatStyle';

const log = Logger.getLogger('ChatStyleLibrary');

interface IChatStyleAttributes
{
    assetId: string;
    isSystemStyle: boolean;
    purchasable: boolean;
    isHcOnly: boolean;
    isStaffOverrideable: boolean;
    allowHTML: boolean;
    isAmbassadorOnly: boolean;
    isNotification: boolean;
}

/**
 * ChatStyleLibrary
 *
 * Parses the `chatstyles_xml` catalog and builds a {@link ChatStyle} for
 * every `<style>` entry from its `style_<assetId>_*` bitmap assets and
 * `style_<assetId>_regpoints` config text.
 *
 * TS-only note: unlike AS3's synchronously-embedded assets, this port's
 * per-style bitmaps are registered into the asset library asynchronously
 * (App.ts's registerChatStyleImageAssets(), after Helium.bootstrap()
 * resolves), which is after this component is constructed. So styles are
 * built lazily on first `getStyle()`/`getStyleIds()`-driven access instead of
 * eagerly in the constructor - by the time anything actually renders a
 * bubble or opens the style selector, image registration has long since
 * completed. The constructor only parses the catalog's `<style>` attributes.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/style/ChatStyleLibrary.as
 */
export class ChatStyleLibrary implements IChatStyleLibrary, IDisposable
{
    private static readonly DEFAULT_STYLE_ID: number = 0;

    private _assets: IAssetLibrary | null;
    private readonly _styles: Map<number, ChatStyle> = new Map();
    private readonly _styleAttributes: Map<number, IChatStyleAttributes> = new Map();

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/style/ChatStyleLibrary.as::ChatStyleLibrary()
    constructor(assets: IAssetLibrary)
    {
        this._assets = assets;

        const catalog = assets.getAssetByName('chatstyles_xml');
        const root = (catalog?.content as Document | null)?.documentElement ?? null;

        if(!root)
        {
            log.warn('Missing chatstyles_xml asset - freeflowchat chat styles unavailable');

            return;
        }

        for(const styleNode of Array.from(root.children).filter((element) => element.tagName === 'style'))
        {
            const id = parseInt(styleNode.getAttribute('id') ?? '0', 10);

            this._styleAttributes.set(id, {
                assetId: styleNode.getAttribute('assetId') ?? '',
                isSystemStyle: styleNode.getAttribute('systemStyle') === 'true',
                purchasable: styleNode.getAttribute('purchasable') === 'true',
                isHcOnly: styleNode.getAttribute('hcOnly') === 'true',
                isStaffOverrideable: styleNode.getAttribute('staffOverrideable') === 'true',
                allowHTML: styleNode.getAttribute('allowHTML') === 'true',
                isAmbassadorOnly: styleNode.getAttribute('ambassadorOnly') === 'true',
                isNotification: styleNode.getAttribute('notification') === 'true',
            });
        }
    }

    // TS-only: lazily builds (and caches) the ChatStyle for one catalog entry -
    // see the class header for why this replaced eager construction.
    private buildStyle(id: number): ChatStyle | null
    {
        const cached = this._styles.get(id);

        if(cached) return cached;

        const attributes = this._styleAttributes.get(id);

        if(!attributes) return null;

        try
        {
            const style = this.initializeStyleFromAssets(
                attributes.assetId,
                attributes.isSystemStyle,
                attributes.purchasable,
                attributes.isHcOnly,
                attributes.isStaffOverrideable,
                attributes.allowHTML,
                attributes.isAmbassadorOnly,
                attributes.isNotification
            );

            this._styles.set(id, style);

            return style;
        }
        catch (error)
        {
            log.warn(`Error initializing chat style: ${id}, error message: ${error}`);

            return null;
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/style/ChatStyleLibrary.as::initializeStyleFromAssets()
    private initializeStyleFromAssets(
        assetId: string,
        isSystemStyle: boolean,
        purchasable: boolean,
        isHcOnly: boolean,
        isStaffOverrideable: boolean,
        allowHTML: boolean,
        isAmbassadorOnly: boolean,
        isNotification: boolean
    ): ChatStyle
    {
        const assets = this.assets;
        const config = (assets.getAssetByName(`style_${assetId}_regpoints`)?.content as string | null) ?? '';
        const background = assets.getAssetByName(`style_${assetId}_chat_bubble_base`)?.content as ImageBitmap;

        // AS3's own initializeStyleFromAssets() reads getConfigPoint(config,"9sliceXY"/"9sliceWH")
        // with no hasConfig() guard, same unguarded-AS3-bug pattern as "pointerY" below - a
        // style whose regpoints config is entirely empty (no regpoints asset at all, e.g. the
        // system/notification styles: notification_red/green/wrong/correct_circle/
        // question_mark/skull, all missing their regpoints file) throws there in AS3 too,
        // which the surrounding try/catch (constructor in AS3, buildStyle() here) silently
        // turns into "this style's data is actually style 0's" - including its isSystemStyle
        // flag, which is how these system styles were leaking into the user-facing chat-style
        // picker (RoomChatInputView.createOrUpdateChatStylesView()'s `style.isSystemStyle`
        // filter check was reading style 0's flag instead of the real one). Guarded here to
        // match the established pointerY precedent instead of reproducing the crash.
        const sliceXY = this.hasConfig(config, '9sliceXY') ? this.getConfigPoint(config, '9sliceXY') : new Point(0, 0);
        const sliceWH = this.hasConfig(config, '9sliceWH') ? this.getConfigPoint(config, '9sliceWH') : new Point(0, 0);
        const scale9Grid = new Rectangle(sliceXY.x, sliceXY.y, sliceWH.x, sliceWH.y);
        const faceOffset = this.hasConfig(config, 'faceXY') ? this.getConfigPoint(config, 'faceXY') : null;

        let pointer: ImageBitmap | null = null;
        let pointerY = 0;
        let pointerXMargins: number[] | null = null;

        if(!(this.hasConfig(config, 'anonymous') ? this.getConfigBoolean(config, 'anonymous') : false))
        {
            pointer = (assets.getAssetByName(`style_${assetId}_chat_bubble_pointer`)?.content as ImageBitmap | null) ?? null;

            // AS3's own initializeStyleFromAssets() reads getConfigCSV(config,"pointerY")[0]
            // with no hasConfig() guard, unlike every sibling property in this same method
            // (fontFace/fontSize/textColorRGB/etc.) - a real, unguarded AS3 bug, not a porting
            // deviation. A style whose config lacks "pointerY" (observed for style id 3) throws
            // there in AS3 too; guarded here to match the established sibling pattern instead of
            // reproducing the crash, since the surrounding try/catch already just no-ops the
            // style on failure regardless.
            pointerY = this.hasConfig(config, 'pointerY') ? parseInt(this.getConfigCSV(config, 'pointerY')![0], 10) : 0;
            pointerXMargins = this.hasConfig(config, 'pointerXMargins') ? this.getConfigIntArray(config, 'pointerXMargins') : null;
        }

        let emblem: ImageBitmap | null = null;
        let emblemOffset: Point | null = null;

        if(this.hasConfig(config, 'emblemXY') && assets.hasAsset(`style_${assetId}_chat_bubble_emblem`))
        {
            emblem = (assets.getAssetByName(`style_${assetId}_chat_bubble_emblem`)?.content as ImageBitmap | null) ?? null;
            emblemOffset = this.getConfigPoint(config, 'emblemXY');
        }

        let emblemMultiline: ImageBitmap | null = null;
        let emblemMultilineOffset: Point | null = null;

        if(this.hasConfig(config, 'emblemMultilineXY') && assets.hasAsset(`style_${assetId}_chat_bubble_emblem_multiline`))
        {
            emblemMultiline = (assets.getAssetByName(`style_${assetId}_chat_bubble_emblem_multiline`)?.content as ImageBitmap | null) ?? null;
            emblemMultilineOffset = this.getConfigPoint(config, 'emblemMultilineXY');
        }

        const icon = assets.hasAsset(`style_${assetId}_icon`)
            ? ((assets.getAssetByName(`style_${assetId}_icon`)?.content as ImageBitmap | null) ?? null)
            : null;
        // AS3's own initializeStyleFromAssets() reads getConfigRect(config,"textFieldMargins")
        // with no hasConfig() guard either - same unguarded-AS3-bug pattern noted above for
        // 9sliceXY/9sliceWH, guarded here for the same reason.
        const textFieldMargins = this.hasConfig(config, 'textFieldMargins') ? this.getConfigRect(config, 'textFieldMargins') : new Rectangle(0, 0, 0, 0);
        const selectorPreview = assets.getAssetByName(`style_${assetId}_selector_preview`)?.content as ImageBitmap;

        let color: ImageBitmap | null = null;

        if(assets.hasAsset(`style_${assetId}_chat_bubble_color`))
        {
            color = (assets.getAssetByName(`style_${assetId}_chat_bubble_color`)?.content as ImageBitmap | null) ?? null;
        }

        const colorOffset = this.hasConfig(config, 'colorXY') ? this.getConfigPoint(config, 'colorXY') : null;
        const overlap = this.hasConfig(config, 'overlapRect') ? this.getConfigRect(config, 'overlapRect') : null;
        const textColor = this.hasConfig(config, 'textColorRGB') ? Number(this.getConfigCSV(config, 'textColorRGB')![0]) : 0;
        const fontFace = this.hasConfig(config, 'fontFace') ? this.getConfigCSV(config, 'fontFace')![0] : 'Volter';
        const fontSize = this.hasConfig(config, 'fontSize') ? parseInt(this.getConfigCSV(config, 'fontSize')![0], 10) : 9;
        const textFormat: IChatTextFormat = {fontFace, fontSize, color: textColor};

        const linkColor = this.hasConfig(config, 'linkColorRGB') ? Number(this.getConfigCSV(config, 'linkColorRGB')![0]) : textColor;
        const linkHoverColor = this.hasConfig(config, 'linkHoverColorRGB') ? Number(this.getConfigCSV(config, 'linkHoverColorRGB')![0]) : textColor;
        const linkActiveColor = this.hasConfig(config, 'linkActiveColorRGB') ? Number(this.getConfigCSV(config, 'linkActiveColorRGB')![0]) : textColor;

        const styleSheet: IChatLinkStyleSheet = {
            linkColor: this.toHexString(linkColor),
            linkHoverColor: this.toHexString(linkHoverColor),
            linkActiveColor: this.toHexString(linkActiveColor),
        };

        const usePixelPerfectNineSlice = this.hasConfig(config, 'usePixelPerfectNineSlice') && this.getConfigBoolean(config, 'usePixelPerfectNineSlice');

        const descriptor: IChatStyleDescriptor = {
            background,
            scale9Grid,
            pointer,
            pointerY,
            pointerXMargins,
            textFieldMargins,
            textFormat,
            // AS3: initializeStyleFromAssets() passes a hardcoded `false` here — the
            // "anonymous" config flag computed above only ever gates whether the
            // pointer bitmap/margins are loaded, it's never threaded into ChatStyle.
            isAnonymous: false,
            emblem,
            emblemOffset,
            emblemMultiline,
            emblemMultilineOffset,
            faceOffset,
            icon,
            selectorPreview,
            isSystemStyle,
            purchasable,
            isHcOnly,
            isStaffOverrideable,
            isAmbassadorOnly,
            isNotification,
            color,
            colorOffset,
            overlap,
            allowHTML,
            styleSheet,
            usePixelPerfectNineSlice,
        };

        return new ChatStyle(descriptor);
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/style/ChatStyleLibrary.as::toHexString()
    private toHexString(color: number): string
    {
        let hex = (color >>> 0).toString(16);

        while(hex.length < 6)
        {
            hex = '0' + hex;
        }

        return `#${hex}`;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/style/ChatStyleLibrary.as::hasConfig()
    private hasConfig(config: string, key: string): boolean
    {
        return config.indexOf(key) !== -1;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/style/ChatStyleLibrary.as::getConfigCSV()
    private getConfigCSV(config: string, key: string): string[] | null
    {
        const keyIndex = config.indexOf(key);

        if(keyIndex === -1) return null;

        const eqIndex = config.indexOf('=', keyIndex);
        let endIndex = config.indexOf('\r\n', eqIndex);

        if(endIndex === -1) endIndex = config.indexOf('\n', eqIndex);
        if(endIndex === -1) endIndex = config.length;

        const hasLeadingSpace = config.charAt(eqIndex + 1) === ' ';
        const start = eqIndex + (hasLeadingSpace ? 2 : 1);

        return config.substring(start, endIndex).split(',');
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/style/ChatStyleLibrary.as::getConfigPoint()
    private getConfigPoint(config: string, key: string): Point
    {
        const csv = this.getConfigCSV(config, key)!;

        return new Point(parseInt(csv[0], 10), parseInt(csv[1], 10));
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/style/ChatStyleLibrary.as::getConfigIntArray()
    private getConfigIntArray(config: string, key: string): number[]
    {
        const csv = this.getConfigCSV(config, key) ?? [];

        return csv.map((value) => parseInt(value, 10));
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/style/ChatStyleLibrary.as::getConfigRect()
    private getConfigRect(config: string, key: string): Rectangle
    {
        const csv = this.getConfigCSV(config, key)!;

        return new Rectangle(parseInt(csv[0], 10), parseInt(csv[1], 10), parseInt(csv[2], 10), parseInt(csv[3], 10));
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/style/ChatStyleLibrary.as::getConfigBoolean()
    private getConfigBoolean(config: string, key: string): boolean
    {
        return this.getConfigCSV(config, key)?.[0] === 'true';
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/style/ChatStyleLibrary.as::getStyleIds()
    getStyleIds(): number[]
    {
        // AS3 builds every style eagerly at init inside a try/catch and adds only the
        // ones that succeed, so getStyleIds() returns buildable styles only. The lazy
        // port listed every catalog attribute key, including styles whose buildStyle()
        // throws — the style selector then showed empty previews. Build each here
        // (results are cached in _styles) and keep only the ones that construct.
        const ids: number[] = [];

        for(const id of this._styleAttributes.keys())
        {
            if(this.buildStyle(id) !== null)
            {
                ids.push(id);
            }
        }

        return ids;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/style/ChatStyleLibrary.as::getStyle()
    // Narrower return type than IChatStyleLibrary's (ChatStyle also implements
    // IChatStyleInternal) — ChatBubbleFactory holds this concrete class and needs
    // the fuller shape (pointer margins, emblem, styleSheet...) to build a bubble.
    getStyle(styleId: number): ChatStyle | null
    {
        return this.buildStyle(styleId) ?? this.buildStyle(ChatStyleLibrary.DEFAULT_STYLE_ID);
    }

    private get assets(): IAssetLibrary
    {
        if(!this._assets)
        {
            throw new Error('[ChatStyleLibrary] Not initialized');
        }

        return this._assets;
    }

    private _disposed: boolean = false;

    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/style/ChatStyleLibrary.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;
        this._styles.clear();
        this._styleAttributes.clear();
        this._assets = null;
    }
}
