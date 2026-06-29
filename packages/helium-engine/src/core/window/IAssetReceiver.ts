import type {IDisposable} from "../runtime/IDisposable";

/**
 * Interface for objects that can receive loaded bitmap assets.
 *
 * In AS3, `IAssetReceiver.receiveAsset()` received an IAsset wrapping
 * a BitmapData. In TypeScript, we pass ImageBitmap directly (Canvas adaptation).
 *
 * @see sources/win63_version/core/window/components/StaticBitmapWrapperController.as
 */
export interface IAssetReceiver extends IDisposable
{
	/**
	 * Called when an asset has been loaded and is ready for use.
	 *
	 * @param asset - The decoded bitmap
	 * @param uri - The resolved asset URI
	 */
	receiveAsset(asset: ImageBitmap, uri: string): void;
}
