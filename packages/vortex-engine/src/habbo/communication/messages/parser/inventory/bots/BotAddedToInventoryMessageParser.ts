import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {Bot} from '@habbo/inventory/bots/Bot';

/**
 * A single bot has entered the inventory (header 3570) — bought from the catalog or picked back up
 * out of a room. The trailing flag tells the client whether to pop the inventory open, which is why
 * a purchase shows the player where the bot went and a pickup does not.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3095/_SafeCls_3675.as
 * (obfuscated in the primary dump; `_SafeStr_4546[3570] = _SafeCls_3954` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as:1583).
 */
export class BotAddedToInventoryMessageParser implements IMessageParser
{
    // AS3: .../_SafeCls_3675.as::_SafeStr_4718
    private _item: Bot | null = null;

    // AS3: .../_SafeCls_3675.as::_SafeStr_9394
    private _openInventory: boolean = false;

    // AS3: .../_SafeCls_3675.as::get item()
    get item(): Bot | null
    {
        return this._item;
    }

    // AS3: .../_SafeCls_3675.as::openInventory()
    // AS3 declares this one as a plain method rather than a getter, the same inconsistency
    // PetAddedToInventoryEventParser has; kept as a property since the distinction carries no
    // behaviour.
    get openInventory(): boolean
    {
        return this._openInventory;
    }

    // AS3: .../_SafeCls_3675.as::flush()
    flush(): boolean
    {
        this._item = null;

        return true;
    }

    // AS3: .../_SafeCls_3675.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._item = Bot.parse(wrapper);
        this._openInventory = wrapper.readBoolean();

        return true;
    }
}
