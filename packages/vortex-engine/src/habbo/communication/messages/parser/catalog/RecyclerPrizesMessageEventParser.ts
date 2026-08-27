import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {PrizeLevelMessageData} from '../../incoming/catalog/PrizeLevelMessageData';

/**
 * Parser for the recycler prize table (one PrizeLevelMessageData per star tier).
 *
 * Body from the primary tree (`unknowns/_SafePkg_2166/_SafeCls_2243.as`). The `win63_version` copy
 * below, which supplies the readable class name, has the decompiler's `while(0 < _loc2_)` — the
 * counter is incremented and never tested, so a non-empty prize table would hang the browser.
 *
 * @see sources/win63_version/habbo/communication/messages/parser/catalog/RecyclerPrizesMessageEventParser.as
 */
export class RecyclerPrizesMessageEventParser implements IMessageParser
{
    private _prizeLevels: PrizeLevelMessageData[] = [];

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2166/_SafeCls_2243.as::get prizeLevels()
    get prizeLevels(): PrizeLevelMessageData[]
    {
        return this._prizeLevels;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2166/_SafeCls_2243.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2166/_SafeCls_2243.as::parse()
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
