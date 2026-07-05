import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for present opened message
 *
 * @see source_as_win63/habbo/communication/messages/parser/room/furniture/PresentOpenedMessageEventParser.as
 */
export class PresentOpenedMessageEventParser implements IMessageParser
{
    private _itemType: string = '';

    get itemType(): string
    {
        return this._itemType;
    }

    private _classId: number = 0;

    get classId(): number
    {
        return this._classId;
    }

    private _productCode: string = '';

    get productCode(): string
    {
        return this._productCode;
    }

    private _placedItemId: number = 0;

    get placedItemId(): number
    {
        return this._placedItemId;
    }

    private _placedItemType: string = '';

    get placedItemType(): string
    {
        return this._placedItemType;
    }

    private _placedInRoom: boolean = false;

    get placedInRoom(): boolean
    {
        return this._placedInRoom;
    }

    private _petFigureString: string = '';

    get petFigureString(): string
    {
        return this._petFigureString;
    }

    flush(): boolean
    {
        this._itemType = '';
        this._classId = 0;
        this._productCode = '';
        this._placedItemId = 0;
        this._placedItemType = '';
        this._placedInRoom = false;
        this._petFigureString = '';
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._itemType = wrapper.readString();
        this._classId = wrapper.readInt();
        this._productCode = wrapper.readString();
        this._placedItemId = wrapper.readInt();
        this._placedItemType = wrapper.readString();
        this._placedInRoom = wrapper.readBoolean();
        this._petFigureString = wrapper.readString();

        return true;
    }
}
