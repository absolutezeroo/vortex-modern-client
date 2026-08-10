import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Pin or lock a thread. Both flags are always sent, so the caller passes the state it wants for
 * each, not just the one it is changing.
 *
 * **The payload order is not the parameter order.** AS3 declares
 * `(groupId, threadId, isLocked, isSticky)` and sends `[groupId, threadId, isSticky, isLocked]` —
 * the two booleans are swapped on the way out. Both source trees agree on the swap, and the two
 * call sites settle which parameter is which: `ThreadListItemView` calls
 * `lockThread(forum, threadId, !isLocked, isSticky)` and
 * `stickThread(forum, threadId, isLocked, !isSticky)`. Reproduced exactly; getting this wrong
 * silently pins a thread when the user asked to lock it.
 *
 * AS3: sources/win63_version/habbo/communication/messages/outgoing/groupforums/UpdateThreadMessageComposer.as
 * (`_SafeCls_3919` in the primary tree; header 3206 from its registry)
 */
export class UpdateThreadMessageComposer extends MessageComposer<[number, number, boolean, boolean]>
{
    private _data: [number, number, boolean, boolean];

    constructor(groupId: number, threadId: number, isLocked: boolean, isSticky: boolean)
    {
        super();

        this._data = [groupId, threadId, isSticky, isLocked];
    }

    // AS3: .../groupforums/UpdateThreadMessageComposer.as::getMessageArray()
    getMessageArray(): [number, number, boolean, boolean]
    {
        return this._data;
    }
}
