import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';
import type {Game2LeaderboardEntryData} from '@habbo/communication/messages/parser/game/score/Game2LeaderboardEntryData';
import {
    Game2GetFriendsLeaderboardComposer
} from '@habbo/communication/messages/outgoing/game/score/Game2GetFriendsLeaderboardComposer';
import type {SnowWarEngine} from '../SnowWarEngine';

/**
 * One leaderboard's worth of paging state: the rows the server last sent, where the visible window
 * sits inside them, and how to ask for the page before or after.
 *
 * The five subclasses differ in exactly one method — `getMessageComposer()`, which picks the
 * request — plus, for the two "total" boards, a pinned own-entry row that is popped off the end of
 * the list and re-appended after the visible slice.
 *
 * Two things about the paging are easy to get wrong and are AS3's, not this port's:
 *
 * - **`isWaitingForData` gates both scroll methods**, and is set the moment a request goes out.
 *   Without it a fast scroll sends a page request per click and the answers arrive out of order.
 * - **`updateCurrentIndex()` moves the window by a *window*, not a page** — the server sends
 *   `windowSize` rows around the requested rank, so after a scroll-up the index has to jump
 *   forward by that much to keep pointing at the same rows.
 *
 * AS3 declares one more protected field (`_SafeStr_11506`, a Boolean) that neither this class nor
 * any of its five subclasses ever reads or writes. It is not ported: there is nothing to name it
 * from.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/leaderboard/LeaderboardTable.as
 */
export class LeaderboardTable
{
    // AS3: LeaderboardTable.as::SCROLL_DOWN
    public static readonly SCROLL_DOWN: number = 0;

    // AS3: LeaderboardTable.as::SCROLL_UP
    public static readonly SCROLL_UP: number = 1;

    /** Derived name — `_SafeStr_4581`, the engine every snow-war class is constructed with. */
    // AS3: LeaderboardTable.as::_SafeStr_4581
    protected _engine: SnowWarEngine | null;

    /** Derived name — `_SafeStr_8762`, read once from the session as the viewer's own user id. */
    // AS3: LeaderboardTable.as::_SafeStr_8762
    protected _ownUserId: number = 0;

    // AS3: LeaderboardTable.as::_SafeStr_7524
    protected _favouriteGroupId: number = -1;

    // AS3: LeaderboardTable.as::_disposed
    protected _disposed: boolean = false;

    // AS3: LeaderboardTable.as::_entries
    protected _entries: Game2LeaderboardEntryData[] | null = null;

    /** Derived name — `_SafeStr_4643`, the first visible row's index. */
    // AS3: LeaderboardTable.as::_SafeStr_4643
    protected _currentIndex: number = -1;

    /** Derived name — `_SafeStr_6380`; the server's total row count, from `totalListSize`. */
    // AS3: LeaderboardTable.as::_SafeStr_6380
    protected _totalListSize: number = 0;

    /** Derived name — `_SafeStr_4776`; `games.highscores.viewSize`, 8 by default. */
    // AS3: LeaderboardTable.as::_SafeStr_4776
    protected _viewSize: number = 8;

    /** Derived name — `_SafeStr_5541`; `games.highscores.windowSize`, 50 by default. */
    // AS3: LeaderboardTable.as::_SafeStr_5541
    protected _windowSize: number = 50;

    /** Derived name — `_SafeStr_4994`; true from the moment a page is requested until it lands. */
    // AS3: LeaderboardTable.as::_SafeStr_4994
    protected _isWaitingForData: boolean = true;

    /** Derived name — `_SafeStr_8364`; the game id the last request was made for. */
    // AS3: LeaderboardTable.as::_SafeStr_8364
    protected _gameId: number = 0;

    // AS3: LeaderboardTable.as::LeaderboardTable()
    constructor(engine: SnowWarEngine)
    {
        this._engine = engine;
        this._ownUserId = engine.sessionDataManager?.userId ?? 0;
        this._viewSize = engine.config?.getInteger('games.highscores.viewSize', 8) ?? 8;
        this._windowSize = engine.config?.getInteger('games.highscores.windowSize', 50) ?? 50;
    }

    // AS3: LeaderboardTable.as::get viewSize()
    public get viewSize(): number
    {
        return this._viewSize;
    }

    // AS3: LeaderboardTable.as::get favouriteGroupId()
    public get favouriteGroupId(): number
    {
        return this._favouriteGroupId;
    }

    // AS3: LeaderboardTable.as::isInitialized()
    public isInitialized(): boolean
    {
        return this._entries !== null;
    }

    // AS3: LeaderboardTable.as::disposeTable()
    public disposeTable(): void
    {
        this._currentIndex = -1;
        this._entries = null;
        this._totalListSize = -1;
        this._isWaitingForData = true;
    }

    // AS3: LeaderboardTable.as::addEntries()
    public addEntries(entries: Game2LeaderboardEntryData[], totalListSize: number): void
    {
        this._totalListSize = totalListSize;

        if(!this._entries)
        {
            this._entries = entries;
            this.initializeList();
        }
        else
        {
            this._entries = entries;
            this.updateCurrentIndex();
        }

        this._isWaitingForData = false;
    }

    // AS3: LeaderboardTable.as::addGroupEntries()
    public addGroupEntries(entries: Game2LeaderboardEntryData[], totalListSize: number, favouriteGroupId: number): void
    {
        this._favouriteGroupId = favouriteGroupId;
        this._totalListSize = totalListSize;

        if(!this._entries)
        {
            this._entries = entries;
            this.initializeList();
        }
        else
        {
            this._entries = entries;
            this.updateCurrentIndex();
        }

        this._isWaitingForData = false;
    }

    /**
     * Centres the window on the viewer's own row — their user id, or their favourite group's id on
     * a group board, which is what the `gender === 'g'` test tells apart.
     */
    // AS3: LeaderboardTable.as::initializeList()
    protected initializeList(): void
    {
        const entries = this._entries ?? [];
        let found = 0;

        for(let i = 0; i < entries.length; i++)
        {
            const isGroup = entries[i].gender === 'g';

            if(!isGroup && entries[i].userId === this._ownUserId)
            {
                found = i;
                break;
            }

            if(isGroup && entries[i].userId === this._favouriteGroupId)
            {
                found = i;
                break;
            }
        }

        if(found >= this._viewSize)
        {
            // AS3 assigns a float division into an `int` field, which truncates.
            this._currentIndex = Math.trunc(found - this._viewSize / 2);
        }
        else
        {
            this._currentIndex = 0;
        }
    }

    // AS3: LeaderboardTable.as::updateCurrentIndex()
    private updateCurrentIndex(): void
    {
        if(this._currentIndex < 0)
        {
            this._currentIndex += this._windowSize;
        }
        else
        {
            this._currentIndex -= this._windowSize;
        }
    }

    /**
     * Moves the window up a page, or asks the server for the previous one and answers false — the
     * caller redraws only when it gets true.
     */
    // AS3: LeaderboardTable.as::scrollUp()
    public scrollUp(): boolean
    {
        if(this._isWaitingForData) return false;

        const entries = this._entries ?? [];

        this._currentIndex -= this._viewSize;

        if(this._currentIndex < 0)
        {
            if(entries.length > 0 && entries[0].rank > 1)
            {
                const rank = Math.max(1, entries[0].rank - this._windowSize);
                const composer = this.getMessageComposer(this._gameId, rank, LeaderboardTable.SCROLL_UP);

                this._engine?.communication?.connection?.send(composer);
                this._isWaitingForData = true;

                return false;
            }

            this._currentIndex = 0;
        }

        return true;
    }

    // AS3: LeaderboardTable.as::scrollDown()
    public scrollDown(): boolean
    {
        if(this._isWaitingForData) return false;

        const entries = this._entries ?? [];

        this._currentIndex += this._viewSize;

        if(this._currentIndex + this._viewSize >= entries.length)
        {
            if(entries.length > 0 && entries[entries.length - 1].rank < this._totalListSize)
            {
                const rank = entries[entries.length - 1].rank + 1;
                const composer = this.getMessageComposer(this._gameId, rank, LeaderboardTable.SCROLL_DOWN);

                this._engine?.communication?.connection?.send(composer);
                this._isWaitingForData = true;

                return false;
            }
        }

        return true;
    }

    /** The one method the five subclasses exist to override. */
    // AS3: LeaderboardTable.as::getMessageComposer()
    protected getMessageComposer(gameId: number, rank: number, scrollDirection: number): IMessageComposer<number[]>
    {
        return new Game2GetFriendsLeaderboardComposer(gameId, rank, scrollDirection, this._viewSize, this._windowSize);
    }

    /** Throws the page away and asks for the default view — rank -1 — of `gameId`. */
    // AS3: LeaderboardTable.as::revertToDefaultView()
    public revertToDefaultView(gameId: number): void
    {
        this.disposeTable();

        const composer = this.getMessageComposer(gameId, -1, LeaderboardTable.SCROLL_DOWN);

        this._engine?.communication?.connection?.send(composer);
        this._isWaitingForData = true;
        this._gameId = gameId;
    }

    // AS3: LeaderboardTable.as::getVisibleEntries()
    public getVisibleEntries(): Game2LeaderboardEntryData[]
    {
        const visible: Game2LeaderboardEntryData[] = [];

        if(!this._entries) return visible;

        const end = Math.min(this._entries.length, this._currentIndex + this._viewSize);

        for(let i = this._currentIndex; i < end; i++)
        {
            visible.push(this._entries[i]);
        }

        return visible;
    }

    // AS3: LeaderboardTable.as::canScrollUp()
    public canScrollUp(): boolean
    {
        if(this._isWaitingForData || !this._entries || this._entries.length === 0) return false;

        if(this._entries[0].rank === 1 && this._currentIndex <= 0) return false;

        return true;
    }

    // AS3: LeaderboardTable.as::canScrollDown()
    public canScrollDown(): boolean
    {
        if(this._isWaitingForData || !this._entries || this._entries.length === 0) return false;

        if(this._entries[this._entries.length - 1].rank >= this._totalListSize
            && this._currentIndex + this._viewSize >= this._entries.length)
        {
            return false;
        }

        return true;
    }

    // AS3: LeaderboardTable.as::dispose()
    public dispose(): void
    {
        if(this._disposed) return;

        this.disposeTable();
        this._engine = null;
        this._entries = null;
        this._disposed = true;
    }
}
