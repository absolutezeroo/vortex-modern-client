import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IWindow} from '@core/window/IWindow';
import type {IInteractiveWindow} from '@core/window/components/IInteractiveWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {IAvatarImageListener} from '@habbo/avatar/IAvatarImageListener';
import type {HabboCatalog} from '../HabboCatalog';
import type {IGridItem} from './IGridItem';
import type {IItemGrid} from './IItemGrid';

/**
 * Base grid-item view: hosts an icon bitmap, handles select/drag mouse events.
 *
 * @see sources/win63_version/habbo/catalog/viewer/ProductGridItem.as
 */
export class ProductGridItem implements IGridItem
{
    static readonly GRID_ITEM_BORDER: string = 'bg';

    protected _view: IWindowContainer | null = null;

    private _grid: IItemGrid | null = null;

    protected _icon: IBitmapWrapperWindow | null = null;

    protected _wideIcon: IBitmapWrapperWindow | null = null;

    private _disposed: boolean = false;

    private _mouseDownTarget: IWindow | null = null;

    private _catalog: HabboCatalog | null;

    constructor(catalog: HabboCatalog)
    {
        this._catalog = catalog;
    }

    get view(): IWindowContainer
    {
        return this._view!;
    }

    set grid(grid: IItemGrid)
    {
        this._grid = grid;
    }

    dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;
        this._grid = null;
        this._icon = null;
        this._wideIcon = null;
        this._catalog = null;

        if(this._view != null)
        {
            this._view.dispose();
            this._view = null;
        }
    }

    get disposed(): boolean
    {
        return this._disposed;
    }

    protected get catalog(): HabboCatalog | null
    {
        return this._catalog;
    }

    activate(): void
    {
        if(!this._view) return;

        const highlight = this._view.findChildByTag('ITEM_HILIGHT');

        if(highlight)
        {
            highlight.visible = true;
        }
        else
        {
            this._view.getChildByName('bg')!.style = 0;
        }
    }

    deactivate(): void
    {
        if(!this._view) return;

        const highlight = this._view.findChildByTag('ITEM_HILIGHT');

        if(highlight)
        {
            highlight.visible = false;
        }
        else
        {
            this._view.getChildByName('bg')!.style = 3;
        }
    }

    set view(view: IWindowContainer)
    {
        if(!view) return;

        this._view = view;
        this._view.procedure = this.eventProc.bind(this);
        this._wideIcon = this._view.findChildByName('image_wide') as unknown as IBitmapWrapperWindow | null;

        if(this._wideIcon)
        {
            this._view.findChildByName('wide_container')!.visible = this.useWideView;
            this._view.findChildByName('small_container')!.visible = !this.useWideView;
            this._view.width = this.useWideView ? this._view.limits.maxWidth : this._view.limits.minWidth;
        }
        else
        {
            this._wideIcon = this._icon;
        }

        this._icon = this._view.findChildByName('image') as unknown as IBitmapWrapperWindow | null;

        const highlight = this._view.findChildByTag('ITEM_HILIGHT');

        if(highlight)
        {
            highlight.visible = false;
        }

        const multiContainer = this._view.findChildByName('multiContainer');

        if(multiContainer)
        {
            multiContainer.visible = false;
        }
    }

    protected get useWideView(): boolean
    {
        return false;
    }

    setDraggable(draggable: boolean): void
    {
        const interactive = this._view as unknown as IInteractiveWindow | null;

        if(interactive && draggable)
        {
            interactive.setMouseCursorForState(4, 5);
            interactive.setMouseCursorForState(4 | 1, 5);
        }
    }

    private eventProc(event: WindowEvent, window: IWindow | null): void
    {
        if(event.type === 'WME_UP')
        {
            this._mouseDownTarget = null;
        }
        else if(event.type === 'WME_DOWN')
        {
            if(window == null) return;

            this._grid!.select(this, true);
            this._mouseDownTarget = window;
        }
        else if(event.type === 'WME_OUT' && this._mouseDownTarget != null && this._mouseDownTarget === window)
        {
            const started = this._grid!.startDragAndDrop(this);

            if(started)
            {
                this._mouseDownTarget = null;
            }
        }
        else if(event.type === 'WME_CLICK' || event.type === 'WME_DOUBLE_CLICK')
        {
            this._mouseDownTarget = null;
        }
    }

    setIconImage(image: ImageBitmap | null, disposeSource: boolean): void
    {
        if(image == null) return;

        const target = this.targetIcon;

        if(target != null && !target.disposed)
        {
            target.bitmap = image;
        }

        if(disposeSource)
        {
            image.close();
        }
    }

    protected get targetIcon(): IBitmapWrapperWindow | null
    {
        return this.useWideView ? this._wideIcon : this._icon;
    }

    // AS3: sources/win63_version/habbo/catalog/viewer/ProductGridItem.as::renderAvatarImage()
    // AS3's BitmapData render is synchronous end-to-end. The PixiJS port's equivalent
    // (AvatarImage.getCroppedImage()) produces a Texture backed by a canvas resource
    // synchronously, but turning that into the ImageBitmap the icon wrapper needs requires
    // the browser's async createImageBitmap() - there is no synchronous browser equivalent.
    // Callers therefore apply the result via a promise continuation instead of a direct return.
    protected renderAvatarImage(figureString: string, listener: IAvatarImageListener | null): Promise<ImageBitmap | null>
    {
        const avatarImage = this._catalog!.avatarRenderManager!.createAvatarImage(figureString, 'h', '', listener, null);

        if(!avatarImage) return Promise.resolve(null);

        const texture = avatarImage.getCroppedImage('head', 0.5) as {
            width: number;
            height: number;
            source?: { resource?: CanvasImageSource };
        } | null;

        avatarImage.dispose();

        const resource = texture?.source?.resource;

        if(!texture || !resource) return Promise.resolve(null);

        const canvas = document.createElement('canvas');

        canvas.width = texture.width;
        canvas.height = texture.height;

        const ctx = canvas.getContext('2d');

        if(!ctx) return Promise.resolve(null);

        ctx.drawImage(resource, 0, 0);

        return createImageBitmap(canvas);
    }
}
