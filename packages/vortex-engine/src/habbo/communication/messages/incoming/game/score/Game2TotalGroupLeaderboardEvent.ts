import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {Game2GroupLeaderboardParser} from '../../../parser/game/score/Game2GroupLeaderboardParser';

/**
 * A page of the all-time group leaderboard. Header 2417.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2462/Game2TotalGroupLeaderboardEvent.as
 */
export class Game2TotalGroupLeaderboardEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, Game2GroupLeaderboardParser);
    }
}
