import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {ResolutionAchievementData} from '../../quest/ResolutionAchievementData';

/**
 * Parser for the achievement resolutions list message.
 * Parses a list of resolution achievements along with a stuff ID and end time.
 *
 * @see source_as_win63/habbo/communication/messages/parser/game/lobby/AchievementResolutionsMessageEventParser.as
 */
export class AchievementResolutionsMessageEventParser implements IMessageParser
{
    private _stuffId: number = -1;

    get stuffId(): number
    {
        return this._stuffId;
    }

    private _achievements: ResolutionAchievementData[] = [];

    get achievements(): ResolutionAchievementData[]
    {
        return this._achievements;
    }

    private _endTime: number = -1;

    get endTime(): number
    {
        return this._endTime;
    }

    flush(): boolean
    {
        this._stuffId = -1;
        this._achievements = [];
        this._endTime = -1;
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._stuffId = wrapper.readInt();

        const count: number = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            this._achievements.push(new ResolutionAchievementData(wrapper));
        }

        this._endTime = wrapper.readInt();

        return true;
    }
}
