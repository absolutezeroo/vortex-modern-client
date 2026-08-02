/**
 * ImageLoader
 *
 * AS3: sources/WIN63-202607011411-782849652/src/login/ImageLoader.as
 *
 * Loads one remote image into a display object and reports completion. The login flow uses it for
 * the two landing illustrations (`landing.view.background_left.uri` / `.background_right.uri`).
 *
 * AS3 hands it a `flash.display.Loader`, which loads and displays in the same object; here the
 * target is a `Bitmap` and the decoded pixels are pushed into it.
 */
import {Logger} from '@core/utils/Logger';
import type {Bitmap} from '../onBoardingHcUi/display/Bitmap';
import {BitmapData} from '../onBoardingHcUi/display/BitmapData';
import {EventDispatcher} from '../onBoardingHcUi/display/DisplayObject';
import {ImageLoaderEvent} from './ImageLoaderEvent';

const log = Logger.getLogger('client.login.ImageLoader');

export class ImageLoader extends EventDispatcher
{
    // AS3: _loader
    private readonly _loader: Bitmap;

    // AS3: _url
    private readonly _url: string;

    // AS3: ImageLoader(_arg_1:Loader, _arg_2:String)
    constructor(loader: Bitmap, url: string)
    {
        super();

        this._loader = loader;
        this._url = url;

        const image = new Image();

        image.crossOrigin = 'anonymous';
        image.addEventListener('load', () =>
        {
            void createImageBitmap(image).then((bitmap) =>
            {
                this._loader.bitmapData = BitmapData.fromImage(bitmap);
                this.avatarImageLoadCompleteHandler();
            });
        });
        image.addEventListener('error', () => this.onImageError());
        image.src = url;
    }

    // AS3: static CreateLoader(_arg_1:Loader, _arg_2:String, _arg_3:Function):ImageLoader
    public static createLoader(loader: Bitmap, url: string, onComplete: (event: ImageLoaderEvent) => void): ImageLoader
    {
        const imageLoader = new ImageLoader(loader, url);

        imageLoader.addEventListener('complete', onComplete as (event: unknown) => void);

        return imageLoader;
    }

    // AS3: avatarImageLoadCompleteHandler(_arg_1:Event)
    private avatarImageLoadCompleteHandler(): void
    {
        log.debug(`Loaded image ${this._url}`);
        this.dispatchEvent(new ImageLoaderEvent('complete', this._loader, this._url));
    }

    /**
     * AS3: onImageError(_arg_1:ErrorEvent)
     *
     * A landing illustration that never arrives leaves the screen usable, so this stays a warning
     * — but it has to be visible, since nothing else reports it.
     */
    private onImageError(): void
    {
        log.warn(`Failed to load image ${this._url}`);
    }
}
