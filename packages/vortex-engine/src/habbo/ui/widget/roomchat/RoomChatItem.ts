/**
 * RoomChatItem
 *
 * @see sources/win63_2023_version/com/sulake/habbo/ui/widget/roomchat/RoomChatItem.as
 * (primary win63_version copy has decompiler corruption — `null.` refs and
 * broken goto-based control flow; cross-checked here)
 *
 * A single chat bubble: builds its window from the active ChatBubbleFactory
 * style, lays out name/message/pointer/user-image, and composites the
 * background bubble image.
 *
 * Clickable links embedded in chat messages (the `links`/`var_1993` branch —
 * per-substring TextFormat + click-to-open-URL) ARE ported: see
 * applyMessageText()'s default case and testMessageLinkMouseClick().
 */
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IRegionWindow} from '@core/window/components/IRegionWindow';
import type {ILabelWindow} from '@core/window/components/ILabelWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {WindowParam} from '@core/window/enum/WindowParam';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {RoomWidgetChatUpdateEvent} from '@habbo/ui/widget/events/RoomWidgetChatUpdateEvent';
import type {IChatLink} from '@habbo/communication/messages/parser/room/chat/ChatMessageEventParser';
import {HabboWebTools} from '@habbo/utils/HabboWebTools';
import type {RoomChatWidget} from './RoomChatWidget';

const RESPECT_ICON_MARGIN_RIGHT = 35;
const NAME_ICON_MARGIN = 26;

// AS3: sources/win63_version/habbo/ui/widget/roomchat/RoomChatItem.as::renderView() (links branch, switch(styleId - 2))
const LINK_COLOR_STYLE_2 = 0xDDDDDD; // AS3 decimal 14540253
const LINK_COLOR_DEFAULT = 0x295BA6; // AS3 decimal 2710438

export class RoomChatItem
{
    private _widget: RoomChatWidget | null;
    private _windowManager: IHabboWindowManager;
    private _localizations: IHabboLocalizationManager | null;
    private _id: string;
    private _siteUrl: string;

    private _window: IRegionWindow | null = null;
    private _aboveLevels: number = 0;
    private _screenLevel: number = -1;
    private _chatType: number = 0;
    private _styleId: number = 0;
    private _userId: number = 0;
    private _senderName: string = '';
    private _message: string = '';
    // AS3: sources/win63_version/habbo/ui/widget/roomchat/RoomChatItem.as::var_790 (var_1993 in win63_2023_version)
    private _links: IChatLink[] | null = null;
    // AS3: sources/win63_version/habbo/ui/widget/roomchat/RoomChatItem.as::var_1629 (var_2506 in win63_2023_version)
    // [start,end) char ranges within the final message text, one per `_links` entry.
    private _linkRanges: Array<[number, number]> | null = null;
    private _senderX: number = 0;
    private _senderImage: ImageBitmap | null = null;
    private _senderColor: number = 0;
    private _roomId: number = 0;
    private _userType: number = 0;
    private _senderCategory: number = 0;
    private _petType: number = 0;
    private _width: number = 0;
    private _rendered: boolean = false;
    private _topOffset: number = 0;
    private _originalBackgroundYOffset: number = 0;
    private _x: number = 0;
    private _y: number = 0;
    private _dragTooltipEnabled: boolean = false;
    private _timeStamp: number = 0;

    // AS3: sources/win63_2023_version/com/sulake/habbo/ui/widget/roomchat/RoomChatItem.as::RoomChatItem()
    constructor(
        widget: RoomChatWidget, windowManager: IHabboWindowManager, _assets: IAssetLibrary | null,
        id: string, localizations: IHabboLocalizationManager | null, siteUrl: string
    )
    {
        this._widget = widget;
        this._windowManager = windowManager;
        this._id = id;
        this._localizations = localizations;
        this._siteUrl = siteUrl;
    }

    // AS3: sources/win63_2023_version/com/sulake/habbo/ui/widget/roomchat/RoomChatItem.as::dispose()
    public dispose(): void
    {
        if(this._window)
        {
            this._window.dispose();
            this._window = null;
            this._widget = null;
            this._senderImage = null;
        }
    }

    // AS3: sources/win63_2023_version/com/sulake/habbo/ui/widget/roomchat/RoomChatItem.as::define()
    public define(event: RoomWidgetChatUpdateEvent): void
    {
        this._chatType = event.chatType;
        this._styleId = event.styleId;
        this._userId = event.userId;
        this._senderName = event.userName;
        this._senderCategory = event.userCategory;
        this._userType = event.userType;
        this._message = event.text;
        this._links = event.links;
        this._senderX = event.userX;
        this._senderImage = event.userImage;
        this._senderColor = event.userColor;
        this._roomId = event.roomId;
        this._petType = event.petType;
        this.renderView();
    }

    public set message(value: string) { this._message = value; }
    public set senderName(value: string) { this._senderName = value; }
    public set senderImage(value: ImageBitmap | null) { this._senderImage = value; }
    public set senderColor(value: number) { this._senderColor = value; }
    public set chatType(value: number) { this._chatType = value; }

    public get view(): IRegionWindow | null { return this._window; }
    public get screenLevel(): number { return this._screenLevel; }
    public set screenLevel(value: number) { this._screenLevel = value; }
    public get timeStamp(): number { return this._timeStamp; }
    public set timeStamp(value: number) { this._timeStamp = value; }
    public get senderX(): number { return this._senderX; }
    public set senderX(value: number) { this._senderX = value; }
    public get width(): number { return this._width; }
    public get height(): number { return 18; }
    public get message(): string { return this._message; }
    public get x(): number { return this._x; }
    public get y(): number { return this._y; }
    public get aboveLevels(): number { return this._aboveLevels; }
    public set aboveLevels(value: number) { this._aboveLevels = value; }
    public get chatStyle(): number { return this._styleId; }
    public get originalBackgroundYOffset(): number { return this._originalBackgroundYOffset; }

    // AS3: sources/win63_2023_version/com/sulake/habbo/ui/widget/roomchat/RoomChatItem.as::set x()
    public set x(value: number)
    {
        this._x = value;

        if(this._window) this._window.x = value;
    }

    // AS3: sources/win63_2023_version/com/sulake/habbo/ui/widget/roomchat/RoomChatItem.as::set y()
    public set y(value: number)
    {
        this._y = value;

        if(this._window) this._window.y = value - this._topOffset + this._originalBackgroundYOffset;
    }

    // AS3: sources/win63_2023_version/com/sulake/habbo/ui/widget/roomchat/RoomChatItem.as::hidePointer()
    public hidePointer(): void
    {
        const pointer = this.findChild('pointer');

        if(pointer) pointer.visible = false;
    }

    // AS3: sources/win63_2023_version/com/sulake/habbo/ui/widget/roomchat/RoomChatItem.as::setPointerOffset()
    public setPointerOffset(offset: number): void
    {
        if(!this._window || this._window.disposed) return;

        const pointer = this.findChild('pointer') as unknown as IBitmapWrapperWindow | null;
        const middle = this.findChild('middle');

        if(!middle || !pointer) return;

        pointer.visible = true;

        let x = offset + this._window.width / 2;

        x = Math.min(x, middle.rectangle.x + middle.rectangle.width - (pointer as unknown as IWindow).width);
        x = Math.max(x, middle.rectangle.x);
        (pointer as unknown as IWindow).x = x;
    }

    // AS3: sources/win63_2023_version/com/sulake/habbo/ui/widget/roomchat/RoomChatItem.as::checkOverlap()
    public checkOverlap(otherHeight: number, otherX: number, otherY: number, otherWidth: number, otherHeight2: number): boolean
    {
        const a = {x: this._x, y: this._y, width: this.width, height: otherHeight};
        const b = {x: otherX, y: otherY, width: otherWidth, height: otherHeight2};

        return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
    }

    // AS3: sources/win63_2023_version/com/sulake/habbo/ui/widget/roomchat/RoomChatItem.as::hideView()
    public hideView(): void
    {
        this._window?.dispose();
        this._window = null;
        this._rendered = false;
    }

    private get isNotify(): boolean
    {
        return this._styleId === 1;
    }

    private findChild(name: string): IWindow | null
    {
        return this._window ? (this._window as unknown as IWindowContainer).findChildByName(name) : null;
    }

    // AS3: sources/win63_2023_version/com/sulake/habbo/ui/widget/roomchat/RoomChatItem.as::renderView()
    public renderView(): void
    {
        if(this._rendered) return;

        this._rendered = true;

        if(this._window) return;

        const factory = this._widget?.chatBubbleFactory;

        if(!factory) return;

        this._window = factory.getBubbleWindow(this._styleId, this._chatType);

        if(!this._window) return;

        this._window.toolTipIsDynamic = true;

        const background = this.findChild('background') as unknown as IBitmapWrapperWindow | null;
        const nameLabel = this.findChild('name') as unknown as ILabelWindow | null;
        const messageText = this.findChild('message') as unknown as ITextWindow | null;
        const pointer = this.findChild('pointer') as unknown as IBitmapWrapperWindow | null;

        if(!background || !messageText)
        {
            return;
        }

        let height = this._window.height;

        const pointerBitmap = factory.getPointerBitmapData(this._styleId);

        this._originalBackgroundYOffset = (background as unknown as IWindow).y;

        const messageXField = messageText as unknown as IWindow;
        const nameMargin = messageXField.x <= NAME_ICON_MARGIN ? 0 : messageXField.x - NAME_ICON_MARGIN;

        if(this._senderImage)
        {
            this._topOffset = Math.max(0, (this._senderImage.height - (background as unknown as IWindow).height) / 2);
            height = Math.max(height, this._senderImage.height);
            height = Math.max(height, (background as unknown as IWindow).height);
        }

        this._width = 0;
        this._window.x = this._x;
        this._window.y = this._y;
        this._window.width = 0;
        this._window.height = height;
        this.enableDragTooltip();
        this.addEventListeners(this._window);

        if(this._senderImage && !this.isNotify)
        {
            const userImage = this.findChild('user_image') as unknown as IBitmapWrapperWindow | null;

            if(userImage)
            {
                const userImageWindow = userImage as unknown as IWindow;

                userImageWindow.width = this._senderImage.width;
                userImageWindow.height = this._senderImage.height;
                userImage.bitmap = this._senderImage;
                userImage.disposesBitmap = false;

                const targetX = userImageWindow.x - this._senderImage.width / 2;
                let targetY = Math.max(0, ((background as unknown as IWindow).height - this._senderImage.height) / 2);

                if(this._userType === 2 && this._petType === 15 && this._senderImage.height > (background as unknown as IWindow).height)
                {
                    targetY = (this._senderImage.height - (background as unknown as IWindow).height) / 2;
                }

                userImageWindow.x = targetX;
                userImageWindow.y += targetY;
                this._width += userImageWindow.x + this._senderImage.width;
            }
        }

        if(nameLabel)
        {
            const nameLabelWindow = nameLabel as unknown as IWindow;

            if(!this.isNotify)
            {
                nameLabel.text = `${this._senderName}: `;
                nameLabelWindow.y += this._topOffset;
                nameLabelWindow.width = nameLabel.textWidth + 6;
            }
            else
            {
                nameLabel.text = '';
                nameLabelWindow.width = 0;
            }

            this._width += nameLabelWindow.width;
        }

        this.applyMessageText(messageText);

        const messageWindow = messageText as unknown as IWindow;

        if(messageWindow.visible)
        {
            messageWindow.x = this._width + nameMargin;

            if(nameLabel)
            {
                const nameLabelWindow = nameLabel as unknown as IWindow;

                messageWindow.x = nameLabelWindow.x + nameLabelWindow.width;

                if(nameLabelWindow.width > 6)
                {
                    messageWindow.x -= 5;
                }
            }

            messageWindow.y += this._topOffset;
            messageWindow.width = messageText.textWidth + 6;
            this._width += messageWindow.width;
        }

        if(pointer && (pointer as unknown as IWindow).visible)
        {
            pointer.bitmap = pointerBitmap;
            pointer.disposesBitmap = false;

            const pointerWindow = pointer as unknown as IWindow;

            pointerWindow.x = this._width / 2;
            pointerWindow.y += this._topOffset;
        }

        let contentWidth = messageWindow.width;

        if(nameLabel) contentWidth += (nameLabel as unknown as IWindow).width;

        const bubbleImage = factory.buildBubbleImage(this._styleId, this._chatType, contentWidth, (background as unknown as IWindow).height, this._senderColor);

        if(bubbleImage)
        {
            this._window.width = bubbleImage.width;
            background.bitmap = bubbleImage;
            background.disposesBitmap = true;
        }

        this._window.y -= this._topOffset;
        this._window.y += this._originalBackgroundYOffset;
        this._width = this._window.width;
        (background as unknown as IWindow).y = this._topOffset;
    }

    // AS3: sources/win63_2023_version/com/sulake/habbo/ui/widget/roomchat/RoomChatItem.as::renderView() (message-text branch)
    private applyMessageText(messageText: ITextWindow): void
    {
        switch(this._chatType)
        {
            case 3:
                messageText.text = this._localizations?.registerParameter('widgets.chatbubble.respect', 'username', this._senderName) ?? this._message;
                this._width = RESPECT_ICON_MARGIN_RIGHT;
                break;
            case 4:
                messageText.text = this._localizations?.registerParameter('widget.chatbubble.petrespect', 'petname', this._senderName) ?? this._message;
                this._width = RESPECT_ICON_MARGIN_RIGHT;
                break;
            case 6:
                messageText.text = this._localizations?.registerParameter('widget.chatbubble.pettreat', 'petname', this._senderName) ?? this._message;
                this._width = RESPECT_ICON_MARGIN_RIGHT;
                break;
            case 7:
            case 8:
            case 9:
            case 5:
                messageText.text = this._message;
                this._width = RESPECT_ICON_MARGIN_RIGHT;
                break;
            default:
                this.applyMessageLinks(messageText);
                break;
        }
    }

    // AS3: sources/win63_version/habbo/ui/widget/roomchat/RoomChatItem.as::renderView() (links/var_1993 branch)
    private applyMessageLinks(messageText: ITextWindow): void
    {
        if(!this._links || this._links.length === 0)
        {
            messageText.text = this._message;
            return;
        }

        const ranges: Array<[number, number]> = [];

        for(let i = 0; i < this._links.length; i++)
        {
            const displayText = this._links[i].displayText;
            const placeholder = `{${i}}`;
            const start = this._message.indexOf(placeholder);
            const end = start + displayText.length;

            ranges.push([start, end]);
            this._message = this._message.replace(placeholder, displayText);
        }

        this._linkRanges = ranges;
        messageText.text = this._message;
        messageText.immediateClickMode = true;
        messageText.setParamFlag(WindowParam.USE_PARENT_GRAPHIC_CONTEXT, false);
        messageText.setParamFlag(WindowParam.FORCE_CLIPPING, true);

        const format = messageText.getTextFormat();

        format.color = this._styleId === 2 ? LINK_COLOR_STYLE_2 : LINK_COLOR_DEFAULT;
        format.underline = true;

        // A malformed link (placeholder missing from the text) yields
        // start === -1, which setTextFormat()'s own range guard already
        // rejects silently — matching AS3's catch(RangeError) fallback
        // without needing a try/catch here.
        for(const [start, end] of ranges)
        {
            messageText.setTextFormat(format, start, end);
        }
    }

    // AS3: sources/win63_version/habbo/ui/widget/roomchat/RoomChatItem.as::testMessageLinkMouseClick()
    private testMessageLinkMouseClick(localX: number, localY: number): boolean
    {
        if(!this._links || !this._linkRanges) return false;

        const messageText = this.findChild('message') as unknown as ITextWindow | null;

        if(!messageText) return false;

        const messageWindow = messageText as unknown as IWindow;
        const charIndex = messageText.getCharIndexAtPoint(localX - messageWindow.x, localY - messageWindow.y);

        if(charIndex < 0) return false;

        for(let i = 0; i < this._linkRanges.length; i++)
        {
            const [start, end] = this._linkRanges[i];

            if(charIndex >= start && charIndex <= end)
            {
                const link = this._links[i];

                // AS3 distinguishes 3 link kinds (external-warning/habboMain/new-tab)
                // via a per-link int; the parsed wire data here only carries a
                // boolean `isTrusted`, so trusted links collapse to the
                // "habboMain" case and untrusted ones show the external warning.
                if(!link.isTrusted)
                {
                    HabboWebTools.openExternalLinkWarning(link.url);
                }
                else
                {
                    HabboWebTools.openWebPage(this._siteUrl + link.url, HabboWebTools.WINDOW_HABBO_MAIN);
                }

                return true;
            }
        }

        return false;
    }

    // AS3: sources/win63_2023_version/com/sulake/habbo/ui/widget/roomchat/RoomChatItem.as::enableDragTooltip()
    public enableDragTooltip(): void
    {
        this._dragTooltipEnabled = true;
        this.refreshTooltip();
    }

    // AS3: sources/win63_2023_version/com/sulake/habbo/ui/widget/roomchat/RoomChatItem.as::disableDragTooltip()
    public disableDragTooltip(): void
    {
        this._dragTooltipEnabled = false;
        this.refreshTooltip();
    }

    private refreshTooltip(): void
    {
        if(!this._window) return;

        this._window.toolTipCaption = '';

        if(this._widget?.isGameSession) return;

        if(this._dragTooltipEnabled)
        {
            this._window.toolTipCaption = '${chat.history.drag.tooltip}';
        }

        this._window.toolTipDelay = 500;
    }

    private addEventListeners(window: IWindow): void
    {
        window.setParamFlag(1, true);
        window.addEventListener(WindowMouseEvent.CLICK, this.onBubbleMouseClick);
        window.addEventListener(WindowMouseEvent.DOWN, this.onBubbleMouseDown);
        window.addEventListener(WindowMouseEvent.OVER, this.onBubbleMouseOver);
        window.addEventListener(WindowMouseEvent.OUT, this.onBubbleMouseOut);
        window.addEventListener(WindowMouseEvent.UP, this.onBubbleMouseUp);
    }

    // AS3: sources/win63_version/habbo/ui/widget/roomchat/RoomChatItem.as::onBubbleMouseClick()
    // win63_2023_version's `if(var_1993 && false)` is decompiler corruption
    // (constant-folded); win63_version's clean `var_790 && var_790.length > 0`
    // is the real condition, confirmed against both copies.
    private onBubbleMouseClick = (event: WindowMouseEvent): void =>
    {
        if(this._links && this._links.length > 0)
        {
            if(this.testMessageLinkMouseClick(event.localX, event.localY))
            {
                return;
            }
        }

        this._widget?.onItemMouseClick(this._userId, this._senderName, this._senderCategory, this._roomId, event);
    };

    private onBubbleMouseDown = (event: WindowMouseEvent): void =>
    {
        this._widget?.onItemMouseDown(this._userId, this._senderCategory, this._roomId, event);
    };

    private onBubbleMouseOver = (event: WindowMouseEvent): void =>
    {
        this._widget?.onItemMouseOver(this._userId, this._senderCategory, this._roomId, event);
    };

    private onBubbleMouseOut = (event: WindowMouseEvent): void =>
    {
        this._widget?.onItemMouseOut(this._userId, this._senderCategory, this._roomId, event);
    };

    private onBubbleMouseUp = (): void =>
    {
        this._widget?.mouseUp();
    };
}
