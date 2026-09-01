import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';
import type {Game2LeaderboardEntryData} from '@habbo/communication/messages/parser/game/score/Game2LeaderboardEntryData';
import {
    Game2GetTotalGroupLeaderboardComposer
} from '@habbo/communication/messages/outgoing/game/score/Game2GetTotalGroupLeaderboardComposer';
import type {SnowWarEngine} from '../SnowWarEngine';
import {LeaderboardTable} from './LeaderboardTable';

/**
 * The all-time group board. Same pinned-own-row shape as `TotalLeaderboardTable`, with one
 * difference that matters: the trailing row is only popped **when the viewer actually has a
 * favourite group** (`favouriteGroupId > 0`). A groupless player's page has no own row to pin, and
 * popping one anyway would eat a real group's entry.
 *
 * It does not extend `TotalLeaderboardTable` — AS3 derives it straight from `LeaderboardTable`,
 * which is why the own-entry handling is repeated rather than inherited.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/leaderboard/TotalGroupLeaderboardTable.as
 */
export class TotalGroupLeaderboardTable extends LeaderboardTable
{
    // AS3: TotalGroupLeaderboardTable.as::_ownEntry
    private _ownEntry: Game2LeaderboardEntryData | null = null;

    // AS3: TotalGroupLeaderboardTable.as::TotalGroupLeaderboardTable()
    constructor(engine: SnowWarEngine)
    {
        super(engine);

        this._viewSize -= 1;
    }

    // AS3: TotalGroupLeaderboardTable.as::addGroupEntries()
    public override addGroupEntries(
        entries: Game2LeaderboardEntryData[],
        totalListSize: number,
        favouriteGroupId: number
    ): void
    {
        if(favouriteGroupId > 0)
        {
            this._ownEntry = entries.pop() ?? null;
        }

        super.addGroupEntries(entries, totalListSize, favouriteGroupId);
    }

    // AS3: TotalGroupLeaderboardTable.as::getVisibleEntries()
    public override getVisibleEntries(): Game2LeaderboardEntryData[]
    {
        const visible = super.getVisibleEntries();

        if(this._ownEntry) visible.push(this._ownEntry);

        return visible;
    }

    // AS3: TotalGroupLeaderboardTable.as::getMessageComposer()
    protected override getMessageComposer(gameId: number, rank: number, scrollDirection: number): IMessageComposer<number[]>
    {
        return new Game2GetTotalGroupLeaderboardComposer(gameId, rank, scrollDirection, this._viewSize, this._windowSize);
    }

    // AS3: TotalGroupLeaderboardTable.as::dispose()
    public override dispose(): void
    {
        super.dispose();

        this._ownEntry = null;
    }
}
