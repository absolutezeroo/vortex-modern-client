import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for the recycler-finished push (success/failure + awarded prize id).
 *
 * @see sources/win63_version/habbo/communication/messages/parser/catalog/RecyclerFinishedMessageEventParser.as
 */
export class RecyclerFinishedMessageEventParser implements IMessageParser
{
    static readonly STATUS_SUCCESS: number = 1;
    static readonly STATUS_FAILURE: number = 2;

    private _recyclerFinishedStatus: number = -1;

    get recyclerFinishedStatus(): number
    {
        return this._recyclerFinishedStatus;
    }

    private _prizeId: number = 0;

    get prizeId(): number
    {
        return this._prizeId;
    }

    flush(): boolean
    {
        this._recyclerFinishedStatus = -1;
        this._prizeId = 0;
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._recyclerFinishedStatus = wrapper.readInt();
        this._prizeId = wrapper.readInt();
        return true;
    }
}
