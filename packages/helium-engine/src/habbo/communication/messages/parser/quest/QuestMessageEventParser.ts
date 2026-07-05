import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {QuestMessageData} from './QuestMessageData';

/**
 * Parser for a single quest message.
 *
 * Parses the server message containing a single quest's data.
 *
 * @see source_as_win63/habbo/communication/messages/parser/quest/QuestMessageEventParser.as
 */
export class QuestMessageEventParser implements IMessageParser
{
    private _quest: QuestMessageData | null = null;

    get quest(): QuestMessageData | null
    {
        return this._quest;
    }

    flush(): boolean
    {
        this._quest = null;
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._quest = new QuestMessageData(wrapper);

        return true;
    }
}
