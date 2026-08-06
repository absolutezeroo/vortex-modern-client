import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for favourite changed message
 *
 * @see source_as_win63/habbo/communication/messages/parser/navigator/FavouriteChangedEventParser.as
 */
export class FavouriteChangedMessageParser implements IMessageParser
{
    // AS3: sources/win63_version/habbo/communication/messages/parser/navigator/FavouriteChangedEventParser.as::_flatId
    private _flatId: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/parser/navigator/FavouriteChangedEventParser.as::get flatId()
    get flatId(): number
    {
        return this._flatId;
    }

    private _added: boolean = false;

    // AS3: sources/win63_version/habbo/communication/messages/parser/navigator/FavouriteChangedEventParser.as::get added()
    get added(): boolean
    {
        return this._added;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/navigator/FavouriteChangedEventParser.as::flush()
    flush(): boolean
    {
        this._flatId = 0;
        this._added = false;
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/navigator/FavouriteChangedEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._flatId = wrapper.readInt();
        this._added = wrapper.readBoolean();
        return true;
    }
}
