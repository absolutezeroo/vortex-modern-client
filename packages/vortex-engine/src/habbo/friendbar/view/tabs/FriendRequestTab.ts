import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IIconWindow} from '@core/window/components/IIconWindow';
import type {IRegionWindow} from '@core/window/components/IRegionWindow';
import type {IInteractiveWindow} from '@core/window/components/IInteractiveWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {Logger} from '@core/utils/Logger';
import {FriendEntity} from '../../data/FriendEntity';
import type {IFriendRequest} from '../../data/IFriendRequest';
import {FriendEntityTab} from './FriendEntityTab';
import {Tab} from './Tab';

const log = Logger.getLogger('habbo.friendbar.tabs.FriendRequestTab');

/**
 * FriendRequestTab
 *
 * The slot shown when there is exactly one pending request — a friend slot with a
 * "plus" icon and a bubble offering accept, decline and profile.
 *
 * It extends `FriendEntityTab` and fakes the friend: `allocate()` wraps the request in
 * a `FriendEntity` with gender -1 and offline/no-follow, so the inherited header
 * drawing works with no request-specific code.
 *
 * One instance, recycled in a static — like `FriendRequestsTab`, never pooled.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/view/tabs/FriendRequestTab.as
 */
export class FriendRequestTab extends FriendEntityTab
{
    // AS3: .../view/tabs/FriendRequestTab.as::REQUEST_WINDOW_RESOURCE
    protected static readonly REQUEST_WINDOW_RESOURCE: string = 'friend_request_tab_xml';

    // AS3: .../view/tabs/FriendRequestTab.as::BUTTON_ACCEPT
    protected static readonly REQUEST_BUTTON_ACCEPT: string = 'button_accept';

    /** **Name derived** from its value. */
    // AS3: .../view/tabs/FriendRequestTab.as::BUTTON_CLOSE
    protected static readonly REQUEST_BUTTON_CLOSE: string = 'button_close';

    // AS3: .../view/tabs/FriendRequestTab.as::REGION_REJECT
    protected static readonly REGION_REJECT: string = 'click_region_reject';

    // AS3: .../view/tabs/FriendRequestTab.as::REGION_REJECT_TEXT
    protected static readonly REGION_REJECT_TEXT: string = 'link_reject';

    // AS3: .../view/tabs/FriendRequestTab.as::DEFAULT_COLOR
    private static readonly REQUEST_DEFAULT_COLOR: number = 0xFAC919;

    /** **Name derived**: the hovered counterpart of `DEFAULT_COLOR`. */
    private static readonly REQUEST_HOVER_COLOR: number = 0xFFD966;

    // AS3: .../view/tabs/FriendRequestTab.as::REGION_REJECT_COLOR_EXPOSED
    private static readonly REGION_REJECT_COLOR_EXPOSED: number = 0xFFE66A;

    // AS3: .../view/tabs/FriendRequestTab.as::REGION_REJECT_COLOR_NORMAL
    private static readonly REGION_REJECT_COLOR_NORMAL: number = 0xFFFFFF;

    /** The icon window's hovered/normal styles, from the layout's icon set. */
    private static readonly PROFILE_ICON_STYLE_OVER: number = 22;

    private static readonly PROFILE_ICON_STYLE_OUT: number = 21;

    // AS3: .../view/tabs/FriendRequestTab.as::ICON_RESOURCE
    private static readonly PLUS_ICON_RESOURCE: string = 'plus_friend_icon_png';

    /** The one recycled instance. **Name derived**; obfuscated in every tree. */
    // AS3: .../view/tabs/FriendRequestTab.as::_recycledInstance
    private static _recycledRequestTab: FriendRequestTab | null = null;

    /**
     * Reuses the single instance. The head is only redrawn when the request's figure
     * differs from the one already shown.
     */
    // AS3: .../view/tabs/FriendRequestTab.as::allocate()
    static allocateRequest(request: IFriendRequest): FriendRequestTab
    {
        const tab = FriendRequestTab._recycledRequestTab ?? new FriendRequestTab();

        tab._recycled = false;

        if(tab.friend !== null && tab.friend.figure !== request.figure)
        {
            const canvas = tab._window?.findChildByName(FriendEntityTab.CANVAS) as IBitmapWrapperWindow | null;

            if(canvas !== null)
            {
                canvas.bitmap = Tab.view?.getAvatarFaceBitmap(request.figure) ?? null;
            }
        }

        // Gender -1, offline, follow not allowed: a request is not a friend yet, and the
        // inherited header only reads name/figure/id.
        tab.friend = new FriendEntity(request.id, request.name, '', '', -1, false, false, request.figure, 0, '');

        return tab;
    }

    // AS3: .../view/tabs/FriendRequestTab.as::FriendRequestTab()
    constructor()
    {
        super();

        this._window = this.allocateRequestTabWindow();

        const bubble = this._window?.findChildByName(FriendEntityTab.BUBBLE) ?? null;

        if(bubble !== null)
        {
            bubble.visible = false;
        }
    }

    // AS3: .../view/tabs/FriendRequestTab.as::recycle()
    override recycle(): void
    {
        if(this.disposed || this._recycled)
        {
            return;
        }

        // Note: unlike every other tab, the window is *not* released here — the single
        // instance keeps it across recycles.
        this._friend = null;
        this._recycled = true;

        FriendRequestTab._recycledRequestTab = this;
    }

    // AS3: .../view/tabs/FriendRequestTab.as::select()
    override select(animate: boolean): void
    {
        if(this.selected)
        {
            return;
        }

        const bubble = this._window?.findChildByName(FriendEntityTab.BUBBLE) ?? null;

        if(bubble !== null)
        {
            bubble.visible = true;
        }

        super.select(animate);
    }

    // AS3: .../view/tabs/FriendRequestTab.as::deselect()
    override deselect(animate: boolean): void
    {
        if(!this.selected)
        {
            return;
        }

        const bubble = this._window?.findChildByName(FriendEntityTab.BUBBLE) ?? null;

        if(bubble !== null)
        {
            bubble.visible = false;
        }

        super.deselect(animate);
    }

    // AS3: .../view/tabs/FriendRequestTab.as::expose()
    protected override expose(): void
    {
        super.expose();

        this.applyRequestHoverStyle();
    }

    // AS3: .../view/tabs/FriendRequestTab.as::conceal()
    protected override conceal(): void
    {
        super.conceal();

        this.applyRequestHoverStyle();
    }

    private applyRequestHoverStyle(): void
    {
        if(this._window !== null)
        {
            this._window.color = this.exposed ? FriendRequestTab.REQUEST_HOVER_COLOR : FriendRequestTab.REQUEST_DEFAULT_COLOR;
        }
    }

    // AS3: .../view/tabs/FriendRequestTab.as::allocateRequestTabWindow()
    private allocateRequestTabWindow(): IWindowContainer | null
    {
        const window = Tab.windowing?.buildWidgetLayout(FriendRequestTab.REQUEST_WINDOW_RESOURCE) as IWindowContainer | null;

        if(window === null || window === undefined)
        {
            log.error(`allocateRequestTabWindow: layout "${FriendRequestTab.REQUEST_WINDOW_RESOURCE}" is not registered`);

            return null;
        }

        window.x = 0;
        window.y = 0;
        window.width = Tab.width;
        window.height = Tab.height;

        window.addEventListener('WME_CLICK', this.onRequestMouseClick);
        window.addEventListener('WME_OVER', this.onRequestMouseOver);
        window.addEventListener('WME_OUT', this.onRequestMouseOut);

        const header = window.findChildByName(FriendEntityTab.HEADER);

        if(header !== null)
        {
            header.addEventListener('WME_CLICK', this.onRequestMouseClick);
            header.addEventListener('WME_OVER', this.onRequestMouseOver);
            header.addEventListener('WME_OUT', this.onRequestMouseOut);
        }

        const profile = window.findChildByName(FriendEntityTab.PROFILE);

        if(profile !== null)
        {
            profile.addEventListener('WME_CLICK', this.onProfileMouseEvent);

            const interactive = profile as unknown as IInteractiveWindow;

            interactive.toolTipCaption = Tab.localization?.getLocalization('infostand.profile.link.tooltip', '') ?? '';
            interactive.toolTipDelay = 100;
        }

        const icons = window.findChildByName(FriendEntityTab.ICONS);

        if(icons !== null)
        {
            icons.addEventListener('WME_CLICK', this.onRequestMouseClick);
            icons.addEventListener('WME_OVER', this.onRequestMouseOver);
            icons.addEventListener('WME_OUT', this.onRequestMouseOut);
        }

        const canvas = window.findChildByName(FriendEntityTab.CANVAS) as IBitmapWrapperWindow | null;

        if(canvas !== null)
        {
            canvas.disposesBitmap = true;
        }

        const bubble = window.findChildByName(FriendEntityTab.BUBBLE);

        if(bubble !== null)
        {
            bubble.procedure = this.requestBubbleEventProc;
            // AS3: `-(h - (h - margins.bottom)) - 1`, i.e. `-margins.bottom - 1`; this
            // port's bubble window exposes no margins, so its height stands in.
            bubble.y = -bubble.height - 1;
        }

        // The "plus" badge is built in code, not in the layout, and inserted at the head
        // of the icon list.
        const iconRegion = Tab.windowing?.create('ICON', 5, 0, 1, {x: 0, y: 0, width: 25, height: 25}) as unknown as IRegionWindow | null;

        if(iconRegion !== null && iconRegion !== undefined)
        {
            const iconWindow = iconRegion as unknown as IWindow;

            iconWindow.mouseThreshold = 0;

            const bitmap = Tab.windowing?.create('BITMAP', 21, 0, 16, {x: 0, y: 0, width: 25, height: 25}) as unknown as IBitmapWrapperWindow | null;

            if(bitmap !== null && bitmap !== undefined)
            {
                bitmap.disposesBitmap = false;
                bitmap.bitmap = (Tab.assets?.getAssetByName(FriendRequestTab.PLUS_ICON_RESOURCE)?.content as ImageBitmap | null) ?? null;
                (iconRegion as unknown as IWindowContainer).addChild(bitmap as unknown as IWindow);
            }

            const iconList = window.findChildByName(FriendEntityTab.ICONS) as IItemListWindow | null;

            iconList?.addListItemAt(iconWindow, 0);
        }

        return window;
    }

    // AS3: .../view/tabs/FriendRequestTab.as::releaseRequestTabWindow()
    private releaseRequestTabWindow(window: IWindowContainer): void
    {
        if(window.disposed)
        {
            return;
        }

        window.procedure = null;
        window.removeEventListener('WME_CLICK', this.onRequestMouseClick);
        window.removeEventListener('WME_OVER', this.onRequestMouseOver);
        window.removeEventListener('WME_OUT', this.onRequestMouseOut);

        const header = window.findChildByName(FriendEntityTab.HEADER);

        if(header !== null)
        {
            header.removeEventListener('WME_CLICK', this.onRequestMouseClick);
            header.removeEventListener('WME_OVER', this.onRequestMouseOver);
            header.removeEventListener('WME_OUT', this.onRequestMouseOut);
        }

        // Verbatim: AS3 removes all three `icons` listeners with the click handler.
        const icons = window.findChildByName(FriendEntityTab.ICONS);

        if(icons !== null)
        {
            icons.removeEventListener('WME_CLICK', this.onRequestMouseClick);
            icons.removeEventListener('WME_OVER', this.onRequestMouseClick);
            icons.removeEventListener('WME_OUT', this.onRequestMouseClick);
        }

        window.findChildByName(FriendEntityTab.PROFILE)?.removeEventListener('WME_CLICK', this.onProfileMouseEvent);

        window.width = Tab.width;
        window.height = Tab.height;
        window.color = FriendRequestTab.REQUEST_DEFAULT_COLOR;

        const canvas = window.findChildByName(FriendEntityTab.CANVAS) as IBitmapWrapperWindow | null;

        if(canvas !== null)
        {
            canvas.bitmap = null;
        }

        const label = window.findChildByTag(FriendEntityTab.LABEL) as ITextWindow | null;

        if(label !== null)
        {
            label.underline = false;
        }
    }

    // AS3: .../view/tabs/FriendRequestTab.as::bubbleEventProc()
    private requestBubbleEventProc = (event: WindowEvent, window: IWindow): void =>
    {
        const friendId = this._friend?.id ?? 0;

        if(event.type === 'WME_CLICK')
        {
            switch(window.name)
            {
                case FriendRequestTab.REQUEST_BUTTON_ACCEPT:
                    Tab.data?.acceptFriendRequest(friendId);
                    break;

                case FriendRequestTab.REQUEST_BUTTON_CLOSE:
                    if(this.selected)
                    {
                        Tab.view?.deSelect(true);
                    }

                    break;

                case FriendEntityTab.BTN_PROFILE:
                    Tab.tracking?.trackGoogle('extendedProfile', 'friendBar_friendRequestButton');
                    Tab.data?.showProfile(friendId);
                    break;

                case FriendRequestTab.REGION_REJECT:
                    Tab.data?.declineFriendRequest(friendId);
                    break;
            }

            return;
        }

        if(event.type === 'WME_OVER' || event.type === 'WME_OUT')
        {
            const over = event.type === 'WME_OVER';
            const container = window as IWindowContainer;

            if(window.name === FriendRequestTab.REGION_REJECT)
            {
                const text = container.getChildByName(FriendRequestTab.REGION_REJECT_TEXT) as ITextWindow | null;

                if(text !== null)
                {
                    text.textColor = over ? FriendRequestTab.REGION_REJECT_COLOR_EXPOSED : FriendRequestTab.REGION_REJECT_COLOR_NORMAL;
                }
            }

            if(window.name === FriendEntityTab.BTN_PROFILE)
            {
                const icon = container.findChildByName(FriendEntityTab.ICON) as unknown as IIconWindow | null;

                if(icon !== null)
                {
                    icon.style = over ? FriendRequestTab.PROFILE_ICON_STYLE_OVER : FriendRequestTab.PROFILE_ICON_STYLE_OUT;
                }
            }

            if(window.name === FriendEntityTab.PROFILE)
            {
                const name = container.getChildByName(FriendEntityTab.NAME) as ITextWindow | null;

                if(name !== null)
                {
                    name.underline = over;
                }
            }
        }
    };

    /**
     * Late-arriving face. The figure is re-resolved rather than using the bitmap passed
     * in — verbatim from AS3, which ignores its second argument here.
     */
    // AS3: .../view/tabs/FriendRequestTab.as::avatarImageReady()
    avatarImageReady(request: IFriendRequest, _face: ImageBitmap): void
    {
        if(this.disposed || this._friend === null || this._friend.figure !== request.figure)
        {
            return;
        }

        const canvas = this._window?.findChildByName(FriendEntityTab.CANVAS) as IBitmapWrapperWindow | null;

        if(canvas === null)
        {
            return;
        }

        const face = Tab.view?.getAvatarFaceBitmap(request.figure) ?? null;

        if(face !== null)
        {
            canvas.bitmap = face;
            (canvas as unknown as IWindow).width = face.width;
            (canvas as unknown as IWindow).height = face.height;
        }
    }

    private onRequestMouseClick = (event: WindowEvent): void =>
    {
        this.onMouseClick(event as WindowMouseEvent);
    };

    private onRequestMouseOver = (event: WindowEvent): void =>
    {
        this.onMouseOver(event as WindowMouseEvent);
    };

    private onRequestMouseOut = (event: WindowEvent): void =>
    {
        this.onMouseOut(event as WindowMouseEvent);
    };

    // AS3: .../view/tabs/FriendRequestTab.as::dispose()
    override dispose(): void
    {
        if(this._window !== null)
        {
            this.releaseRequestTabWindow(this._window);
            this._window = null;
        }

        super.dispose();
    }
}
