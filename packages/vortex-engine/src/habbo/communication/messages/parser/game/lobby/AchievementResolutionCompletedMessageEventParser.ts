import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * Parser for the achievement resolution completed message.
 * Parses the stuff code and badge code when a resolution achievement is completed.
 *
 * @see source_as_win63/habbo/communication/messages/parser/game/lobby/AchievementResolutionCompletedMessageEventParser.as
 */
export class AchievementResolutionCompletedMessageEventParser implements IMessageParser
{
    private _stuffCode: string = '';

    // AS3: sources/win63_version/habbo/communication/messages/parser/game/lobby/AchievementResolutionCompletedMessageEventParser.as::get stuffCode()
    get stuffCode(): string
    {
        return this._stuffCode;
    }

    private _badgeCode: string = '';

    // AS3: sources/win63_version/habbo/communication/messages/parser/game/lobby/AchievementResolutionCompletedMessageEventParser.as::get badgeCode()
    get badgeCode(): string
    {
        return this._badgeCode;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/game/lobby/AchievementResolutionCompletedMessageEventParser.as::flush()
    flush(): boolean
    {
        this._stuffCode = '';
        this._badgeCode = '';
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/game/lobby/AchievementResolutionCompletedMessageEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._stuffCode = wrapper.readString();
        this._badgeCode = wrapper.readString();

        return true;
    }
}
