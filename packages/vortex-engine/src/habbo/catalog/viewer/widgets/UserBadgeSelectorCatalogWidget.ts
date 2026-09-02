import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemGridWindow} from '@core/window/components/IItemGridWindow';
import type {ITextFieldWindow} from '@core/window/components/ITextFieldWindow';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {WindowKeyboardEvent} from '@core/window/events/WindowKeyboardEvent';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import {BadgesMessageEvent} from '@habbo/communication/messages/incoming/inventory/badges/BadgesMessageEvent';
import type {IBadgeImageWidget} from '@habbo/window/widgets/IBadgeImageWidget';
// The room-object tree's IStuffData, not `habbo/inventory/items`' — the two are incompatible at
// runtime, and `SetRoomPreviewerStuffDataEvent` takes this one.
import type {IStuffData} from '@habbo/room/object/data/IStuffData';
import {StringArrayStuffData} from '@habbo/room/object/data/StringArrayStuffData';
import type {HabboCatalog} from '../../HabboCatalog';
import {CatalogWidgetEvent} from './events/CatalogWidgetEvent';
import {SelectProductEvent} from './events/SelectProductEvent';
import {SetExtraPurchaseParameterEvent} from './events/SetExtraPurchaseParameterEvent';
import {SetRoomPreviewerStuffDataEvent} from './events/SetRoomPreviewerStuffDataEvent';
import {CatalogWidget} from './CatalogWidget';

/**
 * The badge-display page's picker: a grid of every badge the player owns, minus the codes listed
 * in `badge.display.excluded.badgeCodes`, with a search box over badge code, name and description.
 * The selected badge becomes the purchase's extra parameter and is pushed into the room previewer
 * as a four-slot `StringArrayStuffData`, so the furni preview shows the badge that will be on it.
 *
 * The grid is rebuilt from scratch on every filter change, and the selection is re-applied
 * afterwards by index — the item windows do not survive `destroyGridItems()`.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/UserBadgeSelectorCatalogWidget.as
 */
export class UserBadgeSelectorCatalogWidget extends CatalogWidget
{
    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/UserBadgeSelectorCatalogWidget.as::BADGE_GRID_ITEM_NAME
    private static readonly BADGE_GRID_ITEM_NAME: string = 'badgeGridItem';

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/UserBadgeSelectorCatalogWidget.as::MAX_SEARCH_STRING_LENGTH
    private static readonly MAX_SEARCH_STRING_LENGTH: number = 40;

    // AS3 raises this by its literal string; `CatalogWidgetEvent` declares only WIDGETS_INITIALIZED,
    // and the two widgets that already use this one spell it out the same way.
    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/events/CatalogWidgetEventEnum.as::EXTRA_PARAM_REQUIRED_FOR_BUY
    private static readonly CWE_EXTRA_PARAM_REQUIRED_FOR_BUY = 'CWE_EXTRA_PARAM_REQUIRED_FOR_BUY';

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/UserBadgeSelectorCatalogWidget.as::_itemGrid
    private _itemGrid: IItemGridWindow | null = null;

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/UserBadgeSelectorCatalogWidget.as::_catalog
    private _catalog: HabboCatalog | null;

    // The chosen badge code. Name DERIVED — `_SafeStr_4782` is obfuscated in every tree.
    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/UserBadgeSelectorCatalogWidget.as::_SafeStr_4782
    private _selectedBadgeCode: string | null = null;

    // Name DERIVED — `_SafeStr_7894`, the badges-updated listener.
    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/UserBadgeSelectorCatalogWidget.as::_SafeStr_7894
    private _badgesUpdatedEvent: IMessageEvent | null = null;

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/UserBadgeSelectorCatalogWidget.as::_excludedBadges
    private _excludedBadges: string[] | null;

    // Every badge the player owns. Name DERIVED — `_SafeStr_5733`.
    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/UserBadgeSelectorCatalogWidget.as::_SafeStr_5733
    private _allBadgeCodes: string[] | null = null;

    // The subset the search currently shows, and the grid's index space. Name DERIVED — `_SafeStr_4999`.
    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/UserBadgeSelectorCatalogWidget.as::_SafeStr_4999
    private _visibleBadgeCodes: string[] | null = null;

    // Name DERIVED — `_SafeStr_7012`, the normalised search term.
    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/UserBadgeSelectorCatalogWidget.as::_SafeStr_7012
    private _searchText: string = '';

    // code → "code name description", lowercased once. Name DERIVED — `_SafeStr_6795`.
    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/UserBadgeSelectorCatalogWidget.as::_SafeStr_6795
    private _badgeSearchCache: Record<string, string> | null = null;

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/UserBadgeSelectorCatalogWidget.as::UserBadgeSelectorCatalogWidget()
    constructor(window: IWindowContainer, catalog: HabboCatalog)
    {
        super(window);

        this._catalog = catalog;
        this._excludedBadges = catalog.getProperty('badge.display.excluded.badgeCodes').split(',');
    }

    /**
     * AS3 never calls `super.init()` here — alone among the widgets — so the base class's own
     * set-up does not run for this one. Transcribed as it stands; adding the call would change
     * which layout the widget attaches.
     */
    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/UserBadgeSelectorCatalogWidget.as::init()
    override init(): boolean
    {
        this._itemGrid = this.window.findChildByName('badgeGrid') as unknown as IItemGridWindow | null;
        this.window.procedure = this.onWidgetEvent;

        this.refreshBadgeData();
        this.applyBadgeFilter(false);
        this.updateSearchUiState();

        this.events.on(CatalogWidgetEvent.WIDGETS_INITIALIZED, this.onWidgetsInitialized);

        this._badgesUpdatedEvent = new BadgesMessageEvent(this.onUserBadgesUpdated);
        this._catalog?.connection?.addMessageEvent(this._badgesUpdatedEvent);

        return true;
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/UserBadgeSelectorCatalogWidget.as::refreshBadgeData()
    private refreshBadgeData(): void
    {
        const badgeCodes = this._catalog?.inventory?.getAllMyBadgeIds(this._excludedBadges) ?? [];

        this._allBadgeCodes = badgeCodes;

        if(this._selectedBadgeCode != null && badgeCodes.indexOf(this._selectedBadgeCode) === -1)
        {
            this._selectedBadgeCode = null;
        }

        this.rebuildBadgeSearchCache();
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/UserBadgeSelectorCatalogWidget.as::rebuildBadgeSearchCache()
    private rebuildBadgeSearchCache(): void
    {
        this._badgeSearchCache = {};

        for(const code of this._allBadgeCodes ?? [])
        {
            this._badgeSearchCache[code] = this.buildBadgeSearchText(code);
        }
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/UserBadgeSelectorCatalogWidget.as::resetBadgeSelectorGrid()
    private resetBadgeSelectorGrid(): void
    {
        if(this._itemGrid == null) return;

        this._itemGrid.destroyGridItems();

        let index = 0;

        for(const code of this._visibleBadgeCodes ?? [])
        {
            const item = this.createGridItem(code, index++);

            if(item) this._itemGrid.addGridItem(item as unknown as IWindow);
        }

        this.restoreSelectionState();
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/UserBadgeSelectorCatalogWidget.as::onWidgetsInitialized()
    private onWidgetsInitialized = (_event: CatalogWidgetEvent): void =>
    {
        if(this.page.offers.length === 0) return;

        this.events.emit(
            UserBadgeSelectorCatalogWidget.CWE_EXTRA_PARAM_REQUIRED_FOR_BUY,
            new CatalogWidgetEvent(UserBadgeSelectorCatalogWidget.CWE_EXTRA_PARAM_REQUIRED_FOR_BUY)
        );
        this.events.emit(SelectProductEvent.SELECT_PRODUCT, new SelectProductEvent(this.page.offers[0]));
    };

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/UserBadgeSelectorCatalogWidget.as::createGridItem()
    protected createGridItem(badgeCode: string, index: number): IWindowContainer | null
    {
        const item = this._catalog?.windowManager?.buildWidgetLayout('badgeGridItem') as unknown as IWindowContainer | null;

        if(item == null) return null;

        const badgeWindow = item.findChildByName('badgeWidget') as unknown as IWidgetWindow | null;
        const badgeWidget = badgeWindow?.widget as IBadgeImageWidget | null;

        if(badgeWidget)
        {
            badgeWidget.type = 'normal';
            badgeWidget.badgeId = badgeCode;
        }

        item.id = index;
        item.name = UserBadgeSelectorCatalogWidget.BADGE_GRID_ITEM_NAME;
        item.procedure = this.badgeGridItemWindowProc;

        return item;
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/UserBadgeSelectorCatalogWidget.as::setBadgeGridItemSelectionBg()
    private setBadgeGridItemSelectionBg(index: number, selected: boolean): void
    {
        const item = this._itemGrid?.getGridItemAt(index) as unknown as IWindowContainer | null;
        const background = item?.findChildByName('bg');

        if(background) background.style = selected ? 0 : 2;
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/UserBadgeSelectorCatalogWidget.as::restoreSelectionState()
    private restoreSelectionState(): void
    {
        if(this._selectedBadgeCode == null || this._visibleBadgeCodes == null) return;

        const index = this._visibleBadgeCodes.indexOf(this._selectedBadgeCode);

        if(index >= 0) this.setBadgeGridItemSelectionBg(index, true);
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/UserBadgeSelectorCatalogWidget.as::clearSelectedBadge()
    private clearSelectedBadge(announce: boolean = true): void
    {
        if(this._selectedBadgeCode != null && this._visibleBadgeCodes != null)
        {
            const index = this._visibleBadgeCodes.indexOf(this._selectedBadgeCode);

            if(index >= 0) this.setBadgeGridItemSelectionBg(index, false);
        }

        this._selectedBadgeCode = null;

        if(announce)
        {
            this.events.emit(SetExtraPurchaseParameterEvent.CWE_SET_EXTRA_PARM, new SetExtraPurchaseParameterEvent(''));
            this.page.dispatchWidgetEvent(new SetRoomPreviewerStuffDataEvent(this.getPreviewerStuffData('')));
        }
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/UserBadgeSelectorCatalogWidget.as::setSelectedBadgeByIndex()
    private setSelectedBadgeByIndex(index: number): void
    {
        if(this._visibleBadgeCodes == null || index < 0 || index >= this._visibleBadgeCodes.length) return;

        if(this._selectedBadgeCode != null && this._visibleBadgeCodes.indexOf(this._selectedBadgeCode) >= 0)
        {
            this.setBadgeGridItemSelectionBg(this._visibleBadgeCodes.indexOf(this._selectedBadgeCode), false);
        }

        this._selectedBadgeCode = this._visibleBadgeCodes[index];
        this.setBadgeGridItemSelectionBg(index, true);

        this.events.emit(
            SetExtraPurchaseParameterEvent.CWE_SET_EXTRA_PARM,
            new SetExtraPurchaseParameterEvent(this._selectedBadgeCode)
        );
        this.page.dispatchWidgetEvent(
            new SetRoomPreviewerStuffDataEvent(this.getPreviewerStuffData(this._selectedBadgeCode))
        );
    }

    /**
     * The click lands on whatever child of the row was under the pointer, so the row itself is
     * found by walking up to the first window named `badgeGridItem`.
     */
    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/UserBadgeSelectorCatalogWidget.as::getBadgeGridItemWindow()
    private getBadgeGridItemWindow(window: IWindow | null): IWindowContainer | null
    {
        let current = window;

        while(current != null)
        {
            if(current.name === UserBadgeSelectorCatalogWidget.BADGE_GRID_ITEM_NAME)
            {
                return current as unknown as IWindowContainer;
            }

            current = current.parent;
        }

        return null;
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/UserBadgeSelectorCatalogWidget.as::badgeGridItemWindowProc()
    private badgeGridItemWindowProc = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        const item = this.getBadgeGridItemWindow(window);

        if(item != null) this.setSelectedBadgeByIndex(item.id);
    };

    /**
     * Slot 0 is the badge-display furni's state, slot 1 the badge code; the last two are unused
     * and shipped empty.
     */
    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/UserBadgeSelectorCatalogWidget.as::getPreviewerStuffData()
    private getPreviewerStuffData(badgeCode: string | null): IStuffData
    {
        const stuffData = new StringArrayStuffData();

        stuffData.setArray(['0', badgeCode ?? '', '', '']);

        return stuffData;
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/UserBadgeSelectorCatalogWidget.as::onWidgetEvent()
    private onWidgetEvent = (event: WindowEvent, window: IWindow): void =>
    {
        const target = window ?? (event.target as IWindow | null);

        if(event.type === 'WME_CLICK')
        {
            if(target != null && target.name === 'search_placeholder')
            {
                this.focusSearchInput();
            }
            else if(target != null
                && (target.name === 'cancel_search_btn'
                    || (target.parent != null && target.parent.name === 'cancel_search_btn')))
            {
                this.clearSearch();
            }
        }
        else if(event.type === 'WE_CHANGE')
        {
            const input = target as unknown as ITextFieldWindow | null;

            if(input == null || input.name !== 'search_input') return;

            if(input.text.length > UserBadgeSelectorCatalogWidget.MAX_SEARCH_STRING_LENGTH)
            {
                input.text = input.text.substr(0, UserBadgeSelectorCatalogWidget.MAX_SEARCH_STRING_LENGTH);
            }

            this.resetHorizontalScroll(input);
            this._searchText = UserBadgeSelectorCatalogWidget.normalizeSearchText(input.text);
            this.applyBadgeFilter();
            this.updateSearchUiState();
        }
        else if(event.type === 'WKE_KEY_DOWN')
        {
            if(target != null && target.name === 'search_input')
            {
                const keyboardEvent = event as WindowKeyboardEvent;

                if(keyboardEvent?.keyCode === 27) this.clearSearch();
            }
        }
    };

    /**
     * `scrollH` lives on `IScrollableWindow` in this port, not on `ITextFieldWindow` as it does in
     * AS3 — the text controller implements it, but the interface the search box is typed as does
     * not declare it.
     */
    // AS3: .../src/com/sulake/core/window/components/IScrollableWindow.as::set scrollH()
    private resetHorizontalScroll(input: ITextFieldWindow): void
    {
        (input as unknown as {scrollH?: number}).scrollH = 0;
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/UserBadgeSelectorCatalogWidget.as::focusSearchInput()
    private focusSearchInput(): void
    {
        const input = this.window.findChildByName('search_input') as unknown as ITextFieldWindow | null;

        if(input == null) return;

        input.focus();
        input.setSelection(0, input.text.length);
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/UserBadgeSelectorCatalogWidget.as::clearSearch()
    private clearSearch(): void
    {
        const input = this.window.findChildByName('search_input') as unknown as ITextFieldWindow | null;

        if(input != null)
        {
            input.text = '';
            this.resetHorizontalScroll(input);
        }

        this._searchText = '';
        this.applyBadgeFilter();
        this.updateSearchUiState();
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/UserBadgeSelectorCatalogWidget.as::applyBadgeFilter()
    private applyBadgeFilter(clearSelectionWhenFilteredOut: boolean = true): void
    {
        this._visibleBadgeCodes = [];

        for(const code of this._allBadgeCodes ?? [])
        {
            if(this.matchesSearch(code)) this._visibleBadgeCodes.push(code);
        }

        if(clearSelectionWhenFilteredOut
            && this._selectedBadgeCode != null
            && this._visibleBadgeCodes.indexOf(this._selectedBadgeCode) === -1)
        {
            this.clearSelectedBadge();
        }

        this.resetBadgeSelectorGrid();
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/UserBadgeSelectorCatalogWidget.as::matchesSearch()
    private matchesSearch(badgeCode: string): boolean
    {
        if(this._searchText === '') return true;

        const searchText = this._badgeSearchCache?.[badgeCode];

        return searchText != null && searchText.indexOf(this._searchText) >= 0;
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/UserBadgeSelectorCatalogWidget.as::buildBadgeSearchText()
    private buildBadgeSearchText(badgeCode: string): string
    {
        const localization = this._catalog?.localization;

        if(badgeCode == null || localization == null) return '';

        return UserBadgeSelectorCatalogWidget.normalizeSearchText(
            `${badgeCode} ${localization.getBadgeName(badgeCode)} ${localization.getBadgeDesc(badgeCode)}`
        );
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/UserBadgeSelectorCatalogWidget.as::normalizeSearchText()
    private static normalizeSearchText(text: string | null): string
    {
        return text == null ? '' : text.toLowerCase();
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/UserBadgeSelectorCatalogWidget.as::updateSearchUiState()
    private updateSearchUiState(): void
    {
        const input = this.window.findChildByName('search_input') as unknown as ITextFieldWindow | null;
        const placeholder = this.window.findChildByName('search_placeholder');
        const cancelButton = this.window.findChildByName('cancel_search_btn');
        const hasText = input != null && input.text.length > 0;

        if(placeholder) placeholder.visible = !hasText;
        if(cancelButton) cancelButton.visible = hasText;
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/UserBadgeSelectorCatalogWidget.as::onUserBadgesUpdated()
    private onUserBadgesUpdated = (_event: IMessageEvent): void =>
    {
        this.refreshBadgeData();
        this.applyBadgeFilter();
        this.updateSearchUiState();
    };

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/UserBadgeSelectorCatalogWidget.as::dispose()
    override dispose(): void
    {
        if(this.disposed) return;

        if(this._badgesUpdatedEvent) this._catalog?.connection?.removeMessageEvent(this._badgesUpdatedEvent);

        this.events.off(CatalogWidgetEvent.WIDGETS_INITIALIZED, this.onWidgetsInitialized);

        this._catalog = null;
        this._excludedBadges = null;
        this._allBadgeCodes = null;
        this._visibleBadgeCodes = null;
        this._badgeSearchCache = null;
        this._selectedBadgeCode = null;
        super.dispose();
    }
}
