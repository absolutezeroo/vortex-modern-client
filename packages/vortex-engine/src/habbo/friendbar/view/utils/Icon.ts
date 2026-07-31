import type {IDisposable} from '@core/runtime/IDisposable';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';

/**
 * Icon
 *
 * Base for the friend bar's two lamp icons. Draws one image into a bitmap window at a
 * given alignment, and owns the optional timer a subclass uses to animate itself.
 *
 * `notify()` re-enables a disabled icon: an icon with something to report is never
 * left greyed out.
 *
 * AS3 composites into the window's own mutable `BitmapData`. Here the window's `bitmap`
 * is an immutable `ImageBitmap`, so `redraw()` builds a fresh one through an
 * `OffscreenCanvas` — the same idiom `HabboFaceFocuser` uses. The clear-then-draw of
 * the AS3 version is implicit: a new canvas starts transparent.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/view/utils/Icon.as
 */
export class Icon implements IDisposable
{
    // AS3: .../view/utils/Icon.as::ALIGN_LEFT
    protected static readonly ALIGN_LEFT: number = 0;

    // AS3: .../view/utils/Icon.as::ALIGN_CENTER
    protected static readonly ALIGN_CENTER: number = 1;

    // AS3: .../view/utils/Icon.as::ALIGN_RIGHT
    protected static readonly ALIGN_RIGHT: number = 2;

    // AS3: .../view/utils/Icon.as::MASK_HORIZONTAL
    protected static readonly MASK_HORIZONTAL: number = 3;

    // AS3: .../view/utils/Icon.as::ALIGN_TOP
    protected static readonly ALIGN_TOP: number = 4;

    // AS3: .../view/utils/Icon.as::ALIGN_MIDDLE
    protected static readonly ALIGN_MIDDLE: number = 8;

    /**
     * 18, not 16: the constant carries the vertical mask's own bits, which is why
     * `MASK_VERTICAL` has the same value.
     */
    // AS3: .../view/utils/Icon.as::ALIGN_BOTTOM
    protected static readonly ALIGN_BOTTOM: number = 18;

    // AS3: .../view/utils/Icon.as::MASK_VERTICAL
    protected static readonly MASK_VERTICAL: number = 18;

    // AS3: .../view/utils/Icon.as::_disposed
    private _disposed: boolean = false;

    // AS3: .../view/utils/Icon.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../view/utils/Icon.as::_SafeStr_6948
    private _disabled: boolean = false;

    // AS3: .../view/utils/Icon.as::get disabled()
    get disabled(): boolean
    {
        return this._disabled;
    }

    /**
     * AS3 holds a `BitmapDataAsset` and reads `.content` at draw time; in this port an
     * asset's content already *is* the `ImageBitmap`, so the image is held directly.
     */
    // AS3: .../view/utils/Icon.as::_SafeStr_4582
    protected _image: ImageBitmap | null = null;

    // AS3: .../view/utils/Icon.as::get image()
    protected get image(): ImageBitmap | null
    {
        return this._image;
    }

    // AS3: .../view/utils/Icon.as::set image()
    protected set image(value: ImageBitmap | null)
    {
        this._image = value;
        this.redraw();
    }

    // AS3: .../view/utils/Icon.as::_SafeStr_4644
    protected _canvas: IBitmapWrapperWindow | null = null;

    // AS3: .../view/utils/Icon.as::get canvas()
    protected get canvas(): IBitmapWrapperWindow | null
    {
        return this._canvas;
    }

    // AS3: .../view/utils/Icon.as::set canvas()
    protected set canvas(value: IBitmapWrapperWindow | null)
    {
        this._canvas = value;
        this.redraw();
    }

    /** Defaults to centre/middle (`ALIGN_CENTER | ALIGN_MIDDLE`). */
    // AS3: .../view/utils/Icon.as::_SafeStr_8317
    private _alignment: number = 9;

    // AS3: .../view/utils/Icon.as::get alignment()
    protected get alignment(): number
    {
        return this._alignment;
    }

    // AS3: .../view/utils/Icon.as::set alignment()
    protected set alignment(value: number)
    {
        this._alignment = value;
        this.redraw();
    }

    // AS3: .../view/utils/Icon.as::_SafeStr_4902
    protected _timerId: ReturnType<typeof setInterval> | null = null;

    // AS3: .../view/utils/Icon.as::_frame
    protected _frame: number = 0;

    // AS3: .../view/utils/Icon.as::_SafeStr_6228
    protected _notifying: boolean = false;

    // AS3: .../view/utils/Icon.as::_hover
    protected _hover: boolean = false;

    /**
     * Raising a notification force-enables the icon — a lamp with something to say is
     * never left disabled.
     */
    // AS3: .../view/utils/Icon.as::notify()
    notify(notifying: boolean): void
    {
        this._notifying = notifying;

        if(this._notifying && this._disabled)
        {
            this.enable(true);
        }
    }

    // AS3: .../view/utils/Icon.as::hover()
    hover(hover: boolean): void
    {
        this._hover = hover;
    }

    // AS3: .../view/utils/Icon.as::enable()
    enable(enabled: boolean): void
    {
        this._disabled = !enabled;
    }

    // AS3: .../view/utils/Icon.as::redraw()
    protected redraw(): void
    {
        const canvas = this._canvas;

        if(canvas === null || canvas.disposed)
        {
            return;
        }

        const width = (canvas as unknown as {width: number}).width;
        const height = (canvas as unknown as {height: number}).height;

        if(width <= 0 || height <= 0)
        {
            return;
        }

        const surface = new OffscreenCanvas(width, height);
        const context = surface.getContext('2d');

        if(context === null)
        {
            return;
        }

        const image = this._image;

        if(image !== null)
        {
            let x = 0;
            let y = 0;

            switch(this._alignment & Icon.MASK_HORIZONTAL)
            {
                case Icon.ALIGN_CENTER:
                    x = width / 2 - image.width / 2;
                    break;
                case Icon.ALIGN_RIGHT:
                    x = width - image.width;
                    break;
            }

            switch(this._alignment & Icon.MASK_VERTICAL)
            {
                case Icon.ALIGN_MIDDLE:
                    y = height / 2 - image.height / 2;
                    break;
                case Icon.ALIGN_BOTTOM:
                    y = height - image.height;
                    break;
            }

            context.drawImage(image, x, y);
        }

        canvas.bitmap = surface.transferToImageBitmap();
        (canvas as unknown as {invalidate(): void}).invalidate();
    }

    /**
     * Starts or stops the animation tick. Starting fires one frame immediately, so an
     * icon does not sit blank for a whole interval before its first draw.
     */
    // AS3: .../view/utils/Icon.as::toggleTimer()
    protected toggleTimer(on: boolean, delay: number): void
    {
        if(on)
        {
            if(this._timerId === null)
            {
                this._timerId = setInterval(() => this.onTimerEvent(), delay);
                this.onTimerEvent();
            }
            else
            {
                // AS3 reassigns `delay` on the live Timer; an interval cannot be
                // retimed, so it is replaced.
                clearInterval(this._timerId);
                this._timerId = setInterval(() => this.onTimerEvent(), delay);
            }
        }
        else
        {
            this._frame = 0;

            if(this._timerId !== null)
            {
                clearInterval(this._timerId);
                this._timerId = null;
            }
        }
    }

    /** Empty in the base class; each subclass animates its own way. */
    // AS3: .../view/utils/Icon.as::onTimerEvent()
    protected onTimerEvent(): void
    {
        // Intentionally empty - see AS3.
    }

    // AS3: .../view/utils/Icon.as::dispose()
    dispose(): void
    {
        if(this._disposed)
        {
            return;
        }

        this.toggleTimer(false, 0);
        this.image = null;
        this.canvas = null;
        this._disposed = true;
    }
}
