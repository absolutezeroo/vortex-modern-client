import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';
import type {Game2LeaderboardEntryData} from '@habbo/communication/messages/parser/game/score/Game2LeaderboardEntryData';
import {
    Game2GetTotalLeaderboardComposer
} from '@habbo/communication/messages/outgoing/game/score/Game2GetTotalLeaderboardComposer';
import type {SnowWarEngine} from '../SnowWarEngine';
import {LeaderboardTable} from './LeaderboardTable';

/**
 * The hotel-wide all-time board.
 *
 * It differs from the base in three linked ways, and all three are one feature: the server appends
 * the viewer's own row to the end of every page, so the table pops it off, keeps it aside, shows
 * one row fewer (`viewSize - 1`) and re-appends it under whatever slice is visible. That is also
 * why `initializeList()` does not centre on the viewer — their row is always on screen anyway.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/leaderboard/TotalLeaderboardTable.as
 */
export class TotalLeaderboardTable extends LeaderboardTable
{
    // AS3: TotalLeaderboardTable.as::_ownEntry
    private _ownEntry: Game2LeaderboardEntryData | null = null;

    // AS3: TotalLeaderboardTable.as::TotalLeaderboardTable()
    constructor(engine: SnowWarEngine)
    {
        super(engine);

        this._viewSize -= 1;
    }

    // AS3: TotalLeaderboardTable.as::addEntries()
    public override addEntries(entries: Game2LeaderboardEntryData[], totalListSize: number): void
    {
        this._ownEntry = entries.pop() ?? null;

        super.addEntries(entries, totalListSize);
    }

    // AS3: TotalLeaderboardTable.as::getVisibleEntries()
    public override getVisibleEntries(): Game2LeaderboardEntryData[]
    {
        const visible = super.getVisibleEntries();

        if(this._ownEntry) visible.push(this._ownEntry);

        return visible;
    }

    // AS3: TotalLeaderboardTable.as::initializeList()
    protected override initializeList(): void
    {
        this._currentIndex = 0;
    }

    // AS3: TotalLeaderboardTable.as::getMessageComposer()
    protected override getMessageComposer(gameId: number, rank: number, scrollDirection: number): IMessageComposer<number[]>
    {
        return new Game2GetTotalLeaderboardComposer(gameId, rank, scrollDirection, this._viewSize, this._windowSize);
    }

    // AS3: TotalLeaderboardTable.as::dispose()
    public override dispose(): void
    {
        super.dispose();

        this._ownEntry = null;
    }
}
