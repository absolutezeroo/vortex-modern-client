import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {UserNftWardrobeMessageParser} from '../../parser/nftwardrobe/UserNftWardrobeMessageParser';

/**
 * The NFT avatars the user owns, pushed in answer to `GetUserNftWardrobeMessageComposer`.
 *
 * Header **2116**, from WIN63's registry (`_SafeStr_4546[2116] = _SafeCls_3924`); the emulator names the *request* `GetUserNftWardrobeMessageEvent` (2203); this is its answer. Class
 * name DERIVED — the AS3 event class is obfuscated and exists in no other tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3435/_SafeCls_3924.as
 */
export class UserNftWardrobeMessageEvent extends MessageEvent implements IMessageEvent
{
    // AS3: .../src/unknowns/_SafePkg_3435/_SafeCls_3924.as::_SafeCls_3924()
    constructor(callback: MessageEventCallback)
    {
        super(callback, UserNftWardrobeMessageParser);
    }
}
