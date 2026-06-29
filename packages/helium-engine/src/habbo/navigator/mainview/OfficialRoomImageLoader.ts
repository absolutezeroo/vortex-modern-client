import type { IBitmapWrapperWindow } from '@core/window/components/IBitmapWrapperWindow';
import type { IHabboTransitionalNavigator } from '../IHabboTransitionalNavigator';
import { Logger } from '@core/utils/Logger';

const logger = Logger.getLogger('OfficialRoomImageLoader');

/**
 * Loads an official room icon image into a bitmap wrapper window.
 *
 * Checks the asset library first; if missing, initiates a network load.
 * Once available, sets the bitmap on the provided window.
 *
 * @see sources/win63_version/habbo/navigator/mainview/OfficialRoomImageLoader.as
 */
export class OfficialRoomImageLoader
{
    private _navigator: IHabboTransitionalNavigator | null;
    private _imageName: string;
    private _imageUrl: string;
    private _bitmapWindow: IBitmapWrapperWindow | null;
    private _disposed: boolean = false;

    constructor(
        navigator: IHabboTransitionalNavigator,
        imageName: string,
        bitmapWindow: IBitmapWrapperWindow
    )
    {
        this._navigator = navigator;
        this._imageName = imageName;
        this._bitmapWindow = bitmapWindow;

        const baseUrl = navigator.getProperty('image.library.url');

        this._imageUrl = baseUrl + imageName;

        logger.info('[OFFICIAL ROOM ICON IMAGE DOWNLOADER] : ' + this._imageUrl);
    }

    startLoad(): void
    {
        if(!this._navigator) return;

        const assets = this._navigator.assets;

        if(!assets) return;

        if(assets.hasAsset(this._imageName))
        {
            this.setImage();
        }
        else
        {
            const loaderStruct = assets.loadAssetFromFile(this._imageName, this._imageUrl, 'image/gif');

            loaderStruct.addEventListener('AssetLoaderEventComplete', () => this.onImageReady());
            loaderStruct.addEventListener('AssetLoaderEventError', () => this.onLoadError());
        }
    }

    get disposed(): boolean
    {
        return this._disposed;
    }

    dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;
        this._bitmapWindow = null;
        this._navigator = null;
    }

    private onImageReady(): void
    {
        if(this._disposed) return;

        this.setImage();
    }

    private setImage(): void
    {
        if(!this._navigator || this._navigator.disposed || !this._bitmapWindow || this._bitmapWindow.disposed)
        {
            this.dispose();
            return;
        }

        const bitmap = this._navigator.getButtonImage(this._imageName, '') as ImageBitmap | null;

        if(bitmap)
        {
            this._bitmapWindow.disposesBitmap = false;
            this._bitmapWindow.bitmap = bitmap;
            this._bitmapWindow.width = bitmap.width;
            this._bitmapWindow.height = bitmap.height;
            this._bitmapWindow.visible = true;
        }
        else
        {
            logger.warn('OfficialRoomImageLoader - Image not found: ' + this._imageName);
        }

        this.dispose();
    }

    private onLoadError(): void
    {
        logger.warn('Error loading image: ' + this._imageUrl);
        this.dispose();
    }
}
