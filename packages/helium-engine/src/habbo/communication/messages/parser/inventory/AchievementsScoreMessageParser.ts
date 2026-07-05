import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for achievements score message
 *
 * @see source_as_win63/habbo/communication/messages/parser/inventory/achievements/AchievementsScoreEventParser.as
 */
export class AchievementsScoreMessageParser implements IMessageParser
{
    private _score: number = 0;

    get score(): number
    {
        return this._score;
    }

    flush(): boolean
    {
        this._score = 0;
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._score = wrapper.readInt();
        return true;
    }
}
