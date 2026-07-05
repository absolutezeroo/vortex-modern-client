/**
 * ChatBubbleStyle
 *
 * @see sources/win63_2023_version/com/sulake/habbo/ui/widget/roomchat/style/ChatBubbleStyle.as
 * (primary win63_version copy has decompiler corruption; cross-checked here)
 *
 * TODO(AS3): AS3 builds a style from an XML descriptor (bitmaps + speak/
 * whisper/shout layout asset ids). The master catalog XML
 * (`roomchat_styles_chatstyles_xml`, listing all 26 styles) exists in
 * `sources/win63_2023_version/binaryDataXml_organized/non-layouts/2113_chatstyles_xml.xml`
 * but hasn't been bundled into packages/helium-client/src/assets yet — that's
 * an asset-pipeline gap, not a code gap. Only the "normal" style (id 0) is
 * constructed here directly from its known bundled asset names, structured so
 * `ChatBubbleFactory` can load the rest from the real XML once it's bundled.
 */
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IRegionWindow} from '@core/window/components/IRegionWindow';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('ChatBubbleStyle');

export interface ChatBubbleStyleDescriptor
{
    id: number;
    styleName: string;
    isSystemStyle: boolean;
    isStaffOverrideable: boolean;
    speakLayout: string;
    whisperLayout: string | null;
    shoutLayout: string | null;
    leftBitmap: string;
    leftColorBitmap: string | null;
    middleBitmap: string;
    rightBitmap: string;
    pointerBitmap: string;
    previewIconBitmap: string | null;
}

export class ChatBubbleStyle
{
    private _id: number;
    private _styleName: string;
    private _isSystemStyle: boolean;
    private _isStaffOverrideable: boolean;
    private _normalLayout: IRegionWindow | null = null;
    private _whisperLayout: IRegionWindow | null = null;
    private _shoutLayout: IRegionWindow | null = null;
    private _leftBitmapData: ImageBitmap | null = null;
    private _leftColorBitmapData: ImageBitmap | null = null;
    private _middleBitmapData: ImageBitmap | null = null;
    private _rightBitmapData: ImageBitmap | null = null;
    private _pointerBitmapData: ImageBitmap | null = null;
    private _selectorPreviewIconBitmapData: ImageBitmap | null = null;

    // AS3: sources/win63_2023_version/com/sulake/habbo/ui/widget/roomchat/style/ChatBubbleStyle.as::ChatBubbleStyle()
    constructor(assets: IAssetLibrary, windowManager: IHabboWindowManager, descriptor: ChatBubbleStyleDescriptor)
    {
        this._id = descriptor.id;
        this._styleName = descriptor.styleName;
        this._isSystemStyle = descriptor.isSystemStyle;
        this._isStaffOverrideable = descriptor.isStaffOverrideable;

        this._normalLayout = this.buildBubbleWindow(windowManager, descriptor.speakLayout);
        this._whisperLayout = descriptor.whisperLayout ? this.buildBubbleWindow(windowManager, descriptor.whisperLayout) : null;
        this._shoutLayout = descriptor.shoutLayout ? this.buildBubbleWindow(windowManager, descriptor.shoutLayout) : null;

        this._leftBitmapData = this.getBitmapDataFor(assets, descriptor.leftBitmap);
        this._leftColorBitmapData = descriptor.leftColorBitmap ? this.getBitmapDataFor(assets, descriptor.leftColorBitmap) : null;
        this._middleBitmapData = this.getBitmapDataFor(assets, descriptor.middleBitmap);
        this._rightBitmapData = this.getBitmapDataFor(assets, descriptor.rightBitmap);
        this._pointerBitmapData = this.getBitmapDataFor(assets, descriptor.pointerBitmap);
        this._selectorPreviewIconBitmapData = descriptor.previewIconBitmap ? this.getBitmapDataFor(assets, descriptor.previewIconBitmap) : null;
    }

    public get id(): number { return this._id; }
    public get styleName(): string { return this._styleName; }

    // AS3: sources/win63_2023_version/com/sulake/habbo/ui/widget/roomchat/style/ChatBubbleStyle.as::get normalLayout()
    public get normalLayout(): IRegionWindow | null { return this._normalLayout; }
    public get whisperLayout(): IRegionWindow | null { return this._whisperLayout; }
    public get shoutLayout(): IRegionWindow | null { return this._shoutLayout; }

    public get leftBitmapData(): ImageBitmap | null { return this._leftBitmapData; }
    public get leftColorBitmapData(): ImageBitmap | null { return this._leftColorBitmapData; }
    public get middleBitmapData(): ImageBitmap | null { return this._middleBitmapData; }
    public get rightBitmapData(): ImageBitmap | null { return this._rightBitmapData; }
    public get pointerBitmapData(): ImageBitmap | null { return this._pointerBitmapData; }

    public get isSystemStyle(): boolean { return this._isSystemStyle; }
    public get isStaffOverrideable(): boolean { return this._isStaffOverrideable; }
    public get selectorPreviewIconBitmapData(): ImageBitmap | null { return this._selectorPreviewIconBitmapData; }

    // AS3: sources/win63_2023_version/com/sulake/habbo/ui/widget/roomchat/style/ChatBubbleStyle.as::buildBubbleWindow()
    private buildBubbleWindow(windowManager: IHabboWindowManager, layoutName: string): IRegionWindow | null
    {
        const window = windowManager.buildWidgetLayout(layoutName) as unknown as IRegionWindow | null;

        if(!window) return null;

        window.tags.push('roomchat_bubble');
        window.x = 0;
        window.y = 0;
        window.width = 0;
        window.background = true;

        return window;
    }

    // AS3: sources/win63_2023_version/com/sulake/habbo/ui/widget/roomchat/style/ChatBubbleStyle.as::getBitmapDataFor()
    private getBitmapDataFor(assets: IAssetLibrary, assetName: string): ImageBitmap | null
    {
        const asset = assets.getAssetByName(assetName);

        if(!asset)
        {
            log.warn(`Missing chat bubble bitmap asset: ${assetName}`);

            return null;
        }

        return asset.content as ImageBitmap;
    }
}
