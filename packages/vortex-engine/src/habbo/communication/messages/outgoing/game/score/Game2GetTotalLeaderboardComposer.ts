import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * One page of the all-time hotel-wide leaderboard. Same paging contract as
 * `Game2GetFriendsLeaderboardComposer`.
 *
 * Header 3383, from WIN63's registry (`_composers[3383]`); the emulator agrees
 * (`Game2GetTotalLeaderboardEvent`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2403/Game2GetTotalLeaderboardComposer.as
 * @see sources/win63_version/habbo/communication/messages/outgoing/game/score/Game2GetTotalLeaderboardComposer.as
 */
export class Game2GetTotalLeaderboardComposer extends MessageComposer<[number, number, number, number, number]>
{
    // AS3: .../_SafePkg_2403/Game2GetTotalLeaderboardComposer.as::_SafeStr_4556
    private readonly _data: [number, number, number, number, number];

    constructor(gameId: number, rank: number, scrollDirection: number, viewSize: number, windowSize: number)
    {
        super();

        this._data = [gameId, rank, scrollDirection, viewSize, windowSize];
    }

    // AS3: .../_SafePkg_2403/Game2GetTotalLeaderboardComposer.as::getMessageArray()
    getMessageArray(): [number, number, number, number, number]
    {
        return this._data;
    }
}
