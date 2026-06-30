import {Logger} from '@core/utils/Logger';
import {normalizeLocalAssetUrl} from '@core/utils/urlUtils';
import type {IResourceManager} from '@core/window/IResourceManager';
import type {IAssetReceiver} from '@core/window/IAssetReceiver';
import type {IHabboWindowManager} from './IHabboWindowManager';

const log = Logger.getLogger('ResourceManager');

const LOCAL_ASSET_HTTP_ORIGIN = 'http://vortex-assets.local';
const LOCAL_ASSET_HTTPS_ORIGIN = 'https://vortex-assets.local';

/**
 * Manages asset retrieval for the window system.
 *
 * Supports two registration modes:
 * 1. `registerAsset(name, bitmap)` — immediate: stores a decoded ImageBitmap
 * 2. `registerAssetUrl(name, url)` — lazy: stores a URL, decodes on first request
 *
 * When `retrieveAsset()` is called:
 * - If bitmap is cached → delivers immediately
 * - If a URL is registered → fetches, decodes, caches, then delivers
 * - Otherwise → queues the receiver for later delivery
 *
 * @see sources/win63_version/habbo/window/ResourceManager.as
 */
export class ResourceManager implements IResourceManager
{
	private _windowManager: IHabboWindowManager;
	private _assets: Map<string, ImageBitmap> = new Map();
	private _assetUrls: Map<string, string> = new Map();
	private _pendingReceivers: Map<string, IAssetReceiver[]> = new Map();
	private _loading: Set<string> = new Set();

	constructor(windowManager: IHabboWindowManager)
	{
		this._windowManager = windowManager;
	}

	private _disposed: boolean = false;

	public get disposed(): boolean
	{
		return this._disposed;
	}

	/**
	 * Registers a bitmap asset by name (immediate).
	 *
	 * If there are pending receivers waiting for this asset,
	 * delivers it to them immediately.
	 *
	 * @param name - The asset name
	 * @param bitmap - The decoded bitmap
	 */
	public registerAsset(name: string, bitmap: ImageBitmap): void
	{
		const resolvedName = this.resolveAssetName(name);

		this._assets.set(resolvedName, bitmap);
		this._assetUrls.delete(resolvedName);

		// Deliver to any pending receivers
		this.deliverToReceivers(resolvedName, bitmap);
	}

	/**
	 * Registers an asset URL for lazy loading.
	 *
	 * The bitmap is NOT decoded immediately. When `retrieveAsset()` is called
	 * for this name, the URL is fetched and decoded on demand.
	 *
	 * @param name - The asset name
	 * @param url - The URL to fetch the image from
	 */
	public registerAssetUrl(name: string, url: string): void
	{
		const resolvedName = this.resolveAssetName(name);

		if (this._assets.has(resolvedName)) return;

		this._assetUrls.set(resolvedName, url);

		if (this._pendingReceivers.has(resolvedName) && !this._loading.has(resolvedName))
		{
			this._loading.add(resolvedName);
			this.loadFromUrl(resolvedName, url);
		}
	}

	/**
	 * Retrieves an asset by URI and delivers it to the receiver.
	 *
	 * If the asset is already cached, delivers immediately via
	 * `receiver.receiveAsset()`. If a URL is registered, loads it
	 * lazily. Otherwise, queues the receiver for later delivery.
	 *
	 * In AS3: `retrieveAsset(uri: String, receiver: IAssetReceiver)`
	 *
	 * @param uri - The asset URI
	 * @param receiver - The receiver to deliver the asset to
	 */
	public retrieveAsset(uri: string, receiver: IAssetReceiver): void
	{
		if (!uri || !receiver) return;

		const resolvedName = this.resolveAssetName(uri);

		if (!resolvedName) return;

		// Check bitmap cache first
		const cached = this._assets.get(resolvedName);

		if (cached)
		{
			receiver.receiveAsset(cached, resolvedName);

			return;
		}

		// Queue receiver
		let receivers = this._pendingReceivers.get(resolvedName);

		if (!receivers)
		{
			receivers = [];
			this._pendingReceivers.set(resolvedName, receivers);
		}

		receivers.push(receiver);

		// If a URL is registered and not already loading, start loading
		const url = this._assetUrls.get(resolvedName);

		if (url && !this._loading.has(resolvedName))
		{
			this._loading.add(resolvedName);
			this.loadFromUrl(resolvedName, url);

			return;
		}

		// AS3 ResourceManager.retrieveAsset (l.57-61): when the asset is not a
		// known bundle asset and the resolved name is itself a fetchable URL
		// (http/https), load it directly from that URL. Without this, URL-based
		// assetUri (e.g. room thumbnails) stay queued forever and never render.
		if (!url && !this._loading.has(resolvedName) && this.isFetchableUrl(resolvedName))
		{
			this._loading.add(resolvedName);
			this.loadFromUrl(resolvedName, resolvedName);
		}
	}

	/**
	 * Whether the resolved asset name is a directly fetchable URL.
	 *
	 * Mirrors the AS3 check `substr(0,7) == "http://" || substr(0,8) == "https://"`.
	 * The TS port also accepts root-relative paths so localhost can load
	 * `vortex-assets.local` resources through the Vite proxy without CORS.
	 */
	private isFetchableUrl(name: string): boolean
	{
		return name.startsWith('http://') || name.startsWith('https://') || (name.length > 1 && name.startsWith('/'));
	}

	/**
	 * Checks if two asset URIs resolve to the same asset.
	 *
	 * @param uri1 - First URI
	 * @param uri2 - Second URI
	 * @returns True if they resolve to the same asset
	 */
	public isSameAsset(uri1: string, uri2: string): boolean
	{
		return this.resolveAssetName(uri1) === this.resolveAssetName(uri2);
	}

	/**
	 * Registers an asset content object under a name.
	 *
	 * AS3 exposes createAsset(name, assetClass, content). In the TS port
	 * StaticBitmapWrapperController consumes ImageBitmap directly, so this
	 * method only persists ImageBitmap payloads.
	 */
	public createAsset(name: string, _assetClass: new (...args: unknown[]) => unknown, content: unknown): void
	{
		if (content instanceof ImageBitmap)
		{
			this.registerAsset(name, content);
		}
	}

	/**
	 * Removes an asset from all local caches.
	 */
	public removeAsset(name: string): void
	{
		const resolvedName = this.resolveAssetName(name);

		this._assets.delete(resolvedName);
		this._assetUrls.delete(resolvedName);
		this._pendingReceivers.delete(resolvedName);
		this._loading.delete(resolvedName);
	}

	/**
	 * Dispose the resource manager.
	 */
	public dispose(): void
	{
		if (this._disposed) return;

		this._disposed = true;
		this._assets.clear();
		this._assetUrls.clear();
		this._pendingReceivers.clear();
		this._loading.clear();
	}

	/**
	 * Resolves an asset name through window manager interpolation.
	 *
	 * In AS3, this used `_windowManager.interpolate()` for variable
	 * substitution.
	 *
	 * @param uri - The raw asset URI
	 * @returns The resolved asset name
	 */
	private resolveAssetName(uri: string): string
	{
		const interpolatingManager = this._windowManager as unknown as {
			interpolate?: (value: string) => string
		};

		const resolved = interpolatingManager.interpolate?.(uri) ?? uri;

		return normalizeLocalAssetUrl(resolved);
	}

	/**
	 * Loads an image from a URL, caches it, and delivers to pending receivers.
	 *
	 * @param name - The asset name
	 * @param url - The URL to fetch
	 */
	private loadFromUrl(name: string, url: string): void
	{
		fetch(normalizeLocalAssetUrl(url))
			.then(response => response.blob())
			.then(blob => createImageBitmap(blob))
			.then(bitmap =>
			{
				if (this._disposed) return;

				this._loading.delete(name);
				this._assetUrls.delete(name);
				this._assets.set(name, bitmap);

				this.deliverToReceivers(name, bitmap);
			})
			.catch(() =>
			{
				this._loading.delete(name);
			});
	}

	/**
	 * Delivers a bitmap to all pending receivers for the given name.
	 *
	 * @param name - The asset name
	 * @param bitmap - The bitmap to deliver
	 */
	private deliverToReceivers(name: string, bitmap: ImageBitmap): void
	{
		const receivers = this._pendingReceivers.get(name);

		if (!receivers) return;

		this._pendingReceivers.delete(name);

		for (const receiver of receivers)
		{
			if (!receiver.disposed)
			{
				try
				{
					receiver.receiveAsset(bitmap, name);
				}
				catch (e: unknown)
				{
					log.warn(`Error delivering asset "${name}" to receiver:`, e);
				}
			}
		}
	}
}
