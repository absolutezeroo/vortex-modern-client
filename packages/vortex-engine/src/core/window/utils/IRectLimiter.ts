/**
 * Interface for rectangle size limits.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/core/window/utils/IRectLimiter.as
 */
export interface IRectLimiter
{
    // AS3: .../src/com/sulake/core/window/utils/IRectLimiter.as::get minWidth()
    minWidth: number;
    // AS3: .../src/com/sulake/core/window/utils/IRectLimiter.as::get maxWidth()
    maxWidth: number;
    // AS3: .../src/com/sulake/core/window/utils/IRectLimiter.as::get minHeight()
    minHeight: number;
    // AS3: .../src/com/sulake/core/window/utils/IRectLimiter.as::get maxHeight()
    maxHeight: number;

    assign(minWidth: number, maxWidth: number, minHeight: number, maxHeight: number): void;

    clone(owner?: unknown): IRectLimiter;
}
