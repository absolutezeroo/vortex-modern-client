import type {IWindow} from '../IWindow';

/**
 * Interface for static bitmap wrapper windows.
 *
 * Static bitmaps load their content via `assetUri` through the ResourceManager.
 * The `bitmapData` property exposes the loaded ImageBitmap for rendering.
 *
 * @see sources/win63_version/core/window/components/StaticBitmapWrapperController.as
 */
export interface IStaticBitmapWrapperWindow extends IWindow
{
    /**
	 * The asset URI for this static bitmap.
	 *
	 * Setting this triggers an asset request via the ResourceManager.
	 */
    assetUri: string;

    /**
	 * The decoded bitmap content for this window.
	 *
	 * Set automatically by `receiveAsset()` when the asset loads.
	 */
    bitmapData: ImageBitmap | null;

    /**
	 * Anchor point used when positioning/scaling the bitmap within the window.
	 *
	 * AS3: IStaticBitmapWrapperWindow extends the same shared bitmap-properties
	 * interface as IBitmapWrapperWindow (obfuscated `_SafeCls_1989`); on the
	 * concrete side, StaticBitmapWrapperController extends BitmapDataController
	 * and inherits this property from it, same as AS3.
	 */
    pivotPoint: number;
}
