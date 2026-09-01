import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * One page of the all-time friends leaderboard.
 *
 * The five arguments are the paging contract every leaderboard composer shares: which game, the
 * rank to page from (`-1` asks for the default view, centred on the viewer), which way the list is
 * being scrolled (`LeaderboardTable.SCROLL_DOWN` = 0, `SCROLL_UP` = 1), how many rows the window
 * shows, and how many the server should send around that rank — the last two come from the
 * `games.highscores.viewSize` / `windowSize` config keys.
 *
 * Header 3467, from WIN63's registry (`_composers[3467]`); the emulator agrees
 * (`Game2GetFriendsLeaderboardEvent`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2403/Game2GetFriendsLeaderboardComposer.as
 * @see sources/win63_version/habbo/communication/messages/outgoing/game/score/Game2GetFriendsLeaderboardComposer.as
 */
export class Game2GetFriendsLeaderboardComposer extends MessageComposer<[number, number, number, number, number]>
{
    // AS3: .../_SafePkg_2403/Game2GetFriendsLeaderboardComposer.as::_SafeStr_4556
    private readonly _data: [number, number, number, number, number];

    constructor(gameId: number, rank: number, scrollDirection: number, viewSize: number, windowSize: number)
    {
        super();

        this._data = [gameId, rank, scrollDirection, viewSize, windowSize];
    }

    // AS3: .../_SafePkg_2403/Game2GetFriendsLeaderboardComposer.as::getMessageArray()
    getMessageArray(): [number, number, number, number, number]
    {
        return this._data;
    }
}
