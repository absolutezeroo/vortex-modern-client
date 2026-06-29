import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {IHabboTransitionalNavigator} from '../IHabboTransitionalNavigator';
import type {RoomEventData} from '@habbo/communication/messages/incoming/navigator/RoomEventData';

/**
 * Room event info display in the toolbar extension area.
 * Shows compact/expanded event info with modify/extend buttons.
 *
 * @see sources/win63_version/habbo/navigator/inroom/RoomEventInfoCtrl.as
 */
export class RoomEventInfoCtrl implements IDisposable
{
    private static readonly TOOLBAR_EXTENSION_ID: string = 'room_event_info';

    private _navigator: IHabboTransitionalNavigator | null;
    private _window: IWindowContainer | null = null;
    private _expanded: boolean = true;

    constructor(navigator: IHabboTransitionalNavigator)
    {
        this._navigator = navigator;
    }

    get disposed(): boolean
    {
        return this._navigator === null;
    }

    get expanded(): boolean
    {
        return this._expanded;
    }

    set expanded(value: boolean)
    {
        this._expanded = value;
    }

    dispose(): void
    {
        if(this._navigator)
        {
            this._navigator.toolbar?.extensionView?.detachExtension(RoomEventInfoCtrl.TOOLBAR_EXTENSION_ID);
        }

        this._navigator = null;

        if(this._window)
        {
            (this._window as unknown as { dispose(): void }).dispose();
            this._window = null;
        }
    }

    refresh(): void
    {
        if(!this._navigator) return;

        const toolbar = this._navigator.toolbar;

        if(toolbar === null || toolbar.extensionView === null || !this._enabled()) return;

        const hasEvent = this._navigator.data.roomEventData !== null;
        const isOwner = this._navigator.data.currentRoomOwner;
        const isEventMod = this._navigator.data.eventMod;
        const roomId = this._navigator.data.currentRoomId;
        const session = this._navigator.roomSessionManager?.getSession(roomId) ?? null;

        if(!session) return;

        let canEdit = isOwner || isEventMod;

        if(session.roomControllerLevel === 1)
        {
            canEdit = true;
        }

        if(!hasEvent && !isOwner && !canEdit)
        {
            toolbar.extensionView.detachExtension(RoomEventInfoCtrl.TOOLBAR_EXTENSION_ID);
            return;
        }

        this._prepareWindow();

        if(this._window === null) return;

        const expandedAndHasEvent = this._expanded && hasEvent;

        const showOwner = expandedAndHasEvent && isOwner;
        const showVisitor = expandedAndHasEvent && !isOwner;
        const showContracted = !this._expanded || !hasEvent;
        const showModify = expandedAndHasEvent && canEdit;
        const showGetEvent = !hasEvent && canEdit;
        const showInProgress = expandedAndHasEvent && !canEdit;
        const showDesc = expandedAndHasEvent;

        this._setChildVisible('event_bg_owner', showOwner);
        this._setChildVisible('event_bg_visitor', showVisitor);
        this._setChildVisible('event_bg_contracted', showContracted);
        this._setChildVisible('modify_link_region', showModify);
        this._setChildVisible('extend_event_region', showModify && this._canExtend());
        this._setChildVisible('get_event', showGetEvent);
        this._setChildVisible('create_link', false);
        this._setChildVisible('in_progress_txt', showInProgress);
        this._setChildVisible('desc_txt', showDesc);
        this._setChildVisible('header_txt', hasEvent);

        const shouldShow =
            (hasEvent && (showOwner || showVisitor || showContracted || showModify || showInProgress || showDesc)) ||
            showGetEvent;

        this._window.visible = shouldShow;

        if(hasEvent && this._navigator.data.roomEventData !== null)
        {
            const evData: RoomEventData = this._navigator.data.roomEventData;
            this._setChildCaption('header_txt', evData.eventName);
            this._setChildCaption('desc_txt', evData.eventDescription);
        }

        toolbar.extensionView.attachExtension(
            RoomEventInfoCtrl.TOOLBAR_EXTENSION_ID,
            this._window as unknown as Parameters<typeof toolbar.extensionView.attachExtension>[1],
            -1,
            ['next_quest_timer', 'quest_tracker']
        );

        this._window.x = 0;
        this._window.y = 0;

        const visitorBg = this._window.findChildByName('event_bg_visitor');
        const contractedBg = this._window.findChildByName('event_bg_contracted');

        this._window.height = (expandedAndHasEvent && visitorBg !== null)
            ? (visitorBg as unknown as { height: number }).height
            : contractedBg !== null
                ? (contractedBg as unknown as { height: number }).height
                : this._window.height;
    }

    close(): void
    {
        if(this._window !== null && this._window.visible)
        {
            this._window.visible = false;
            this._navigator?.toolbar?.extensionView?.detachExtension(RoomEventInfoCtrl.TOOLBAR_EXTENSION_ID);
        }
    }

    private _enabled(): boolean
    {
        if(!this._navigator) return false;

        const newIdentity = this._navigator.getInteger('new.identity', 0);
        const hideUi = this._navigator.getBoolean('new.identity.hide.ui');
        const identityOk = newIdentity === 0 || !hideUi;

        return this._navigator.getBoolean('eventinfo.enabled') && identityOk;
    }

    private _canExtend(): boolean
    {
        if(!this._navigator) return false;

        const evData = this._navigator.data.roomEventData;

        if(evData === null) return false;

        if(!this._navigator.getBoolean('roomad.limit_total_time')) return true;

        const now = Date.now();
        const expTime = evData.expirationDate.getTime();
        const durationMs = this._navigator.getInteger('room_ad.duration.minutes', 120) * 60 * 1000;
        const maxTotalMs = this._navigator.getInteger('room_ad.maximum_total_time.minutes', 10080) * 60 * 1000;

        return expTime + durationMs < now + maxTotalMs;
    }

    private _prepareWindow(): void
    {
        if(this._window !== null) return;

        const win = this._navigator?.getXmlWindow('iro_event_info') as IWindowContainer | null;

        if(win === null) return;

        this._window = win;

        const bgRegion = win.findChildByName('bg_region');

        if(bgRegion !== null)
        {
            bgRegion.addEventListener('WME_CLICK', this._onGetEventClick);
        }

        const modifyRegion = win.findChildByName('modify_link_region');

        if(modifyRegion !== null)
        {
            modifyRegion.addEventListener('WME_CLICK', this._onModify);
        }

        const extendRegion = win.findChildByName('extend_event_region');

        if(extendRegion !== null)
        {
            extendRegion.addEventListener('WME_CLICK', this._onExtend);
        }
    }

    private _setChildVisible(name: string, visible: boolean): void
    {
        if(this._window === null) return;

        const child = this._window.findChildByName(name);

        if(child !== null) child.visible = visible;
    }

    private _setChildCaption(name: string, caption: string): void
    {
        if(this._window === null) return;

        const child = this._window.findChildByName(name);

        if(child !== null) child.caption = caption;
    }

    private _onGetEventClick = (_event: WindowEvent): void =>
    {
        if(!this._navigator) return;

        if(this._navigator.data.roomEventData !== null)
        {
            this._expanded = !this._expanded;
            this.refresh();
        }
        else
        {
            this._navigator.openCatalogRoomAdsPage();
        }
    };

    private _onModify = (event: WindowEvent): void =>
    {
        if(event.type === 'WME_CLICK')
        {
            this._navigator?.roomEventViewCtrl?.show();
        }
    };

    private _onExtend = (event: WindowEvent): void =>
    {
        if(event.type !== 'WME_CLICK' || !this._navigator) return;

        const evData = this._navigator.data.roomEventData;

        if(evData === null) return;

        this._navigator.openCatalogRoomAdsExtendPage(
            evData.eventName,
            evData.eventDescription,
            evData.expirationDate,
            evData.categoryId
        );
    };
}
