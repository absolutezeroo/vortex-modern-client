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

    // AS3: sources/win63_version/habbo/communication/messages/parser/navigator/UserFlatCatsEventParser.as::get nodes()
    get nodes(): FlatCategory[]
    {
        return this._nodes;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/navigator/UserFlatCatsEventParser.as::flush()
    flush(): boolean
    {
        this._nodes = [];
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/navigator/UserFlatCatsEventParser.as::parse()
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
