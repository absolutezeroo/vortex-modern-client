import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {CollectibleProductItem} from './CollectibleProductItem';

/**
 * The furni types the player may mint into collectibles.
 *
 * Two deliberate oddities, both AS3's and both ported as written:
 *
 * - **`flush()` returns `false`**, where every other parser in this package returns `true`. It is
 *   the only one in the whole `collectibles` package that does.
 * - **`parse()` does not reset the list.** It appends to whatever is already there, so a second
 *   message concatenates rather than replaces. Combined with the `false` above — which is what
 *   stops the message pump from clearing the parser between deliveries — this reads as a
 *   deliberate accumulate-across-messages design: the server pages the type list.
 *
 * Writing either "correctly" would silently change what the mint tab shows, so neither is touched.
 * `hasData()` exists precisely because the list can be empty after a parse that returned true.
 *
 * Name RECOVERED from sources/win63_version/habbo/communication/messages/parser/collectibles/CollectableMintableItemTypesMessageEventParser.as
 * — that tree is obfuscated too, but it is the one where messages keep readable *filenames*.
 * (The port drops AS3's "Event" infix from parser names, as it does throughout.)
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/collectibles/_SafeCls_4430.as
 */
export class CollectableMintableItemTypesMessageParser implements IMessageParser
{
    // AS3: _SafeCls_4430.as::_SafeStr_6618 (from `get collectibleProductItems()`)
    private _collectibleProductItems: CollectibleProductItem[] = [];

    // AS3: _SafeCls_4430.as::flush()
    flush(): boolean
    {
        this._collectibleProductItems = [];

        // AS3 returns false here, alone among this package's parsers. See the class note.
        return false;
    }

    // AS3: _SafeCls_4430.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        // No reset: AS3 appends. See the class note.
        const count = wrapper.readInt();

        for(let i = 0; i < count; i++) this._collectibleProductItems.push(new CollectibleProductItem(wrapper));

        return true;
    }

    // AS3: _SafeCls_4430.as::hasData()
    hasData(): boolean
    {
        return this._collectibleProductItems.length > 0;
    }

    // AS3: _SafeCls_4430.as::get collectibleProductItems()
    get collectibleProductItems(): CollectibleProductItem[]
    {
        return this._collectibleProductItems;
    }
}
