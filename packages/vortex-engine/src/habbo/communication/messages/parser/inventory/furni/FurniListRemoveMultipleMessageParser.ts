import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * Parser for FurniListRemoveMultiple message (bulk item removal from inventory)
 *
 * @see sources/win63_version/habbo/communication/messages/parser/inventory/furni/FurniListRemoveMultipleEventParser.as
 */
export class FurniListRemoveMultipleMessageParser implements IMessageParser
{
    private _stripIds: number[] = [];

    // AS3: sources/win63_version/habbo/communication/messages/parser/inventory/furni/FurniListRemoveMultipleEventParser.as::get stripIds()
    get stripIds(): number[]
    {
        return this._stripIds;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/inventory/furni/FurniListRemoveMultipleEventParser.as::flush()
    flush(): boolean
    {
        this._stripIds = [];

        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/inventory/furni/FurniListRemoveMultipleEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._stripIds = [];

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            this._stripIds.push(wrapper.readInt());
        }

        return true;
    }
}
