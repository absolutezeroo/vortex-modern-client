import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for guide ticket resolution messages.
 * Contains the resolution code which maps to a localization string.
 *
 * @see source_as_win63/habbo/communication/messages/parser/help/GuideTicketResolutionMessageEventParser.as
 */
export class GuideTicketResolutionMessageParser implements IMessageParser
{
    private static readonly RESOLUTION_VALID_CLOSED: number = 0;
    private static readonly RESOLUTION_VALID_RESOLVED: number = 1;
    private static readonly RESOLUTION_INVALID: number = 2;

    private _resultCode: number = -1;

    get resultCode(): number
    {
        return this._resultCode;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/help/GuideTicketResolutionMessageEventParser.as::get localizationCode()
    get localizationCode(): string
    {
        if(this._resultCode === GuideTicketResolutionMessageParser.RESOLUTION_VALID_CLOSED ||
			this._resultCode === GuideTicketResolutionMessageParser.RESOLUTION_VALID_RESOLVED)
        {
            return 'valid';
        }

        return 'invalid';
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/help/GuideTicketResolutionMessageEventParser.as::flush()
    flush(): boolean
    {
        this._resultCode = -1;
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/help/GuideTicketResolutionMessageEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._resultCode = wrapper.readInt();

        return true;
    }
}
