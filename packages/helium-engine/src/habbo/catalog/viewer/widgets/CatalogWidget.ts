import type {EventEmitter} from 'eventemitter3';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ICatalogPage} from '../ICatalogPage';
import type {ICatalogWidget} from './ICatalogWidget';

/**
 * Base class for catalog page widgets.
 *
 * @see sources/win63_version/habbo/catalog/viewer/widgets/CatalogWidget.as
 */
export class CatalogWidget implements ICatalogWidget
{
    protected _window: IWindowContainer;

    protected _events: EventEmitter | null = null;

    private _page: ICatalogPage | null = null;

    private _disposed: boolean = false;

    protected _isEmbedded: boolean = false;

    constructor(window: IWindowContainer)
    {
        this._window = window;
        this._isEmbedded = window.tags.indexOf('EMBEDDED') > -1;
    }

    set page(page: ICatalogPage)
    {
        this._page = page;
    }

    set events(events: EventEmitter)
    {
        this._events = events;
    }

    get window(): IWindowContainer
    {
        return this._window;
    }

    get events(): EventEmitter
    {
        return this._events!;
    }

    get page(): ICatalogPage
    {
        return this._page!;
    }

    dispose(): void
    {
        this._events = null;
        this._page = null;
        this._window = null!;
        this._disposed = true;
    }

    get disposed(): boolean
    {
        return this._disposed;
    }

    init(): boolean
    {
        return true;
    }

    closed(): void
    {
    }

    // AS3 loads this via assets.getAssetByName(name).content + buildFromXML(); this port's
    // compiled window-layout registry builds ready-to-use windows directly instead (see
    // IHabboWindowManager buildWidgetLayout() doc).
    protected attachWidgetView(name: string): void
    {
        if(this._isEmbedded) return;

        if(!this.window || !this.page || !this.page.viewer || !this.page.viewer.catalog || !this.page.viewer.catalog.windowManager) return;

        const view = this.page.viewer.catalog.windowManager.buildWidgetLayout(name);

        if(view == null) return;

        this.window.removeChildAt(0);
        this.window.addChild(view);
    }

    protected getAssetBitmapData(name: string): ImageBitmap | null
    {
        const asset = this.page.viewer.catalog.assets!.getAssetByName(name);

        if(asset == null) return null;

        return asset.content as ImageBitmap;
    }
}
