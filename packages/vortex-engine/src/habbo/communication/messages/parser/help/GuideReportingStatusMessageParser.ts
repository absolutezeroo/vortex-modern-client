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

    // AS3: sources/win63_version/habbo/communication/messages/parser/help/GuideReportingStatusMessageEventParser.as::get statusCode()
    get statusCode(): number
    {
        return this._statusCode;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/help/GuideReportingStatusMessageEventParser.as::get localizationCode()
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

    // AS3: sources/win63_version/habbo/communication/messages/parser/help/GuideReportingStatusMessageEventParser.as::flush()
    flush(): boolean
    {
        this._statusCode = 0;
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/help/GuideReportingStatusMessageEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._statusCode = wrapper.readInt();

        return true;
    }
}
