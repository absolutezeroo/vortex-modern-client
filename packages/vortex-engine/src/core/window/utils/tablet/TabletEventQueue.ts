import {MouseEventQueue} from '../MouseEventQueue';

/**
 * Queue of pending touch events for batch processing.
 *
 * AS3 derives this from `GenericEventQueue`, the shared base `MouseEventQueue` also
 * extends; this port has no separate `GenericEventQueue` class, so it derives from
 * `MouseEventQueue` directly - the members AS3 inherits from the common base are the
 * ones already on it.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/core/window/utils/tablet/TabletEventQueue.as
 */
export class TabletEventQueue extends MouseEventQueue
{
    private readonly _touchPosition: { x: number; y: number } = {x: 0, y: 0};

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/window/utils/tablet/TabletEventQueue.as::get touchPosition()
    public get touchPosition(): { x: number; y: number }
    {
        return this._touchPosition;
    }
}
