import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * One page of a weekly hotel-wide leaderboard.
 *
 * The weekly boards carry one argument the all-time ones do not, and it goes *second*: the week
 * offset, `0` being the current week and `maxOffset` the oldest the server keeps. The rest is the
 * paging contract described on `Game2GetFriendsLeaderboardComposer`.
 *
 * Header 1741, from WIN63's registry (`_composers[1741]`); the emulator agrees
 * (`Game2GetWeeklyLeaderboardEvent`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2403/Game2GetWeeklyLeaderboardComposer.as
 * @see sources/win63_version/habbo/communication/messages/outgoing/game/score/Game2GetWeeklyLeaderboardComposer.as
 */
export class Game2GetWeeklyLeaderboardComposer extends MessageComposer<[number, number, number, number, number, number]>
{
    // AS3: .../_SafePkg_2403/Game2GetWeeklyLeaderboardComposer.as::_SafeStr_4556
    private readonly _data: [number, number, number, number, number, number];

    constructor(
        gameId: number,
        weekOffset: number,
        rank: number,
        scrollDirection: number,
        viewSize: number,
        windowSize: number
    )
    {
        super();

        this._data = [gameId, weekOffset, rank, scrollDirection, viewSize, windowSize];
    }

    // AS3: .../_SafePkg_2403/Game2GetWeeklyLeaderboardComposer.as::getMessageArray()
    getMessageArray(): [number, number, number, number, number, number]
    {
        return this._data;
    }
}
