import type {IDisposable} from '@core/runtime';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';

import type {HabbiconController} from './HabbiconController';
import type {HabbiconEntryModel} from './HabbiconEntryModel';
import type {HabbiconSetModel} from './HabbiconSetModel';
import {HabbiconTabMode} from './HabbiconTabMode';
import {HabbiconCollectionTrayGroupView} from './HabbiconCollectionTrayGroupView';
import type {HabbiconTileView} from './HabbiconTileView';

/**
 * The owned and favourited tabs: the player's habbicons grouped by collection.
 *
 * Both tabs share this one view, told apart only by the mode string handed to `refresh()`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/habbicons/HabbiconCollectionTrayView.as
 */
export class HabbiconCollectionTrayView implements IDisposable
{
    // AS3: HabbiconCollectionTrayView.as::_SafeStr_4593 (name derived: the owning controller)
    private _controller: HabbiconController | null;

    // AS3: HabbiconCollectionTrayView.as::_window
    private _window: IWindowContainer | null;

    // AS3: HabbiconCollectionTrayView.as::_SafeStr_6891 (name derived: the group template)
    private _groupTemplate: IWindowContainer | null;

    // AS3: HabbiconCollectionTrayView.as::_SafeStr_6757 (name derived: the tile template)
    private _tileTemplate: IWindowContainer | null;

    // AS3: HabbiconCollectionTrayView.as::_SafeStr_7482 (name derived: the tile-click callback)
    private _onTileClicked: ((tile: HabbiconTileView) => void) | null;

    // AS3: HabbiconCollectionTrayView.as::_SafeStr_6463 (name derived: the live group views)
    private _groups: HabbiconCollectionTrayGroupView[] = [];

    // AS3: HabbiconCollectionTrayView.as::_disposed
    private _disposed: boolean = false;

    // AS3: HabbiconCollectionTrayView.as::HabbiconCollectionTrayView()
    constructor(
        controller: HabbiconController | null,
        window: IWindowContainer | null,
        groupTemplate: IWindowContainer | null,
        tileTemplate: IWindowContainer | null,
        onTileClicked: ((tile: HabbiconTileView) => void) | null
    )
    {
        this._controller = controller;
        this._window = window;
        this._groupTemplate = groupTemplate;
        this._tileTemplate = tileTemplate;
        this._onTileClicked = onTileClicked;

        this.removeTemplatesFromLayout();
    }

    /**
	 * Scroll is reset to the top on every refresh, so switching tabs never lands mid-list.
	 */
    // AS3: HabbiconCollectionTrayView.as::refresh()
    refresh(mode: string, groups: HabbiconSetModel[] | null): void
    {
        this.clearGroupViews();

        const favourited = mode === HabbiconTabMode.FAVOURITED;
        const title = this.trayTitle;
        const summary = this.traySummary;
        const list = this.trayGroupList;

        if(title !== null)
        {
            title.text = favourited ? '${habbicon_book.tab.favourited}' : '${habbicon_book.tab.owned}';
        }

        if(summary !== null) summary.text = this.resolveSummaryText(favourited, groups);

        if(groups !== null && this._groupTemplate !== null && list !== null)
        {
            for(const group of groups)
            {
                if(group === null) continue;

                const view = new HabbiconCollectionTrayGroupView(
                    this._groupTemplate, this._tileTemplate, this._controller, this._onTileClicked
                );

                view.initialize(group);

                const window = view.window;

                if(window !== null) list.addListItem(window as unknown as IWindow);

                this._groups.push(view);
            }
        }

        if(list !== null) list.scrollV = 0;

        if(this._window !== null) (this._window as unknown as IWindow).visible = true;
    }

    // AS3: HabbiconCollectionTrayView.as::refreshEntry()
    refreshEntry(entry: HabbiconEntryModel | null): void
    {
        if(entry === null) return;

        for(const group of this._groups)
        {
            if(HabbiconCollectionTrayView.matchesEntryGroup(group.group, entry))
            {
                group.refreshEntry(entry);

                return;
            }
        }
    }

    // AS3: HabbiconCollectionTrayView.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: HabbiconCollectionTrayView.as::clearGroupViews()
    private clearGroupViews(): void
    {
        for(const group of this._groups)
        {
            group.dispose();
        }

        this._groups.length = 0;
    }

    // AS3: HabbiconCollectionTrayView.as::removeTemplatesFromLayout()
    private removeTemplatesFromLayout(): void
    {
        const list = this.trayGroupList;

        if(list === null || this._groupTemplate === null) return;

        if(list.getListItemIndex(this._groupTemplate as unknown as IWindow) > -1)
        {
            list.removeListItem(this._groupTemplate as unknown as IWindow);
        }
    }

    // AS3: HabbiconCollectionTrayView.as::resolveSummaryText()
    private resolveSummaryText(favourited: boolean, groups: HabbiconSetModel[] | null): string
    {
        if(groups === null || groups.length === 0)
        {
            return favourited ? '${habbicon_book.tray.empty.favourited}' : '${habbicon_book.tray.empty.owned}';
        }

        return this._controller?.localizationManager?.getLocalizationWithParams(
            favourited ? 'habbicon_book.tray.favourited.summary' : 'habbicon_book.tray.owned.summary',
            '',
            'count', String(HabbiconCollectionTrayView.countEntries(groups))
        ) ?? '';
    }

    // AS3: HabbiconCollectionTrayView.as::countEntries()
    private static countEntries(groups: HabbiconSetModel[]): number
    {
        let count = 0;

        for(const group of groups)
        {
            if(group === null) continue;

            count += group.habbicons.length;
        }

        return count;
    }

    /**
	 * The favourites tab is one synthetic group with no collection id, so matching falls through to
	 * the title comparison — which is why the group carries a localized title rather than a key.
	 */
    // AS3: HabbiconCollectionTrayView.as::matchesEntryGroup()
    private static matchesEntryGroup(group: HabbiconSetModel | null, entry: HabbiconEntryModel): boolean
    {
        if(group === null) return false;

        if(group.collectionId === entry.collectionId) return true;

        return entry.collectionTitle !== null && group.title === entry.collectionTitle;
    }

    // AS3: HabbiconCollectionTrayView.as::get trayTitle()
    private get trayTitle(): ITextWindow | null
    {
        return (this._window?.findChildByName('tray_title') as ITextWindow | null) ?? null;
    }

    // AS3: HabbiconCollectionTrayView.as::get traySummary()
    private get traySummary(): ITextWindow | null
    {
        return (this._window?.findChildByName('tray_summary') as ITextWindow | null) ?? null;
    }

    // AS3: HabbiconCollectionTrayView.as::get trayGroupList()
    private get trayGroupList(): IItemListWindow | null
    {
        return (this._window?.findChildByName('tray_group_list') as IItemListWindow | null) ?? null;
    }

    // AS3: HabbiconCollectionTrayView.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this.clearGroupViews();

        this._controller = null;
        this._window = null;
        this._groupTemplate = null;
        this._tileTemplate = null;
        this._onTileClicked = null;
        this._groups = [];
        this._disposed = true;
    }
}
