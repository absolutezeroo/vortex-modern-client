import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {NftWardrobeItem} from './NftWardrobeItem';

/**
 * The NFT avatars the user owns: a count, then that many `NftWardrobeItem` records.
 *
 * Class name DERIVED: the AS3 parser is `_SafeCls_4284.as`; named after the emulator's
 * `GetUserNftWardrobeMessageEvent` (2203), whose answer this is.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3525/_SafeCls_4284.as
 */
export class UserNftWardrobeMessageParser implements IMessageParser
{
    // AS3: .../src/unknowns/_SafePkg_3525/_SafeCls_4284.as::_nftAvatars
    // AS3 leaves this uninitialised until `flush()`; initialised here, as in `HotLooksMessageParser`.
    private _nftAvatars: NftWardrobeItem[] = [];

    // AS3: .../src/unknowns/_SafePkg_3525/_SafeCls_4284.as::get nftAvatars()
    get nftAvatars(): NftWardrobeItem[]
    {
        return this._nftAvatars;
    }

    // AS3: .../src/unknowns/_SafePkg_3525/_SafeCls_4284.as::flush()
    flush(): boolean
    {
        this._nftAvatars = [];

        return true;
    }

    // AS3: .../src/unknowns/_SafePkg_3525/_SafeCls_4284.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        const count = wrapper.readInt();

        for(let index = 0; index < count; index++)
        {
            this._nftAvatars.push(new NftWardrobeItem(wrapper));
        }

        return true;
    }
}
