import type {BitmapDataAsset} from '@core/assets/BitmapDataAsset';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {XmlAsset} from '@core/assets/XmlAsset';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemGridWindow} from '@core/window/components/IItemGridWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {DimmerView} from './DimmerView';

/**
 * DimmerViewColorGrid
 *
 * The seven-swatch colour picker. One cell is built per colour from the
 * `dimmer_color_chooser_cell` layout, and each cell layers three bitmaps: the frame, the
 * swatch itself, and the selection tick that only the chosen cell shows.
 *
 * AS3 clones the swatch bitmap per cell and runs a `ColorTransform` over the copy. This port
 * sets the window's `color` instead: `BitmapDataRenderer.tintBitmap()` applies exactly that
 * multiply, and the seven cells then share one bitmap rather than each owning a tinted copy.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/furniture/dimmer/DimmerViewColorGrid.as
 */
export class DimmerViewColorGrid
{
    // AS3: .../dimmer/DimmerViewColorGrid.as::DimmerViewColorGrid()
    constructor(
        view: DimmerView,
        grid: IItemGridWindow | null,
        windowManager: IHabboWindowManager,
        assets: IAssetLibrary | null
    )
    {
        this._view = view;
        this._grid = grid;

        this.storeAssets(assets);
        this.populate(windowManager);
    }

    // AS3: .../dimmer/DimmerViewColorGrid.as::_SafeStr_4550
    private _view: DimmerView | null;

    // AS3: .../dimmer/DimmerViewColorGrid.as::_SafeStr_5509
    private _grid: IItemGridWindow | null;

    // AS3: .../dimmer/DimmerViewColorGrid.as::_colorCellXML
    private _colorCellXml: string | null = null;

    // AS3: .../dimmer/DimmerViewColorGrid.as::_colorCellFrame
    private _colorCellFrame: ImageBitmap | null = null;

    // AS3: .../dimmer/DimmerViewColorGrid.as::_SafeStr_6888
    private _colorButton: ImageBitmap | null = null;

    // AS3: .../dimmer/DimmerViewColorGrid.as::_SafeStr_6296
    private _colorSelected: ImageBitmap | null = null;

    /** The cell currently showing its tick. */
    // AS3: .../dimmer/DimmerViewColorGrid.as::_SafeStr_4790
    private _selectedCell: IWindowContainer | null = null;

    // AS3: .../dimmer/DimmerViewColorGrid.as::setSelectedColorIndex()
    public setSelectedColorIndex(index: number): void
    {
        if(this._grid === null) return;

        if(index < 0 || index >= this._grid.numGridItems) return;

        this.select(this._grid.getGridItemAt(index) as IWindowContainer | null);
    }

    // AS3: .../dimmer/DimmerViewColorGrid.as::get colors()
    private get colors(): number[]
    {
        return this._view?.colors ?? [];
    }

    // AS3: .../dimmer/DimmerViewColorGrid.as::populate()
    private populate(windowManager: IHabboWindowManager): void
    {
        if(this._view === null || this._grid === null) return;

        this.populateColourGrid(windowManager);
    }

    // AS3: .../dimmer/DimmerViewColorGrid.as::select()
    private select(cell: IWindowContainer | null): void
    {
        if(this._selectedCell !== null)
        {
            const previous = this._selectedCell.getChildByName('chosen');

            if(previous !== null)
            {
                previous.visible = false;
            }
        }

        this._selectedCell = cell;

        if(this._selectedCell === null) return;

        const chosen = this._selectedCell.getChildByName('chosen');

        if(chosen !== null)
        {
            chosen.visible = true;
        }
    }

    // AS3: .../dimmer/DimmerViewColorGrid.as::populateColourGrid()
    private populateColourGrid(windowManager: IHabboWindowManager): void
    {
        if(this._grid === null || this._colorCellXml === null) return;

        this._grid.destroyGridItems();
        this._selectedCell = null;

        for(const color of this.colors)
        {
            const cell = windowManager.buildFromXML(this._colorCellXml) as IWindowContainer | null;

            if(cell === null) continue;

            cell.addEventListener('WME_CLICK', this.onClick);
            cell.background = true;
            cell.color = 0xFFFFFFFF;

            if(this._colorCellFrame !== null)
            {
                cell.width = this._colorCellFrame.width;
                cell.height = this._colorCellFrame.height;
            }

            this._grid.addGridItem(cell);

            const border = cell.findChildByTag('BG_BORDER') as IBitmapWrapperWindow | null;

            if(border !== null && this._colorCellFrame !== null)
            {
                border.bitmap = this._colorCellFrame;
            }

            const swatch = cell.findChildByTag('COLOR_IMAGE') as IBitmapWrapperWindow | null;

            if(swatch !== null && this._colorButton !== null)
            {
                swatch.bitmap = this._colorButton;

                // AS3 builds a ColorTransform out of the colour's own channels divided by
                // 255 and multiplies the cloned bitmap by it; `color` is the same operation
                // one layer down. Opaque alpha, since AS3's transform leaves alpha alone.
                swatch.color = 0xFF000000 | color;
            }

            const chosen = cell.findChildByTag('COLOR_CHOSEN') as IBitmapWrapperWindow | null;

            if(chosen !== null && this._colorSelected !== null)
            {
                chosen.bitmap = this._colorSelected;
                chosen.visible = false;
            }
        }
    }

    // AS3: .../dimmer/DimmerViewColorGrid.as::onClick()
    private onClick = (event: WindowMouseEvent): void =>
    {
        if(this._grid === null || this._view === null) return;

        const index = this._grid.getGridItemIndex(event.target as IWindow);

        this.setSelectedColorIndex(index);

        this._view.selectedColorIndex = index;
    };

    // AS3: .../dimmer/DimmerViewColorGrid.as::storeAssets()
    private storeAssets(assets: IAssetLibrary | null): void
    {
        if(assets === null) return;

        this._colorCellXml = (assets.getAssetByName('dimmer_color_chooser_cell') as XmlAsset | null)?.content as string | null;
        this._colorCellFrame = (assets.getAssetByName('dimmer_color_frame') as BitmapDataAsset | null)?.content as ImageBitmap | null;
        this._colorButton = (assets.getAssetByName('dimmer_color_button') as BitmapDataAsset | null)?.content as ImageBitmap | null;
        this._colorSelected = (assets.getAssetByName('dimmer_color_selected') as BitmapDataAsset | null)?.content as ImageBitmap | null;
    }

    // AS3: .../dimmer/DimmerViewColorGrid.as::dispose()
    public dispose(): void
    {
        this._view = null;
        this._grid = null;
        this._colorCellXml = null;
        this._colorCellFrame = null;
        this._colorButton = null;
        this._colorSelected = null;
        this._selectedCell = null;
    }
}
