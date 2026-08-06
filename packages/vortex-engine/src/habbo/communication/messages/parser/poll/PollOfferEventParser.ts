import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for poll offer events
 *
 * @see source_as_win63/habbo/communication/messages/parser/poll/PollOfferEventParser.as
 */
export class PollOfferEventParser implements IMessageParser
{
    private _id: number = -1;

    // AS3: sources/win63_version/habbo/communication/messages/parser/poll/PollOfferEventParser.as::get id()
    get id(): number
    {
        return this._id;
    }

    private _type: string = '';

    // AS3: sources/win63_version/habbo/communication/messages/parser/poll/PollOfferEventParser.as::get type()
    get type(): string
    {
        return this._type;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/poll/PollOfferEventParser.as::_headline
    private _headline: string = '';

    // AS3: sources/win63_version/habbo/communication/messages/parser/poll/PollOfferEventParser.as::get headline()
    get headline(): string
    {
        return this._headline;
    }

    private _summary: string = '';

    // AS3: sources/win63_version/habbo/communication/messages/parser/poll/PollOfferEventParser.as::get summary()
    get summary(): string
    {
        return this._summary;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/poll/PollOfferEventParser.as::flush()
    flush(): boolean
    {
        this._id = -1;
        this._type = '';
        this._headline = '';
        this._summary = '';
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/poll/PollOfferEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._id = wrapper.readInt();
        this._type = wrapper.readString();
        this._headline = wrapper.readString();
        this._summary = wrapper.readString();

        return true;
    }
}
