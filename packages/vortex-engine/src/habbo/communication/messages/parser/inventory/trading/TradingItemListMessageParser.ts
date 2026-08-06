import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {TradingFurniItemParser} from './TradingFurniItemParser';

/**
 * Both sides' offers, in one message.
 *
 * The eight accessors are AS3's own. The port previously grouped them into two
 * `{userId, items, numItems, numCredits}` records, which had no counterpart in the source and
 * nothing consumed; `TradingModel.updateItemGroupMaps()` reads the flat names.
 *
 * The read order is unchanged and matches AS3: for each side, id, item count + items,
 * then numItems and numCredits — the two counts come *after* the items, not with the id.
 *
 * AS3: sources/win63_version/habbo/communication/messages/parser/inventory/trading/TradingItemListEventParser.as
 */
export class TradingItemListMessageParser implements IMessageParser
{
    private _firstUserId: number = -1;

    // AS3: .../TradingItemListEventParser.as::get firstUserID()
    get firstUserId(): number
    {
        return this._firstUserId;
    }

    private _firstUserItemArray: TradingFurniItemParser[] = [];

    // AS3: .../TradingItemListEventParser.as::get firstUserItemArray()
    get firstUserItemArray(): TradingFurniItemParser[]
    {
        return this._firstUserItemArray;
    }

    private _firstUserNumItems: number = 0;

    // AS3: .../TradingItemListEventParser.as::get firstUserNumItems()
    get firstUserNumItems(): number
    {
        return this._firstUserNumItems;
    }

    private _firstUserNumCredits: number = 0;

    // AS3: .../TradingItemListEventParser.as::get firstUserNumCredits()
    get firstUserNumCredits(): number
    {
        return this._firstUserNumCredits;
    }

    private _secondUserId: number = -1;

    // AS3: .../TradingItemListEventParser.as::get secondUserID()
    get secondUserId(): number
    {
        return this._secondUserId;
    }

    private _secondUserItemArray: TradingFurniItemParser[] = [];

    // AS3: .../TradingItemListEventParser.as::get secondUserItemArray()
    get secondUserItemArray(): TradingFurniItemParser[]
    {
        return this._secondUserItemArray;
    }

    private _secondUserNumItems: number = 0;

    // AS3: .../TradingItemListEventParser.as::get secondUserNumItems()
    get secondUserNumItems(): number
    {
        return this._secondUserNumItems;
    }

    private _secondUserNumCredits: number = 0;

    // AS3: .../TradingItemListEventParser.as::get secondUserNumCredits()
    get secondUserNumCredits(): number
    {
        return this._secondUserNumCredits;
    }

    // AS3: .../TradingItemListEventParser.as::flush()
    flush(): boolean
    {
        this._firstUserId = -1;
        this._firstUserItemArray = [];
        this._firstUserNumItems = 0;
        this._firstUserNumCredits = 0;
        this._secondUserId = -1;
        this._secondUserItemArray = [];
        this._secondUserNumItems = 0;
        this._secondUserNumCredits = 0;

        return true;
    }

    // AS3: .../TradingItemListEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._firstUserId = wrapper.readInt();
        this._firstUserItemArray = [];

        if(!this.parseItemData(wrapper, this._firstUserItemArray)) return false;

        this._firstUserNumItems = wrapper.readInt();
        this._firstUserNumCredits = wrapper.readInt();

        this._secondUserId = wrapper.readInt();
        this._secondUserItemArray = [];

        if(!this.parseItemData(wrapper, this._secondUserItemArray)) return false;

        this._secondUserNumItems = wrapper.readInt();
        this._secondUserNumCredits = wrapper.readInt();

        return true;
    }

    // AS3: .../TradingItemListEventParser.as::parseItemData()
    private parseItemData(wrapper: IMessageDataWrapper, target: TradingFurniItemParser[]): boolean
    {
        let count = wrapper.readInt();

        while(count > 0)
        {
            target.push(new TradingFurniItemParser(wrapper));
            count--;
        }

        return true;
    }
}
