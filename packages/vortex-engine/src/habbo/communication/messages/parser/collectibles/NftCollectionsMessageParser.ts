import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {NftCollection} from './NftCollection';

/**
 * Every NFT collection the hotel runs, with the player's progress folded into each one.
 *
 * Name DERIVED: obfuscated in every tree, named for its one handler
 * (`CollectionsTab.as::onNftCollectionsMessage()`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/collectibles/_SafeCls_4014.as
 */
export class NftCollectionsMessageParser implements IMessageParser
{
    // AS3: _SafeCls_4014.as::_SafeStr_7306 (from `get nftCollections()`)
    private _nftCollections: NftCollection[] = [];

    // AS3: _SafeCls_4014.as::flush()
    flush(): boolean
    {
        this._nftCollections = [];

        return true;
    }

    // AS3: _SafeCls_4014.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._nftCollections = [];

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++) this._nftCollections.push(new NftCollection(wrapper));

        return true;
    }

    // AS3: _SafeCls_4014.as::get nftCollections()
    get nftCollections(): NftCollection[]
    {
        return this._nftCollections;
    }
}
