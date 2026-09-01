import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * One page of a weekly friends leaderboard. Same shape as `Game2GetWeeklyLeaderboardComposer`,
 * week offset second.
 *
 * Header 3867, from WIN63's registry (`_composers[3867]`); the emulator agrees
 * (`Game2GetWeeklyFriendsLeaderboardEvent`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2403/Game2GetWeeklyFriendsLeaderboardComposer.as
 * @see sources/win63_version/habbo/communication/messages/outgoing/game/score/Game2GetWeeklyFriendsLeaderboardComposer.as
 */
export class Game2GetWeeklyFriendsLeaderboardComposer extends MessageComposer<[number, number, number, number, number, number]>
{
    // AS3: .../_SafePkg_2403/Game2GetWeeklyFriendsLeaderboardComposer.as::_SafeStr_4556
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

    // AS3: .../_SafePkg_2403/Game2GetWeeklyFriendsLeaderboardComposer.as::getMessageArray()
    getMessageArray(): [number, number, number, number, number, number]
    {
        return this._data;
    }
}
