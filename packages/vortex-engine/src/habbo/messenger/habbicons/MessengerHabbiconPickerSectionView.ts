/**
 * MessengerHabbiconPickerSectionView — one titled band, laid out as a 5-column grid.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPickerSectionView.as
 *
 * The grid is always padded to whole rows: `ceil(entries / 5) * 5` tiles are built and the surplus
 * get a null entry, which `MessengerHabbiconPickerTileView` renders as an inert filler. That is
 * what keeps a 3-icon section the same shape as a 5-icon one.
 *
 * Both heights are computed rather than laid out by the window system, because the grid has to
 * measure to its row count before the picker can size itself to the total.
 */
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemGridWindow} from '@core/window/components/IItemGridWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {MessengerHabbiconPickerEntry} from './MessengerHabbiconPickerEntry';
import {MessengerHabbiconPickerTileView} from './MessengerHabbiconPickerTileView';

export class MessengerHabbiconPickerSectionView
{
    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPickerSectionView.as::GRID_COLUMNS
    private static readonly GRID_COLUMNS: number = 5;

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPickerSectionView.as::SLOT_SIZE
    private static readonly SLOT_SIZE: number = 45;

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPickerSectionView.as::SLOT_SPACING
    private static readonly SLOT_SPACING: number = 2;

    /** AS3's literal `20` — the title strip above the grid. */
    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPickerSectionView.as::MessengerHabbiconPickerSectionView()
    private static readonly TITLE_HEIGHT: number = 20;

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPickerSectionView.as::_window
    private _window: IWindowContainer | null = null;

    /** Derived name — `_SafeStr_6310`: this section's tiles, fillers included. */
    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPickerSectionView.as::_SafeStr_6310
    private _tiles: MessengerHabbiconPickerTileView[] = [];

    /** Derived name — `_SafeStr_4778`: the section type ("favorites"/"recent"/…). */
    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPickerSectionView.as::_SafeStr_4778
    private _type: string | null = null;

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPickerSectionView.as::_key
    private _key: string | null = null;

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPickerSectionView.as::_disposed
    private _disposed: boolean = false;

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPickerSectionView.as::MessengerHabbiconPickerSectionView()
    constructor(
        template: IWindowContainer,
        type: string,
        key: string,
        title: string,
        entries: MessengerHabbiconPickerEntry[],
        onSelected: ((habbiconId: number, keepOpen: boolean) => void) | null,
        windowManager: IHabboWindowManager | null,
        isUnseen: ((habbiconId: number) => boolean) | null,
        onWheel: ((event: WindowMouseEvent) => void) | null
    )
    {
        this._window = template.clone() as IWindowContainer;
        this._type = type;
        this._key = key;

        const sectionTitle = this.sectionTitle;

        if(sectionTitle) sectionTitle.caption = title;

        const grid = this.habbiconGrid;

        if(!grid) return;

        const tileTemplate = grid.getGridItemAt(0) as IWindowContainer | null;

        grid.removeGridItems();

        const entryCount = entries.length;
        const rows = Math.max(1, Math.ceil(entryCount / MessengerHabbiconPickerSectionView.GRID_COLUMNS));
        const slots = rows * MessengerHabbiconPickerSectionView.GRID_COLUMNS;

        for(let index = 0; index < slots; index++)
        {
            if(!tileTemplate) break;

            const entry = index < entryCount ? entries[index] : null;
            const tile = new MessengerHabbiconPickerTileView(
                tileTemplate, entry, onSelected, windowManager, isUnseen, onWheel
            );

            this._tiles.push(tile);

            if(tile.window) grid.addGridItem(tile.window);
        }

        grid.height = rows * MessengerHabbiconPickerSectionView.SLOT_SIZE + (rows - 1) * MessengerHabbiconPickerSectionView.SLOT_SPACING;
        this._window.height = MessengerHabbiconPickerSectionView.TITLE_HEIGHT + grid.height + MessengerHabbiconPickerSectionView.SLOT_SPACING;

        tileTemplate?.dispose();

        this._window.visible = true;
    }

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPickerSectionView.as::get window()
    public get window(): IWindowContainer | null
    {
        return this._window;
    }

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPickerSectionView.as::get type()
    public get type(): string | null
    {
        return this._type;
    }

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPickerSectionView.as::get key()
    public get key(): string | null
    {
        return this._key;
    }

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPickerSectionView.as::clearUnseenCounterForHabbicon()
    public clearUnseenCounterForHabbicon(habbiconId: number): void
    {
        for(const tile of this._tiles)
        {
            tile.clearUnseenCounterForHabbicon(habbiconId);
        }
    }

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPickerSectionView.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPickerSectionView.as::get sectionTitle()
    private get sectionTitle(): ITextWindow | null
    {
        return (this._window?.findChildByName('section_title') ?? null) as ITextWindow | null;
    }

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPickerSectionView.as::get habbiconGrid()
    private get habbiconGrid(): IItemGridWindow | null
    {
        return (this._window?.findChildByName('habbicon_grid') ?? null) as IItemGridWindow | null;
    }

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPickerSectionView.as::dispose()
    public dispose(): void
    {
        if(this._disposed) return;

        for(const tile of this._tiles)
        {
            tile.dispose();
        }

        this._tiles.length = 0;

        if(this._window !== null)
        {
            if(this._window.parent !== null)
            {
                (this._window.parent as IWindowContainer).removeChild(this._window);
            }

            this._window.dispose();
            this._window = null;
        }

        this._type = null;
        this._key = null;
        this._disposed = true;
    }
}
