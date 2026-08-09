import type {IWindow} from '../IWindow';

/**
 * Interface for bitmap wrapper windows.
 *
 * Bitmap wrappers hold a programmatic bitmap set by code (e.g. avatar rendering).
 * The `bitmap` property is the primary way to set the content.
 *
 * @see sources/win63_version/core/window/components/BitmapWrapperController.as
 * @see sources/PRODUCTION-201601012205-226667486/com/sulake/core/window/components/IBitmapWrapperWindow.as
 */
export interface IBitmapWrapperWindow extends IWindow {
    /**
     * The programmatic bitmap for this window.
     *
     * Setting this disposes the old bitmap if `disposesBitmap` is true,
     * calls `fitSize()`, and invalidates the window.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/window/components/BitmapWrapperController.as::get bitmap()
    bitmap: ImageBitmap | null;

    /**
     * The underlying bitmap data (alias for bitmap).
     */
    bitmapData: ImageBitmap | null;

    /**
     * Whether this window owns the bitmap and should dispose it.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/window/components/BitmapWrapperController.as::get disposesBitmap()
    disposesBitmap: boolean;

    /**
     * The named catalog/asset-library image this bitmap was last set from.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/window/components/BitmapWrapperController.as::get bitmapAssetName()
    bitmapAssetName: string;

    /**
     * Anchor point used when positioning/scaling the bitmap within the window.
     *
     * TODO(AS3): the real AS3 interface (obfuscated as `_SafeCls_1989` in
     * WIN63-202607011411-782849652/src/com/sulake/core/window/utils/) also exposes
     * zoomX/Y, greyscale, etchingColor, etchingPoint, fitSizeToContents,
     * wrapX/Y, flipX/Y and rotation - all implemented on the concrete
     * BitmapDataController already, just not exposed here yet.
     */
    pivotPoint: number;

    /**
     * Whether the bitmap stretches horizontally to fill the window width.
     */
    stretchedX: boolean;

    /**
     * Whether the bitmap stretches vertically to fill the window height.
     */
    stretchedY: boolean;
}
