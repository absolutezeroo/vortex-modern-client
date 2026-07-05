import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {TradingFurniItemParser} from './TradingFurniItemParser';

export interface TradingUserItems
{
    userId: number;
    items: TradingFurniItemParser[];
    numItems: number;
    numCredits: number;
}

/**
 * Parser for trading item list message
 *
 * @see source_as_win63/habbo/communication/messages/parser/inventory/trading/TradingItemListEventParser.as
 */
export class TradingItemListMessageParser implements IMessageParser
{
    private _userOneItems: TradingUserItems | null = null;

    get userOneItems(): TradingUserItems | null
    {
        return this._userOneItems;
    }

    private _userTwoItems: TradingUserItems | null = null;

    get userTwoItems(): TradingUserItems | null
    {
        return this._userTwoItems;
    }

    flush(): boolean
    {
        this._userOneItems = null;
        this._userTwoItems = null;
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._userOneItems = this.parseUserItems(wrapper);
        this._userTwoItems = this.parseUserItems(wrapper);

        return true;
    }

    private parseUserItems(wrapper: IMessageDataWrapper): TradingUserItems
    {
        const userId = wrapper.readInt();
        const items: TradingFurniItemParser[] = [];
        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            items.push(new TradingFurniItemParser(wrapper));
        }

        const numItems = wrapper.readInt();
        const numCredits = wrapper.readInt();

        return {userId, items, numItems, numCredits};
    }
}
