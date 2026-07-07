import {Point, Rectangle} from 'pixi.js';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IDisposable} from '@core/runtime';
import {Logger} from '@core/utils/Logger';
import type {ChatTextFormat, IChatStyle} from '@habbo/freeflowchat/style/IChatStyle';
import type {IChatStyleLibrary} from '@habbo/freeflowchat/style/IChatStyleLibrary';
import type {ChatLinkStyleSheet} from './IChatStyleInternal';
import {ChatStyle, type ChatStyleDescriptor} from './ChatStyle';

const log = Logger.getLogger('ChatStyleLibrary');

/**
 * ChatStyleLibrary
 *
 * Parses the `chatstyles_xml` catalog and builds a {@link ChatStyle} for
 * every `<style>` entry from its `style_<assetId>_*` bitmap assets and
 * `style_<assetId>_regpoints` config text.
 *
 * TODO(AS3): `chatstyles_xml` and the per-style `style_<assetId>_*`
 * bitmap/regpoints assets it references aren't bundled into
 * packages/helium-client/src/assets yet — an asset-pipeline gap, not a code
 * gap (same situation as @habbo/ui/widget/roomchat/style/ChatBubbleStyle's
 * sibling catalog). The catalog XML itself already exists at
 * sources/win63_2023_version/binaryDataXml_organized/non-layouts/454_chatstyles_xml$12d8bfe617173ccd8e74fa168cd72dda1735114579.xml
 * — only the per-style regpoints/bitmap assets are missing (they only exist,
 * as legacy binary blobs, for a handful of styles under sources/flash_version).
 * Until bundled, the constructor logs a warning per style it can't build and
 * `getStyle()` degrades to returning null instead of AS3's implicit crash.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/style/ChatStyleLibrary.as
 */
export class ChatStyleLibrary implements IChatStyleLibrary, IDisposable
{
    private static readonly _DEFAULT_STYLE_ID: number = 0;

    private _assets: IAssetLibrary | null;
    private readonly _styles: Map<number, ChatStyle> = new Map();

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
            const assetId = styleNode.getAttribute('assetId') ?? '';
            const isSystemStyle = styleNode.getAttribute('systemStyle') === 'true';
            const purchasable = styleNode.getAttribute('purchasable') === 'true';
            const isHcOnly = styleNode.getAttribute('hcOnly') === 'true';
            const isStaffOverrideable = styleNode.getAttribute('staffOverrideable') === 'true';
            const allowHTML = styleNode.getAttribute('allowHTML') === 'true';
            const isAmbassadorOnly = styleNode.getAttribute('ambassadorOnly') === 'true';
            const isNotification = styleNode.getAttribute('notification') === 'true';

            try
            {
                const style = this.initializeStyleFromAssets(assetId, isSystemStyle, purchasable, isHcOnly, isStaffOverrideable, allowHTML, isAmbassadorOnly, isNotification);

                this._styles.set(id, style);
            }
            catch (error)
            {
                log.warn(`Error initializing chat style: ${id}, error message: ${error}`);
            }
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

        const sliceXY = this.getConfigPoint(config, '9sliceXY');
        const sliceWH = this.getConfigPoint(config, '9sliceWH');
        const scale9Grid = new Rectangle(sliceXY.x, sliceXY.y, sliceWH.x, sliceWH.y);
        const faceOffset = this.hasConfig(config, 'faceXY') ? this.getConfigPoint(config, 'faceXY') : null;

        let pointer: ImageBitmap | null = null;
        let pointerY = 0;
        let pointerXMargins: number[] | null = null;

        if(!(this.hasConfig(config, 'anonymous') ? this.getConfigBoolean(config, 'anonymous') : false))
        {
            pointer = (assets.getAssetByName(`style_${assetId}_chat_bubble_pointer`)?.content as ImageBitmap | null) ?? null;
            pointerY = parseInt(this.getConfigCSV(config, 'pointerY')![0], 10);
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
        const textFieldMargins = this.getConfigRect(config, 'textFieldMargins');
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
        const textFormat: ChatTextFormat = {fontFace, fontSize, color: textColor};

        const linkColor = this.hasConfig(config, 'linkColorRGB') ? Number(this.getConfigCSV(config, 'linkColorRGB')![0]) : textColor;
        const linkHoverColor = this.hasConfig(config, 'linkHoverColorRGB') ? Number(this.getConfigCSV(config, 'linkHoverColorRGB')![0]) : textColor;
        const linkActiveColor = this.hasConfig(config, 'linkActiveColorRGB') ? Number(this.getConfigCSV(config, 'linkActiveColorRGB')![0]) : textColor;

        const styleSheet: ChatLinkStyleSheet = {
            linkColor: this.toHexString(linkColor),
            linkHoverColor: this.toHexString(linkHoverColor),
            linkActiveColor: this.toHexString(linkActiveColor),
        };

        const usePixelPerfectNineSlice = this.hasConfig(config, 'usePixelPerfectNineSlice') && this.getConfigBoolean(config, 'usePixelPerfectNineSlice');

        const descriptor: ChatStyleDescriptor = {
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
        return Array.from(this._styles.keys());
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/style/ChatStyleLibrary.as::getStyle()
    getStyle(styleId: number): IChatStyle | null
    {
        return this._styles.get(styleId) ?? this._styles.get(ChatStyleLibrary._DEFAULT_STYLE_ID) ?? null;
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
        this._assets = null;
    }
}
