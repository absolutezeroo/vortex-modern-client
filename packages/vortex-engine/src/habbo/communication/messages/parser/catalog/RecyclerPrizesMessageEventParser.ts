import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {PrizeLevelMessageData} from '../../incoming/catalog/PrizeLevelMessageData';

/**
 * Parser for the recycler prize table (one PrizeLevelMessageData per star tier).
 *
 * @see sources/win63_version/habbo/communication/messages/parser/catalog/RecyclerPrizesMessageEventParser.as
 */
export class RecyclerPrizesMessageEventParser implements IMessageParser
{
    private _prizeLevels: PrizeLevelMessageData[] = [];

    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/RecyclerPrizesMessageEventParser.as::get prizeLevels()
    get prizeLevels(): PrizeLevelMessageData[]
    {
        return this._prizeLevels;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/RecyclerPrizesMessageEventParser.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/RecyclerPrizesMessageEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        const count = wrapper.readInt();

        this._prizeLevels = [];

        for(let i = 0; i < count; i++)
        {
            this._prizeLevels.push(new PrizeLevelMessageData(wrapper));
        }

        return true;
    }
}
