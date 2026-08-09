import type {IWidget} from './IWidget';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IHabboWindowManager} from '../IHabboWindowManager';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IWindow} from '@core/window/IWindow';
import {PropertyStruct} from '@core/window/utils/PropertyStruct';

/**
 * Pet image rendering widget.
 *
 * Renders a pet figure with configurable direction, scale, zoom, and
 * shrink-on-overflow behavior. Supports asynchronous image loading.
 *
 * In the AS3 version, implements IGetImageListener and uses PetFigureData
 * to parse the figure string. In the TypeScript port, pet metadata is
 * stored for the UI layer.
 *
 * @see sources/win63_version/habbo/window/widgets/PetImageWidget.as
 */
export class PetImageWidget implements IWidget
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/PetImageWidget.as::TYPE
    public static readonly TYPE: string = 'pet_image';

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/PetImageWidget.as::FIGURE_KEY
    private static readonly FIGURE_KEY: string = 'pet_image:figure';
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/PetImageWidget.as::SCALE_KEY
    private static readonly SCALE_KEY: string = 'pet_image:scale';
    private static readonly DIRECTION_KEY: string = 'pet_image:direction';
    private static readonly ZOOM_X_KEY: string = 'pet_image:zoomX';
    private static readonly ZOOM_Y_KEY: string = 'pet_image:zoomY';
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/PetImageWidget.as::SHRINK_ON_OVERFLOW_KEY
    private static readonly SHRINK_ON_OVERFLOW_KEY: string = 'pet_image:shrink_on_overflow';

    private static readonly DIRECTIONS: string[] = [
        'northeast', 'east', 'southeast', 'south',
        'southwest', 'west', 'northwest', 'north'
    ];

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/PetImageWidget.as::SCALES
    private static readonly SCALES: number[] = [32, 64];

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/PetImageWidget.as::FIGURE_DEFAULT
    private static readonly FIGURE_DEFAULT: string = '1 0 ffffff';

    private _widgetWindow: IWidgetWindow | null = null;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/PetImageWidget.as::_windowManager
    private _windowManager: IHabboWindowManager | null = null;
    private _root: IWindowContainer | null = null;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/PetImageWidget.as::_bitmap
    private _bitmap: IWindow | null = null;
    private _region: IWindow | null = null;

    constructor(window: IWidgetWindow, windowManager: IHabboWindowManager)
    {
        this._widgetWindow = window;
        this._windowManager = windowManager;

        const root = this._windowManager.buildWidgetLayout('pet_image_xml') as IWindowContainer;

        if(root)
        {
            this._root = root;
            this._bitmap = root.findChildByName('bitmap');
            this._region = root.findChildByName('region');

            this.refresh();

            this._widgetWindow.rootWindow = root;
            root.width = this._widgetWindow.width;
            root.height = this._widgetWindow.height;
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/PetImageWidget.as::_disposed
    private _disposed: boolean = false;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/PetImageWidget.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    private _figure: string = PetImageWidget.FIGURE_DEFAULT;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/PetImageWidget.as::get figure()
    public get figure(): string
    {
        return this._figure;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/PetImageWidget.as::set figure()
    public set figure(value: string)
    {
        this._figure = PetImageWidget.cleanupAvatarString(value);
    }

    private _scale: number = 64;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/PetImageWidget.as::get scale()
    public get scale(): number
    {
        return this._scale;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/PetImageWidget.as::set scale()
    public set scale(value: number)
    {
        this._scale = value;
    }

    private _direction: number = 2;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/PetImageWidget.as::get direction()
    public get direction(): number
    {
        return this._direction;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/PetImageWidget.as::set direction()
    public set direction(value: number)
    {
        this._direction = value;
    }

    private _zoomX: number = 1;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/PetImageWidget.as::get zoomX()
    public get zoomX(): number
    {
        return this._zoomX;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/PetImageWidget.as::set zoomX()
    public set zoomX(value: number)
    {
        this._zoomX = value;
    }

    private _zoomY: number = 1;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/PetImageWidget.as::get zoomY()
    public get zoomY(): number
    {
        return this._zoomY;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/PetImageWidget.as::set zoomY()
    public set zoomY(value: number)
    {
        this._zoomY = value;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/PetImageWidget.as::_shrinkOnOverflow
    private _shrinkOnOverflow: boolean = false;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/PetImageWidget.as::get shrinkOnOverflow()
    public get shrinkOnOverflow(): boolean
    {
        return this._shrinkOnOverflow;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/PetImageWidget.as::set shrinkOnOverflow()
    public set shrinkOnOverflow(value: boolean)
    {
        this._shrinkOnOverflow = value;
    }

    private _petWidth: number = 0;

    /**
	 * The width of the pet image (before zoom).
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/PetImageWidget.as::get petWidth()
    public get petWidth(): number
    {
        return this._petWidth;
    }

    private _petHeight: number = 0;

    /**
	 * The height of the pet image (before zoom).
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/PetImageWidget.as::get petHeight()
    public get petHeight(): number
    {
        return this._petHeight;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/PetImageWidget.as::get properties()
    public get properties(): PropertyStruct[]
    {
        if(this._disposed) return [];

        return [
            new PropertyStruct(PetImageWidget.FIGURE_KEY, this._figure),
            new PropertyStruct(PetImageWidget.SCALE_KEY, this._scale),
            new PropertyStruct(PetImageWidget.DIRECTION_KEY, PetImageWidget.DIRECTIONS[this._direction]),
            new PropertyStruct(PetImageWidget.ZOOM_X_KEY, this._zoomX),
            new PropertyStruct(PetImageWidget.ZOOM_Y_KEY, this._zoomY),
            new PropertyStruct(PetImageWidget.SHRINK_ON_OVERFLOW_KEY, this._shrinkOnOverflow),
        ];
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/PetImageWidget.as::set properties()
    public set properties(values: PropertyStruct[])
    {
        for(const prop of values)
        {
            switch(prop.key)
            {
                case PetImageWidget.FIGURE_KEY:
                    this.figure = String(prop.value);
                    break;
                case PetImageWidget.SCALE_KEY:
                    this.scale = Number(prop.value);
                    break;
                case PetImageWidget.DIRECTION_KEY:
                    this.direction = PetImageWidget.DIRECTIONS.indexOf(String(prop.value));
                    break;
                case PetImageWidget.ZOOM_X_KEY:
                    this.zoomX = Number(prop.value);
                    break;
                case PetImageWidget.ZOOM_Y_KEY:
                    this.zoomY = Number(prop.value);
                    break;
                case PetImageWidget.SHRINK_ON_OVERFLOW_KEY:
                    this.shrinkOnOverflow = Boolean(prop.value);
                    break;
            }
        }
    }

    /**
	 * Clean up a pet figure string, replacing NaN values.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/PetImageWidget.as::cleanupAvatarString()
    private static cleanupAvatarString(figure: string): string
    {
        if(!figure) return PetImageWidget.FIGURE_DEFAULT;

        return figure.replace(/NaN/g, '');
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/PetImageWidget.as::dispose()
    public dispose(): void
    {
        if(this._disposed) return;

        if(this._region)
        {
            this._region.dispose();
            this._region = null;
        }

        this._bitmap = null;

        if(this._root)
        {
            this._root.dispose();
            this._root = null;
        }

        if(this._widgetWindow)
        {
            this._widgetWindow.rootWindow = null;
            this._widgetWindow = null;
        }

        this._windowManager = null;
        this._disposed = true;
    }

    /**
	 * Refresh the pet bitmap rendering.
	 *
	 * In AS3, this fetches the pet image from the room engine and draws
	 * to the bitmap wrapper. Stubbed for now — the UI layer handles
	 * pet rendering.
	 *
	 * Public: ProductIconWidget calls (petImageWidget.widget as PetImageWidget).refresh()
	 * directly after changing blend, matching AS3's external call into this method.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/PetImageWidget.as::refresh()
    public refresh(): void
    {
        // TODO: pet bitmap rendering (Flash BitmapData logic)
    }
}
