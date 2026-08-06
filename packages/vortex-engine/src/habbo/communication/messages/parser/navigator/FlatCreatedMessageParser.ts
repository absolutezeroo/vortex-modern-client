import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for flat created message
 *
 * @see source_as_win63/habbo/communication/messages/parser/navigator/FlatCreatedEventParser.as
 */
export class FlatCreatedMessageParser implements IMessageParser
{
    // AS3: sources/win63_version/habbo/communication/messages/parser/navigator/FlatCreatedEventParser.as::_flatId
    private _flatId: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/parser/navigator/FlatCreatedEventParser.as::get flatId()
    get flatId(): number
    {
        return this._flatId;
    }

    private _flatName: string = '';

    // AS3: sources/win63_version/habbo/communication/messages/parser/navigator/FlatCreatedEventParser.as::get flatName()
    get flatName(): string
    {
        return this._flatName;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/navigator/FlatCreatedEventParser.as::flush()
    flush(): boolean
    {
        this._flatId = 0;
        this._flatName = '';
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/navigator/FlatCreatedEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._flatId = wrapper.readInt();
        this._flatName = wrapper.readString();
        return true;
    }
}
