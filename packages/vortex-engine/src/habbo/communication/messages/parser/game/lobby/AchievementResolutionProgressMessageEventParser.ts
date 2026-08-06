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
    // AS3: sources/win63_version/habbo/communication/messages/parser/game/lobby/AchievementResolutionProgressMessageEventParser.as::_stuffId
    private _stuffId: number = -1;

    // AS3: sources/win63_version/habbo/communication/messages/parser/game/lobby/AchievementResolutionProgressMessageEventParser.as::get stuffId()
    get stuffId(): number
    {
        return this._stuffId;
    }

    private _achievementId: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/parser/game/lobby/AchievementResolutionProgressMessageEventParser.as::get achievementId()
    get achievementId(): number
    {
        return this._achievementId;
    }

    private _requiredLevelBadgeCode: string = '';

    // AS3: sources/win63_version/habbo/communication/messages/parser/game/lobby/AchievementResolutionProgressMessageEventParser.as::get requiredLevelBadgeCode()
    get requiredLevelBadgeCode(): string
    {
        return this._requiredLevelBadgeCode;
    }

    private _userProgress: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/parser/game/lobby/AchievementResolutionProgressMessageEventParser.as::get userProgress()
    get userProgress(): number
    {
        return this._userProgress;
    }

    private _totalProgress: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/parser/game/lobby/AchievementResolutionProgressMessageEventParser.as::get totalProgress()
    get totalProgress(): number
    {
        return this._totalProgress;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/game/lobby/AchievementResolutionProgressMessageEventParser.as::_endTime
    private _endTime: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/parser/game/lobby/AchievementResolutionProgressMessageEventParser.as::get endTime()
    get endTime(): number
    {
        return this._endTime;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/game/lobby/AchievementResolutionProgressMessageEventParser.as::flush()
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

    // AS3: sources/win63_version/habbo/communication/messages/parser/game/lobby/AchievementResolutionProgressMessageEventParser.as::parse()
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
