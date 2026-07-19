import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/HabboCatalog.as::purchaseProductAsGift()
 * (composer class itself is obfuscated, `_SafeCls_1796` - name derived from its only caller, not
 * recovered). Param order/semantics recovered from the only real AS3 caller,
 * PurchaseConfirmationDialog.as::giveGift() (lines 936-951): giftBoxProductId is a default-vs-custom
 * product id whose two source fields aren't otherwise resolved in that tree - named honestly rather
 * than over-claiming a precise meaning.
 */
export class PurchaseProductAsGiftMessageComposer extends MessageComposer<ConstructorParameters<typeof PurchaseProductAsGiftMessageComposer>>
{
    private _data: ConstructorParameters<typeof PurchaseProductAsGiftMessageComposer>;

    constructor(
        pageId: number,
        offerId: number,
        extraParam: string,
        receiverName: string,
        giftMessage: string | null,
        giftBoxProductId: number,
        boxType: number,
        ribbonType: number,
        showPurchaserName: boolean = false
    )
    {
        super();
        this._data = [pageId, offerId, extraParam, receiverName, giftMessage, giftBoxProductId, boxType, ribbonType, showPurchaserName];
    }

    getMessageArray()
    {
        return this._data;
    }
}
