/**
 * RoomVisitsCtrl — "where has this user been": the rooms they entered, with the time of each.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/moderation/RoomVisitsCtrl.as
 *
 * **Rows come from a `static` pool shared by every instance of this window.** `dispose()` returns
 * them to it rather than destroying them, after clearing both `procedure` handlers — a returned row
 * that kept its handler would fire the previous window's action. The pool is capped at 200; beyond
 * that rows are disposed.
 *
 * Each row wires two independent actions: the room name opens the room's moderator card
 * (`OpenRoomTool`) and the "view room" cell walks the moderator into it
 * (`OpenRoomInSpectatorMode`).
 *
 * The scrollbar is toggled by hand on a 300 ms debounce after a resize, and the list is widened or
 * narrowed by the scrollbar's own 17 px so the rows keep filling the frame.
 */
import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IFrameWindow} from '@core/window/components/IFrameWindow';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IScrollableListWindow} from '@core/window/components/IScrollableListWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {
    GetRoomVisitsMessageComposer
} from '@habbo/communication/messages/outgoing/moderation/GetRoomVisitsMessageComposer';
import type {
    RoomVisitsMessageParser
} from '@habbo/communication/messages/parser/moderation/RoomVisitsMessageParser';
import type {RoomVisitData} from '@habbo/communication/messages/parser/moderation/RoomVisitData';
import {OpenRoomInSpectatorMode} from './actions/OpenRoomInSpectatorMode';
import {OpenRoomTool} from './actions/OpenRoomTool';
import type {ITrackedWindow} from './ITrackedWindow';
import type {ModerationManager} from './ModerationManager';
import {WindowTracker} from './WindowTracker';

export class RoomVisitsCtrl implements IDisposable, ITrackedWindow
{
    // AS3: RoomVisitsCtrl.as::ROOM_ROW_POOL_MAX_SIZE
    private static readonly ROOM_ROW_POOL_MAX_SIZE: number = 200;

    /** Shared by every `RoomVisitsCtrl`, as in AS3 — rows outlive the window that built them. */
    // AS3: RoomVisitsCtrl.as::ROOM_ROW_POOL
    private static readonly ROOM_ROW_POOL: IWindowContainer[] = [];

    /** `0xFFA2D6EA` — AS3 writes it as the decimal `4288861930`. */
    // AS3: RoomVisitsCtrl.as::populateRoomRow()
    private static readonly ROW_COLOR_ALTERNATE: number = 0xFFA2D6EA;

    /** `0xFFFFFFFF` — AS3 writes it as the decimal `4294967295`. */
    // AS3: RoomVisitsCtrl.as::populateRoomRow()
    private static readonly ROW_COLOR_DEFAULT: number = 0xFFFFFFFF;

    /** AS3's `new Timer(300, 1)` — one shot, 300 ms after the last resize. */
    // AS3: RoomVisitsCtrl.as::show()
    private static readonly RESIZE_DEBOUNCE_MS: number = 300;

    /** The scrollbar's width, added back to the list when it hides. */
    // AS3: RoomVisitsCtrl.as::onResizeTimer()
    private static readonly SCROLLBAR_WIDTH: number = 17;

    // AS3: RoomVisitsCtrl.as::_main
    private _main: ModerationManager | null;

    // AS3: RoomVisitsCtrl.as::_frame
    private _frame: IFrameWindow | null = null;

    /** Derived name — `_SafeStr_4652`. */
    // AS3: RoomVisitsCtrl.as::_SafeStr_4652
    private _list: IItemListWindow | null = null;

    /** Derived name — `_SafeStr_5971`. */
    // AS3: RoomVisitsCtrl.as::_SafeStr_5971
    private _userId: number;

    // AS3: RoomVisitsCtrl.as::_rooms
    private _rooms: RoomVisitData[] = [];

    // AS3: RoomVisitsCtrl.as::_disposed
    private _disposed: boolean = false;

    /** Derived name — `_SafeStr_6091`: the row the list ships with, cloned when the pool is empty. */
    // AS3: RoomVisitsCtrl.as::_SafeStr_6091
    private _rowTemplate: IWindowContainer | null = null;

    /** Derived name — `_SafeStr_5526`: the resize debounce. */
    // AS3: RoomVisitsCtrl.as::_SafeStr_5526
    private _resizeTimer: ReturnType<typeof setTimeout> | null = null;

    /** Derived name — `_SafeStr_7324`: the rows on screen, returned to the pool on dispose. */
    // AS3: RoomVisitsCtrl.as::_SafeStr_7324
    private _rows: IWindowContainer[] = [];

    // AS3: RoomVisitsCtrl.as::RoomVisitsCtrl()
    constructor(main: ModerationManager, userId: number)
    {
        this._main = main;
        this._userId = userId;
    }

    // AS3: RoomVisitsCtrl.as::getFormattedTime()
    public static getFormattedTime(hour: number, minute: number): string
    {
        return `${RoomVisitsCtrl.padToTwoDigits(hour)}:${RoomVisitsCtrl.padToTwoDigits(minute)}`;
    }

    // AS3: RoomVisitsCtrl.as::padToTwoDigits()
    public static padToTwoDigits(value: number): string
    {
        return value < 10 ? `0${value}` : `${value}`;
    }

    // AS3: RoomVisitsCtrl.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    /**
     * The window is built *after* the request goes out, and stays hidden until the answer arrives —
     * `onRoomVisits()` is what makes it visible.
     */
    // AS3: RoomVisitsCtrl.as::show()
    public show(): void
    {
        this._main?.messageHandler?.addRoomVisitsListener(this);
        this._main?.connection?.send(new GetRoomVisitsMessageComposer(this._userId));

        this._frame = this._main?.getXmlWindow('roomvisits_frame') as unknown as IFrameWindow | null;

        if(this._frame === null) return;

        this._list = this._frame.findChildByName('visits_list') as unknown as IItemListWindow | null;

        if(this._list !== null)
        {
            this._rowTemplate = this._list.getListItemAt(0) as unknown as IWindowContainer | null;
            this._list.removeListItems();
        }

        (this._frame as unknown as IWindow).procedure = this.onWindow;

        const closeButton = this._frame.findChildByTag('close');

        if(closeButton !== null) closeButton.procedure = this.onClose;
    }

    /** Unsubscribes on arrival: this window asks once and never refreshes. */
    // AS3: RoomVisitsCtrl.as::onRoomVisits()
    public onRoomVisits(data: RoomVisitsMessageParser): void
    {
        if(data.userId !== this._userId) return;
        if(this._disposed) return;

        this._rooms = data.rooms;

        const frame = this._frame as unknown as IWindow | null;

        if(frame !== null) frame.caption = `Room visits: ${data.userName}`;

        this.populate();
        this.onResizeTimer();

        if(frame !== null) frame.visible = true;

        this._main?.messageHandler?.removeRoomVisitsListener(this);
    }

    // AS3: RoomVisitsCtrl.as::getType()
    public getType(): number
    {
        return WindowTracker.TYPE_ROOMVISITS;
    }

    // AS3: RoomVisitsCtrl.as::getId()
    public getId(): string
    {
        return `${this._userId}`;
    }

    // AS3: RoomVisitsCtrl.as::getFrame()
    public getFrame(): IFrameWindow | null
    {
        return this._frame;
    }

    // AS3: RoomVisitsCtrl.as::populate()
    private populate(): void
    {
        let alternate = true;

        for(const room of this._rooms)
        {
            this.populateRoomRow(room, alternate);

            alternate = !alternate;
        }
    }

    /** The row's own colour is applied to the two interactive cells as well, not just the row. */
    // AS3: RoomVisitsCtrl.as::populateRoomRow()
    private populateRoomRow(room: RoomVisitData, alternate: boolean): void
    {
        const row = this.getRoomRowWindow();

        if(row === null || this._main === null) return;

        const color = alternate ? RoomVisitsCtrl.ROW_COLOR_ALTERNATE : RoomVisitsCtrl.ROW_COLOR_DEFAULT;

        (row as unknown as IWindow).color = color;

        const roomName = row.findChildByName('room_name_txt');

        if(roomName !== null)
        {
            roomName.caption = room.roomName;

            new OpenRoomTool(this._frame, this._main, roomName, room.roomId);

            roomName.color = color;
        }

        const time = row.findChildByName('time_txt') as ITextWindow | null;

        if(time !== null) time.text = RoomVisitsCtrl.getFormattedTime(room.enterHour, room.enterMinute);

        const viewRoom = row.findChildByName('view_room_txt');

        if(viewRoom !== null)
        {
            new OpenRoomInSpectatorMode(this._main, viewRoom, room.roomId);

            viewRoom.color = color;
        }

        this.addRoomRowToList(row);
    }

    // AS3: RoomVisitsCtrl.as::addRoomRowToList()
    private addRoomRowToList(row: IWindowContainer): void
    {
        this._list?.addListItem(row as unknown as IWindow);

        this._rows.push(row);
    }

    // AS3: RoomVisitsCtrl.as::getRoomRowWindow()
    private getRoomRowWindow(): IWindowContainer | null
    {
        const pooled = RoomVisitsCtrl.ROOM_ROW_POOL.pop() ?? null;

        if(pooled !== null) return pooled;

        return ((this._rowTemplate as unknown as IWindow | null)?.clone() ?? null) as unknown as IWindowContainer | null;
    }

    /**
     * Both `procedure` handlers are cleared before the row goes back: the `OpenRoomTool` and
     * `OpenRoomInSpectatorMode` bound to them belong to the window being disposed.
     */
    // AS3: RoomVisitsCtrl.as::storeRoomRowWindow()
    private storeRoomRowWindow(row: IWindowContainer): void
    {
        if(RoomVisitsCtrl.ROOM_ROW_POOL.length >= RoomVisitsCtrl.ROOM_ROW_POOL_MAX_SIZE)
        {
            (row as unknown as IWindow).dispose();

            return;
        }

        const roomName = row.findChildByName('room_name_txt');

        if(roomName !== null) roomName.procedure = null;

        const viewRoom = row.findChildByName('view_room_txt');

        if(viewRoom !== null) viewRoom.procedure = null;

        const template = this._rowTemplate as unknown as IWindow | null;
        const rowWindow = row as unknown as IWindow;

        if(template !== null)
        {
            rowWindow.width = template.width;
            rowWindow.height = template.height;
        }

        RoomVisitsCtrl.ROOM_ROW_POOL.push(row);
    }

    // AS3: RoomVisitsCtrl.as::onClose()
    private onClose = (event: WindowEvent): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        this.dispose();
    };

    /** Only the frame's own resize counts, and only while no debounce is already pending. */
    // AS3: RoomVisitsCtrl.as::onWindow()
    private onWindow = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type !== 'WE_RESIZED' || window !== (this._frame as unknown as IWindow)) return;

        if(this._resizeTimer !== null) return;

        this._resizeTimer = setTimeout(() =>
        {
            this._resizeTimer = null;

            this.onResizeTimer();
        }, RoomVisitsCtrl.RESIZE_DEBOUNCE_MS);
    };

    /** Shows or hides the scrollbar, and gives the list back the width it occupies. */
    // AS3: RoomVisitsCtrl.as::onResizeTimer()
    private onResizeTimer(): void
    {
        const list = this._list as unknown as IScrollableListWindow | null;
        const listWindow = this._list as unknown as IWindow | null;

        if(list === null || listWindow === null) return;

        const parent = listWindow.parent as unknown as IWindowContainer | null;
        const scroller = parent?.getChildByName('scroller') ?? null;

        if(scroller === null) return;

        const needsScroller = list.scrollableRegion.height > listWindow.height;

        if(scroller.visible)
        {
            if(!needsScroller)
            {
                scroller.visible = false;
                listWindow.width += RoomVisitsCtrl.SCROLLBAR_WIDTH;
            }

            return;
        }

        if(needsScroller)
        {
            scroller.visible = true;
            listWindow.width -= RoomVisitsCtrl.SCROLLBAR_WIDTH;
        }
    }

    // AS3: RoomVisitsCtrl.as::dispose()
    public dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;

        if(this._list !== null)
        {
            this._list.removeListItems();
            (this._list as unknown as IWindow).dispose();
            this._list = null;
        }

        if(this._frame !== null)
        {
            (this._frame as unknown as IWindow).destroy();
            this._frame = null;
        }

        this._main = null;

        if(this._resizeTimer !== null)
        {
            clearTimeout(this._resizeTimer);
            this._resizeTimer = null;
        }

        for(const row of this._rows)
        {
            this.storeRoomRowWindow(row);
        }

        if(this._rowTemplate !== null)
        {
            (this._rowTemplate as unknown as IWindow).dispose();
            this._rowTemplate = null;
        }

        this._rows = [];
    }
}
