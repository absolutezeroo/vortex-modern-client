/**
 * UserClassificationCtrl — the room's occupants with the classification the server assigns each.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/moderation/UserClassificationCtrl.as
 *
 * Structurally the twin of `RoomVisitsCtrl`: a static row pool shared by every instance, a 300 ms
 * resize debounce, and a hand-toggled scrollbar. It even reports **the same window type (6)**, so
 * the tracker treats the two as one slot and opening either closes the other — see
 * `WindowTracker.TYPE_ROOMVISITS`.
 *
 * **Non-moderators get a redacted view rather than no window.** The classification column and the
 * "visit" cell are hidden, and neither row action is wired at all — so the window still opens and
 * lists names, but nothing in it is actionable.
 *
 * `_frame.caption = ""` on arrival is AS3's: this window's title bar is deliberately blank.
 */
import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IFrameWindow} from '@core/window/components/IFrameWindow';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IScrollableListWindow} from '@core/window/components/IScrollableListWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {UserClassificationData} from '@habbo/userclassification/UserClassificationData';
import {VisitUserUtil} from '@habbo/util/VisitUserUtil';
import {OpenUserInfo} from './actions/OpenUserInfo';
import type {ITrackedWindow} from './ITrackedWindow';
import type {ModerationManager} from './ModerationManager';
import {WindowTracker} from './WindowTracker';

export class UserClassificationCtrl implements IDisposable, ITrackedWindow
{
    // AS3: UserClassificationCtrl.as::CLASSIFICATION_ROW_POOL_MAX_SIZE
    private static readonly CLASSIFICATION_ROW_POOL_MAX_SIZE: number = 200;

    /** Shared by every instance, as in AS3 — rows outlive the window that built them. */
    // AS3: UserClassificationCtrl.as::CLASSIFICATION_ROW_POOL
    private static readonly CLASSIFICATION_ROW_POOL: IWindowContainer[] = [];

    /** `0xFFA2D6EA` — AS3 writes it as the decimal `4288861930`. */
    // AS3: UserClassificationCtrl.as::populateRoomRow()
    private static readonly ROW_COLOR_ALTERNATE: number = 0xFFA2D6EA;

    /** `0xFFFFFFFF` — AS3 writes it as the decimal `4294967295`. */
    // AS3: UserClassificationCtrl.as::populateRoomRow()
    private static readonly ROW_COLOR_DEFAULT: number = 0xFFFFFFFF;

    /** AS3's `new Timer(300, 1)`. */
    // AS3: UserClassificationCtrl.as::show()
    private static readonly RESIZE_DEBOUNCE_MS: number = 300;

    // AS3: UserClassificationCtrl.as::onResizeTimer()
    private static readonly SCROLLBAR_WIDTH: number = 17;

    // AS3: UserClassificationCtrl.as::_main
    private _main: ModerationManager | null;

    // AS3: UserClassificationCtrl.as::_frame
    private _frame: IFrameWindow | null = null;

    /** Derived name — `_SafeStr_4652`. */
    // AS3: UserClassificationCtrl.as::_SafeStr_4652
    private _list: IItemListWindow | null = null;

    /** Derived name — `_SafeStr_8681`: which classification request this window answers. */
    // AS3: UserClassificationCtrl.as::_SafeStr_8681
    private _classificationType: number;

    /** Derived name — `_SafeStr_10193`. */
    // AS3: UserClassificationCtrl.as::_SafeStr_10193
    private _classifications: UserClassificationData[] = [];

    // AS3: UserClassificationCtrl.as::_disposed
    private _disposed: boolean = false;

    /** Derived name — `_SafeStr_6091`. */
    // AS3: UserClassificationCtrl.as::_SafeStr_6091
    private _rowTemplate: IWindowContainer | null = null;

    /** Derived name — `_SafeStr_5526`. */
    // AS3: UserClassificationCtrl.as::_SafeStr_5526
    private _resizeTimer: ReturnType<typeof setTimeout> | null = null;

    /** Derived name — `_SafeStr_7090`. */
    // AS3: UserClassificationCtrl.as::_SafeStr_7090
    private _rows: IWindowContainer[] = [];

    // AS3: UserClassificationCtrl.as::UserClassificationCtrl()
    constructor(main: ModerationManager, classificationType: number)
    {
        this._main = main;
        this._classificationType = classificationType;
    }

    // AS3: UserClassificationCtrl.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    /** Unlike its twin this sends nothing: the message handler builds it *from* the answer. */
    // AS3: UserClassificationCtrl.as::show()
    public show(): void
    {
        this._main?.messageHandler?.addUserClassificationListener(this);

        this._frame = this._main?.getXmlWindow('userclassification_frame') as unknown as IFrameWindow | null;

        if(this._frame === null) return;

        this._list = this._frame.findChildByName('userclassification_list') as unknown as IItemListWindow | null;

        if(this._list !== null)
        {
            this._rowTemplate = this._list.getListItemAt(0) as unknown as IWindowContainer | null;
            this._list.removeListItems();
        }

        (this._frame as unknown as IWindow).procedure = this.onWindow;

        const closeButton = this._frame.findChildByTag('close');

        if(closeButton !== null) closeButton.procedure = this.onClose;
    }

    // AS3: UserClassificationCtrl.as::onUserClassification()
    public onUserClassification(classificationType: number, classifications: UserClassificationData[]): void
    {
        if(classificationType !== this._classificationType) return;
        if(this._disposed) return;

        this._classifications = classifications;

        const frame = this._frame as unknown as IWindow | null;

        if(frame !== null) frame.caption = '';

        this.populate();
        this.onResizeTimer();

        if(frame !== null) frame.visible = true;

        this._main?.messageHandler?.removeUserClassificationListener(this);
    }

    // AS3: UserClassificationCtrl.as::populate()
    private populate(): void
    {
        let alternate = true;

        for(const classification of this._classifications)
        {
            this.populateRoomRow(classification, alternate);

            alternate = !alternate;
        }
    }

    /**
     * AS3 adds the row to the list *before* wiring the two actions, and wires them only for
     * moderators — order and condition both kept.
     */
    // AS3: UserClassificationCtrl.as::populateRoomRow()
    private populateRoomRow(classification: UserClassificationData, alternate: boolean): void
    {
        const row = this.getRoomRowWindow();

        if(row === null) return;

        const color = alternate
            ? UserClassificationCtrl.ROW_COLOR_ALTERNATE
            : UserClassificationCtrl.ROW_COLOR_DEFAULT;

        (row as unknown as IWindow).color = color;

        const userName = row.findChildByName('user_name_txt');

        if(userName !== null)
        {
            userName.caption = classification.username;
            userName.color = color;
        }

        const visitRoom = row.findChildByName('visit_room_txt') as ITextWindow | null;
        const visitRoomWindow = visitRoom as unknown as IWindow | null;

        if(visitRoomWindow !== null) visitRoomWindow.color = color;

        const classText = row.findChildByName('user_classification_txt') as ITextWindow | null;

        if(classText !== null) classText.text = classification.classType;

        const isModerator = this._main?.isModerator ?? false;

        if(!isModerator)
        {
            if(classText !== null) (classText as unknown as IWindow).visible = false;
            if(visitRoomWindow !== null) visitRoomWindow.visible = false;
        }

        this.addClassificationRowToList(row);

        if(this._main !== null && isModerator)
        {
            if(userName !== null) new OpenUserInfo(this._frame, this._main, userName, classification.userId);
            if(visitRoomWindow !== null) new VisitUserUtil(this._main, visitRoomWindow, classification.userId);
        }
    }

    // AS3: UserClassificationCtrl.as::addClassificationRowToList()
    private addClassificationRowToList(row: IWindowContainer): void
    {
        this._list?.addListItem(row as unknown as IWindow);

        this._rows.push(row);
    }

    // AS3: UserClassificationCtrl.as::getRoomRowWindow()
    private getRoomRowWindow(): IWindowContainer | null
    {
        const pooled = UserClassificationCtrl.CLASSIFICATION_ROW_POOL.pop() ?? null;

        if(pooled !== null) return pooled;

        return ((this._rowTemplate as unknown as IWindow | null)?.clone() ?? null) as unknown as IWindowContainer | null;
    }

    /** Both `procedure` handlers are cleared: they belong to the window being disposed. */
    // AS3: UserClassificationCtrl.as::storeClassificationRowWindow()
    private storeClassificationRowWindow(row: IWindowContainer): void
    {
        if(UserClassificationCtrl.CLASSIFICATION_ROW_POOL.length
            >= UserClassificationCtrl.CLASSIFICATION_ROW_POOL_MAX_SIZE)
        {
            (row as unknown as IWindow).dispose();

            return;
        }

        const userName = row.findChildByName('user_name_txt');

        if(userName !== null) userName.procedure = null;

        const visitRoom = row.findChildByName('visit_room_txt');

        if(visitRoom !== null) visitRoom.procedure = null;

        const template = this._rowTemplate as unknown as IWindow | null;
        const rowWindow = row as unknown as IWindow;

        if(template !== null)
        {
            rowWindow.width = template.width;
            rowWindow.height = template.height;
        }

        UserClassificationCtrl.CLASSIFICATION_ROW_POOL.push(row);
    }

    // AS3: UserClassificationCtrl.as::onClose()
    private onClose = (event: WindowEvent): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        this.dispose();
    };

    // AS3: UserClassificationCtrl.as::onWindow()
    private onWindow = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type !== 'WE_RESIZED' || window !== (this._frame as unknown as IWindow)) return;

        if(this._resizeTimer !== null) return;

        this._resizeTimer = setTimeout(() =>
        {
            this._resizeTimer = null;

            this.onResizeTimer();
        }, UserClassificationCtrl.RESIZE_DEBOUNCE_MS);
    };

    // AS3: UserClassificationCtrl.as::onResizeTimer()
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
                listWindow.width += UserClassificationCtrl.SCROLLBAR_WIDTH;
            }

            return;
        }

        if(needsScroller)
        {
            scroller.visible = true;
            listWindow.width -= UserClassificationCtrl.SCROLLBAR_WIDTH;
        }
    }

    // AS3: UserClassificationCtrl.as::getType()
    public getType(): number
    {
        return WindowTracker.TYPE_ROOMVISITS;
    }

    // AS3: UserClassificationCtrl.as::getId()
    public getId(): string
    {
        return `${this._classificationType}`;
    }

    // AS3: UserClassificationCtrl.as::getFrame()
    public getFrame(): IFrameWindow | null
    {
        return this._frame;
    }

    // AS3: UserClassificationCtrl.as::dispose()
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
            this.storeClassificationRowWindow(row);
        }

        if(this._rowTemplate !== null)
        {
            (this._rowTemplate as unknown as IWindow).dispose();
            this._rowTemplate = null;
        }

        this._rows = [];
    }
}
