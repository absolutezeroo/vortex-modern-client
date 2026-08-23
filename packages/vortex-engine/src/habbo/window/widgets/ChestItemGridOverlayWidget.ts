import type {IChestItemGridOverlayWidget} from './IChestItemGridOverlayWidget';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IHabboWindowManager} from '../IHabboWindowManager';
import {NumberPlaqueBitmap} from '@habbo/window/utils/NumberPlaqueBitmap';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {PropertyStruct} from '@core/window/utils/PropertyStruct';
import type {IIterator} from '@core/window/utils/IIterator';
import {EmptyIterator} from '@core/window/iterators/EmptyIterator';

/**
 * Chest item grid overlay widget.
 *
 * Displays a colored plaque (silver/gold/brown) with a contents-count
 * overlay on grid items for "chest"-type catalog/inventory items, following
 * the same pattern as {@link RarityItemGridOverlayWidget}/
 * {@link LimitedItemGridOverlayWidget}.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/ChestItemGridOverlayWidget.as
 */
export class ChestItemGridOverlayWidget implements IChestItemGridOverlayWidget 
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/ChestItemGridOverlayWidget.as::TYPE
    public static readonly TYPE: string = 'chest_overlay_grid';
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/ChestItemGridOverlayWidget.as::COLOR_SILVER
    public static readonly COLOR_SILVER: string = 'silver';
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/ChestItemGridOverlayWidget.as::COLOR_GOLD
    public static readonly COLOR_GOLD: string = 'gold';
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/ChestItemGridOverlayWidget.as::COLOR_BROWN
    public static readonly COLOR_BROWN: string = 'brown';

    private _widgetWindow: IWidgetWindow | null = null;
    // AS3: .../src/com/sulake/habbo/window/widgets/ChestItemGridOverlayWidget.as::_windowManager
    private _windowManager: IHabboWindowManager | null = null;
    private _root: IWindowContainer | null = null;
    private _plaqueBitmap: IStaticBitmapWrapperWindow | null = null;
    private _numberBitmap: IWindow | null = null;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/ChestItemGridOverlayWidget.as::ChestItemGridOverlayWidget()
    constructor(window: IWidgetWindow, windowManager: IHabboWindowManager) 
    {
        this._widgetWindow = window;
        this._windowManager = windowManager;

        const root = this._windowManager.buildWidgetLayout('chest_overlay_griditem_xml') as IWindowContainer | null;

        if(root) 
        {
            this._root = root;
            this._plaqueBitmap = root.findChildByName('chest_plaque_bitmap') as unknown as IStaticBitmapWrapperWindow | null;
            this._numberBitmap = root.findChildByName('chest_plaque_number_bitmap');

            this._widgetWindow.rootWindow = root as unknown as IWindow;
        }
    }

    // AS3: .../src/com/sulake/habbo/window/widgets/ChestItemGridOverlayWidget.as::_disposed
    private _disposed: boolean = false;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/ChestItemGridOverlayWidget.as::get disposed()
    public get disposed(): boolean 
    {
        return this._disposed;
    }

    private _contentsCount: number = 0;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/ChestItemGridOverlayWidget.as::get contentsCount()
    public get contentsCount(): number 
    {
        return this._contentsCount;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/ChestItemGridOverlayWidget.as::set contentsCount()
    public set contentsCount(value: number)
    {
        this._contentsCount = value;

        const plaque = this._root?.findChildByName('chest_plaque_number_bitmap') as
            (IWindow & {bitmap?: ImageBitmap | null}) | null;

        if(plaque == null) return;

        plaque.bitmap = NumberPlaqueBitmap.createBitmap(this._windowManager, value, plaque.width, plaque.height);
    }

    // AS3: .../src/com/sulake/habbo/window/widgets/ChestItemGridOverlayWidget.as::_color
    private _color: string = '';

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/ChestItemGridOverlayWidget.as::get color()
    public get color(): string 
    {
        return this._color;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/ChestItemGridOverlayWidget.as::set color()
    public set color(value: string) 
    {
        this._color = value;

        if(this._plaqueBitmap) 
        {
            this._plaqueBitmap.assetUri = `chest_overlay_${value}_plaque`;
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/ChestItemGridOverlayWidget.as::get iterator()
    public iterator(): IIterator 
    {
        return EmptyIterator.INSTANCE;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/ChestItemGridOverlayWidget.as::get properties()
    public get properties(): PropertyStruct[] 
    {
        return [];
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/ChestItemGridOverlayWidget.as::set properties()
    public set properties(_values: PropertyStruct[]) 
    {
        // AS3: properties setter is a no-op for this widget
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/ChestItemGridOverlayWidget.as::dispose()
    public dispose(): void 
    {
        if(this._disposed) return;

        this._disposed = true;
        this._plaqueBitmap = null;
        this._numberBitmap = null;

        if(this._root) 
        {
            this._root.dispose();
            this._root = null;
        }

        if(this._widgetWindow) 
        {
            this._widgetWindow.rootWindow = null;
        }

        this._widgetWindow = null;
        this._windowManager = null;
    }
}
