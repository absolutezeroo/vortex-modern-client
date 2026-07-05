import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * Parser for the achievement resolution progress message.
 * Parses progress data for a specific resolution achievement including
 * stuff ID, achievement ID, badge code, user/total progress, and end time.
 *
 * @see source_as_win63/habbo/communication/messages/parser/game/lobby/AchievementResolutionProgressMessageEventParser.as
 */
export class AchievementResolutionProgressMessageEventParser implements IMessageParser
{
    private _stuffId: number = -1;

    get stuffId(): number
    {
        return this._stuffId;
    }

    private _achievementId: number = 0;

    get achievementId(): number
    {
        return this._achievementId;
    }

    private _requiredLevelBadgeCode: string = '';

    get requiredLevelBadgeCode(): string
    {
        return this._requiredLevelBadgeCode;
    }

    private _userProgress: number = 0;

    get userProgress(): number
    {
        return this._userProgress;
    }

    private _totalProgress: number = 0;

    get totalProgress(): number
    {
        return this._totalProgress;
    }

    private _endTime: number = 0;

    get endTime(): number
    {
        return this._endTime;
    }

    flush(): boolean
    {
        this._stuffId = -1;
        this._achievementId = 0;
        this._requiredLevelBadgeCode = '';
        this._userProgress = 0;
        this._totalProgress = 0;
        this._endTime = 0;
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._stuffId = wrapper.readInt();
        this._achievementId = wrapper.readInt();
        this._requiredLevelBadgeCode = wrapper.readString();
        this._userProgress = wrapper.readInt();
        this._totalProgress = wrapper.readInt();
        this._endTime = wrapper.readInt();

        return true;
    }
}
