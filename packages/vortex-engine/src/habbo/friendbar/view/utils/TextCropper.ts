import type {IDisposable} from '@core/runtime/IDisposable';
import type {ITextWindow} from '@core/window/components/ITextWindow';

/**
 * TextCropper
 *
 * Truncates a text window's first line to its own width, with an ellipsis — friend
 * names in the bar are far wider than a slot.
 *
 * AS3 measures in an offscreen `TextField` carrying the window's format and finds the
 * cut with `getCharIndexAtPoint()`. This port has no offscreen text measurer, so the
 * cut is found by binary search against the window's own `textWidth`: each candidate is
 * assigned, measured, and the original restored if nothing needed cutting. Those are
 * real measurements of the real renderer, not an estimate from character counts.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/view/utils/TextCropper.as
 */
export class TextCropper implements IDisposable
{
    // AS3: .../view/utils/TextCropper.as::_SafeStr_10395
    private static readonly ELLIPSIS: string = '...';

    /** Head-room AS3 leaves for the ellipsis when picking the cut point. */
    // AS3: .../view/utils/TextCropper.as::_SafeStr_10443
    private static readonly ELLIPSIS_MARGIN: number = 20;

    // AS3: .../view/utils/TextCropper.as::_disposed
    private _disposed: boolean = false;

    // AS3: .../view/utils/TextCropper.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../view/utils/TextCropper.as::crop()
    crop(textWindow: ITextWindow): void
    {
        const window = textWindow as unknown as {width: number};
        const original = textWindow.text;

        if(textWindow.textWidth <= window.width)
        {
            return;
        }

        const budget = window.width - TextCropper.ELLIPSIS_MARGIN;

        if(budget <= 0)
        {
            textWindow.text = TextCropper.ELLIPSIS;

            return;
        }

        let low = 0;
        let high = original.length;

        while(low < high)
        {
            const middle = Math.ceil((low + high) / 2);

            textWindow.text = original.slice(0, middle);

            if(textWindow.textWidth <= budget)
            {
                low = middle;
            }
            else
            {
                high = middle - 1;
            }
        }

        textWindow.text = original.slice(0, low) + TextCropper.ELLIPSIS;
    }

    // AS3: .../view/utils/TextCropper.as::dispose()
    dispose(): void
    {
        if(this._disposed)
        {
            return;
        }

        this._disposed = true;
    }
}
