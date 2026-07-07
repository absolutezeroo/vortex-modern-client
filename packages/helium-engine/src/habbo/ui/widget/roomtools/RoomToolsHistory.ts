/**
 * RoomToolsHistory
 *
 * @see sources/win63_version/habbo/ui/widget/roomtools/RoomToolsHistory.as
 *
 * Visited-rooms dropdown list shown when the room-history toolbar button
 * is toggled.
 *
 * TODO(AS3): the per-row "room_tools_history_item" layout asset is not
 * bundled (only room_tools_toolbar/room_tools_info/room_tools_history exist
 * in packages/helium-client/src/assets/window-layouts/). populate() logs and
 * no-ops instead of throwing so the toggle button remains usable (it still
 * opens/closes an empty window) while the visited-room list itself is not
 * yet rendered. Add the missing layout to restore full parity.
 */
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {Logger} from '@core/utils/Logger';
import type {GuestRoomData} from '@habbo/communication/messages/incoming/navigator/GuestRoomData';
import type {RoomToolsWidgetHandler} from '@habbo/ui/handler/RoomToolsWidgetHandler';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';

const log = Logger.getLogger('RoomToolsHistory');

const PADDING = 5;
const SPACING = 2;

export class RoomToolsHistory
{
    private _windowManager: IHabboWindowManager | null;
    private _assets: IAssetLibrary | null;
    private _window: IWindowContainer | null;
    private _handler: RoomToolsWidgetHandler | null;
    private _items: IWindow[] = [];

    // AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsHistory.as::RoomToolsHistory()
    constructor(windowManager: IHabboWindowManager, assets: IAssetLibrary | null, handler: RoomToolsWidgetHandler)
    {
        this._handler = handler;
        this._assets = assets;
        this._windowManager = windowManager;
        this._window = windowManager.buildWidgetLayout('room_tools_history_xml') as IWindowContainer | null;
    }

    // AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsHistory.as::populate()
    public populate(rooms: GuestRoomData[]): void
    {
        if(!this._window || !this._windowManager) return;

        const probe = this._windowManager.buildWidgetLayout('room_tools_history_item_xml');

        if(!probe)
        {
            log.warn('room_tools_history_item_xml layout not bundled — history list will not render (see TODO(AS3) header)');

            return;
        }

        probe.dispose();

        let previous: IWindow | null = null;

        for(const room of rooms)
        {
            const item = this._windowManager.buildWidgetLayout('room_tools_history_item_xml') as IWindowContainer | null;

            if(!item) continue;

            this._window.addChild(item);

            const nameLabel = item.findChildByName('room_name');

            if(nameLabel) nameLabel.caption = room.roomName;

            item.y = previous ? previous.bottom + SPACING : PADDING;
            item.x = PADDING;
            item.id = room.flatId;
            item.procedure = this.onClick;

            previous = item;
            this._items.push(item);
        }

        if(previous)
        {
            this._window.height = previous.bottom + 2 * PADDING;
        }
    }

    // AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsHistory.as::dispose()
    public dispose(): void
    {
        for(const item of this._items)
        {
            item.procedure = null;
            item.dispose();
        }

        this._items = [];
        this._windowManager = null;
        this._handler = null;
        this._assets = null;
        this._window?.dispose();
        this._window = null;
    }

    // AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsHistory.as::onClick()
    private onClick = (event: WindowEvent, target: IWindow): void =>
    {
        if(event.type !== WindowMouseEvent.CLICK) return;

        this._handler?.goToPrivateRoom(target.id);
    };

    // AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsHistory.as::get window()
    public get window(): IWindowContainer | null
    {
        return this._window;
    }
}
