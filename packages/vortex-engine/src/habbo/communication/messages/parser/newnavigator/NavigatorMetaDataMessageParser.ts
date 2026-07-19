import type {IMessageDataWrapper} from '@core/communication';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {NavigatorTopLevelContext} from '../../incoming/newnavigator';

/**
 * Parser for navigator metadata message (top level contexts)
 *
 * @see source_as_win63/habbo/communication/messages/parser/newnavigator/class_1337.as
 */
export class NavigatorMetaDataMessageParser implements IMessageParser
{
    private _topLevelContexts: NavigatorTopLevelContext[] = [];

    get topLevelContexts(): NavigatorTopLevelContext[]
    {
        return this._topLevelContexts;
    }

    flush(): boolean
    {
        this._topLevelContexts = [];

        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            this._topLevelContexts.push(new NavigatorTopLevelContext(wrapper));
        }

        return true;
    }
}
