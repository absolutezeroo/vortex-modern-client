import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {NftTransferFeeMessageParser} from '../../parser/collectibles/NftTransferFeeMessageParser';

/**
 * Header 3700: `_SafeStr_4546[3700] = _SafeCls_3637` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as;
 * handled by `TransferNftsTab.as::onNftTransferFeeMessage()`.
 *
 * Name DERIVED from its parser and its handler; both are obfuscated.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2127/_SafeCls_3637.as
 */
export class NftTransferFeeMessageEvent extends MessageEvent implements IMessageEvent
{
    // AS3: _SafeCls_3637.as::_SafeCls_3637()
    constructor(callback: MessageEventCallback)
    {
        super(callback, NftTransferFeeMessageParser);
    }
}
