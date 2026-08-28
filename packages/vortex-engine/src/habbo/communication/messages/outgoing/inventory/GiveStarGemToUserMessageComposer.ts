import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Send star gems to another user.
 *
 * Always sends a quantity of 1.
 *
 * TS-only: **this composer exists in no source tree.** There is no file of this name in
 * `win63_version` (the citation this header used to carry pointed at one), no entry for it in the
 * primary tree's registry, no construction call site, and `SessionDataManager.as` there has no
 * `giveStarGem()`. It is left unregistered in `HabboMessages` for the same reason — see the note
 * there, above the commented-out `_composers.set(1111, ...)`.
 */
export class GiveStarGemToUserMessageComposer extends MessageComposer<[number, number]>
{
    private _data: [number, number];

    constructor(userId: number)
    {
        super();
        this._data = [userId, 1];
    }

    getMessageArray(): [number, number]
    {
        return this._data;
    }
}
