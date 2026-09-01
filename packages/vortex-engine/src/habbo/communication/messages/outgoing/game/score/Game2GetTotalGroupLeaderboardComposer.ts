import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * One page of the all-time group leaderboard. Same paging contract as
 * `Game2GetFriendsLeaderboardComposer`; the rows come back as groups rather than users, which is
 * why the reply carries the viewer's favourite group id alongside them.
 *
 * Header 1479, from WIN63's registry (`_composers[1479]`); the emulator agrees
 * (`Game2GetTotalGroupLeaderboardEvent`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2403/Game2GetTotalGroupLeaderboardComposer.as
 * @see sources/win63_version/habbo/communication/messages/outgoing/game/score/Game2GetTotalGroupLeaderboardComposer.as
 */
export class Game2GetTotalGroupLeaderboardComposer extends MessageComposer<[number, number, number, number, number]>
{
    // AS3: .../_SafePkg_2403/Game2GetTotalGroupLeaderboardComposer.as::_SafeStr_4556
    private readonly _data: [number, number, number, number, number];

    constructor(gameId: number, rank: number, scrollDirection: number, viewSize: number, windowSize: number)
    {
        super();

        this._data = [gameId, rank, scrollDirection, viewSize, windowSize];
    }

    // AS3: .../_SafePkg_2403/Game2GetTotalGroupLeaderboardComposer.as::getMessageArray()
    getMessageArray(): [number, number, number, number, number]
    {
        return this._data;
    }
}
