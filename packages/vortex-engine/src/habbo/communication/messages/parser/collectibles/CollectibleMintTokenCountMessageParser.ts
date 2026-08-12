import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * How many mint tokens the active wallet holds.
 *
 * Name DERIVED: obfuscated in every tree, named for its one handler
 * (`MintInventoryListTab.as::onCollectibleMintTokensMessage()`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/collectibles/_SafeCls_4209.as
 */
export class CollectibleMintTokenCountMessageParser implements IMessageParser
{
    // AS3: _SafeCls_4209.as::_SafeStr_8177 (from `get totalTokens()`)
    private _totalTokens: number = 0;

    // AS3: _SafeCls_4209.as::flush()
    flush(): boolean
    {
        this._totalTokens = 0;

        return true;
    }

    // AS3: _SafeCls_4209.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._totalTokens = wrapper.readInt();

        return true;
    }

    // AS3: _SafeCls_4209.as::get totalTokens()
    get totalTokens(): number
    {
        return this._totalTokens;
    }
}
