import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {Bot} from '@habbo/inventory/bots/Bot';

/**
 * The full bot inventory (header 682).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3095/_SafeCls_3735.as
 * (obfuscated in the primary dump; `_SafeStr_4546[682] = _SafeCls_3058` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as:1712).
 */
export class BotInventoryMessageParser implements IMessageParser
{
    // AS3: .../_SafeCls_3735.as::_items — a keyed collection, not a list: BotsModel.updateItems()
    // diffs it against its own store by key.
    private _items: Map<number, Bot> = new Map<number, Bot>();

    // AS3: .../_SafeCls_3735.as::get items()
    get items(): Map<number, Bot>
    {
        return this._items;
    }

    // AS3: .../_SafeCls_3735.as::flush()
    flush(): boolean
    {
        this._items = new Map<number, Bot>();

        return true;
    }

    // AS3: .../_SafeCls_3735.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._items = new Map<number, Bot>();

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            const bot = Bot.parse(wrapper);

            this._items.set(bot.id, bot);
        }

        return true;
    }
}
