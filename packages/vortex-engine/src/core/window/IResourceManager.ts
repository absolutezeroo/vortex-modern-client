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
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/ResourceManager.as::retrieveAsset()
    // A null receiver is a prefetch — AS3 starts the load and only guards the notification.
    retrieveAsset(uri: string, receiver: IAssetReceiver | null): void;

    /**
	 * Checks if two asset URIs resolve to the same asset.
	 *
	 * @param uri1 - First URI
	 * @param uri2 - Second URI
	 * @returns True if they resolve to the same asset
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/ResourceManager.as::isSameAsset()
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

    /**
	 * Checks whether an asset name is known - registered as a decoded bitmap or as a
	 * lazily-loadable URL - without requesting it.
	 *
	 * Stands in for AS3's `assets.getAssetByName(name) != null` pre-check, which the port
	 * cannot make for images: they are not in a component asset library.
	 *
	 * @param name - The asset name
	 * @returns True if `retrieveAsset()` would be able to resolve this name
	 */
    hasAsset(name: string): boolean;

    /**
	 * The decoded bitmap for a name, or null when it is not in the cache yet.
	 *
	 * TS-only: AS3 reads `assets.getAssetByName(name).content` off a component asset library, which
	 * is always resolved by the time anything asks. This port keeps window images here instead, and
	 * `retrieveAsset()` is receiver-based — so a caller that has to composite *now*
	 * (`AvatarEditorGridColorItem.setupColor()` tints the shared chip) needs the cached value
	 * directly. Returns null for a name registered only as a lazy URL and never requested.
	 */
    // TS-only: see the note above; AS3 reads a component asset library instead.
    getAsset(name: string): ImageBitmap | null;
}
