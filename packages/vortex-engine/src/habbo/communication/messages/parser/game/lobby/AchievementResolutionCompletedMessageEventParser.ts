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

    get stuffCode(): string
    {
        return this._stuffCode;
    }

    private _badgeCode: string = '';

    get badgeCode(): string
    {
        return this._badgeCode;
    }

    flush(): boolean
    {
        this._stuffCode = '';
        this._badgeCode = '';
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._stuffCode = wrapper.readString();
        this._badgeCode = wrapper.readString();

        return true;
    }
}
