/**
 * The port of a three-line idiom AS3 repeats at every bitmap-wrapper slot in the client:
 *
 *     var slot:BitmapData = new BitmapData(wrapper.width, wrapper.height);
 *     slot.fillRect(slot.rect, 0);
 *     slot.copyPixels(image, image.rect, new Point((slot.width - image.width) / 2,
 *                                                 (slot.height - image.height) / 2));
 *     wrapper.bitmap = slot;
 *
 * Two things it does that assigning the raw image does NOT:
 * - the result is always exactly the slot's size, so the wrapper never scales it. A wrapper whose
 *   layout does not switch stretching off will otherwise stretch whatever it is given to fill the
 *   slot, which is how a 64x110 avatar came out as a distorted 100x150 one;
 * - the image is centred, and cropped rather than shrunk when it is bigger than the slot.
 *
 * `PurchaseConfirmationDialog.setImage()` already carried this by hand; the inventory grids and
 * previews (bots, pets) assumed the wrapper would centre for them, and it does not.
 *
 * TS-only in the sense that AS3 has no such shared function — it inlines these lines per call site.
 */
export function drawIntoBitmapSlot(
    image: ImageBitmap | null,
    slotWidth: number,
    slotHeight: number,
    closeSource: boolean = true
): ImageBitmap | null
{
    if(image === null) return null;

    const width = Math.max(1, Math.floor(slotWidth));
    const height = Math.max(1, Math.floor(slotHeight));
    const canvas = new OffscreenCanvas(width, height);
    const context = canvas.getContext('2d');

    if(context === null) return null;

    context.drawImage(
        image,
        Math.floor((width - image.width) * 0.5),
        Math.floor((height - image.height) * 0.5)
    );

    const result = canvas.transferToImageBitmap();

    // AS3 hands the source BitmapData's lifetime to the caller; here the source is a throwaway
    // render in every current call site, so it is released unless the caller says otherwise.
    if(closeSource) image.close();

    return result;
}
