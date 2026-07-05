/**
 * ImageLoader
 *
 * @see sources/win63_2021_version/login/ImageLoader.as
 *
 * Loads an image from a URL and dispatches an ImageLoaderEvent on completion.
 * AS3 pattern: wraps a Loader and dispatches "complete" event.
 */
import {EventEmitter} from 'eventemitter3';
import {ImageLoaderEvent} from './ImageLoaderEvent';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('ImageLoader');

export class ImageLoader extends EventEmitter
{
    private _loader: HTMLImageElement;
    private _url: string;

    /**
	 * AS3: ImageLoader(_arg_1:Loader, _arg_2:String)
	 * Loads the image immediately.
	 */
    constructor(loader: HTMLImageElement, url: string)
    {
        super();

        this._loader = loader;
        this._url = url;

        loader.addEventListener('load', this._onComplete);
        loader.addEventListener('error', this._onError);
        loader.src = url;
    }

    /**
	 * AS3: CreateLoader(_arg_1:Loader, _arg_2:String, _arg_3:Function):ImageLoader
	 * Factory method — creates a loader and registers the callback.
	 */
    public static CreateLoader(img: HTMLImageElement, url: string, callback: (event: ImageLoaderEvent) => void): ImageLoader
    {
        const loader = new ImageLoader(img, url);

        loader.on('complete', callback);

        return loader;
    }

    /**
	 * AS3: avatarImageLoadCompleteHandler(_arg_1:Event):void
	 */
    private _onComplete = (): void =>
    {
        log.info('Loaded image ' + this._url);
        this.emit('complete', new ImageLoaderEvent(this._loader, this._url));
    };

    /**
	 * AS3: onImageError(_arg_1:ErrorEvent):void
	 */
    private _onError = (): void =>
    {
        log.info('Failed to load image ' + this._url);
    };
}
