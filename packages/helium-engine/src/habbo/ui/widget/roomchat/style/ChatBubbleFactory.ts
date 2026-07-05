/**
 * ChatBubbleFactory
 *
 * @see sources/win63_2023_version/com/sulake/habbo/ui/widget/roomchat/style/ChatBubbleFactory.as
 * (primary win63_version copy has decompiler corruption; cross-checked here)
 *
 * TODO(AS3): see ChatBubbleStyle.ts header — only style id 0 ("normal") is
 * registered until the chatstyles catalog XML is bundled as an asset.
 */
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IRegionWindow} from '@core/window/components/IRegionWindow';
import {Logger} from '@core/utils/Logger';
import {ChatBubbleStyle} from './ChatBubbleStyle';

const log = Logger.getLogger('ChatBubbleFactory');

const NORMAL_STYLE_DESCRIPTOR = {
    id: 0,
    styleName: 'normal',
    isSystemStyle: false,
    isStaffOverrideable: false,
    speakLayout: 'roomchat_bubble_speak',
    whisperLayout: null,
    shoutLayout: 'roomchat_bubble_shout',
    leftBitmap: 'roomchat_styles_normal_chat_bubble_left',
    leftColorBitmap: 'roomchat_styles_normal_chat_bubble_left_color',
    middleBitmap: 'roomchat_styles_normal_chat_bubble_middle',
    rightBitmap: 'roomchat_styles_normal_chat_bubble_right',
    pointerBitmap: 'roomchat_styles_normal_chat_bubble_pointer',
    previewIconBitmap: 'roomchat_styles_normal_selector_preview',
};

export class ChatBubbleFactory
{
    private _styles: Map<number, ChatBubbleStyle> = new Map();

    // AS3: sources/win63_2023_version/com/sulake/habbo/ui/widget/roomchat/style/ChatBubbleFactory.as::ChatBubbleFactory()
    constructor(assets: IAssetLibrary, windowManager: IHabboWindowManager)
    {
        try
        {
            this._styles.set(0, new ChatBubbleStyle(assets, windowManager, NORMAL_STYLE_DESCRIPTOR));
        }
        catch (error)
        {
            log.warn(`Error initializing chat style: 0, error message: ${error}`);
        }
    }

    // AS3: sources/win63_2023_version/com/sulake/habbo/ui/widget/roomchat/style/ChatBubbleFactory.as::getBubbleWindow()
    public getBubbleWindow(styleId: number, chatType: number): IRegionWindow | null
    {
        const style = this.getSafeChatBubbleStyle(styleId);

        if(!style) return null;

        switch(chatType)
        {
            case 0:
                return style.normalLayout?.clone() as IRegionWindow | null ?? null;
            case 1:
                return (style.whisperLayout ?? style.normalLayout)?.clone() as IRegionWindow | null ?? null;
            case 2:
                return (style.shoutLayout ?? style.normalLayout)?.clone() as IRegionWindow | null ?? null;
            default:
                return (style.whisperLayout ?? style.normalLayout)?.clone() as IRegionWindow | null ?? null;
        }
    }

    // AS3: sources/win63_2023_version/com/sulake/habbo/ui/widget/roomchat/style/ChatBubbleFactory.as::getPointerBitmapData()
    public getPointerBitmapData(styleId: number): ImageBitmap | null
    {
        return this.getSafeChatBubbleStyle(styleId)?.pointerBitmapData ?? null;
    }

    // AS3: sources/win63_2023_version/com/sulake/habbo/ui/widget/roomchat/style/ChatBubbleFactory.as::buildBubbleImage()
    public buildBubbleImage(styleId: number, _chatType: number, middleWidth: number, height: number, userColor: number): ImageBitmap | null
    {
        const style = this.getSafeChatBubbleStyle(styleId);

        if(!style?.leftBitmapData || !style.middleBitmapData || !style.rightBitmapData) return null;

        const totalWidth = style.leftBitmapData.width + middleWidth + style.rightBitmapData.width;
        const canvas = new OffscreenCanvas(Math.max(1, totalWidth), Math.max(1, height));
        const ctx = canvas.getContext('2d');

        if(!ctx) return null;

        let x = 0;

        ctx.drawImage(style.leftBitmapData, x, 0);

        if(style.leftColorBitmapData)
        {
            // AS3: BitmapData.draw(leftColorBitmapData, null, new ColorTransform(r/255,g/255,b/255), "darken")
            // — tint the color-mask bitmap by the sender's name color, then darken-blend
            // it over the plain left cap already drawn above.
            const r = userColor !== 0 ? (userColor >> 16) & 0xFF : 232;
            const g = userColor !== 0 ? (userColor >> 8) & 0xFF : 177;
            const b = userColor !== 0 ? userColor & 0xFF : 55;

            const tintCanvas = new OffscreenCanvas(style.leftColorBitmapData.width, style.leftColorBitmapData.height);
            const tintCtx = tintCanvas.getContext('2d');

            if(tintCtx)
            {
                tintCtx.fillStyle = `rgb(${r},${g},${b})`;
                tintCtx.fillRect(0, 0, tintCanvas.width, tintCanvas.height);
                tintCtx.globalCompositeOperation = 'destination-in';
                tintCtx.drawImage(style.leftColorBitmapData, 0, 0);

                ctx.save();
                ctx.globalCompositeOperation = 'darken';
                ctx.drawImage(tintCanvas, x, 0);
                ctx.restore();
            }
        }

        x += style.leftBitmapData.width;

        if(style.middleBitmapData.width === 1)
        {
            ctx.save();
            ctx.translate(x, 0);
            ctx.scale(middleWidth / style.middleBitmapData.width, 1);
            ctx.drawImage(style.middleBitmapData, 0, 0);
            ctx.restore();
        }
        else
        {
            const tileCount = Math.floor(middleWidth / style.middleBitmapData.width) + 1;

            for(let i = 0; i < tileCount; i++)
            {
                ctx.drawImage(style.middleBitmapData, x + i * style.middleBitmapData.width, 0);
            }
        }

        x += middleWidth;
        ctx.drawImage(style.rightBitmapData, x, 0);

        return canvas.transferToImageBitmap();
    }

    // AS3: sources/win63_2023_version/com/sulake/habbo/ui/widget/roomchat/style/ChatBubbleFactory.as::getStyleIds()
    public getStyleIds(): number[]
    {
        return Array.from(this._styles.keys());
    }

    // AS3: sources/win63_2023_version/com/sulake/habbo/ui/widget/roomchat/style/ChatBubbleFactory.as::getAllowedUserInputStyleIds()
    public getAllowedUserInputStyleIds(): number[]
    {
        return this.getStyleIds().filter((id) =>
        {
            const style = this._styles.get(id);

            return style && !style.isSystemStyle && !style.isStaffOverrideable;
        });
    }

    // AS3: sources/win63_2023_version/com/sulake/habbo/ui/widget/roomchat/style/ChatBubbleFactory.as::getStaffOverrideableStyleIds()
    public getStaffOverrideableStyleIds(): number[]
    {
        return this.getStyleIds().filter((id) => this._styles.get(id)?.isStaffOverrideable);
    }

    // AS3: sources/win63_2023_version/com/sulake/habbo/ui/widget/roomchat/style/ChatBubbleFactory.as::getStyleSelectorPreviewBitmap()
    public getStyleSelectorPreviewBitmap(styleId: number): ImageBitmap | null
    {
        return this.getSafeChatBubbleStyle(styleId)?.selectorPreviewIconBitmapData ?? null;
    }

    // AS3: sources/win63_2023_version/com/sulake/habbo/ui/widget/roomchat/style/ChatBubbleFactory.as::getActualBubbleHeight()
    public getActualBubbleHeight(styleId: number): number
    {
        return this.getSafeChatBubbleStyle(styleId)?.middleBitmapData?.height ?? 0;
    }

    // AS3: sources/win63_2023_version/com/sulake/habbo/ui/widget/roomchat/style/ChatBubbleFactory.as::getSafeChatBubbleStyle()
    private getSafeChatBubbleStyle(styleId: number): ChatBubbleStyle | null
    {
        if(!this._styles.has(styleId))
        {
            styleId = 0;
        }

        return this._styles.get(styleId) ?? null;
    }
}
