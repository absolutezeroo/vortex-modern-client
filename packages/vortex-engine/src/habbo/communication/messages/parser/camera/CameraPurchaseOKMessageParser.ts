import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * The photo purchase went through. Carries no payload — the message is the news.
 *
 * AS3: sources/win63_version/habbo/communication/messages/parser/camera/CameraPurchaseOKMessageEventParser.as
 * (`_SafePkg_4018/_SafeCls_4386` in the primary tree; header 3907 from WIN63's registry)
 */
export class CameraPurchaseOKMessageParser implements IMessageParser
{
    // AS3: .../_SafePkg_4018/_SafeCls_4386.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: .../_SafePkg_4018/_SafeCls_4386.as::parse()
    parse(_wrapper: IMessageDataWrapper): boolean
    {
        return true;
    }
}
