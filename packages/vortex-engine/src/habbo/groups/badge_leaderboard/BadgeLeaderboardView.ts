/**
 * BadgeLeaderboardView — the leaderboard window: a filter dropdown, ten rows, a pinned "your rank"
 * row underneath, and a two-button pager.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/badge_leaderboard/BadgeLeaderboardView.as
 *
 * All ten row views are built once and then only shown or hidden — the controller never adds or
 * removes list items, it fills the ones that have data and hides the rest. The pinned row wraps
 * `own_container` itself rather than a clone, which is why it is constructed with `ownsWindow`
 * false.
 *
 * The title is five text windows, not one: four shadow copies behind the real one, all set
 * together by `setTitle()`.
 */
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IFrameWindow} from '@core/window/components/IFrameWindow';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IRegionWindow} from '@core/window/components/IRegionWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IDropMenuWindow} from '@core/window/components/IDropMenuWindow';
import type {IInteractiveWindow} from '@core/window/components/IInteractiveWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import {Logger} from '@core/utils/Logger';
import type {BadgeLeaderboardController} from './BadgeLeaderboardController';
import {BadgeLeaderboardEntryView} from './BadgeLeaderboardEntryView';

const log = Logger.getLogger('habbo.groups.badge_leaderboard.BadgeLeaderboardView');

export class BadgeLeaderboardView
{
    // AS3: BadgeLeaderboardView.as::DESKTOP_WINDOW_LAYER
    public static readonly DESKTOP_WINDOW_LAYER: number = 1;

    /** AS3's literal `10` in `createWindow()` — one row view per leaderboard page slot. */
    // AS3: BadgeLeaderboardView.as::createWindow()
    private static readonly ENTRY_COUNT: number = 10;

    // AS3: BadgeLeaderboardView.as::_disposed
    private _disposed: boolean = false;

    /** Derived name — `_SafeStr_4593`: the controller that drives this view. */
    // AS3: BadgeLeaderboardView.as::_SafeStr_4593
    private _controller: BadgeLeaderboardController | null;

    // AS3: BadgeLeaderboardView.as::_windowManager
    private _windowManager: IHabboWindowManager | null;

    // AS3: BadgeLeaderboardView.as::_window
    private _window: IFrameWindow | null = null;

    /** Derived name — `_SafeStr_6060`: the pinned own-rank row. */
    // AS3: BadgeLeaderboardView.as::_SafeStr_6060
    private _ownEntryView: BadgeLeaderboardEntryView | null = null;

    /** Derived name — `_SafeStr_6411`: the row template lifted out of the list. */
    // AS3: BadgeLeaderboardView.as::_SafeStr_6411
    private _entryTemplate: IWindowContainer | null = null;

    /** Derived name — `_SafeStr_5826`: the ten row views. */
    // AS3: BadgeLeaderboardView.as::_SafeStr_5826
    private _entryViews: BadgeLeaderboardEntryView[] = [];

    /** Derived name — `_SafeStr_9453`: the header image's designed `y`, offsets are added to it. */
    // AS3: BadgeLeaderboardView.as::_SafeStr_9453
    private _rankTypeExtendedImageBaseY: number = 0;

    // AS3: BadgeLeaderboardView.as::BadgeLeaderboardView()
    constructor(controller: BadgeLeaderboardController, windowManager: IHabboWindowManager)
    {
        this._controller = controller;
        this._windowManager = windowManager;

        this.createWindow();
        this.hide();
    }

    // AS3: BadgeLeaderboardView.as::createWindow()
    private createWindow(): void
    {
        if(this._window !== null || this._windowManager === null) return;

        const layout = this._controller?.assets?.getAssetByName('badge_leaderboard_view')?.content ?? null;

        if(layout === null)
        {
            log.warn('badge_leaderboard_view is not in the asset library — the leaderboard cannot be built.');

            return;
        }

        this._window = this._windowManager.buildFromXML(
            layout as Document, BadgeLeaderboardView.DESKTOP_WINDOW_LAYER
        ) as IFrameWindow | null;

        if(this._window === null) return;

        this._rankTypeExtendedImageBaseY = (this.rankTypeExtendedImage as unknown as IWindow | null)?.y ?? 0;

        const closeButton = this.closeButton;

        if(closeButton) closeButton.procedure = this.onClose;

        const dropdownRegion = this.dropdownRegion as unknown as IWindow | null;
        const dropdownOpener = this.dropdownOpener as unknown as IWindow | null;
        const hiddenDropdown = this.hiddenDropdown as unknown as IWindow | null;

        if(dropdownRegion) dropdownRegion.procedure = this.onDropdownOpen;
        if(dropdownOpener) dropdownOpener.procedure = this.onDropdownOpen;
        if(hiddenDropdown) hiddenDropdown.procedure = this.onDropdownSelection;

        const previousButton = this.previousButton as unknown as IWindow | null;
        const nextButton = this.nextButton as unknown as IWindow | null;

        if(previousButton) previousButton.procedure = this.onPreviousPage;
        if(nextButton) nextButton.procedure = this.onNextPage;

        const rankingList = this.rankingList;

        if(rankingList === null) return;

        this._entryTemplate = rankingList.getListItemByName('entry_template') as IWindowContainer | null;

        if(this._entryTemplate !== null)
        {
            rankingList.removeListItem(this._entryTemplate);
        }

        this._entryViews = [];

        for(let index = 0; index < BadgeLeaderboardView.ENTRY_COUNT; index++)
        {
            if(this._entryTemplate === null) break;

            const view = new BadgeLeaderboardEntryView(this._entryTemplate.clone() as IWindowContainer);
            const region = view.profileRegion as unknown as IWindow | null;

            if(region)
            {
                region.id = index;
                region.procedure = this.onProfileClicked;
            }

            if(view.window)
            {
                view.window.visible = false;
                rankingList.addListItem(view.window);
            }

            this._entryViews.push(view);
        }

        const ownContainer = this.ownContainer;

        if(ownContainer === null) return;

        // Not a clone, and not owned: `own_container` belongs to the layout.
        this._ownEntryView = new BadgeLeaderboardEntryView(ownContainer, false, 'rank_own');

        const ownRegion = this._ownEntryView.profileRegion as unknown as IWindow | null;

        if(ownRegion)
        {
            ownRegion.id = -1;
            ownRegion.procedure = this.onProfileClicked;
        }

        ownContainer.visible = false;
    }

    // AS3: BadgeLeaderboardView.as::onClose()
    private onClose = (event: WindowEvent): void =>
    {
        if(event.type === 'WME_CLICK')
        {
            this.hide();
        }
    };

    // AS3: BadgeLeaderboardView.as::onDropdownOpen()
    private onDropdownOpen = (event: WindowEvent): void =>
    {
        if(event.type === 'WME_CLICK')
        {
            this._controller?.onDropdownOpenClicked();
        }
    };

    // AS3: BadgeLeaderboardView.as::onDropdownSelection()
    private onDropdownSelection = (event: WindowEvent): void =>
    {
        if(event.type === 'WE_SELECTED')
        {
            this._controller?.onDropdownSelectionChanged(this.hiddenDropdown?.selection ?? 0);
        }
    };

    // AS3: BadgeLeaderboardView.as::onPreviousPage()
    private onPreviousPage = (event: WindowEvent): void =>
    {
        if(event.type === 'WME_CLICK')
        {
            this._controller?.onPreviousPageClicked();
        }
    };

    // AS3: BadgeLeaderboardView.as::onNextPage()
    private onNextPage = (event: WindowEvent): void =>
    {
        if(event.type === 'WME_CLICK')
        {
            this._controller?.onNextPageClicked();
        }
    };

    // AS3: BadgeLeaderboardView.as::onProfileClicked()
    private onProfileClicked = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type === 'WME_CLICK')
        {
            this._controller?.onProfileRegionClicked(window.id);
        }
    };

    /**
     * The procedure is detached around `populate()`/`selection`, because setting the selection
     * dispatches `WE_SELECTED` and would re-enter the controller with the option it just chose.
     */
    // AS3: BadgeLeaderboardView.as::setDropdownOptions()
    public setDropdownOptions(options: string[], selection: number): void
    {
        const dropdown = this.hiddenDropdown;
        const dropdownWindow = dropdown as unknown as IWindow | null;

        if(dropdown === null || dropdownWindow === null) return;

        dropdownWindow.procedure = null;
        dropdown.populate(options);
        dropdown.selection = selection;
        dropdownWindow.procedure = this.onDropdownSelection;
    }

    // AS3: BadgeLeaderboardView.as::setFrameStyle()
    public setFrameStyle(style: number): void
    {
        const window = this._window as unknown as IWindow | null;

        if(window !== null && window.style !== style)
        {
            window.style = style;
        }
    }

    // AS3: BadgeLeaderboardView.as::openDropdownMenu()
    public openDropdownMenu(): void
    {
        this.hiddenDropdown?.openMenu();
        (this.hiddenDropdown as unknown as IWindow | null)?.activate();
    }

    // AS3: BadgeLeaderboardView.as::setTitle()
    public setTitle(title: string): void
    {
        for(const text of this.titleTexts)
        {
            if(text) text.text = title;
        }
    }

    // AS3: BadgeLeaderboardView.as::setInfo()
    public setInfo(assetUri: string, info: string): void
    {
        const image = this.rankTypeExtendedImage;
        const text = this.rankTypeInfoText;

        if(image) image.assetUri = assetUri;
        if(text) text.text = info;
    }

    // AS3: BadgeLeaderboardView.as::setRankTypeExtendedImageYOffset()
    public setRankTypeExtendedImageYOffset(offset: number): void
    {
        const image = this.rankTypeExtendedImage as unknown as IWindow | null;

        if(image) image.y = this._rankTypeExtendedImageBaseY + offset;
    }

    // AS3: BadgeLeaderboardView.as::setPagerEnabled()
    public setPagerEnabled(previous: boolean, next: boolean): void
    {
        const previousButton = this.previousButton;
        const nextButton = this.nextButton;

        if(previousButton)
        {
            if(previous) previousButton.enable();
            else previousButton.disable();
        }

        if(nextButton)
        {
            if(next) nextButton.enable();
            else nextButton.disable();
        }
    }

    // AS3: BadgeLeaderboardView.as::setEntryVisible()
    public setEntryVisible(index: number, visible: boolean): void
    {
        if(index >= 0 && index < this._entryViews.length)
        {
            const window = this._entryViews[index].window;

            if(window) window.visible = visible;
        }
    }

    // AS3: BadgeLeaderboardView.as::setOwnEntryVisible()
    public setOwnEntryVisible(visible: boolean): void
    {
        const ownContainer = this.ownContainer;

        if(ownContainer) ownContainer.visible = visible;
    }

    // AS3: BadgeLeaderboardView.as::hide()
    public hide(): void
    {
        if(!this.isShowing()) return;

        const desktop = this._windowManager?.getDesktop(BadgeLeaderboardView.DESKTOP_WINDOW_LAYER) ?? null;

        if(desktop !== null)
        {
            (desktop as unknown as IWindowContainer).removeChild(this._window as unknown as IWindow);
        }
    }

    // AS3: BadgeLeaderboardView.as::show()
    public show(): void
    {
        if(this._window === null) return;

        const window = this._window as unknown as IWindow;

        if(this.isShowing())
        {
            window.activate();

            return;
        }

        const desktop = this._windowManager?.getDesktop(BadgeLeaderboardView.DESKTOP_WINDOW_LAYER) ?? null;

        if(desktop !== null)
        {
            (desktop as unknown as IWindowContainer).addChild(window);

            if(window.parent === desktop)
            {
                window.center();
            }

            window.activate();
        }
    }

    // AS3: BadgeLeaderboardView.as::isShowing()
    public isShowing(): boolean
    {
        const window = this._window as unknown as IWindow | null;

        return window !== null && window.parent !== null;
    }

    // AS3: BadgeLeaderboardView.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: BadgeLeaderboardView.as::get closeButton()
    public get closeButton(): IWindow | null
    {
        return (this._window as unknown as IWindowContainer | null)?.findChildByTag('close') ?? null;
    }

    // AS3: BadgeLeaderboardView.as::get frameTitleContainer()
    public get frameTitleContainer(): IWindowContainer | null
    {
        return this.findChild('hacky_title') as IWindowContainer | null;
    }

    // AS3: BadgeLeaderboardView.as::get titleShadow0Text()
    public get titleShadow0Text(): ITextWindow | null
    {
        return this.findChild('title_txt_shadow_0') as ITextWindow | null;
    }

    // AS3: BadgeLeaderboardView.as::get titleShadow1Text()
    public get titleShadow1Text(): ITextWindow | null
    {
        return this.findChild('title_txt_shadow_1') as ITextWindow | null;
    }

    // AS3: BadgeLeaderboardView.as::get titleShadow2Text()
    public get titleShadow2Text(): ITextWindow | null
    {
        return this.findChild('title_txt_shadow_2') as ITextWindow | null;
    }

    // AS3: BadgeLeaderboardView.as::get titleShadow3Text()
    public get titleShadow3Text(): ITextWindow | null
    {
        return this.findChild('title_txt_shadow_3') as ITextWindow | null;
    }

    // AS3: BadgeLeaderboardView.as::get titleText()
    public get titleText(): ITextWindow | null
    {
        return this.findChild('title_txt') as ITextWindow | null;
    }

    // AS3: BadgeLeaderboardView.as::get titleTexts()
    public get titleTexts(): Array<ITextWindow | null>
    {
        return [
            this.titleShadow0Text,
            this.titleShadow1Text,
            this.titleShadow2Text,
            this.titleShadow3Text,
            this.titleText
        ];
    }

    // AS3: BadgeLeaderboardView.as::get dropdownRegion()
    public get dropdownRegion(): IRegionWindow | null
    {
        return this.findChild('dropdown_region') as IRegionWindow | null;
    }

    // AS3: BadgeLeaderboardView.as::get dropdownOpener()
    public get dropdownOpener(): IStaticBitmapWrapperWindow | null
    {
        return this.findChild('dropdown_opener') as IStaticBitmapWrapperWindow | null;
    }

    // AS3: BadgeLeaderboardView.as::get hiddenDropdown()
    public get hiddenDropdown(): IDropMenuWindow | null
    {
        return this.findChild('hidden_dropdown') as unknown as IDropMenuWindow | null;
    }

    // AS3: BadgeLeaderboardView.as::get bodyContainer()
    public get bodyContainer(): IWindowContainer | null
    {
        return this.findChild('body') as IWindowContainer | null;
    }

    // AS3: BadgeLeaderboardView.as::get infoContainer()
    public get infoContainer(): IWindowContainer | null
    {
        return this.findChild('info_container') as IWindowContainer | null;
    }

    // AS3: BadgeLeaderboardView.as::get rankTypeExtendedImage()
    public get rankTypeExtendedImage(): IStaticBitmapWrapperWindow | null
    {
        return this.findChild('rank_type_extended_img') as IStaticBitmapWrapperWindow | null;
    }

    // AS3: BadgeLeaderboardView.as::get rankTypeInfoText()
    public get rankTypeInfoText(): ITextWindow | null
    {
        return this.findChild('rank_type_info') as ITextWindow | null;
    }

    // AS3: BadgeLeaderboardView.as::get rankingList()
    public get rankingList(): IItemListWindow | null
    {
        return this.findChild('ranking_list') as unknown as IItemListWindow | null;
    }

    // AS3: BadgeLeaderboardView.as::get ownContainer()
    public get ownContainer(): IWindowContainer | null
    {
        return this.findChild('own_container') as IWindowContainer | null;
    }

    // AS3: BadgeLeaderboardView.as::get ownEntryView()
    public get ownEntryView(): BadgeLeaderboardEntryView | null
    {
        return this._ownEntryView;
    }

    // AS3: BadgeLeaderboardView.as::get entryViews()
    public get entryViews(): BadgeLeaderboardEntryView[]
    {
        return this._entryViews;
    }

    // AS3: BadgeLeaderboardView.as::get buttonsList()
    public get buttonsList(): IItemListWindow | null
    {
        return this.findChild('buttons') as unknown as IItemListWindow | null;
    }

    // AS3: BadgeLeaderboardView.as::get previousButton()
    public get previousButton(): IInteractiveWindow | null
    {
        return this.findChild('previous_btn') as unknown as IInteractiveWindow | null;
    }

    // AS3: BadgeLeaderboardView.as::get nextButton()
    public get nextButton(): IInteractiveWindow | null
    {
        return this.findChild('next_btn') as unknown as IInteractiveWindow | null;
    }

    // TS-only: AS3 repeats `_window.findChildByName(...)` in every accessor; the null-guard the
    // port needs is the same each time.
    private findChild(name: string): IWindow | null
    {
        return (this._window as unknown as IWindowContainer | null)?.findChildByName(name) ?? null;
    }

    // AS3: BadgeLeaderboardView.as::dispose()
    public dispose(): void
    {
        if(this._disposed) return;

        this.hide();

        for(const view of this._entryViews)
        {
            view.dispose();
        }

        this._entryViews = [];

        if(this._entryTemplate !== null)
        {
            this._entryTemplate.dispose();
            this._entryTemplate = null;
        }

        if(this._ownEntryView !== null)
        {
            this._ownEntryView.dispose();
            this._ownEntryView = null;
        }

        if(this._window !== null)
        {
            (this._window as unknown as IWindow).dispose();
            this._window = null;
        }

        this._controller = null;
        this._windowManager = null;
        this._disposed = true;
    }
}
