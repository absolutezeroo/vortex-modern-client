import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {FlatCategory} from '../../incoming/navigator';

/**
 * Parser for user flat categories message
 *
 * @see source_as_win63/habbo/communication/messages/parser/navigator/UserFlatCatsEventParser.as
 */
export class UserFlatCatsMessageParser implements IMessageParser
{
    private _nodes: FlatCategory[] = [];

    get nodes(): FlatCategory[]
    {
        return this._nodes;
    }

    flush(): boolean
    {
        this._nodes = [];
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._nodes = [];
        const count = wrapper.readInt();
        for(let i = 0; i < count; i++)
        {
            this._nodes.push(new FlatCategory(wrapper));
        }
        return true;
    }
}
