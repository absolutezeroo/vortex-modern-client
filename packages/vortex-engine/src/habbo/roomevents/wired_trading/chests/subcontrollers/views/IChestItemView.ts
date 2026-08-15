import type {IWindow} from '@core/window/IWindow';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {
    IChestStorageItem
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/chests/IChestStorageItem';

/**
 * The four windows a chest item cell exposes so shared decoration can paint LTD and rarity badges
 * over it, plus the item it is showing.
 *
 * It exists so that decoration is written once against an interface rather than against each cell
 * class — the transaction views implement it too.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_trading/chests/subcontrollers/views/_SafeCls_4478.as
 * (name derived: obfuscated in every tree, named for what it describes)
 */
export interface IChestItemView
{
    // AS3: _SafeCls_4478.as::get ltdBackgroundBitmap()
    readonly ltdBackgroundBitmap: IWindow | null;

    // AS3: _SafeCls_4478.as::get furniIcon()
    readonly furniIcon: IWidgetWindow | null;

    // AS3: _SafeCls_4478.as::get ltdOverlayWidget()
    readonly ltdOverlayWidget: IWidgetWindow | null;

    // AS3: _SafeCls_4478.as::get rarityOverlayWidget()
    readonly rarityOverlayWidget: IWidgetWindow | null;

    // AS3: _SafeCls_4478.as::get chestBasedItemSample()
    readonly chestBasedItemSample: IChestStorageItem | null;
}
