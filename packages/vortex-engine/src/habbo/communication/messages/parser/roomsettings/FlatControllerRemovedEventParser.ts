import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

export class FlatControllerRemovedEventParser implements IMessageParser
{
    // AS3: sources/win63_version/habbo/communication/messages/parser/roomsettings/FlatControllerRemovedEventParser.as::_flatId
    private _flatId: number = 0;
    private _userId: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/parser/roomsettings/FlatControllerRemovedEventParser.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/roomsettings/FlatControllerRemovedEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._flatId = wrapper.readInt();
        this._userId = wrapper.readInt();
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/roomsettings/FlatControllerRemovedEventParser.as::get flatId()
    get flatId(): number { return this._flatId; }
    // AS3: sources/win63_version/habbo/communication/messages/parser/roomsettings/FlatControllerRemovedEventParser.as::get userId()
    get userId(): number { return this._userId; }
}
