import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for the builder's club furni count message - the reply to
 * BuildersClubQueryFurniCountMessageComposer.
 *
 * @see sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1714/_SafeCls_2945.as
 */
export class BuildersClubFurniCountMessageParser implements IMessageParser
{
    private _furniCount: number = 0;

    get furniCount(): number
    {
        return this._furniCount;
    }

    flush(): boolean
    {
        this._furniCount = 0;
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._furniCount = wrapper.readInt();
        return true;
    }
}
