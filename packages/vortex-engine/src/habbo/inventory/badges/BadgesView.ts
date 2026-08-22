import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IItemGridWindow} from '@core/window/components/IItemGridWindow';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IDropMenuWindow} from '@core/window/components/IDropMenuWindow';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {WindowKeyboardEvent} from '@core/window/events/WindowKeyboardEvent';
import {Logger} from '@core/utils/Logger';
import type {IBadgeImageWidget} from '@habbo/window/widgets/IBadgeImageWidget';
import {BadgeRarityEnum} from '@habbo/communication/enum/BadgeRarityEnum';
import {BadgeLeaderboardUtils} from '@habbo/groups/BadgeLeaderboardUtils';

import type {Badge} from './Badge';
import type {BadgesModel} from './BadgesModel';
import {BadgeGridView} from './BadgeGridView';

const log = Logger.getLogger('habbo.inventory.badges.BadgesView');

/**
 * BadgesView — the badges-inventory tab.
 *
 * Two grids: `active_items` holds the badges being worn, `inactive_items` the rest, paged by
 * `BadgeGridView`. The panel beside them shows the selected badge's name, description, rarity
 * tag and owner count, and the wear/clear button.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesView.as
 */
export class BadgesView
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesView.as::FILTER_ALL
    private static readonly FILTER_ALL: number = 0;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesView.as::FILTER_NORMAL_BADGES
    private static readonly FILTER_NORMAL_BADGES: number = 1;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesView.as::FILTER_ACHIEVEMENTS
    private static readonly FILTER_ACHIEVEMENTS: number = 2;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesView.as::RARITY_FILTER_ALL
    // Derived name: obfuscated in the primary tree.
    private static readonly RARITY_FILTER_ALL: number = -1;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesView.as::RARITY_FILTER_COMMON
    // Derived name: obfuscated in the primary tree.
    private static readonly RARITY_FILTER_COMMON: number = -2;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesView.as::_model
    private _model: BadgesModel | null;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesView.as::_window
    private _window: IWindowContainer | null = null;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesView.as::_activeGrid
    // Derived name: obfuscated in the primary tree — the worn-badges grid.
    private _activeGrid: IItemGridWindow | null = null;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesView.as::_gridView
    private _gridView: BadgeGridView | null = null;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesView.as::_initialized
    private _initialized: boolean = false;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesView.as::_disposed
    private _disposed: boolean = false;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesView.as::_categoryFilter
    // Derived name: obfuscated in the primary tree.
    private _categoryFilter: number = BadgesView.FILTER_ALL;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesView.as::_ignoreBadgeFilterEvents
    private _ignoreBadgeFilterEvents: boolean = false;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesView.as::_rarityFilter
    // Derived name: obfuscated in the primary tree.
    private _rarityFilter: number = BadgesView.RARITY_FILTER_ALL;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesView.as::_rarityFilterIds
    // Derived name: obfuscated in the primary tree.
    private _rarityFilterIds: number[] = [BadgesView.RARITY_FILTER_ALL];
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesView.as::_ignoreBadgeRarityFilterEvents
    private _ignoreBadgeRarityFilterEvents: boolean = false;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesView.as::BadgesView()
    constructor(model: BadgesModel)
    {
        this._model = model;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesView.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesView.as::get isVisible()
    get isVisible(): boolean
    {
        return this._window !== null && this._window.parent !== null && this._window.visible;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesView.as::isStandaloneBadgeRarity()
    isStandaloneBadgeRarity(badgeRarityId: number): boolean
    {
        return this._model !== null && this._model.isStandaloneBadgeRarity(badgeRarityId);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesView.as::getWindowContainer()
    getWindowContainer(): IWindowContainer | null
    {
        if(!this._initialized) this.init();

        if(this._window === null || this._window.disposed) return null;

        return this._window;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesView.as::updateAll()
    updateAll(searchTerm: string | null = null): void
    {
        if(!this._initialized || this._model === null) return;

        this._model.forceSelection();

        const term = searchTerm ?? this.getSearchTerm();

        this.updateFilterOptions();
        this.updateListViews(term);
        this.updateActionView();
    }

    /**
	 * The right-hand panel: the wear/clear button, and the selected badge's details.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesView.as::updateActionView()
    updateActionView(): void
    {
        if(!this._initialized || this._model === null) return;

        if(this._window === null || this._window.disposed) return;

        // AS3 casts to its button interface purely for caption/enable/disable, all of which
        // IWindow already carries here.
        const button = this._window.findChildByName('wearBadge_button');

        if(button === null) return;

        const badge = this._model.getSelectedBadge();

        if(badge === null)
        {
            button.caption = '${inventory.badges.wearbadge}';
            button.disable();
            this.clearSelectedBadgeDetails();
            this.setBadgeImageVisible(false);

            return;
        }

        button.caption = badge.isInUse ? '${inventory.badges.clearbadge}' : '${inventory.badges.wearbadge}';

        this.updateSelectedBadgeDetails(badge);

        const badgeImage = this._window.findChildByName('badge_image');
        const widget = (badgeImage as unknown as IWidgetWindow | null)?.widget as IBadgeImageWidget | null;

        if(widget) widget.badgeId = badge.badgeId;

        this.setBadgeImageVisible(true);

        // AS3 disables wearing once the worn set is full, unless this badge is the one being
        // taken off.
        const worn = this._model.getBadges(1);

        if(worn.length >= this._model.maxActiveCount && !badge.isInUse) button.disable();
        else button.enable();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesView.as::clearSelectedBadgeDetails()
    private clearSelectedBadgeDetails(): void
    {
        this.setBadgeName(null);
        this.setTextDetail('badgeDescription', null, false);
        this.setBadgeRarityDetail(0, false);
        this.setTextDetail('badgeOwnerCount', null, false);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesView.as::updateSelectedBadgeDetails()
    private updateSelectedBadgeDetails(badge: Badge): void
    {
        this.setBadgeName(badge.name);
        this.setTextDetail('badgeDescription', badge.description, badge.description !== null && badge.description !== '');
        this.setBadgeRarityDetail(badge.badgeRarityId, true);
        this.setTextDetail(
            'badgeOwnerCount',
            this.localize('badge.owner_count', '', {count: BadgeLeaderboardUtils.formatOwnerCount(badge.ownerCount)}),
            BadgeLeaderboardUtils.shouldShowOwnerCount(badge.ownerCount)
        );
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesView.as::setBadgeImageVisible()
    private setBadgeImageVisible(visible: boolean): void
    {
        const badgeImage = this._window?.findChildByName('badge_image') ?? null;

        if(badgeImage !== null) badgeImage.visible = visible;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesView.as::init()
    private init(): void
    {
        this._window = this._model?.controller?.view?.getView('badges') as IWindowContainer | null ?? null;

        if(this._window === null)
        {
            log.warn('Badges tab window "badges" not found in the inventory layout');

            return;
        }

        this._window.procedure = this.windowEventProc;
        this._window.visible = false;

        this._window.findChildByName('wearBadge_button')?.addEventListener(WindowMouseEvent.CLICK, this.onWearBadgeClick);

        const inactive = this._window.findChildByName('inactive_items') as unknown as IItemGridWindow | null;
        const pages = this._window.findChildByName('item_grid_pages') as unknown as IItemListWindow | null;

        this._gridView = new BadgeGridView(this, inactive, pages);
        this._activeGrid = this._window.findChildByName('active_items') as unknown as IItemGridWindow | null;

        const filter = this._window.findChildByName('filter');

        if(filter !== null) filter.caption = '';

        const clearFilter = this._window.findChildByName('clear_filter_button');

        if(clearFilter !== null) clearFilter.visible = false;

        this.updateFilterOptions();

        this._initialized = true;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesView.as::updateListViews()
    private updateListViews(searchTerm: string | null): void
    {
        if(!this._initialized || this._model === null) return;

        if(this._window === null || this._window.disposed) return;

        this._activeGrid?.removeGridItems();

        this._gridView?.setFilter(this._categoryFilter, this._rarityFilter, searchTerm);
        this._gridView?.setItems(this._model.getBadges(0));

        for(const badge of this._model.getBadges(1))
        {
            const window = badge.window;

            if(window !== null) this._activeGrid?.addGridItem(window);
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesView.as::setBadgeName()
    private setBadgeName(name: string | null): void
    {
        if(this._window === null || this._window.disposed) return;

        const field = this._window.findChildByName('badgeName') as ITextWindow | null;

        if(field === null) return;

        // AS3 blanks the field first in both branches — a text window keeps its measured size
        // otherwise.
        field.text = '';

        if(name !== null) field.text = name;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesView.as::setTextDetail()
    private setTextDetail(name: string, text: string | null, visible: boolean, textColor: number = -1): void
    {
        if(this._window === null || this._window.disposed) return;

        const field = this._window.findChildByName(name) as ITextWindow | null;

        if(field === null) return;

        field.visible = visible;
        field.text = '';

        if(!visible) return;

        if(textColor >= 0) field.textColor = textColor;

        field.text = text ?? '';
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesView.as::setBadgeRarityDetail()
    private setBadgeRarityDetail(badgeRarityId: number, visible: boolean): void
    {
        if(this._window === null || this._window.disposed || this._model === null) return;

        const tag = this._window.findChildByName('badgeRarityTag');
        const border = this._window.findChildByName('badgeRarityBorder') as ITextWindow | null;
        const label = this._window.findChildByName('badgeRarity') as ITextWindow | null;

        if(tag === null || border === null || label === null) return;

        tag.visible = visible;
        border.visible = visible;
        border.text = '';
        label.visible = visible;
        label.text = '';

        if(!visible) return;

        label.textColor = 16777215;
        label.text = this.localize('badge.rarity.badge', '', {rarity: this.getBadgeRarityText(badgeRarityId)});
        border.text = label.text;
        tag.color = BadgeRarityEnum.getWhiteBackgroundTagColor(badgeRarityId, this._model.isUncommonBadgeRarityEnabled());
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesView.as::getBadgeRarityText()
    private getBadgeRarityText(badgeRarityId: number): string
    {
        const key = BadgeRarityEnum.getLabelLocalizationKey(badgeRarityId, this._model?.isUncommonBadgeRarityEnabled() ?? false);

        return this.localize(key, key);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesView.as::updateFilterOptions()
    private updateFilterOptions(): void
    {
        const options = this._window?.findChildByName('filter.options') as IDropMenuWindow | null;

        if(!options) return;

        const labels = [
            this.getBadgeFilterLabel(BadgesView.FILTER_ALL),
            this.getBadgeFilterLabel(BadgesView.FILTER_NORMAL_BADGES),
            this.getBadgeFilterLabel(BadgesView.FILTER_ACHIEVEMENTS)
        ];

        this._ignoreBadgeFilterEvents = true;

        try
        {
            options.populate(labels);
            options.selection = this._categoryFilter;
        }
        finally
        {
            this._ignoreBadgeFilterEvents = false;
        }

        this.updateRarityFilterOptions();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesView.as::updateRarityFilterOptions()
    private updateRarityFilterOptions(): void
    {
        const options = this._window?.findChildByName('filter.rarity') as IDropMenuWindow | null;

        if(!options) return;

        this._rarityFilterIds = this.getAvailableBadgeRarityFilterIds();

        if(!this._rarityFilterIds.includes(this._rarityFilter)) this._rarityFilter = BadgesView.RARITY_FILTER_ALL;

        if(!this.isBadgeRarityFilterEnabled()) this._rarityFilter = BadgesView.RARITY_FILTER_ALL;

        const labels = this._rarityFilterIds.map((id) => this.getBadgeRarityFilterLabel(id));

        this._ignoreBadgeRarityFilterEvents = true;

        try
        {
            options.populate(labels);
            options.selection = Math.max(0, this._rarityFilterIds.indexOf(this._rarityFilter));
        }
        finally
        {
            this._ignoreBadgeRarityFilterEvents = false;
        }

        if(this.isBadgeRarityFilterEnabled()) options.enable();
        else options.disable();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesView.as::windowEventProc()
    private windowEventProc = (event: WindowEvent, target: IWindow): void =>
    {
        if(event.type === WindowMouseEvent.CLICK)
        {
            if(target.name === 'clear_filter_button')
            {
                const filter = this._window?.findChildByName('filter');

                if(filter !== null && filter !== undefined) filter.caption = '';

                target.visible = false;
                this.updateAll(null);
            }

            return;
        }

        if(event.type === WindowKeyboardEvent.KEY_UP)
        {
            if(target.name !== 'filter') return;

            const clearFilter = this._window?.findChildByName('clear_filter_button') ?? null;
            const keyCode = (event as WindowKeyboardEvent).keyCode;

            if(clearFilter !== null) clearFilter.visible = target.caption.length > 0;

            // 27 escape, 13 enter — AS3's two literals.
            if(keyCode === 27)
            {
                target.caption = '';

                if(clearFilter !== null) clearFilter.visible = false;

                this.updateAll(null);
            }
            else if(keyCode === 13)
            {
                this.updateAll(target.caption);
            }

            return;
        }

        if(event.type === 'WE_SELECTED')
        {
            if(target.name === 'filter.options')
            {
                if(this._ignoreBadgeFilterEvents) return;

                const selected = this.getSelectedBadgeFilter(target as unknown as IDropMenuWindow);

                if(selected !== this._categoryFilter)
                {
                    this._categoryFilter = selected;
                    this.updateAll(null);
                }
            }
            else if(target.name === 'filter.rarity')
            {
                if(this._ignoreBadgeRarityFilterEvents) return;

                const selected = this.getSelectedBadgeRarityFilter(target as unknown as IDropMenuWindow);

                if(selected !== this._rarityFilter)
                {
                    this._rarityFilter = selected;
                    this.updateAll(null);
                }
            }
        }
    };

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesView.as::onWearBadgeClick()
    private onWearBadgeClick = (): void =>
    {
        const badge = this._model?.getSelectedBadge() ?? null;

        if(badge !== null) this._model?.toggleBadgeWearing(badge.badgeId);
    };

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesView.as::getSelectedBadgeFilter()
    private getSelectedBadgeFilter(options: IDropMenuWindow | null): number
    {
        if(options === null) return BadgesView.FILTER_ALL;

        const selection = options.selection;

        return selection < 0 || selection > BadgesView.FILTER_ACHIEVEMENTS ? BadgesView.FILTER_ALL : selection;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesView.as::getBadgeFilterLabel()
    private getBadgeFilterLabel(filter: number): string
    {
        switch(filter)
        {
            case BadgesView.FILTER_ALL:
                return this.localize('inventory.badges.filter.all');
            case BadgesView.FILTER_NORMAL_BADGES:
                return this.localize('inventory.badges.filter.normal_badges');
            case BadgesView.FILTER_ACHIEVEMENTS:
                return this.localize('inventory.badges.filter.achievements');
            default:
                return '';
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesView.as::getAvailableBadgeRarityFilterIds()
    private getAvailableBadgeRarityFilterIds(): number[]
    {
        const ids = this._model?.getAvailableRareBadgeRarityIds() ?? [];

        if(this._model?.hasCommonBadgeRarityGroup() ?? false) ids.unshift(BadgesView.RARITY_FILTER_COMMON);

        ids.unshift(BadgesView.RARITY_FILTER_ALL);

        return ids;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesView.as::getSelectedBadgeRarityFilter()
    private getSelectedBadgeRarityFilter(options: IDropMenuWindow | null): number
    {
        if(options === null || this._rarityFilterIds.length === 0) return BadgesView.RARITY_FILTER_ALL;

        let selection = options.selection;

        if(selection < 0 || selection >= this._rarityFilterIds.length) selection = 0;

        return this._rarityFilterIds[selection];
    }

    /**
	 * The rarity drop-down is only worth offering once there is more than "all" and "common".
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesView.as::isBadgeRarityFilterEnabled()
    private isBadgeRarityFilterEnabled(): boolean
    {
        return this._rarityFilterIds.length > 2;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesView.as::getBadgeRarityFilterLabel()
    private getBadgeRarityFilterLabel(rarityId: number): string
    {
        if(rarityId === BadgesView.RARITY_FILTER_ALL) return this.localize('inventory.badges.filter.rarity.all');

        if(rarityId === BadgesView.RARITY_FILTER_COMMON) return this.localize('inventory.badges.filter.rarity.common');

        const key = BadgeRarityEnum.getLocalizationKey(rarityId, this._model?.isUncommonBadgeRarityEnabled() ?? false);

        return key.length > 0 ? this.localize(key, key) : '';
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesView.as::getSearchTerm()
    private getSearchTerm(): string
    {
        if(this._window === null || this._window.disposed) return '';

        const filter = this._window.findChildByName('filter') as ITextWindow | null;

        return filter !== null ? filter.caption : '';
    }

    // TS-only: AS3 reaches the localization manager through `_model.controller.localization` at
    // every call site; folded into one helper so the null-checks are written once.
    private localize(key: string, fallback: string = '', params: Record<string, string> | null = null): string
    {
        const localization = this._model?.controller?.localization ?? null;

        if(localization === null) return fallback;

        if(params === null) return localization.getLocalization(key, fallback);

        const [name] = Object.keys(params);

        return localization.getLocalizationWithParams(key, fallback, name, params[name]);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesView.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;
        this._model = null;

        if(this._gridView !== null)
        {
            this._gridView.dispose();
            this._gridView = null;
        }

        this._activeGrid = null;

        if(this._window !== null)
        {
            this._window.dispose();
            this._window = null;
        }
    }
}
