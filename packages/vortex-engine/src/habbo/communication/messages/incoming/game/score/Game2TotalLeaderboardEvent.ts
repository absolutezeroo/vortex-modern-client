import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {Game2LeaderboardParser} from '../../../parser/game/score/Game2LeaderboardParser';

/**
 * A page of the all-time hotel leaderboard. Header 733.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2462/Game2TotalLeaderboardEvent.as
 */
export class Game2TotalLeaderboardEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, Game2LeaderboardParser);
    }
}
