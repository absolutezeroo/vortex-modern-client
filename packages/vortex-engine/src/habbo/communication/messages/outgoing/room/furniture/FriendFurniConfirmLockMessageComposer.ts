import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Answers a friendship-furni confirmation: true to engrave, false to back out (header 3318).
 *
 * The class name is **derived**, not recovered: the composer is
 * `_SafePkg_2585/_SafeCls_2584` in every tree. It matches `vortex-emulator`'s
 * `FriendFurniConfirmLockMessageEvent`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2585/_SafeCls_2584.as
 */
export class FriendFurniConfirmLockMessageComposer extends MessageComposer<[number, boolean]>
{
    // AS3: .../_SafePkg_2585/_SafeCls_2584.as::_SafeCls_2584()
    constructor(stuffId: number, confirmed: boolean)
    {
        super();

        this._data = [stuffId, confirmed];
    }

    private _data: [number, boolean];

    // AS3: .../_SafePkg_2585/_SafeCls_2584.as::getMessageArray()
    getMessageArray(): [number, boolean]
    {
        return this._data;
    }
}
