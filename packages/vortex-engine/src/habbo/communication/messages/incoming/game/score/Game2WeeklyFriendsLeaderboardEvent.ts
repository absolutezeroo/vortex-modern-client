import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {Game2WeeklyLeaderboardParser} from '../../../parser/game/score/Game2WeeklyLeaderboardParser';

/**
 * A page of a weekly friends leaderboard. Header 2802. Shares the plain weekly parser — the friends
 * board differs only in which rows the server picks.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2462/Game2WeeklyFriendsLeaderboardEvent.as
 */
export class Game2WeeklyFriendsLeaderboardEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, Game2WeeklyLeaderboardParser);
    }
}
