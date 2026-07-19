import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for guide reporting status messages.
 * Contains the current status code for the guide reporting system.
 *
 * @see source_as_win63/habbo/communication/messages/parser/help/GuideReportingStatusMessageEventParser.as
 */
export class GuideReportingStatusMessageParser implements IMessageParser
{
    public static readonly STATUS_OK: number = 0;
    public static readonly STATUS_PENDING: number = 1;
    public static readonly STATUS_BLOCKED: number = 2;
    public static readonly STATUS_TOO_QUICK: number = 3;

    private _statusCode: number = 0;

    get statusCode(): number
    {
        return this._statusCode;
    }

    get localizationCode(): string
    {
        switch(this._statusCode - 2)
        {
            case 0:
                return 'blocked';
            case 1:
                return 'tooquick';
            default:
                return '';
        }
    }

    flush(): boolean
    {
        this._statusCode = 0;
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._statusCode = wrapper.readInt();

        return true;
    }
}
