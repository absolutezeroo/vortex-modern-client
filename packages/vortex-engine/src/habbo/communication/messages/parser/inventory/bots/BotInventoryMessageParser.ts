import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

export interface IBotData
{
    id: number;
    name: string;
    motto: string;
    gender: string;
    figure: string;
}

/**
 * Parser for bot inventory message
 *
 * @see source_as_win63/habbo/communication/messages/parser/inventory/bots/BotInventoryEventParser.as
 */
export class BotInventoryMessageParser implements IMessageParser
{
    private _bots: IBotData[] = [];

    get bots(): IBotData[]
    {
        return this._bots;
    }

    flush(): boolean
    {
        this._bots = [];
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            const id = wrapper.readInt();
            const name = wrapper.readString();
            const motto = wrapper.readString();
            const gender = wrapper.readString();
            const figure = wrapper.readString();

            this._bots.push({id, name, motto, gender, figure});
        }

        return true;
    }
}
