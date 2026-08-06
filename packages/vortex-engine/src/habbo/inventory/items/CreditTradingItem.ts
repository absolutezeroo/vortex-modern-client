import {GroupItem} from './GroupItem';
import type {FurniModel} from '../furni/FurniModel';
import type {IAssetLibrary} from '@core/assets';
import {AssetBitmap} from '@core/assets/AssetBitmap';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import {EmptyStuffData} from '@habbo/room/object/data/EmptyStuffData';

/**
 * The credits tile that stands in for a credit offer in the trade window. It is a `GroupItem`
 * whose "count" is the credit amount, so the grid's own counter renders the number.
 *
 * AS3 passes its own `type`, `category` and `extra` accessors to `super()` **before the instance
 * is initialised**, so all three arrive as 0 — the tile has no furniture type at all, which is why
 * it carries its own icon and tooltip instead of resolving them from furni data. Kept as it is.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/items/CreditTradingItem.as
 */
export class CreditTradingItem extends GroupItem
{
    // AS3: .../CreditTradingItem.as::THUMB_WINDOW_LAYOUT
    private static readonly THUMB_WINDOW_LAYOUT: string = 'inventory_thumb_credits_xml';

    // AS3: .../CreditTradingItem.as::_creditValue
    // Name DERIVED, not recovered (`_SafeStr_9198` in every tree); `getTotalCreditValue()` returns it.
    private _creditValue: number;

    // AS3: .../CreditTradingItem.as::_assets
    private _assets: IAssetLibrary | null;

    // AS3: .../CreditTradingItem.as::CreditTradingItem()
    constructor(model: FurniModel, assets: IAssetLibrary | null, creditValue: number)
    {
        // AS3 reads `getItemIcon()` before super() — it can, because `_assets` is assigned first
        // and the getter only needs that. The same order is kept here; TS forbids touching `this`
        // before super(), so the icon is resolved from the parameter rather than the field.
        // AS3 passes `new StuffDataBase()` — the bare base class, which is concrete there. This
        // port made `StuffDataBase` abstract, so the tile gets `EmptyStuffData`, its only
        // no-payload subclass. Nothing reads this item's stuff data either way.
        super(model, 0, 0, new EmptyStuffData(), 0, CreditTradingItem.resolveIcon(assets), false, 'center');

        this._creditValue = creditValue;
        this._assets = assets;
    }

    // AS3: .../CreditTradingItem.as::getItemIcon()
    // The static half exists only because TS cannot call an instance method before super();
    // `getItemIcon()` below is AS3's own member and stays public.
    private static resolveIcon(assets: IAssetLibrary | null): ImageBitmap | null
    {
        if(!assets) return null;

        const asset = assets.getAssetByName('inventory_furni_icon_credits');

        return asset ? AssetBitmap.resolveSync(asset.content) : null;
    }

    // AS3: .../CreditTradingItem.as::getItemIcon()
    getItemIcon(): ImageBitmap | null
    {
        return CreditTradingItem.resolveIcon(this._assets);
    }

    // AS3: .../CreditTradingItem.as::getItemTooltipText()
    getItemTooltipText(): string
    {
        return '${purse_coins}';
    }

    // AS3: .../CreditTradingItem.as::getTotalCreditValue()
    getTotalCreditValue(): number
    {
        return this._creditValue;
    }

    // AS3: .../CreditTradingItem.as::get isGroupable()
    override get isGroupable(): boolean
    {
        return true;
    }

    // AS3: .../CreditTradingItem.as::getTotalCount()
    // The credit amount *is* the count, which is what puts the number on the tile.
    override getTotalCount(): number
    {
        return this.getTotalCreditValue();
    }

    // AS3: .../CreditTradingItem.as::getUnlockedCount()
    override getUnlockedCount(): number
    {
        return this.getTotalCreditValue();
    }

    // AS3: .../CreditTradingItem.as::createWindow()
    protected override createWindow(): void
    {
        this._window = this._model.windowManager.buildWidgetLayout(
            CreditTradingItem.THUMB_WINDOW_LAYOUT
        ) as IWindowContainer | null;
    }

    // AS3: .../CreditTradingItem.as::getMinimumItemsToShowCounter()
    // 1, not GroupItem's 2: a single credit still has to show its number.
    override getMinimumItemsToShowCounter(): number
    {
        return 1;
    }

    // AS3: .../CreditTradingItem.as::dispose()
    override dispose(): void
    {
        this._assets = null;
        super.dispose();
    }
}
