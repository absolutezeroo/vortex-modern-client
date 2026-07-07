/**
 * RoomToolsToolbarCtrl
 *
 * @see sources/win63_version/habbo/ui/widget/roomtools/RoomToolsToolbarCtrl.as
 *
 * The room-tools icon strip: settings/zoom/collapse/history/chat-history/
 * like/share/camera buttons, collapse-expand slide animation, and the
 * share-room popup with clipboard.
 */
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {Motion} from '@core/window/motion/Motion';
import {EaseOut} from '@core/window/motion/EaseOut';
import {MoveTo} from '@core/window/motion/MoveTo';
import {Queue} from '@core/window/motion/Queue';
import {Callback} from '@core/window/motion/Callback';
import {Motions} from '@core/window/motion/Motions';
import {HabboToolbarEvent} from '@habbo/toolbar/events/HabboToolbarEvent';
import {RoomWidgetZoomToggleMessage} from '@habbo/ui/widget/messages/RoomWidgetZoomToggleMessage';
import {RoomToolsCtrlBase} from './RoomToolsCtrlBase';
import {RoomToolsHistory} from './RoomToolsHistory';
import type {RoomToolsWidget} from './RoomToolsWidget';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';

const TOOLBAR_EXPAND_TARGET_X = 1;
const TOOLBAR_COLLAPSE_TARGET_X = -130;

export class RoomToolsToolbarCtrl extends RoomToolsCtrlBase 
{
    private _history: RoomToolsHistory | null = null;

    // AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsToolbarCtrl.as::RoomToolsToolbarCtrl()
    constructor(widget: RoomToolsWidget, windowManager: IHabboWindowManager, assets: IAssetLibrary | null) 
    {
        super(widget, windowManager, assets);

        this._window = windowManager.buildWidgetLayout('room_tools_toolbar_xml') as IWindowContainer | null;

        if(this._window) 
        {
            this._window.procedure = this.onWindowEvent;
            this._window.addEventListener(WindowMouseEvent.OVER, this.onWindowEvent);
            this._window.addEventListener(WindowMouseEvent.OUT, this.onWindowEvent);
        }

        this.updateVisuals();
    }

    // AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsToolbarCtrl.as::get right()
    public get right(): number 
    {
        if(!this._window) return 0;

        if(this._collapsed) 
        {
            const expand = this._window.findChildByName('side_bar_expand');

            return expand ? expand.width - 5 : 0;
        }

        return this._window.width - 5;
    }

    // AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsToolbarCtrl.as::dispose()
    public override dispose(): void 
    {
        if(this._history) 
        {
            this._history.dispose();
            this._history = null;
        }

        const shareWindow = this._windowManager.getWindowByName('share_room_link') as IWindowContainer | null;

        shareWindow?.dispose();

        super.dispose();
    }

    // AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsToolbarCtrl.as::updateRoomHistoryButtons()
    public updateRoomHistoryButtons(): void 
    {
        if(!this._window || !this._widget) return;

        const forward = this._window.findChildByName('button_history_forward');
        const back = this._window.findChildByName('button_history_back');
        const historyBtn = this._window.findChildByName('button_history');

        if(this._widget.currentRoomIndex >= this._widget.visitedRooms.length - 1) 
        {
            forward?.disable();
        }
        else 
        {
            forward?.enable();
        }

        if(this._widget.currentRoomIndex === 0) 
        {
            back?.disable();
        }
        else 
        {
            back?.enable();
        }

        if(this._widget.visitedRooms.length <= 1) 
        {
            historyBtn?.disable();
        }
        else 
        {
            historyBtn?.enable();
        }
    }

    // AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsToolbarCtrl.as::disableRoomHistoryButtons()
    public disableRoomHistoryButtons(): void 
    {
        this._window?.findChildByName('button_history_forward')?.disable();
        this._window?.findChildByName('button_history_back')?.disable();
    }

    // AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsToolbarCtrl.as::release()
    public release(): void 
    {
        if(this._history) 
        {
            this.toggleHistory();
        }
    }

    // AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsToolbarCtrl.as::setChatHistoryButton()
    public setChatHistoryButton(visible: boolean): void 
    {
        this.setElementVisible('button_chat_history', visible);
    }

    // AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsToolbarCtrl.as::setCameraButton()
    public setCameraButton(visible: boolean): void 
    {
        this.setElementVisible('button_camera', visible);
    }

    // AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsToolbarCtrl.as::setLikeButton()
    public setLikeButton(visible: boolean): void 
    {
        this.setElementVisible('button_like', visible);
    }

    // AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsToolbarCtrl.as::setElementVisible()
    public override setElementVisible(name: string, visible: boolean): void 
    {
        if(!this._window) return;

        this._window.visible = true;
        super.setElementVisible(name, visible);
        this.updatePosition();
    }

    // AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsToolbarCtrl.as::updatePosition()
    public updatePosition(): void 
    {
        if(!this._window) return;

        if(this._collapsed) 
        {
            const expand = this._window.findChildByName('side_bar_expand');

            if(expand) expand.y = this._window.height - expand.height;
        }
        else 
        {
            const arrowCollapse = this._window.findChildByName('arrow_collapse');
            const itemList = this._window.findChildByName('itemlist_buttons') as IItemListWindow | null;
            const sideBarCollapse = this._window.findChildByName('side_bar_collapse');
            const windowBg = this._window.findChildByName('window_bg');

            let total = 0;

            if(itemList) 
            {
                for(let i = 0; i < itemList.numListItems; i++) 
                {
                    const item = itemList.getListItemAt(i);

                    if(item?.visible) 
                    {
                        total += item.height;
                    }
                }
            }

            if(sideBarCollapse) sideBarCollapse.height = total;

            this._window.height = total;

            if(itemList) itemList.height = total;
            if(windowBg) windowBg.height = total;

            if(arrowCollapse) arrowCollapse.y = total * 0.5 - arrowCollapse.height * 0.5;
        }

        const desktopHeight = this._window.desktop?.height ?? 0;

        this._window.position = {
            x: RoomToolsCtrlBase.TOOLBAR_X,
            y: desktopHeight - RoomToolsCtrlBase.DISTANCE_FROM_BOTTOM - this._window.height
        };

        const historyWindow = this._history?.window;

        if(historyWindow) 
        {
            historyWindow.position = {
                x: this.right - historyWindow.width,
                y: this._window.position.y - historyWindow.height,
            };
        }
    }

    // AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsToolbarCtrl.as::setCollapsed()
    public override setCollapsed(value: boolean): void 
    {
        if(this._collapsed === value || !this._window) return;

        this._collapsed = value;

        const windowBg = this._window.findChildByName('window_bg');

        if(!windowBg) return;

        if(this._collapsed) 
        {
            const motion = new Queue(
                new EaseOut(new MoveTo(windowBg, 100, TOOLBAR_COLLAPSE_TARGET_X, windowBg.y), 1),
                new Callback(this.motionComplete)
            );

            Motions.runMotion(motion);
        }
        else 
        {
            windowBg.x = TOOLBAR_COLLAPSE_TARGET_X;
            this.updateVisuals();

            const motion = new EaseOut(new MoveTo(windowBg, 100, TOOLBAR_EXPAND_TARGET_X, windowBg.y), 1);

            Motions.runMotion(motion);
        }
    }

    // AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsToolbarCtrl.as::toggleHistory()
    private toggleHistory(): void 
    {
        if(this._history) 
        {
            this._history.dispose();
            this._history = null;

            return;
        }

        if(!this.handler || !this._widget) return;

        this._history = new RoomToolsHistory(this._windowManager, this._assets, this.handler);
        this._history.populate(this._widget.visitedRooms);
        this.updatePosition();
    }

    // AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsToolbarCtrl.as::motionComplete()
    private motionComplete = (_motion: Motion): void => 
    {
        this.updateVisuals();
    };

    // AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsToolbarCtrl.as::updateVisuals()
    private updateVisuals(): void 
    {
        const windowBg = this._window?.findChildByName('window_bg');

        if(!this._window || !windowBg) return;

        windowBg.visible = !this._collapsed;

        const sideBarCollapse = this._window.findChildByName('side_bar_collapse');
        const sideBarExpand = this._window.findChildByName('side_bar_expand');

        if(sideBarCollapse) sideBarCollapse.visible = !this._collapsed;
        if(sideBarExpand) sideBarExpand.visible = this._collapsed;

        this.updatePosition();
    }

    // AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsToolbarCtrl.as::onWindowEvent()
    private onWindowEvent = (event: WindowEvent, target: IWindow): void => 
    {
        if(event.type === 'WE_PARENT_RESIZED' && this._window && this._window.parent && event.target === this._window.parent) 
        {
            this.updatePosition();

            return;
        }

        if(event.type !== WindowMouseEvent.CLICK) return;

        this.clearCollapseTimer();

        switch(target.name) 
        {
            case 'button_settings':
                this.handler?.toggleRoomInfoWindow();
                break;
            case 'button_zoom':
                this._widget?.messageListener?.processWidgetMessage(new RoomWidgetZoomToggleMessage());
                break;
            case 'button_collapse':
            case 'button_expand':
                this._widget?.setCollapsed(!this._collapsed);
                this.handler?.sessionDataManager?.setRoomToolsState(!this._collapsed);
                break;
            case 'button_history_back':
                this._widget?.goToPreviousRoom();
                break;
            case 'button_history_forward':
                this._widget?.goToNextRoom();
                break;
            case 'button_history':
                this.toggleHistory();
                break;
            case 'button_chat_history':
                // TODO(AS3): freeFlowChat isn't wired into RoomUI/RoomDesktop yet — see
                // sources/win63_version/habbo/ui/widget/roomtools/RoomToolsToolbarCtrl.as
                // case "button_chat_history": var_16.freeFlowChat.toggleVisibility();
                break;
            case 'button_like':
                this.handler?.rateRoom();
                this._window?.findChildByName('button_like')?.disable();
                break;
            case 'button_share':
                this.onShareClick();
                break;
            case 'button_camera': {
                const cameraEvent = new HabboToolbarEvent(HabboToolbarEvent.CAMERA_TOGGLE);

                cameraEvent.iconName = HabboToolbarEvent.CAMERA_LAUNCH_ORIGIN_ROOM_TOOL;
                this.handler?.container?.toolbar?.toolbarEvents.emit(HabboToolbarEvent.CAMERA_TOGGLE, cameraEvent);
                break;
            }
        }
    };

    // AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsToolbarCtrl.as::onWindowEvent() (button_share branch)
    private onShareClick(): void 
    {
        if(!this._widget) return;

        let shareWindow = this._windowManager.getWindowByName('share_room_link') as IWindowContainer | null;

        if(!shareWindow) 
        {
            shareWindow = this._windowManager.buildWidgetLayout('share_room') as IWindowContainer | null;
        }

        if(shareWindow) 
        {
            this.handler?.container?.habboTracking?.trackEventLog('RoomLink', 'click', 'client.room_link.clicked');

            shareWindow.name = 'share_room_link';
            shareWindow.center();

            const closeButton = shareWindow.findChildByTag('close');

            closeButton?.addEventListener(WindowMouseEvent.CLICK, () => shareWindow?.dispose());

            const embedTxt = shareWindow.findChildByName('embed_src_txt');
            const embedDirectTxt = shareWindow.findChildByName('embed_src_direct_txt');
            const thumbnail = shareWindow.findChildByName('thumbnail_image') as IStaticBitmapWrapperWindow | null;

            if(embedTxt) embedTxt.caption = this.getEmbedData();
            if(embedDirectTxt) embedDirectTxt.caption = this.getEmbedData('embed_src_direct_txt', '${url.prefix}/room/%roomId%');
            if(thumbnail) 
            {
                const thumbnailUrl = this.getThumbnailUrl();

                if(thumbnailUrl) thumbnail.assetUri = thumbnailUrl;
            }
        }

        void navigator.clipboard?.writeText(this.getEmbedData()).catch(() => 
        {
            // AS3: System.setClipboard() has no browser equivalent guarantee outside a
            // user gesture / secure context — swallow to match AS3's try/catch no-op.
        });
    }

    // AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsToolbarCtrl.as::getEmbedData()
    private getEmbedData(_key: string = 'navigator.embed.src', fallback: string = ''): string 
    {
        const navigatorRef = this.handler?.navigator;
        const guestRoom = navigatorRef?.enteredGuestRoomData ?? null;
        const roomType = guestRoom ? 'private' : null;
        const flatId = guestRoom ? String(guestRoom.flatId) : null;
        const config = this.handler?.container?.config ?? null;
        const embedCode = config?.getProperty('user.hash') ?? '';
        const localizations = this._widget?.localizations;
        const key = 'navigator.embed.src';

        if(localizations?.hasLocalization(key)) 
        {
            localizations.registerParameter(key, 'roomType', roomType ?? '');
            localizations.registerParameter(key, 'embedCode', embedCode);
            localizations.registerParameter(key, 'roomId', flatId ?? '');

            return localizations.getLocalization(key, fallback);
        }

        if(fallback !== '') 
        {
            const urlPrefix = config?.getProperty('url.prefix') ?? '';

            return fallback.replace('${url.prefix}', urlPrefix).replace('%roomId%', flatId ?? '');
        }

        return localizations?.getLocalization(key, fallback) ?? fallback;
    }

    // AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsToolbarCtrl.as::getThumbnailUrl()
    private getThumbnailUrl(): string | null 
    {
        const guestRoom = this.handler?.navigator?.enteredGuestRoomData ?? null;

        if(!guestRoom) return null;

        const config = this.handler?.container?.config ?? null;

        if(guestRoom.officialRoomPicRef !== null) 
        {
            if(config?.getBoolean('new.navigator.official.room.thumbnails.in.amazon')) 
            {
                const base = config?.getProperty('navigator.thumbnail.url_base') ?? '';

                return `${base}${guestRoom.flatId}.png`;
            }

            return `${config?.getProperty('image.library.url') ?? ''}${guestRoom.officialRoomPicRef}`;
        }

        const base = config?.getProperty('navigator.thumbnail.url_base') ?? '';

        return `${base}${guestRoom.flatId}.png`;
    }
}
