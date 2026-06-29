/**
 * ImageLoaderEvent
 *
 * @see sources/win63_2021_version/login/ImageLoaderEvent.as
 *
 * Event dispatched by ImageLoader when an image load completes.
 * Carries the loaded HTMLImageElement and the source URL.
 */
export class ImageLoaderEvent
{
	private _loader: HTMLImageElement;
	private _url: string;

	constructor(loader: HTMLImageElement, url: string)
	{
		this._loader = loader;
		this._url = url;
	}

	get loader(): HTMLImageElement
	{
		return this._loader;
	}

	get url(): string
	{
		return this._url;
	}
}
