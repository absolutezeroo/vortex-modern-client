import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {QuestMessageData} from './QuestMessageData';

/**
 * Parser for the quests list message.
 *
 * Parses a list of quests and a boolean indicating whether to open the quest window.
 *
 * @see source_as_win63/habbo/communication/messages/parser/quest/QuestsMessageEventParser.as
 */
export class QuestsMessageEventParser implements IMessageParser
{
    private _quests: QuestMessageData[] = [];

    // AS3: sources/win63_version/habbo/communication/messages/parser/quest/QuestsMessageEventParser.as::get quests()
    get quests(): QuestMessageData[]
    {
        return this._quests;
    }

    private _openWindow: boolean = false;

    // AS3: sources/win63_version/habbo/communication/messages/parser/quest/QuestsMessageEventParser.as::get openWindow()
    get openWindow(): boolean
    {
        return this._openWindow;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/quest/QuestsMessageEventParser.as::flush()
    flush(): boolean
    {
        this._quests = [];
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/quest/QuestsMessageEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        const count: number = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            this._quests.push(new QuestMessageData(wrapper));
        }

        this._openWindow = wrapper.readBoolean();

        return true;
    }
}
