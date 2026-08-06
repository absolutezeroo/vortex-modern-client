import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

export class ShowEnforceRoomCategoryDialogEventParser implements IMessageParser
{
    private _selectionType: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/parser/roomsettings/ShowEnforceRoomCategoryDialogEventParser.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/roomsettings/ShowEnforceRoomCategoryDialogEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._selectionType = wrapper.readInt();
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/roomsettings/ShowEnforceRoomCategoryDialogEventParser.as::get selectionType()
    get selectionType(): number { return this._selectionType; }
}
