/**
 * One avatar effect as the me-menu sees it: how many you own, whether it is running, and how long
 * it has left.
 *
 * Interface name DERIVED: the AS3 file is `_SafeCls_3596.as` and the identifier exists in no tree.
 * Named for the members it declares and for where it lives (`widget/memenu/`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/memenu/_SafeCls_3596.as
 */
export interface IMeMenuEffect
{
    // AS3: .../widget/memenu/_SafeCls_3596.as::get amountInInventory()
    readonly amountInInventory: number;

    // AS3: .../widget/memenu/_SafeCls_3596.as::get type()
    readonly type: number;

    // AS3: .../widget/memenu/_SafeCls_3596.as::get secondsLeft()
    readonly secondsLeft: number;

    // AS3: .../widget/memenu/_SafeCls_3596.as::get duration()
    readonly duration: number;

    // AS3: .../widget/memenu/_SafeCls_3596.as::get isActive()
    // "Owned and usable", as against `isInUse` — an effect can be active without being worn.
    readonly isActive: boolean;

    // AS3: .../widget/memenu/_SafeCls_3596.as::get isInUse()
    readonly isInUse: boolean;

    /**
     * AS3 types this `flash.display.BitmapData`; this port's bitmap windows take an `ImageBitmap`,
     * which is the same thing on this side of the port.
     */
    // AS3: .../widget/memenu/_SafeCls_3596.as::get icon()
    readonly icon: ImageBitmap | null;
}
