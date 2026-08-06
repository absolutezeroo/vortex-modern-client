import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {EventCategory} from '../../incoming/navigator';

/**
 * Parser for user event categories message
 *
 * @see source_as_win63/habbo/communication/messages/parser/navigator/UserEventCatsEventParser.as
 */
export class UserEventCatsMessageParser implements IMessageParser
{
    private _eventCategories: EventCategory[] = [];

    // AS3: sources/win63_version/habbo/communication/messages/parser/navigator/UserEventCatsEventParser.as::get eventCategories()
    get eventCategories(): EventCategory[]
    {
        return this._eventCategories;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/navigator/UserEventCatsEventParser.as::flush()
    flush(): boolean
    {
        this._eventCategories = [];

        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/navigator/UserEventCatsEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._eventCategories = [];

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            this._eventCategories.push(new EventCategory(wrapper));
        }

        return true;
    }
}
