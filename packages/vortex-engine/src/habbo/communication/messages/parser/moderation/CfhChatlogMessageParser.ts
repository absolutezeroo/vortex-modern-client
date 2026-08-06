import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {CfhChatlogData} from './CfhChatlogData';

/**
 * Parser for CFH (Call For Help) chatlog messages.
 *
 * @see source_as_win63/habbo/communication/messages/parser/moderation/CfhChatlogEventParser.as
 */
export class CfhChatlogMessageParser implements IMessageParser
{
    private _data: CfhChatlogData | null = null;

    // AS3: sources/win63_version/habbo/communication/messages/parser/moderation/CfhChatlogEventParser.as::get data()
    get data(): CfhChatlogData | null
    {
        return this._data;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/moderation/CfhChatlogEventParser.as::flush()
    flush(): boolean
    {
        this._data = null;
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/moderation/CfhChatlogEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._data = new CfhChatlogData(wrapper);

        return true;
    }
}
