import {Assets, Texture} from 'pixi.js';
import {BinaryFileLoader} from './BinaryFileLoader';
import {Logger} from '@core/utils/Logger';

/**
 * BitmapFileLoader
 *
 * Based on AS3: com.sulake.core.assets.loaders.BitmapFileLoader
 *
 * Loader for image files. Converts loaded content to PixiJS Texture.
 */
export class BitmapFileLoader extends BinaryFileLoader
{
	constructor(mimeType: string, url?: string, id: number = -1)
	{
		super(mimeType, url, id);
	}

	private _texture: Texture | null = null;

	/**
	 * The loaded texture
	 */
	get texture(): Texture | null
	{
		return this._texture;
	}

	/**
	 * The loaded content
	 */
	override get content(): unknown
	{
		return this._texture;
	}

	/**
	 * Load content from a URL
	 */
	override load(url: string): void
	{
		const previousUrl = this._url;

		this._url = url;

		if (this._texture)
		{
			// This texture is cached/refcounted by PixiJS Assets (loaded via
			// Assets.load() below) — destroying it directly desyncs that cache
			// and breaks the texture for every other consumer still using it
			// (e.g. the same furniture icon shown elsewhere). Assets.unload()
			// is the correct release path; it only frees the source once no
			// other reference needs it.
			if (previousUrl)
			{
				Assets.unload(previousUrl).catch(() => {});
			}

			this._texture = null;
		}

		this._errorCode = 0;
		this.handleLoadEvent('open');

		// Use PixiJS Assets loader
		Assets.load<Texture>(url)
			.then((texture: Texture) =>
			{
				if (this._disposed)
				{
					Assets.unload(url).catch(() => {});
					return;
				}

				this._texture = texture;
				this._bytesLoaded = 1;
				this._bytesTotal = 1;
				this._status = 200;

				this.handleLoadEvent('complete');
			})
			.catch((error: Error) =>
			{
				Logger.getLogger('BitmapFileLoader').error('Error loading texture:', error);
				this.handleLoadEvent('ioError');
			});
	}

	/**
	 * Dispose of this loader
	 */
	override dispose(): void
	{
		if (!this._disposed)
		{
			if (this._texture && this._url)
			{
				Assets.unload(this._url).catch(() => {});
				this._texture = null;
			}

			super.dispose();
		}
	}
}
