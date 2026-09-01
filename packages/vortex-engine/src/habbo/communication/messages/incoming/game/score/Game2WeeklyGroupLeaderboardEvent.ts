import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    Game2WeeklyGroupLeaderboardParser
} from '../../../parser/game/score/Game2WeeklyGroupLeaderboardParser';

/**
 * A page of a weekly group leaderboard. Header 2876.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2462/Game2WeeklyGroupLeaderboardEvent.as
 */
export class Game2WeeklyGroupLeaderboardEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, Game2WeeklyGroupLeaderboardParser);
    }
}
