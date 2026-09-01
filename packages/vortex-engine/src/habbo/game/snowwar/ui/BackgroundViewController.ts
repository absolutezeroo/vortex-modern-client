import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {SnowWarEngine} from '../SnowWarEngine';
import {WindowUtils} from '../utils/WindowUtils';

/**
 * The winter backdrop behind the lobby and the loading screen: a sky, a sun, and three ranges of
 * hills.
 *
 * It is built on first access and added at the *bottom* of desktop layer 0, so everything else
 * keeps drawing over it. The three vista bands are tiled horizontally across the whole desktop
 * width; the sky and the sun are drawn once, and those two are also the only ones whose bitmap the
 * window must not own — they come straight out of the asset library and are shared.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/ui/BackgroundViewController.as
 */
export class BackgroundViewController implements IDisposable
{
    // AS3: BackgroundViewController.as::_disposed
    private _disposed: boolean = false;

    /** Derived name — `_SafeStr_4581`, the engine. */
    // AS3: BackgroundViewController.as::_SafeStr_4581
    private _engine: SnowWarEngine | null;

    // AS3: BackgroundViewController.as::_background
    private _background: IWindowContainer | null = null;

    // AS3: BackgroundViewController.as::BackgroundViewController()
    constructor(engine: SnowWarEngine)
    {
        this._engine = engine;
    }

    // AS3: BackgroundViewController.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: BackgroundViewController.as::get background()
    public get background(): IWindow | null
    {
        if(!this._background) this.createView();

        return this._background;
    }

    // AS3: BackgroundViewController.as::createView()
    private createView(): void
    {
        const desktop = this._engine?.windowManager?.getDesktop(0) as IWindowContainer | null;

        if(!desktop) return;

        this._background = WindowUtils.createWindow('snowwar_loading_background_xml', 1) as IWindowContainer | null;

        if(!this._background) return;

        this._background.width = desktop.width;
        this._background.height = desktop.height;
        desktop.addChildAt(this._background, 0);

        this.setBitmap('bg_sky', 'sky', this._background);
        this.setBitmap('bg_sunshine', 'sunshine', this._background);
        this.setBitmap('bg_vista_1', 'vista_1', this._background, true);
        this.setBitmap('bg_vista_2', 'vista_2', this._background, true);
        this.setBitmap('bg_vista_3', 'vista_3', this._background, true);
    }

    /**
     * `tile` repeats the source across the background's whole width; without it the image is used
     * as-is and the window is told not to dispose it, because the asset library still owns it.
     */
    // AS3: BackgroundViewController.as::setBitmap()
    private setBitmap(assetName: string, childName: string, container: IWindowContainer, tile: boolean = false): void
    {
        const source = (this._engine?.assets?.getAssetByName(assetName)?.content ?? null) as ImageBitmap | null;
        const slot = container.findChildByName(childName) as IBitmapWrapperWindow | null;

        if(!source || !slot) return;

        if(!tile)
        {
            slot.bitmap = source;
            slot.disposesBitmap = false;

            return;
        }

        const canvas = new OffscreenCanvas(Math.max(1, container.width), Math.max(1, source.height));
        const context = canvas.getContext('2d');

        if(context === null) return;

        for(let x = 0; x < container.width / source.width + 1; x++)
        {
            context.drawImage(source, x * source.width, 0);
        }

        slot.bitmap = canvas.transferToImageBitmap();
    }

    // AS3: BackgroundViewController.as::dispose()
    public dispose(): void
    {
        this._engine = null;

        if(this._background)
        {
            this._background.dispose();
            this._background = null;
        }

        this._disposed = true;
    }
}
