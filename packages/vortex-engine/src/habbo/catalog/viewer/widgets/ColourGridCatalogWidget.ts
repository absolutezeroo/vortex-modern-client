import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemGridWindow} from '@core/window/components/IItemGridWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {Logger} from '@core/utils/Logger';
import {CatalogWidgetColoursEvent} from './events/CatalogWidgetColoursEvent';
import {CatalogWidgetMultiColoursEvent} from './events/CatalogWidgetMultiColoursEvent';
import {CatalogWidgetColourIndexEvent} from './events/CatalogWidgetColourIndexEvent';
import {CatalogWidgetName} from './CatalogWidgetName';
import {CatalogWidget} from './CatalogWidget';

const log = Logger.getLogger('ColourGridCatalogWidget');

/**
 * A generic colour-swatch grid: builds one `color_chooser_cell` widget instance per available
 * colour, tinting a shared greyscale colour bitmap via canvas 'multiply' compositing (this
 * port's equivalent of AS3 `BitmapData.colorTransform()` - same recipe already established in
 * `BitmapSkinRenderer.colorizeEntity()`). Supports single-colour and two-tone (diagonal split)
 * swatches.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/ColourGridCatalogWidget.as
 */
export class ColourGridCatalogWidget extends CatalogWidget
{
    private _colours: number[][] = [];

    private _colourGrid: IItemGridWindow | null = null;

    private _backgroundBitmap: ImageBitmap | null = null;

    private _colourBitmap: ImageBitmap | null = null;

    private _chosenBitmap: ImageBitmap | null = null;

    private _cacheKeyPrefix: string = '';

    private _selected: IWindowContainer | null = null;

    private _colourGridCache: Map<string, IWindowContainer> = new Map();

    constructor(window: IWindowContainer)
    {
        super(window);
    }

    override dispose(): void
    {
        if(this.disposed) return;

        if(this._colourGrid && !this._colourGrid.disposed)
        {
            this._colourGrid.destroyGridItems();
            this._colourGrid.dispose();
        }

        this._colourGrid = null;
        this._selected = null;
        this._colourGridCache.clear();
        this.events.off(CatalogWidgetColoursEvent.COLOUR_ARRAY, this.onAvailableColours);
        this.events.off(CatalogWidgetMultiColoursEvent.MULTI_COLOUR_ARRAY, this.onAvailableMultiColours);
        super.dispose();
    }

    override init(): boolean
    {
        if(!super.init()) return false;

        this.attachWidgetView(CatalogWidgetName.COLOUR_GRID);

        if(this.window.tags.indexOf('FIXED') === -1)
        {
            const first = this.window.getChildAt(0);

            if(first != null)
            {
                first.width = this.window.width;
                first.height = this.window.height;
            }
        }

        this._colourGrid = this.window.findChildByName('colourGrid') as unknown as IItemGridWindow | null;

        if(this._colourGrid)
        {
            this._colourGrid.width = this.window.width - 6;
            this._colourGrid.height = this.window.height - 6;
        }

        this.events.on(CatalogWidgetColoursEvent.COLOUR_ARRAY, this.onAvailableColours);
        this.events.on(CatalogWidgetMultiColoursEvent.MULTI_COLOUR_ARRAY, this.onAvailableMultiColours);

        return true;
    }

    private onAvailableColours = (event: CatalogWidgetColoursEvent): void =>
    {
        this._colours = event.colours.map((colour) => [colour]);
        this._backgroundBitmap = this.getAssetBitmapData(event.backgroundAssetName);
        this._colourBitmap = this.getAssetBitmapData(event.colourAssetName);
        this._cacheKeyPrefix = `${event.backgroundAssetName}\t${event.colourAssetName}`;
        this._chosenBitmap = this.getAssetBitmapData(event.chosenColourAssetName);
        this.populateColourGrid();
        this.select(this._colourGrid?.getGridItemAt(event.index) as unknown as IWindowContainer | null);
    };

    private onAvailableMultiColours = (event: CatalogWidgetMultiColoursEvent): void =>
    {
        this._colours = event.colours.map((colours) => [...colours]);
        this._backgroundBitmap = this.getAssetBitmapData(event.backgroundAssetName);
        this._colourBitmap = this.getAssetBitmapData(event.colourAssetName);
        this._chosenBitmap = this.getAssetBitmapData(event.chosenColourAssetName);
        this.populateColourGrid();
        this.select(this._colourGrid?.getGridItemAt(0) as unknown as IWindowContainer | null);
    };

    private select(item: IWindowContainer | null): void
    {
        log.debug(`Select: ${item}`);

        if(this._selected != null)
        {
            const chosen = this._selected.getChildByName('chosen');

            if(chosen) chosen.visible = false;
        }

        this._selected = item;

        if(this._selected != null)
        {
            const chosen = this._selected.getChildByName('chosen');

            if(chosen) chosen.visible = true;
        }
    }

    private populateColourGrid(): void
    {
        if(this._colourGrid == null) return;

        log.debug(`Display colors: ${[this._colours.length, this._colourGrid.numGridItems]}`);

        this._colourGrid.removeGridItems();
        this._selected = null;

        for(let i = 0; i < this._colours.length; i++)
        {
            const colours = this._colours[i]!;

            if(colours.length === 0) continue;

            const container = this.createColorContainer(colours, i);

            this._colourGrid.addGridItem(container);

            const chosen = container.findChildByTag('COLOR_CHOSEN') as unknown as IStaticBitmapWrapperWindow | null;

            if(chosen && this._chosenBitmap)
            {
                chosen.bitmapData = this._chosenBitmap;
                chosen.visible = false;
            }
        }
    }

    private createColorContainer(colours: number[], index: number): IWindowContainer
    {
        const cacheKey = this.coloursCacheKey(colours, index);
        const cached = this._colourGridCache.get(cacheKey);

        if(cached != null) return cached;

        const container = this.page.viewer.catalog.windowManager!.buildWidgetLayout('color_chooser_cell') as unknown as IWindowContainer;

        container.addEventListener('WME_CLICK', this.onClick);
        container.background = true;
        container.color = 0xFFFFFFFF;

        if(this._backgroundBitmap)
        {
            container.width = this._backgroundBitmap.width;
            container.height = this._backgroundBitmap.height;

            const border = container.findChildByTag('BG_BORDER') as unknown as IStaticBitmapWrapperWindow | null;

            if(border) border.bitmapData = this._backgroundBitmap;
        }

        const colorImage = container.findChildByTag('COLOR_IMAGE') as unknown as IStaticBitmapWrapperWindow | null;

        if(colorImage && this._colourBitmap)
        {
            colorImage.bitmapData = this.buildColourBitmap(this._colourBitmap, colours);
        }

        this._colourGridCache.set(cacheKey, container);

        return container;
    }

    // AS3 recolours the left half with colours[0] and, if present, the right half with
    // colours[1] via two BitmapData.colorTransform() calls composited side by side. This port's
    // equivalent uses canvas 'multiply'/'destination-in' compositing (see BitmapSkinRenderer's
    // colorizeEntity(), same recipe) instead of per-pixel BitmapData manipulation.
    private buildColourBitmap(source: ImageBitmap, colours: number[]): ImageBitmap
    {
        const canvas = new OffscreenCanvas(source.width, source.height);
        const ctx = canvas.getContext('2d');

        if(!ctx) return source;

        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(this.tintImage(source, colours[0]!), 0, 0);

        if(colours.length > 1)
        {
            const halfWidth = source.width / 2;

            ctx.drawImage(
                this.tintImage(source, colours[1]!),
                halfWidth, 0, source.width - halfWidth, source.height,
                halfWidth, 0, source.width - halfWidth, source.height
            );
        }

        return canvas.transferToImageBitmap();
    }

    private tintImage(source: ImageBitmap, color: number): OffscreenCanvas
    {
        const canvas = new OffscreenCanvas(source.width, source.height);
        const ctx = canvas.getContext('2d');

        if(!ctx) return canvas;

        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(source, 0, 0);

        if(color >= 0)
        {
            const r = (color >> 16) & 0xFF;
            const g = (color >> 8) & 0xFF;
            const b = color & 0xFF;

            ctx.globalCompositeOperation = 'multiply';
            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.globalCompositeOperation = 'destination-in';
            ctx.drawImage(source, 0, 0);
        }

        return canvas;
    }

    private coloursCacheKey(colours: number[], index: number): string
    {
        let key = `${this._cacheKeyPrefix}\t${index}`;

        for(const colour of colours) key += `\t${colour}`;

        return key;
    }

    private onClick = (event: WindowMouseEvent): void =>
    {
        const target = event.target as unknown as IWindowContainer | null;

        if(target == null || this._colourGrid == null) return;

        this.select(target);

        const index = this._colourGrid.getGridItemIndex(target as unknown as IWindow);

        this.events.emit(CatalogWidgetColourIndexEvent.COLOUR_INDEX, new CatalogWidgetColourIndexEvent(index));
    };
}
