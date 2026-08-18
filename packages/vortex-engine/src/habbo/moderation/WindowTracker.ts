/**
 * WindowTracker — one live window per (type, id) pair across the whole mod tool.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/moderation/WindowTracker.as
 *
 * Every mod-tool window is opened through `show()` rather than by being added to the desktop
 * directly, and the tracker decides what happens when one is already open for the same subject:
 *
 * - **`toggle`** — the same button pressed twice closes the window instead of reopening it. Both
 *   the incoming *and* the outgoing window are disposed, because the caller has already built the
 *   new one by the time we get here.
 * - **Otherwise the new window inherits the old one's rectangle** — position *and* size — so a
 *   refreshed window does not jump or resize under the moderator's cursor.
 *
 * A window with no predecessor is placed relative to the frame that opened it (below it when
 * `below` is set, to its right otherwise, 5 px apart), or centred on the desktop when there is no
 * caller frame. Either way the result is clamped into the desktop, so a tool opened from a frame
 * near the edge cannot land off-screen.
 */
import type {IWindow} from '@core/window/IWindow';
import type {IFrameWindow} from '@core/window/components/IFrameWindow';
import type {ITrackedWindow} from './ITrackedWindow';

export class WindowTracker
{
    // AS3: WindowTracker.as::TYPE_USERINFO
    public static readonly TYPE_USERINFO: number = 1;

    /** Derived name — `_SafeStr_11195`; `SendMsgsCtrl.getType()` returns 2. */
    // AS3: WindowTracker.as::_SafeStr_11195
    public static readonly TYPE_SENDMSGS: number = 2;

    /** Derived name — `_SafeStr_11556`; `IssueHandler` opens a `ChatlogCtrl` with 3 for an issue. */
    // AS3: WindowTracker.as::_SafeStr_11556
    public static readonly TYPE_CHATLOG_ISSUE: number = 3;

    /** Derived name — `_SafeStr_11454`; `RoomToolCtrl`/`StartPanelCtrl` open a `ChatlogCtrl` with 4 for a room. */
    // AS3: WindowTracker.as::_SafeStr_11454
    public static readonly TYPE_CHATLOG_ROOM: number = 4;

    /** Derived name — `_SafeStr_11378`; `UserInfoCtrl` opens a `ChatlogCtrl` with 5 for a user. */
    // AS3: WindowTracker.as::_SafeStr_11378
    public static readonly TYPE_CHATLOG_USER: number = 5;

    /**
     * Derived name — `_SafeStr_11603`.
     *
     * **`RoomVisitsCtrl.getType()` and `UserClassificationCtrl.getType()` both return 6**, so the
     * two share a tracker slot and opening one closes the other. That is what the source says, in
     * both classes; it is not a transcription slip and is left as-is.
     */
    // AS3: WindowTracker.as::_SafeStr_11603
    public static readonly TYPE_ROOMVISITS: number = 6;

    /** Derived name — `_SafeStr_11035`; `ModActionCtrl.getType()` returns 7. */
    // AS3: WindowTracker.as::_SafeStr_11035
    public static readonly TYPE_MODACTION: number = 7;

    // AS3: WindowTracker.as::TYPE_ISSUEHANDLER
    public static readonly TYPE_ISSUEHANDLER: number = 8;

    // AS3: WindowTracker.as::TYPE_ROOMINFO
    public static readonly TYPE_ROOMINFO: number = 9;

    /** AS3's literal `5` — the gap between the caller frame and the window it opens. */
    // AS3: WindowTracker.as::show()
    private static readonly WINDOW_GAP: number = 5;

    /** Derived name — `_SafeStr_8679`: type → (id → window). */
    // AS3: WindowTracker.as::_SafeStr_8679
    private _windowsByType: Map<number, Map<string, ITrackedWindow | null>> = new Map();

    /**
     * @param window   the freshly built window; the caller has already constructed it
     * @param caller   the frame the window was opened from, or null to centre it
     * @param below    place it under `caller` rather than to its right
     * @param openOnly refuse to open a window that has no predecessor
     * @param toggle   dispose both windows when one was already open for this (type, id)
     * @param usePos   ignore the inherited/relative placement and use the four explicit values
     */
    // AS3: WindowTracker.as::show()
    public show(
        window: ITrackedWindow,
        caller: IFrameWindow | null,
        below: boolean,
        openOnly: boolean,
        toggle: boolean,
        usePos: boolean = false,
        x: number = 0,
        y: number = 0,
        width: number = 0,
        height: number = 0
    ): void
    {
        const previous = this.removeWindow(window.getType(), window.getId());

        if(previous !== null && !previous.disposed)
        {
            // Second press on the same button: throw away the one we were just handed too.
            if(toggle)
            {
                window.dispose();
                previous.dispose();

                return;
            }

            window.show();

            const previousFrame = previous.getFrame() as unknown as IWindow | null;
            const frame = window.getFrame() as unknown as IWindow | null;

            if(frame !== null)
            {
                frame.x = usePos ? x : (previousFrame?.x ?? 0);
                frame.y = usePos ? y : (previousFrame?.y ?? 0);
                frame.width = usePos ? width : (previousFrame?.width ?? 0);
                frame.height = usePos ? height : (previousFrame?.height ?? 0);
            }

            this.getWindowsForType(window.getType()).set(window.getId(), window);

            previous.dispose();

            return;
        }

        if(openOnly) return;

        window.show();

        const frame = window.getFrame() as unknown as IWindow | null;

        if(frame === null)
        {
            this.getWindowsForType(window.getType()).set(window.getId(), window);

            return;
        }

        const callerWindow = caller as unknown as IWindow | null;

        if(callerWindow !== null)
        {
            if(below)
            {
                frame.x = usePos ? x : Math.trunc(callerWindow.x);
                frame.y = usePos ? y : callerWindow.y + callerWindow.height + WindowTracker.WINDOW_GAP;
            }
            else
            {
                frame.x = usePos ? x : callerWindow.x + callerWindow.width + WindowTracker.WINDOW_GAP;
                frame.y = usePos ? y : Math.trunc(callerWindow.y);
            }
        }
        else if(usePos)
        {
            frame.x = x;
            frame.y = y;
        }
        else
        {
            const desktop = frame.desktop;

            frame.x = (desktop?.width ?? 0) / 2 - frame.width / 2;
            frame.y = (desktop?.height ?? 0) / 2 - frame.height / 2;
        }

        const desktop = frame.desktop;

        frame.x = Math.max(0, Math.min(frame.x, (desktop?.width ?? 0) - frame.width));
        frame.y = Math.max(0, Math.min(frame.y, (desktop?.height ?? 0) - frame.height));

        this.getWindowsForType(window.getType()).set(window.getId(), window);
    }

    /** Clears the slot and hands back whatever was in it — the caller decides what to do with it. */
    // AS3: WindowTracker.as::removeWindow()
    private removeWindow(type: number, id: string): ITrackedWindow | null
    {
        const windows = this.getWindowsForType(type);
        const previous = windows.get(id) ?? null;

        windows.set(id, null);

        return previous;
    }

    // AS3: WindowTracker.as::getWindowsForType()
    private getWindowsForType(type: number): Map<string, ITrackedWindow | null>
    {
        let windows = this._windowsByType.get(type) ?? null;

        if(windows === null)
        {
            windows = new Map();
            this._windowsByType.set(type, windows);
        }

        return windows;
    }
}
