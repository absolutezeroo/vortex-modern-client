import type {IAssetReceiver} from './IAssetReceiver';
import type {IDisposable} from "../runtime/IDisposable";

/**
 * Interface for the window resource manager.
 *
 * Manages asset retrieval, caching, and delivery to IAssetReceiver instances.
 *
 * @see sources/win63_version/habbo/window/ResourceManager.as
 */
export interface IResourceManager extends IDisposable
{
    /**
	 * Retrieves an asset by URI and delivers it to the receiver.
	 *
	 * If the asset is already cached, delivers immediately.
	 * Otherwise, queues the receiver for async delivery.
	 *
	 * @param uri - The asset URI
	 * @param receiver - The receiver callback
	 */
    retrieveAsset(uri: string, receiver: IAssetReceiver): void;

    /**
	 * Checks if two asset URIs resolve to the same asset.
	 *
	 * @param uri1 - First URI
	 * @param uri2 - Second URI
	 * @returns True if they resolve to the same asset
	 */
    isSameAsset(uri1: string, uri2: string): boolean;

    /**
	 * Registers a bitmap asset by name.
	 *
	 * @param name - The asset name
	 * @param bitmap - The decoded bitmap
	 */
    registerAsset(name: string, bitmap: ImageBitmap): void;

    /**
	 * Registers an asset URL for lazy loading.
	 *
	 * The bitmap is NOT decoded immediately. When `retrieveAsset()` is called
	 * for this name, the URL is fetched and decoded on demand.
	 *
	 * @param name - The asset name
	 * @param url - The URL to fetch the image from
	 */
    registerAssetUrl(name: string, url: string): void;
}
