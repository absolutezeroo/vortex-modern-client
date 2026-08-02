/**
 * ImageLoaderEvent
 *
 * AS3: sources/WIN63-202607011411-782849652/src/login/ImageLoaderEvent.as
 *
 * Carries the loader and the URL back to `LoginFlow.onImageComplete()`.
 *
 * AS3's `loader` is a `flash.display.Loader` — a display object that becomes the image once it has
 * loaded. Its counterpart here is a `Bitmap` whose `bitmapData` is filled in on completion, which
 * is what `onImageComplete()` then fades in.
 */
import type {Bitmap} from '../onBoardingHcUi/display/Bitmap';
import {DisplayEvent} from '../onBoardingHcUi/display/DisplayObject';

export class ImageLoaderEvent extends DisplayEvent
{
    // AS3: _loader
    private readonly _loader: Bitmap;

    // AS3: _url
    private readonly _url: string;

    // AS3: ImageLoaderEvent(_arg_1:String, _arg_2:Loader, _arg_3:String)
    constructor(type: string, loader: Bitmap, url: string)
    {
        super(type, false);

        this._loader = loader;
        this._url = url;
    }

    // AS3: get loader():Loader
    public get loader(): Bitmap
    {
        return this._loader;
    }

    // AS3: get url():String
    public get url(): string
    {
        return this._url;
    }
}
