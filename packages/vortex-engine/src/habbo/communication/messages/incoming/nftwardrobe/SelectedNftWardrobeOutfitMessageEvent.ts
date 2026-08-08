import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {SelectedNftWardrobeOutfitMessageParser} from '../../parser/nftwardrobe/SelectedNftWardrobeOutfitMessageParser';

/**
 * Which NFT avatar is currently worn, and the figure to fall back to when it is removed.
 *
 * Header **582**, from WIN63's registry (`_SafeStr_4546[582] = _SafeCls_3434`); the emulator names the *request* `GetSelectedNftWardrobeOutfitMessageEvent` (3521); this is its answer. Class
 * name DERIVED — the AS3 event class is obfuscated and exists in no other tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3435/_SafeCls_3434.as
 */
export class SelectedNftWardrobeOutfitMessageEvent extends MessageEvent implements IMessageEvent
{
    // AS3: .../src/unknowns/_SafePkg_3435/_SafeCls_3434.as::_SafeCls_3434()
    constructor(callback: MessageEventCallback)
    {
        super(callback, SelectedNftWardrobeOutfitMessageParser);
    }
}
