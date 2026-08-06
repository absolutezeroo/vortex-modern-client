import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {CommunityGoalProgressData} from './CommunityGoalProgressData';

/**
 * Parses community goal progress data from the server.
 *
 * @see sources/win63_version/habbo/communication/messages/parser/quest/CommunityGoalProgressMessageEventParser.as
 */
export class CommunityGoalProgressMessageParser implements IMessageParser
{
    private _data: CommunityGoalProgressData | null = null;

    // AS3: sources/win63_version/habbo/communication/messages/parser/quest/CommunityGoalProgressMessageEventParser.as::get data()
    get data(): CommunityGoalProgressData | null
    {
        return this._data;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/quest/CommunityGoalProgressMessageEventParser.as::flush()
    flush(): boolean
    {
        this._data = null;
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/quest/CommunityGoalProgressMessageEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._data = new CommunityGoalProgressData(wrapper);
        return true;
    }
}
