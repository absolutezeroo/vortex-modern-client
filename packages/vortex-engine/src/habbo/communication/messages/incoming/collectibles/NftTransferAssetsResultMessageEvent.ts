import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {NftTransferAssetsResultMessageParser} from '../../parser/collectibles/NftTransferAssetsResultMessageParser';

/**
 * Header 2357: `_SafeStr_4546[2357] = _SafeCls_2491` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as;
 * handled by `TransferNftsTab.as::onNftTransferResultMessage()`.
 *
 * Name RECOVERED from sources/win63_version/habbo/communication/messages/incoming/collectibles/NftTransferAssetsResultMessageEvent.as
 * — that tree is obfuscated too, but it is the one where messages keep readable *filenames*.
 * (The port drops AS3's "Event" infix from parser names, as it does throughout.)
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2127/_SafeCls_2491.as
 */
export class NftTransferAssetsResultMessageEvent extends MessageEvent implements IMessageEvent
{
    // AS3: _SafeCls_2491.as::_SafeCls_2491()
    constructor(callback: MessageEventCallback)
    {
        super(callback, NftTransferAssetsResultMessageParser);
    }
}
