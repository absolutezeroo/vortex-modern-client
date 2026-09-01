import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {Game2WeeklyLeaderboardParser} from '../../../parser/game/score/Game2WeeklyLeaderboardParser';

/**
 * A page of a weekly hotel leaderboard. Header 273.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2462/Game2WeeklyLeaderboardEvent.as
 */
export class Game2WeeklyLeaderboardEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, Game2WeeklyLeaderboardParser);
    }
}
