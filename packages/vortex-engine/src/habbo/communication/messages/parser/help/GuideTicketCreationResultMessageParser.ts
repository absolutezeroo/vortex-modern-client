import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for guide ticket creation result messages.
 * Contains the result code which maps to a localization string.
 *
 * @see source_as_win63/habbo/communication/messages/parser/help/GuideTicketCreationResultMessageEventParser.as
 */
export class GuideTicketCreationResultMessageParser implements IMessageParser
{
    private static readonly RESULT_OK: number = 0;
    private static readonly RESULT_BLOCKED: number = 1;
    private static readonly RESULT_NO_CHAT: number = 2;
    private static readonly RESULT_ALREADY_REPORTED: number = 3;

    private _resultCode: number = -1;

    get resultCode(): number
    {
        return this._resultCode;
    }

    get localizationCode(): string
    {
        switch(this._resultCode)
        {
            case GuideTicketCreationResultMessageParser.RESULT_OK:
                return 'sent';
            case GuideTicketCreationResultMessageParser.RESULT_BLOCKED:
                return 'blocked';
            case GuideTicketCreationResultMessageParser.RESULT_NO_CHAT:
                return 'nochat';
            case GuideTicketCreationResultMessageParser.RESULT_ALREADY_REPORTED:
                return 'alreadyreported';
            default:
                return 'invalid';
        }
    }

    flush(): boolean
    {
        this._resultCode = -1;
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._resultCode = wrapper.readInt();

        return true;
    }
}
