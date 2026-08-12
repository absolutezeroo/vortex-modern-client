import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Every wallet the player has linked, with the Stardust one first.
 *
 * The Stardust address is read on its own and then *also* pushed onto the list — but only when it
 * is non-empty, which is how "no Stardust wallet" is signalled. It is therefore both
 * `walletAddresses[0]` and `stardustWalletAddress` when present, and absent from both when not.
 *
 * Name DERIVED: obfuscated in every tree, named for its one handler
 * (`CollectiblesView.as::onCollectableWalletAddressMessage()`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/collectibles/_SafeCls_4305.as
 */
export class CollectibleWalletAddressesMessageParser implements IMessageParser
{
    // AS3: _SafeCls_4305.as::_SafeStr_6871 (from `get stardustWalletAddress()`)
    private _stardustWalletAddress: string = '';

    // AS3: _SafeCls_4305.as::_walletAddresses
    private _walletAddresses: string[] = [];

    // AS3: _SafeCls_4305.as::flush()
    flush(): boolean
    {
        this._stardustWalletAddress = '';
        this._walletAddresses = [];

        return true;
    }

    // AS3: _SafeCls_4305.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._stardustWalletAddress = wrapper.readString();
        this._walletAddresses = [];

        if(this._stardustWalletAddress !== '') this._walletAddresses.push(this._stardustWalletAddress);

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++) this._walletAddresses.push(wrapper.readString());

        return true;
    }

    // AS3: _SafeCls_4305.as::get walletAddresses()
    get walletAddresses(): string[]
    {
        return this._walletAddresses;
    }

    // AS3: _SafeCls_4305.as::get stardustWalletAddress()
    get stardustWalletAddress(): string
    {
        return this._stardustWalletAddress;
    }
}
