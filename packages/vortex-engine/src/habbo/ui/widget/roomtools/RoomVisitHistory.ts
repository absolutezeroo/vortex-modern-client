/**
 * RoomVisitHistory
 *
 * The back/forward per-session room navigation history behind RoomToolsWidget.roomHistory,
 * consumed by RoomToolsToolbarCtrl to drive the toolbar's back/forward buttons and the
 * visited-rooms dropdown (RoomToolsHistory.populate()).
 *
 * Supersedes an older AS3 shape this port previously matched instead: `sources/win63_version`'s
 * RoomToolsWidget.as keeps the history as a flat `_visitedRooms` vector + `_currentRoomIndex` int
 * directly on the widget, with matching `get visitedRooms()`/`get currentRoomIndex()` accessors —
 * exactly what this port had. The primary tree replaced that with this singleton class and
 * RoomToolsWidget.get roomHistory(); win63_version's shape is retired here in favour of it.
 *
 * A process-wide singleton in AS3 (`shared`), which this port keeps as-is rather than threading
 * through DI: nothing outside RoomToolsWidget/RoomToolsToolbarCtrl reaches it.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/roomtools/RoomVisitHistory.as
 */
import {RoomVisitHistoryEntry} from './RoomVisitHistoryEntry';

export class RoomVisitHistory
{
    // AS3: RoomVisitHistory.as::MAX_HISTORY_LENGTH
    private static readonly MAX_HISTORY_LENGTH = 20;

    private static _shared: RoomVisitHistory | null = null;

    // AS3: RoomVisitHistory.as::get shared()
    public static get shared(): RoomVisitHistory
    {
        if(RoomVisitHistory._shared === null) RoomVisitHistory._shared = new RoomVisitHistory();

        return RoomVisitHistory._shared;
    }

    // AS3: RoomVisitHistory.as::_history
    private _history: RoomVisitHistoryEntry[] = [];
    // AS3: RoomVisitHistory.as::_SafeStr_4643 (obfuscated; the current position in `_history`)
    private _currentIndex: number = -1;

    // AS3: RoomVisitHistory.as::get currentIndex()
    public get currentIndex(): number
    {
        return this._currentIndex;
    }

    // AS3: RoomVisitHistory.as::get length()
    public get length(): number
    {
        return this._history.length;
    }

    // AS3: RoomVisitHistory.as::get currentRoom()
    public get currentRoom(): RoomVisitHistoryEntry | null
    {
        if(this._currentIndex < 0 || this._currentIndex >= this._history.length) return null;

        return this._history[this._currentIndex];
    }

    // AS3: RoomVisitHistory.as::canGoBack()
    public canGoBack(): boolean
    {
        return this._currentIndex > 0 && this._history.length > 0;
    }

    // AS3: RoomVisitHistory.as::canGoForward()
    public canGoForward(): boolean
    {
        return this._currentIndex >= 0 && this._currentIndex < this._history.length - 1;
    }

    // AS3: RoomVisitHistory.as::goBack()
    public goBack(): RoomVisitHistoryEntry | null
    {
        if(!this.canGoBack()) return null;

        this._currentIndex -= 1;

        return this._history[this._currentIndex];
    }

    // AS3: RoomVisitHistory.as::goForward()
    public goForward(): RoomVisitHistoryEntry | null
    {
        if(!this.canGoForward()) return null;

        this._currentIndex += 1;

        return this._history[this._currentIndex];
    }

    // AS3: RoomVisitHistory.as::updateRoomName()
    public updateRoomName(flatId: number, roomName: string): void
    {
        for(const entry of this._history)
        {
            if(entry.flatId === flatId) entry.roomName = roomName;
        }
    }

    /**
     * AS3's own body is corrupted at its last branch: the decompiler renders a captured
     * `_history[_history.length - 1]` reference as the literal `null` on its second and third
     * uses (`null.flatId`, `null.roomName = ...`) — calling a property on the `null` literal,
     * which cannot be what shipped. The branch immediately above it captures the same kind of
     * lookup (`currentRoom`) into a local before testing it, so the intended shape is not in
     * doubt; reconstructed here as `lastEntry`. No other AS3 tree carries this class to
     * cross-check against — it postdates win63_version and PRODUCTION both.
     */
    // AS3: RoomVisitHistory.as::onRoomEntered()
    public onRoomEntered(flatId: number, roomName: string): void
    {
        this.updateRoomName(flatId, roomName);

        if(this._history.length === 0)
        {
            this.appendEntry(flatId, roomName);

            return;
        }

        this.normalizeCurrentIndex();

        const current = this.currentRoom;

        if(current !== null && current.flatId === flatId)
        {
            current.roomName = roomName;

            return;
        }

        if(this._currentIndex < this._history.length - 1)
        {
            this.reverseSuffix(this._currentIndex, this._history.length - 1);
        }

        const lastEntry = this._history.length > 0 ? this._history[this._history.length - 1] : null;

        if(lastEntry !== null && lastEntry.flatId === flatId)
        {
            lastEntry.roomName = roomName;
            this._currentIndex = this._history.length - 1;

            return;
        }

        this.appendEntry(flatId, roomName);
    }

    // AS3: RoomVisitHistory.as::getRawHistory()
    public getRawHistory(): RoomVisitHistoryEntry[]
    {
        return this.copyEntries(this._history);
    }

    // AS3: RoomVisitHistory.as::getHistoryView()
    public getHistoryView(): RoomVisitHistoryEntry[]
    {
        const view: RoomVisitHistoryEntry[] = [];
        const seen = new Set<number>();

        for(let i = this._history.length - 1; i >= 0; i--)
        {
            const entry = this._history[i];

            if(!seen.has(entry.flatId))
            {
                seen.add(entry.flatId);
                view.unshift(entry.copy());
            }
        }

        return view;
    }

    // AS3: RoomVisitHistory.as::appendEntry()
    private appendEntry(flatId: number, roomName: string): void
    {
        this._history.push(new RoomVisitHistoryEntry(flatId, roomName));
        this._currentIndex = this._history.length - 1;
        this.trimToMaxLength();
    }

    // AS3: RoomVisitHistory.as::trimToMaxLength()
    private trimToMaxLength(): void
    {
        while(this._history.length > RoomVisitHistory.MAX_HISTORY_LENGTH)
        {
            this._history.shift();
            this._currentIndex -= 1;
        }

        this.normalizeCurrentIndex();
    }

    // AS3: RoomVisitHistory.as::normalizeCurrentIndex()
    private normalizeCurrentIndex(): void
    {
        if(this._history.length === 0)
        {
            this._currentIndex = -1;
        }
        else if(this._currentIndex < 0)
        {
            this._currentIndex = 0;
        }
        else if(this._currentIndex >= this._history.length)
        {
            this._currentIndex = this._history.length - 1;
        }
    }

    // AS3: RoomVisitHistory.as::reverseSuffix()
    private reverseSuffix(from: number, to: number): void
    {
        if(this._history.length === 0) return;

        let start = Math.max(0, from);
        let end = Math.min(to, this._history.length - 1);

        while(start < end)
        {
            const temp = this._history[start];

            this._history[start] = this._history[end];
            this._history[end] = temp;
            start += 1;
            end -= 1;
        }
    }

    // AS3: RoomVisitHistory.as::copyEntries()
    private copyEntries(entries: RoomVisitHistoryEntry[]): RoomVisitHistoryEntry[]
    {
        return entries.map((entry) => entry.copy());
    }
}
