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

const SLIDE_ANIMATION_LENGTH = 0.5;
const MAX_ANIM_Y_OFFSET = 28;

/**
 * Owns and animates the stack of ExtraInfoListItem rows shown by BundlePurchaseExtraInfoWidget
 * (promo nudge, bundle-info explainer, discount-value breakdown).
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoViewManager.as
 */
export class ExtraInfoViewManager implements IUpdateReceiver
{
    private _widget: BundlePurchaseExtraInfoWidget | null;

    private _catalog: HabboCatalog | null;

    private _items: Map<number, ExtraInfoListItem> = new Map();

    private _nextId: number = 0;

    private _disposed: boolean = false;

    private _elapsedSeconds: number = 0;

    constructor(widget: BundlePurchaseExtraInfoWidget, catalog: HabboCatalog)
    {
        this._widget = widget;
        this._catalog = catalog;

        this._catalog.registerUpdateReceiver(this, 10);
    }

    get disposed(): boolean
    {
        return this._disposed;
    }

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

    // TODO(AS3): sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoViewManager.as::addItem()
    // AS3's switch has no case for ExtraInfoItemData.TYPE_RESET_MESSAGE (5) - and neither
    // BundlePurchaseExtraInfoWidget nor anything else in this module ever constructs that type,
    // so it's dead in the original client too, not a porting gap.
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

    getItem(id: number): ExtraInfoListItem | null
    {
        return this._items.get(id) ?? null;
    }

    private reallyRemoveItem(id: number): void
    {
        const item = this.getItem(id);

        if(!item) return;

        const rendered = item.getRenderedWindow();

        if(rendered) this._widget!.window.removeChild(rendered);

        this._items.delete(id);
    }

    private calculateBounce(since: number, cosine: boolean = false): number
    {
        const elapsed = (this._elapsedSeconds - since) / SLIDE_ANIMATION_LENGTH * (Math.PI / 2);

        return cosine ? 1 - Math.abs(Math.cos(elapsed)) : 1 - Math.abs(Math.sin(elapsed));
    }

    private render(): void
    {
        let bottomY = 0;
        let topRemaining = this._widget!.window.height;

        for(const item of this._items.values())
        {
            const rendered = item.getRenderedWindow();

            if(!rendered) continue;

            let bounce = 0;

            if(this._elapsedSeconds - SLIDE_ANIMATION_LENGTH <= item.creationSeconds)
            {
                bounce = this.calculateBounce(item.creationSeconds);
            }

            if(item.isItemRemoved)
            {
                bounce = this.calculateBounce(item.removalSeconds, true);

                if(this._elapsedSeconds > item.removalSeconds + SLIDE_ANIMATION_LENGTH)
                {
                    this.reallyRemoveItem(item.id);

                    break;
                }
            }

            if(item.alignment === 0)
            {
                rendered.y = bottomY - bounce * Math.min(rendered.height, MAX_ANIM_Y_OFFSET);
                bottomY += rendered.height;
            }
            else if(item.alignment === 1)
            {
                rendered.y = topRemaining - rendered.height + bounce * Math.min(rendered.height, MAX_ANIM_Y_OFFSET);
                topRemaining -= rendered.height;
            }
            else if(item.alignment === 2)
            {
                rendered.y = 0;
            }
        }
    }

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

    update(deltaTime: number): void
    {
        this._elapsedSeconds += deltaTime / 1000;
        this.render();
    }
}
