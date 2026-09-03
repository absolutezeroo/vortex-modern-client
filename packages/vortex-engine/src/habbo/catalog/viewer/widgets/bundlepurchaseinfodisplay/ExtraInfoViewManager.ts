import type {IUpdateReceiver} from '@core/runtime/IContext';
import type {HabboCatalog} from '../../../HabboCatalog';
import type {BundlePurchaseExtraInfoWidget} from '../BundlePurchaseExtraInfoWidget';
import {ExtraInfoBonusAchievementItem} from './listitem/ExtraInfoBonusAchievementItem';
import {ExtraInfoBonusBadgeItem} from './listitem/ExtraInfoBonusBadgeItem';
import {ExtraInfoBundlesInfoItem} from './listitem/ExtraInfoBundlesInfoItem';
import {ExtraInfoDiscountValueItem} from './listitem/ExtraInfoDiscountValueItem';
import {ExtraInfoPromoItem} from './listitem/ExtraInfoPromoItem';
import {ExtraInfoItemData} from './ExtraInfoItemData';
import type {ExtraInfoListItem} from './ExtraInfoListItem';

/**
 * Owns and animates the stack of ExtraInfoListItem rows shown by BundlePurchaseExtraInfoWidget
 * (promo nudge, bundle-info explainer, discount-value breakdown).
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoViewManager.as
 */
export class ExtraInfoViewManager implements IUpdateReceiver
{
    private static readonly SLIDE_ANIMATION_LENGTH = 0.5;

    private static readonly MAX_ANIM_Y_OFFSET = 28;

    private _widget: BundlePurchaseExtraInfoWidget | null;

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoViewManager.as::_catalog
    private _catalog: HabboCatalog | null;

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoViewManager.as::_items
    private _items: Map<number, ExtraInfoListItem> = new Map();

    private _nextId: number = 0;

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoViewManager.as::_disposed
    private _disposed: boolean = false;

    private _elapsedSeconds: number = 0;

    constructor(widget: BundlePurchaseExtraInfoWidget, catalog: HabboCatalog)
    {
        this._widget = widget;
        this._catalog = catalog;

        this._catalog.registerUpdateReceiver(this, 10);
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoViewManager.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoViewManager.as::dispose()
    dispose(): void
    {
        if(this.disposed) return;

        this._catalog?.removeUpdateReceiver(this);
        this._widget = null;
        this._catalog = null;

        for(const item of this._items.values())
        {
            item.dispose();
        }

        this._items = new Map();
        this._disposed = true;
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoViewManager.as::clear()
    clear(): void
    {
        const window = this._widget!.window;

        while(window.numChildren > 0)
        {
            window.removeChildAt(0);
        }

        for(const item of this._items.values())
        {
            item.dispose();
        }

        this._items = new Map();
        this.render();
    }

    /**
     * The switch below has no case for `TYPE_RESET_MESSAGE` (5) because AS3's has none either,
     * and nothing in this module — `BundlePurchaseExtraInfoWidget` included — ever constructs
     * that type. Matching the original exactly, not a gap.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoViewManager.as::addItem()
    addItem(data: ExtraInfoItemData): number
    {
        const id = this._nextId++;
        let item: ExtraInfoListItem | null = null;

        switch(data.type)
        {
            case ExtraInfoItemData.TYPE_PROMO:
                item = new ExtraInfoPromoItem(this._widget!, id, data, this._catalog!);

                break;
            case ExtraInfoItemData.TYPE_BUNDLES_INFO_SCREEN:
                item = new ExtraInfoBundlesInfoItem(this._widget!, id, data, this._catalog!);

                break;
            case ExtraInfoItemData.TYPE_DISCOUNT_VALUE:
                item = new ExtraInfoDiscountValueItem(id, data, this._catalog!);

                break;
            case ExtraInfoItemData.TYPE_BONUS_BADGE:
                item = new ExtraInfoBonusBadgeItem(id, data, this._catalog!);

                break;
            case ExtraInfoItemData.TYPE_BONUS_ACHIEVEMENT:
                item = new ExtraInfoBonusAchievementItem(id, data);

                break;
        }

        item!.creationSeconds = this._elapsedSeconds;
        this._items.set(id, item!);

        // AS3 doesn't null-check getRenderedWindow() here either - types 3/4
        // (ExtraInfoBonusBadgeItem/ExtraInfoBonusAchievementItem) return null and would throw the
        // same way in the original client, but nothing in this module ever constructs those types
        // (see the TODO above), so this path is never actually exercised.
        const rendered = item!.getRenderedWindow()!;

        rendered.width = this._widget!.window.width;
        this._widget!.window.addChild(rendered);

        this.sortWindows();
        this.render();

        return item!.id;
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoViewManager.as::removeItem()
    removeItem(id: number): void
    {
        const item = this.getItem(id);

        if(item)
        {
            item.removalSeconds = this._elapsedSeconds;

            if(item.alignment === 2)
            {
                this.reallyRemoveItem(item.id);
            }

            this.render();
        }
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoViewManager.as::getItem()
    getItem(id: number): ExtraInfoListItem | null
    {
        return this._items.get(id) ?? null;
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoViewManager.as::reallyRemoveItem()
    private reallyRemoveItem(id: number): void
    {
        const item = this.getItem(id);

        if(!item) return;

        const rendered = item.getRenderedWindow();

        if(rendered) this._widget!.window.removeChild(rendered);

        this._items.delete(id);
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoViewManager.as::calculateBounce()
    private calculateBounce(since: number, cosine: boolean = false): number
    {
        const elapsed = (this._elapsedSeconds - since) / ExtraInfoViewManager.SLIDE_ANIMATION_LENGTH * (Math.PI / 2);

        return cosine ? 1 - Math.abs(Math.cos(elapsed)) : 1 - Math.abs(Math.sin(elapsed));
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoViewManager.as::render()
    private render(): void
    {
        let bottomY = 0;
        let topRemaining = this._widget!.window.height;

        for(const item of this._items.values())
        {
            const rendered = item.getRenderedWindow();

            if(!rendered) continue;

            let bounce = 0;

            if(this._elapsedSeconds - ExtraInfoViewManager.SLIDE_ANIMATION_LENGTH <= item.creationSeconds)
            {
                bounce = this.calculateBounce(item.creationSeconds);
            }

            if(item.isItemRemoved)
            {
                bounce = this.calculateBounce(item.removalSeconds, true);

                if(this._elapsedSeconds > item.removalSeconds + ExtraInfoViewManager.SLIDE_ANIMATION_LENGTH)
                {
                    this.reallyRemoveItem(item.id);

                    break;
                }
            }

            if(item.alignment === 0)
            {
                rendered.y = bottomY - bounce * Math.min(rendered.height, ExtraInfoViewManager.MAX_ANIM_Y_OFFSET);
                bottomY += rendered.height;
            }
            else if(item.alignment === 1)
            {
                rendered.y = topRemaining - rendered.height + bounce * Math.min(rendered.height, ExtraInfoViewManager.MAX_ANIM_Y_OFFSET);
                topRemaining -= rendered.height;
            }
            else if(item.alignment === 2)
            {
                rendered.y = 0;
            }
        }
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoViewManager.as::sortWindows()
    private sortWindows(): void
    {
        const window = this._widget!.window;
        const topIndex = window.numChildren - 1;

        for(const item of this._items.values())
        {
            if(item.alwaysOnTop)
            {
                const rendered = item.getRenderedWindow();

                if(rendered) window.setChildIndex(rendered, topIndex);
            }
        }
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoViewManager.as::update()
    update(deltaTime: number): void
    {
        this._elapsedSeconds += deltaTime / 1000;
        this.render();
    }
}
