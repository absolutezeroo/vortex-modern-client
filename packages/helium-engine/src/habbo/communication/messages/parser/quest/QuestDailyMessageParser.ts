import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {QuestMessageData} from './QuestMessageData';

/**
 * Parses daily quest data from the server.
 *
 * @see sources/win63_version/habbo/communication/messages/parser/quest/QuestDailyMessageEventParser.as
 */
export class QuestDailyMessageParser implements IMessageParser
{
    private _quest: QuestMessageData | null = null;

    get quest(): QuestMessageData | null
    {
        return this._quest;
    }

    private _easyQuestCount: number = 0;

    get easyQuestCount(): number
    {
        return this._easyQuestCount;
    }

    private _hardQuestCount: number = 0;

    get hardQuestCount(): number
    {
        return this._hardQuestCount;
    }

    flush(): boolean
    {
        this._quest = null;
        this._easyQuestCount = 0;
        this._hardQuestCount = 0;
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        const hasQuest = wrapper.readBoolean();

        if(hasQuest)
        {
            this._quest = new QuestMessageData(wrapper);
            this._easyQuestCount = wrapper.readInt();
            this._hardQuestCount = wrapper.readInt();
        }

        return true;
    }
}
