import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Whether minting is switched on for this hotel at all — the mint tab hides itself when it is not.
 *
 * Name DERIVED: obfuscated in every tree, named for its one handler
 * (`MintInventoryListTab.as::onCollectibleMintingEnabledMessage()`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/collectibles/_SafeCls_4436.as
 */
export class CollectibleMintingEnabledMessageParser implements IMessageParser
{
    // AS3: _SafeCls_4436.as::_SafeStr_5833 (from `get enabled()`)
    private _enabled: boolean = false;

    // AS3: _SafeCls_4436.as::flush()
    flush(): boolean
    {
        this._enabled = false;

        return true;
    }

    // AS3: _SafeCls_4436.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._enabled = wrapper.readBoolean();

        return true;
    }

    // AS3: _SafeCls_4436.as::get enabled()
    get enabled(): boolean
    {
        return this._enabled;
    }
}
