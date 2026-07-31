/**
 * Converts a DOM `WheelEvent` into the delta value the ported window system
 * expects on `WindowMouseEvent.delta`.
 *
 * This has no AS3 counterpart, because AS3 never needed one: Flash handed
 * `MouseEvent.delta` over already expressed in *lines* — 3 per wheel notch on
 * Windows, the OS setting — and every consumer here is built on that unit.
 * `SmoothScroller` multiplies a line by `DEFAULT_SCROLL_STEP` (25px) for lists,
 * and `ScrollBarController` maps one to 0.06 of its 0..1 offset.
 *
 * The DOM reports something else entirely: `deltaY` in pixels (~100 per notch,
 * `deltaMode` 0), lines (`deltaMode` 1) or pages (`deltaMode` 2). Feeding the
 * pixel value in unconverted made one notch worth 100 *lines* = 2500px of
 * scroll intent, which on any normal list overshoots `maxScrollV` several times
 * over and clamps the position to 0 or 1 — the "it only jumps fully to the top
 * or fully to the bottom, never anywhere in between" behaviour.
 *
 * A pixel delta is therefore rescaled so that a standard 100px notch is worth
 * the 3 lines Flash would have reported, keeping the original client's feel
 * (75px per notch in a list, 18% of the range on a scrollbar). Trackpads, which
 * emit a stream of small pixel deltas instead of discrete notches, come out
 * proportionally small and scroll smoothly.
 *
 * Flash's sign convention is the opposite of the DOM's — `delta > 0` means
 * scrolling *up* — so the result is negated.
 */
export class NativeWheelDelta
{
    // No `AS3:` traces below, and no `TODO(AS3)` either: nothing here was ported and
    // nothing is left to port, so either marker would be a lie. The traceability hook
    // flags every member of this class - that is expected, not an oversight.

    /** Lines per wheel notch, as Flash reported them on Windows. */
    public static readonly LINES_PER_NOTCH: number = 3;

    /** Pixels per wheel notch, as browsers report them in `deltaMode` 0. */
    public static readonly PIXELS_PER_NOTCH: number = 100;

    /** Lines per page, for the rarely-used `deltaMode` 2 (page) reporting. */
    public static readonly LINES_PER_PAGE: number = 16;

    private static readonly DOM_DELTA_LINE: number = 1;
    private static readonly DOM_DELTA_PAGE: number = 2;

    /**
     * Converts the vertical delta of a native wheel event to Flash line units.
     */
    public static fromWheelEvent(event: WheelEvent): number
    {
        return NativeWheelDelta.convert(event.deltaY, event.deltaMode);
    }

    /**
     * Converts a raw `deltaY`/`deltaMode` pair to Flash line units.
     */
    public static convert(deltaY: number, deltaMode: number): number
    {
        if(!Number.isFinite(deltaY) || deltaY === 0)
        {
            return 0;
        }

        let lines: number;

        switch(deltaMode)
        {
            case NativeWheelDelta.DOM_DELTA_LINE:
                lines = deltaY;
                break;
            case NativeWheelDelta.DOM_DELTA_PAGE:
                lines = deltaY * NativeWheelDelta.LINES_PER_PAGE;
                break;
            default:
                lines = (deltaY / NativeWheelDelta.PIXELS_PER_NOTCH) * NativeWheelDelta.LINES_PER_NOTCH;
                break;
        }

        return -lines;
    }
}