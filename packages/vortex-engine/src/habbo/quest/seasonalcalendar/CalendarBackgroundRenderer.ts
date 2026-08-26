import type {IDisposable} from '@core/runtime';

/**
 * Stitches the seasonal calendar's separately downloaded `background_N` PNG segments into one
 * continuous horizontal filmstrip, and cuts an arbitrary-offset, arbitrary-width slice out of it
 * for the calendar's scrolling backdrop (`background_slice`).
 *
 * **Class name DERIVED, not recovered.** The primary WIN63 tree keeps this class obfuscated as
 * `_SafeCls_4471`, and `sources/win63_version/habbo/quest/seasonalcalendar/class_4073.as` — the
 * same class under that tree's own obfuscation scheme — is obfuscated too, so no tree has a
 * readable class name. `CalendarBackgroundRenderer` is taken from the unobfuscated 2016
 * PRODUCTION tree's `com.sulake.habbo.quest.seasonalcalendar.CalendarBackgroundRenderer.as`, which
 * declares the same two fields (`_images`/`_disposed`) and the same
 * dispose/getSlice/getImageIndexForOffset/getRelativeXForOffset algorithm shape — but that file's
 * own members are separately obfuscated as `_Str_N` placeholders, so it corroborates only the
 * *class* identity, not member names. Every member name below is read directly from the
 * (unobfuscated) primary WIN63 tree, per CLAUDE.md's rule for citing PRODUCTION for identity only.
 *
 * TS deviation: AS3 stores `Vector.<BitmapData>` and slices with `BitmapData.copyPixels()`; this
 * port stores `ImageBitmap[]` (matching `IBitmapWrapperWindow.bitmap`) and composites with a 2D
 * canvas `drawImage()` per source image, which is the same crop-and-blit operation.
 *
 * @see sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1976/_SafeCls_4471.as (primary; obfuscated class name, readable members)
 * @see sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/quest/seasonalcalendar/CalendarBackgroundRenderer.as (2016; class-name lineage only)
 */
export class CalendarBackgroundRenderer implements IDisposable
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1976/_SafeCls_4471.as::_images
    private _images: ImageBitmap[] | null = null;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1976/_SafeCls_4471.as::_disposed
    private _disposed: boolean = false;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1976/_SafeCls_4471.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    /**
     * AS3 never actually flips `_disposed` here — `dispose()` only clears `_images`, and the
     * `disposed` getter above reads a field nothing ever sets true. Ported literally: this is the
     * real AS3 mechanism (however odd), not a workaround to "fix".
     */
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1976/_SafeCls_4471.as::dispose()
    dispose(): void
    {
        if(!this._disposed)
        {
            this._images = null;
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1976/_SafeCls_4471.as::initializeImageChain()
    initializeImageChain(images: ImageBitmap[]): void
    {
        this._images = images;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1976/_SafeCls_4471.as::getSlice()
    getSlice(offset: number, width: number): ImageBitmap
    {
        if(this._disposed || this._images === null || this._images.length === 0)
        {
            return CalendarBackgroundRenderer.blank(1, 1);
        }

        const canvas = new OffscreenCanvas(Math.max(1, width), Math.max(1, this._images[0].height));
        const context = canvas.getContext('2d');

        if(context === null)
        {
            return CalendarBackgroundRenderer.blank(1, 1);
        }

        // AS3's destination BitmapData is created opaque white (`new BitmapData(param2, h, false,
        // 0xFFFFFF)`); any region the loop below never draws into (the "offset < 0" skip branch)
        // stays that colour rather than transparent.
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);

        let written = 0;

        while(written < width)
        {
            const sourceOffset = offset + written;
            const imageIndex = this.getImageIndexForOffset(sourceOffset);

            if(imageIndex < 0)
            {
                written += -offset;

                if(offset >= 0)
                {
                    return CalendarBackgroundRenderer.blank(1, 1);
                }

                continue;
            }

            const image = this._images[imageIndex];
            const relativeX = this.getRelativeXForOffset(sourceOffset);

            if(image.width > relativeX + width - written)
            {
                const sliceWidth = width - written;

                context.drawImage(image, relativeX, 0, sliceWidth, image.height, written, 0, sliceWidth, image.height);
                written += sliceWidth;
            }
            else
            {
                const sliceWidth = image.width - relativeX;

                context.drawImage(image, relativeX, 0, sliceWidth, image.height, written, 0, sliceWidth, image.height);
                written += sliceWidth;
            }
        }

        return canvas.transferToImageBitmap();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1976/_SafeCls_4471.as::getImageIndexForOffset()
    getImageIndexForOffset(offset: number): number
    {
        if(this._images === null) return -1;

        let cursor = 0;

        for(let index = 0; index < this._images.length; index++)
        {
            const image = this._images[index];

            if(cursor <= offset && offset < cursor + image.width)
            {
                return index;
            }

            cursor += image.width;
        }

        return -1;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1976/_SafeCls_4471.as::getRelativeXForOffset()
    private getRelativeXForOffset(offset: number): number
    {
        if(this._images === null) return -1;

        let cursor = 0;

        for(let index = 0; index < this._images.length; index++)
        {
            const image = this._images[index];

            if(cursor <= offset && offset < cursor + image.width)
            {
                return offset - cursor;
            }

            cursor += image.width;
        }

        return -1;
    }

    // TS-only: shared helper for the several AS3 call sites that construct a tiny placeholder
    // `BitmapData` inline (`new BitmapData(1, 1)` etc.) — one blank opaque-white bitmap factory
    // instead of repeating the canvas boilerplate at each one.
    private static blank(width: number, height: number): ImageBitmap
    {
        const canvas = new OffscreenCanvas(Math.max(1, width), Math.max(1, height));
        const context = canvas.getContext('2d');

        if(context !== null)
        {
            context.fillStyle = '#ffffff';
            context.fillRect(0, 0, canvas.width, canvas.height);
        }

        return canvas.transferToImageBitmap();
    }
}
