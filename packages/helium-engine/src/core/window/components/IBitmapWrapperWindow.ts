import type {IWindow} from '../IWindow';

/**
 * Interface for bitmap wrapper windows.
 *
 * Bitmap wrappers hold a programmatic bitmap set by code (e.g. avatar rendering).
 * The `bitmap` property is the primary way to set the content.
 *
 * @see sources/win63_version/core/window/components/BitmapWrapperController.as
 * @see sources/flash_version/com/sulake/core/window/components/IBitmapWrapperWindow.as
 */
export interface IBitmapWrapperWindow extends IWindow
{
    /**
	 * The programmatic bitmap for this window.
	 *
	 * Setting this disposes the old bitmap if `disposesBitmap` is true,
	 * calls `fitSize()`, and invalidates the window.
	 */
    bitmap: ImageBitmap | null;

    /**
	 * The underlying bitmap data (alias for bitmap).
	 */
    bitmapData: ImageBitmap | null;

    /**
	 * Whether this window owns the bitmap and should dispose it.
	 */
    disposesBitmap: boolean;

    /**
	 * The named catalog/asset-library image this bitmap was last set from.
	 */
    bitmapAssetName: string;

    /**
	 * Anchor point used when positioning/scaling the bitmap within the window.
	 *
	 * TODO(AS3): the real AS3 interface (obfuscated as `_SafeCls_1989` in
	 * win63_2026_crypted_version/src/com/sulake/core/window/utils/) also exposes
	 * stretchedX/Y, zoomX/Y, greyscale, etchingColor, etchingPoint,
	 * fitSizeToContents, wrapX/Y, flipX/Y and rotation - all implemented on the
	 * concrete BitmapDataController already, just not exposed here yet.
	 */
    pivotPoint: number;
}
