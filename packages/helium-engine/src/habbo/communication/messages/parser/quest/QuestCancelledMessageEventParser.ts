import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {QuestMessageData} from './QuestMessageData';

/**
 * Parser for the quest cancelled message.
 *
 * Parses the expired flag and the cancelled quest data.
 *
 * @see source_as_win63/habbo/communication/messages/parser/quest/QuestCancelledMessageEventParser.as
 */
export class QuestCancelledMessageEventParser implements IMessageParser
{
    private _expired: boolean = false;

    get expired(): boolean
    {
        return this._expired;
    }

    private _quest: QuestMessageData | null = null;

    get quest(): QuestMessageData | null
    {
        return this._quest;
    }

    flush(): boolean
    {
        this._expired = false;
        this._quest = null;
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._expired = wrapper.readBoolean();
        this._quest = new QuestMessageData(wrapper);

        return true;
    }
}
