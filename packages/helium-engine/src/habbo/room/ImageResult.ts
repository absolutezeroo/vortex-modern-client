/**
 * Result of a getFurnitureIcon()/getWallItemIcon()/getGenericRoomObjectThumbnail() request.
 *
 * `id === 0` means `data` is already populated (synchronous hit).
 * `id > 0` means the image is loading; the caller (an IGetImageListener) receives
 * `imageReady(id, data)` or `imageFailed(id)` once loading completes.
 * `id === -1` means the request could not be started at all.
 *
 * AS3: sources/flash_version/src/com/sulake/habbo/room/ImageResult.as
 * (real class name recovered from flash_version; win63 decompiles this as class_2198/class_3266)
 *
 * TS deviation: `data` is ImageBitmap (matching IBitmapWrapperWindow.bitmap), not
 * AS3's BitmapData. Converting a loaded PixiJS Texture to an ImageBitmap is
 * inherently asynchronous in the browser (unlike Flash's synchronous BitmapData
 * cloning), so RoomEngine always resolves this via the id>0 pending path and
 * delivers through imageReady() — even for already-cached assets.
 */
export class ImageResult
{
    public id: number = 0;
    public data: ImageBitmap | null = null;
}
