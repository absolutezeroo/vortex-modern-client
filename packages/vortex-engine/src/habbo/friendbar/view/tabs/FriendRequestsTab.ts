import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IBubbleWindow} from '@core/window/components/IBubbleWindow';
import type {IInteractiveWindow} from '@core/window/components/IInteractiveWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {Logger} from '@core/utils/Logger';
import type {IFriendRequest} from '../../data/IFriendRequest';
import {Tab} from './Tab';

const log = Logger.getLogger('habbo.friendbar.tabs.FriendRequestsTab');

/**
 * FriendRequestsTab
 *
 * The single slot that stands for *all* pending requests, with a counter badge.
 * Opening it shows a bubble listing every request, each with accept and discard.
 *
 * Unlike the other tabs there is one instance, not a pool: `allocate()` reuses the
 * last recycled one or builds the only one there will be.
 *
 * The row template is not built per request — `allocateRequestsTabWindow()` lifts the
 * first item out of the layout's list and keeps it as a prototype to `clone()`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/view/tabs/FriendRequestsTab.as
 */
export class FriendRequestsTab extends Tab
{
    // AS3: .../view/tabs/FriendRequestsTab.as::REQUESTS_WINDOW_RESOURCE
    protected static readonly REQUESTS_WINDOW_RESOURCE: string = 'friend_requests_tab_xml';

    // AS3: .../view/tabs/FriendRequestsTab.as::ICON
    protected static readonly ICON: string = 'icon';

    // AS3: .../view/tabs/FriendRequestsTab.as::LABEL
    protected static readonly LABEL: string = 'label';

    // AS3: .../view/tabs/FriendRequestsTab.as::HEADER
    protected static readonly HEADER: string = 'header';

    // AS3: .../view/tabs/FriendRequestsTab.as::CANVAS
    protected static readonly CANVAS: string = 'canvas';

    // AS3: .../view/tabs/FriendRequestsTab.as::BUBBLE
    protected static readonly BUBBLE: string = 'bubble';

    // AS3: .../view/tabs/FriendRequestsTab.as::REQUEST_LIST
    protected static readonly REQUEST_LIST: string = 'request_entity_list';

    // AS3: .../view/tabs/FriendRequestsTab.as::NAME
    protected static readonly NAME: string = 'name';

    // AS3: .../view/tabs/FriendRequestsTab.as::COUNTER
    protected static readonly COUNTER: string = 'badge_counter';

    // AS3: .../view/tabs/FriendRequestsTab.as::REGION_PROFILE
    protected static readonly REGION_PROFILE: string = 'region_profile';

    // AS3: .../view/tabs/FriendRequestsTab.as::REGION_PROFILE_NAME
    protected static readonly REGION_PROFILE_NAME: string = 'region_profile_name';

    /** **Name derived** from its value. */
    // AS3: .../view/tabs/FriendRequestsTab.as::BUTTON_ACCEPT_ALL
    protected static readonly BUTTON_ACCEPT_ALL: string = 'button_accept_all';

    /** **Name derived** from its value. */
    // AS3: .../view/tabs/FriendRequestsTab.as::CLICK_AREA_DISCARD_ALL
    protected static readonly CLICK_AREA_DISCARD_ALL: string = 'click_area_discard_all';

    /** **Name derived** from its value. */
    // AS3: .../view/tabs/FriendRequestsTab.as::BUTTON_CLOSE
    protected static readonly BUTTON_CLOSE: string = 'button_close';

    // AS3: .../view/tabs/FriendRequestsTab.as::BUTTON_ACCEPT
    protected static readonly BUTTON_ACCEPT: string = 'button_accept';

    /** **Name derived** from its value. */
    // AS3: .../view/tabs/FriendRequestsTab.as::CLICK_AREA_DISCARD
    protected static readonly CLICK_AREA_DISCARD: string = 'click_area_discard';

    /** **Name derived** from its value. */
    // AS3: .../view/tabs/FriendRequestsTab.as::TEXT_DISCARD
    protected static readonly TEXT_DISCARD: string = 'text_discard';

    // AS3: .../view/tabs/FriendRequestsTab.as::ICON_RESOURCE
    private static readonly ICON_RESOURCE: string = 'add_friends_icon_png';

    // AS3: .../view/tabs/FriendRequestsTab.as::DEFAULT_COLOR
    private static readonly DEFAULT_COLOR: number = 0xFFFAC919;

    /** **Name derived**: the hovered counterpart of `DEFAULT_COLOR`. */
    private static readonly HOVER_COLOR: number = 0xFFFFD966;

    /** **Name derived**: the even row's background in the request list. */
    private static readonly ROW_COLOR_EVEN: number = 0xFFAB8710;

    /** **Name derived**: the odd row's background. */
    private static readonly ROW_COLOR_ODD: number = 0xFFBD9C2A;

    // AS3: .../view/tabs/FriendRequestsTab.as::REGION_REJECT_COLOR_EXPOSED
    private static readonly REGION_REJECT_COLOR_EXPOSED: number = 0xFFE66A;

    // AS3: .../view/tabs/FriendRequestsTab.as::REGION_REJECT_COLOR_NORMAL
    private static readonly REGION_REJECT_COLOR_NORMAL: number = 0xFFFFFF;

    /** The one recycled instance. **Name derived**; obfuscated in every tree. */
    // AS3: .../view/tabs/FriendRequestsTab.as::_recycledInstance
    private static _recycledInstance: FriendRequestsTab | null = null;

    // AS3: .../view/tabs/FriendRequestsTab.as::allocate()
    static allocate(requests: IFriendRequest[]): FriendRequestsTab
    {
        const tab = FriendRequestsTab._recycledInstance ?? new FriendRequestsTab();

        tab._recycled = false;
        tab._requests = requests;

        const counter = tab._window?.findChildByName(FriendRequestsTab.COUNTER) ?? null;

        if(counter !== null)
        {
            counter.caption = String(requests.length);
        }

        return tab;
    }

    // AS3: .../view/tabs/FriendRequestsTab.as::FriendRequestsTab()
    constructor()
    {
        super();

        this._window = this.allocateRequestsTabWindow();
    }

    // AS3: .../view/tabs/FriendRequestsTab.as::_SafeStr_5001
    private _requests: IFriendRequest[] | null = null;

    /** True once the bubble's rows have been built. **Name derived**. */
    // AS3: .../view/tabs/FriendRequestsTab.as::_rowsBuilt
    private _rowsBuilt: boolean = false;

    /** The row prototype lifted out of the layout. */
    // AS3: .../view/tabs/FriendRequestsTab.as::_entity
    private _entity: IWindowContainer | null = null;

    // AS3: .../view/tabs/FriendRequestsTab.as::recycle()
    override recycle(): void
    {
        if(this.disposed || this._recycled)
        {
            return;
        }

        const list = this.getRequestList();

        if(list !== null)
        {
            while(list.numListItems > 0)
            {
                list.removeListItemAt(0)?.dispose();
            }
        }

        this._rowsBuilt = false;
        this._requests = null;
        this._recycled = true;

        FriendRequestsTab._recycledInstance = this;
    }

    // AS3: .../view/tabs/FriendRequestsTab.as::select()
    override select(animate: boolean): void
    {
        if(this.selected)
        {
            return;
        }

        const bubble = this._window?.findChildByName(FriendRequestsTab.BUBBLE) as IBubbleWindow | null;

        if(bubble !== null)
        {
            (bubble as unknown as IWindow).visible = true;

            if(!this._rowsBuilt)
            {
                this.buildRequestRows();
            }

            this._rowsBuilt = true;
        }

        super.select(animate);
    }

    // AS3: .../view/tabs/FriendRequestsTab.as::select() inner loop
    private buildRequestRows(): void
    {
        const list = this.getRequestList();

        if(list === null || this._entity === null || this._requests === null)
        {
            return;
        }

        let height = 0;

        for(let i = 0; i < this._requests.length; i++)
        {
            const row = this._entity.clone() as IWindowContainer;
            const request = this._requests[i]!;

            row.color = i % 2 === 0 ? FriendRequestsTab.ROW_COLOR_EVEN : FriendRequestsTab.ROW_COLOR_ODD;
            row.id = request.id;

            const name = row.findChildByName(FriendRequestsTab.NAME);

            if(name !== null)
            {
                name.caption = request.name;
            }

            const canvas = row.findChildByName(FriendRequestsTab.CANVAS) as IBitmapWrapperWindow | null;
            const face = Tab.view?.getAvatarFaceBitmap(request.figure) ?? null;

            if(canvas !== null && face !== null)
            {
                // Toggled off around the assignment so the previous bitmap is not
                // disposed under the new one, then back on so the row owns this one.
                canvas.disposesBitmap = false;
                canvas.bitmap = face;
                (canvas as unknown as IWindow).width = face.width;
                (canvas as unknown as IWindow).height = face.height;
                canvas.disposesBitmap = true;
            }

            list.addListItem(row);
            height += row.height + list.spacing;
        }

        (list as unknown as IWindow).height = height;
    }

    // AS3: .../view/tabs/FriendRequestsTab.as::deselect()
    override deselect(animate: boolean): void
    {
        if(!this.selected)
        {
            return;
        }

        const bubble = this._window?.findChildByName(FriendRequestsTab.BUBBLE) ?? null;

        if(bubble !== null)
        {
            bubble.visible = false;
        }

        super.deselect(animate);
    }

    // AS3: .../view/tabs/FriendRequestsTab.as::expose()
    protected override expose(): void
    {
        super.expose();

        this.applyHoverStyle();
    }

    // AS3: .../view/tabs/FriendRequestsTab.as::conceal()
    protected override conceal(): void
    {
        super.conceal();

        this.applyHoverStyle();
    }

    private applyHoverStyle(): void
    {
        if(this._window === null)
        {
            return;
        }

        this._window.color = this.exposed ? FriendRequestsTab.HOVER_COLOR : FriendRequestsTab.DEFAULT_COLOR;

        const label = this._window.findChildByTag(FriendRequestsTab.LABEL) as ITextWindow | null;

        if(label !== null)
        {
            label.underline = this.exposed;
        }
    }

    // AS3: .../view/tabs/FriendRequestsTab.as::allocateRequestsTabWindow()
    private allocateRequestsTabWindow(): IWindowContainer | null
    {
        const window = Tab.windowing?.buildWidgetLayout(FriendRequestsTab.REQUESTS_WINDOW_RESOURCE) as IWindowContainer | null;

        if(window === null || window === undefined)
        {
            log.error(`allocateRequestsTabWindow: layout "${FriendRequestsTab.REQUESTS_WINDOW_RESOURCE}" is not registered`);

            return null;
        }

        window.x = 0;
        window.y = 0;
        window.width = Tab.width;
        window.height = Tab.height;

        window.addEventListener('WME_CLICK', this.onMouseClickEvent);
        window.addEventListener('WME_OVER', this.onMouseOverEvent);
        window.addEventListener('WME_OUT', this.onMouseOutEvent);

        const header = window.findChildByName(FriendRequestsTab.HEADER);

        if(header !== null)
        {
            header.addEventListener('WME_CLICK', this.onMouseClickEvent);
            header.addEventListener('WME_OVER', this.onMouseOverEvent);
            header.addEventListener('WME_OUT', this.onMouseOutEvent);
        }

        const tooltip = Tab.localization?.getLocalization('infostand.profile.link.tooltip', '') ?? '';

        for(const name of [FriendRequestsTab.REGION_PROFILE, FriendRequestsTab.REGION_PROFILE_NAME])
        {
            const region = window.findChildByName(name) as unknown as IInteractiveWindow | null;

            if(region !== null)
            {
                region.toolTipCaption = tooltip;
                region.toolTipDelay = 100;
            }
        }

        const canvas = window.findChildByName(FriendRequestsTab.CANVAS) as IBitmapWrapperWindow | null;

        if(canvas !== null)
        {
            canvas.disposesBitmap = true;
        }

        const bubble = window.findChildByName(FriendRequestsTab.BUBBLE) as IBubbleWindow | null;

        if(bubble !== null)
        {
            const bubbleWindow = bubble as unknown as IWindow;

            bubbleWindow.visible = false;
            // AS3: `-(h - (h - margins.bottom)) - 1`, i.e. `-margins.bottom - 1`. This
            // port's IBubbleWindow exposes no margins, so the offset falls back to the
            // bubble's own height, which is what the layout's margin describes.
            bubbleWindow.y = -bubbleWindow.height - 1;
            bubbleWindow.procedure = this.bubbleEventProc;
        }

        const icon = window.findChildByName(FriendRequestsTab.ICON) as IBitmapWrapperWindow | null;

        if(icon !== null)
        {
            icon.disposesBitmap = false;
            icon.bitmap = (Tab.assets?.getAssetByName(FriendRequestsTab.ICON_RESOURCE)?.content as ImageBitmap | null) ?? null;
        }

        // The layout ships one row; it is removed and kept as the clone source.
        const list = bubble?.content?.getChildByName(FriendRequestsTab.REQUEST_LIST) as IItemListWindow | null;

        if(list !== null && list !== undefined)
        {
            this._entity = list.removeListItemAt(0) as IWindowContainer | null;
        }

        return window;
    }

    // AS3: .../view/tabs/FriendRequestsTab.as::releaseRequestsTabWindow()
    private releaseRequestsTabWindow(window: IWindowContainer): void
    {
        if(window.disposed)
        {
            return;
        }

        window.procedure = null;
        window.removeEventListener('WME_CLICK', this.onMouseClickEvent);
        window.removeEventListener('WME_OVER', this.onMouseOverEvent);
        window.removeEventListener('WME_OUT', this.onMouseOutEvent);

        const header = window.findChildByName(FriendRequestsTab.HEADER);

        if(header !== null)
        {
            header.removeEventListener('WME_CLICK', this.onMouseClickEvent);
            header.removeEventListener('WME_OVER', this.onMouseOverEvent);
            header.removeEventListener('WME_OUT', this.onMouseOutEvent);
        }

        window.width = Tab.width;
        window.height = Tab.height;
        window.color = FriendRequestsTab.DEFAULT_COLOR;

        const canvas = window.findChildByName(FriendRequestsTab.CANVAS) as IBitmapWrapperWindow | null;

        if(canvas !== null)
        {
            canvas.bitmap = null;
        }

        const label = window.findChildByTag(FriendRequestsTab.LABEL) as ITextWindow | null;

        if(label !== null)
        {
            label.underline = false;
        }
    }

    /**
     * Every control inside the bubble routes here. The per-row buttons read their id
     * off the row (`window.parent.id`), which is why the rows carry the request id.
     */
    // AS3: .../view/tabs/FriendRequestsTab.as::bubbleEventProc()
    private bubbleEventProc = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type === 'WME_CLICK')
        {
            switch(window.name)
            {
                case FriendRequestsTab.BUTTON_CLOSE:
                    if(this.selected)
                    {
                        Tab.view?.deSelect(true);
                    }

                    break;

                case FriendRequestsTab.BUTTON_ACCEPT_ALL:
                    Tab.data?.acceptAllFriendRequests();
                    break;

                case FriendRequestsTab.CLICK_AREA_DISCARD_ALL:
                    Tab.data?.declineAllFriendRequests();
                    break;

                case FriendRequestsTab.BUTTON_ACCEPT:
                    Tab.data?.acceptFriendRequest(window.parent?.id ?? 0);
                    break;

                case FriendRequestsTab.CLICK_AREA_DISCARD:
                    Tab.data?.declineFriendRequest(window.parent?.id ?? 0);
                    break;

                case FriendRequestsTab.REGION_PROFILE:
                    Tab.tracking?.trackGoogle('extendedProfile', 'friendBar_multipleFriendRequestsAvatar');
                    Tab.data?.showProfile(window.parent?.id ?? 0);
                    break;

                case FriendRequestsTab.REGION_PROFILE_NAME:
                    Tab.tracking?.trackGoogle('extendedProfile', 'friendBar_multipleFriendRequestsName');
                    Tab.data?.showProfile(window.parent?.id ?? 0);
                    break;
            }

            return;
        }

        if(event.type === 'WME_OVER' || event.type === 'WME_OUT')
        {
            const over = event.type === 'WME_OVER';
            const container = window as IWindowContainer;

            if(window.name === FriendRequestsTab.CLICK_AREA_DISCARD)
            {
                const text = container.getChildByName(FriendRequestsTab.TEXT_DISCARD) as ITextWindow | null;

                if(text !== null)
                {
                    text.textColor = over ? FriendRequestsTab.REGION_REJECT_COLOR_EXPOSED : FriendRequestsTab.REGION_REJECT_COLOR_NORMAL;
                }
            }

            if(window.name === FriendRequestsTab.REGION_PROFILE_NAME)
            {
                const name = container.getChildByName(FriendRequestsTab.NAME) as ITextWindow | null;

                if(name !== null)
                {
                    name.underline = over;
                }
            }
        }
    };

    /**
     * Late-arriving face for one request's row — the bar asks for the image while the
     * bubble is already built.
     */
    // AS3: .../view/tabs/FriendRequestsTab.as::avatarImageReady()
    avatarImageReady(request: IFriendRequest, face: ImageBitmap): void
    {
        if(this.disposed)
        {
            return;
        }

        const list = this.getRequestList();

        if(list === null)
        {
            return;
        }

        for(let i = 0; i < list.numListItems; i++)
        {
            const row = list.getListItemAt(i) as IWindowContainer | null;

            if(row !== null && row.id === request.id)
            {
                const canvas = row.findChildByName(FriendRequestsTab.CANVAS) as IBitmapWrapperWindow | null;

                if(canvas !== null)
                {
                    canvas.disposesBitmap = true;
                    canvas.bitmap = face;
                    (canvas as unknown as IWindow).width = face.width;
                    (canvas as unknown as IWindow).height = face.height;
                }

                return;
            }
        }
    }

    private getRequestList(): IItemListWindow | null
    {
        const bubble = this._window?.findChildByName(FriendRequestsTab.BUBBLE) as IBubbleWindow | null;

        return (bubble?.content?.getChildByName(FriendRequestsTab.REQUEST_LIST) as IItemListWindow | null) ?? null;
    }

    private onMouseClickEvent = (event: WindowEvent): void =>
    {
        this.onMouseClick(event as WindowMouseEvent);
    };

    private onMouseOverEvent = (event: WindowEvent): void =>
    {
        this.onMouseOver(event as WindowMouseEvent);
    };

    private onMouseOutEvent = (event: WindowEvent): void =>
    {
        this.onMouseOut(event as WindowMouseEvent);
    };

    // AS3: .../view/tabs/FriendRequestsTab.as::dispose()
    override dispose(): void
    {
        if(this._window !== null)
        {
            this.releaseRequestsTabWindow(this._window);
            this._window = null;
        }

        if(this._entity !== null)
        {
            this._entity.dispose();
            this._entity = null;
        }

        super.dispose();
    }
}
