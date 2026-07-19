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

    get prizeLevels(): PrizeLevelMessageData[]
    {
        return this._prizeLevels;
    }

    flush(): boolean
    {
        return true;
    }

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
