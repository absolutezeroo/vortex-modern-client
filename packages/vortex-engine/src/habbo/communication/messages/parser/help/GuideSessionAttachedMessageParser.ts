import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for guide session attached messages.
 * Indicates that the user has been attached to a guide session.
 *
 * @see source_as_win63/habbo/communication/messages/parser/help/GuideSessionAttachedMessageEventParser.as
 */
export class GuideSessionAttachedMessageParser implements IMessageParser
{
    private _asGuide: boolean = false;

    // AS3: sources/win63_version/habbo/communication/messages/parser/help/GuideSessionAttachedMessageEventParser.as::get asGuide()
    get asGuide(): boolean
    {
        return this._asGuide;
    }

    private _helpRequestType: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/parser/help/GuideSessionAttachedMessageEventParser.as::get helpRequestType()
    get helpRequestType(): number
    {
        return this._helpRequestType;
    }

    private _helpRequestDescription: string = '';

    // AS3: sources/win63_version/habbo/communication/messages/parser/help/GuideSessionAttachedMessageEventParser.as::get helpRequestDescription()
    get helpRequestDescription(): string
    {
        return this._helpRequestDescription;
    }

    private _roleSpecificWaitTime: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/parser/help/GuideSessionAttachedMessageEventParser.as::get roleSpecificWaitTime()
    get roleSpecificWaitTime(): number
    {
        return this._roleSpecificWaitTime;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/help/GuideSessionAttachedMessageEventParser.as::flush()
    flush(): boolean
    {
        this._asGuide = false;
        this._helpRequestType = 0;
        this._helpRequestDescription = '';
        this._roleSpecificWaitTime = 0;
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/help/GuideSessionAttachedMessageEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._asGuide = wrapper.readBoolean();
        this._helpRequestType = wrapper.readInt();
        this._helpRequestDescription = wrapper.readString();
        this._roleSpecificWaitTime = wrapper.readInt();

        return true;
    }
}
