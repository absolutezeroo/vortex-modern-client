import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Header 1063 — back out of a mystery-box open flow.
 *
 * The int is the **furniture owner's** user id, not the object id: AS3 passes
 * `container.getFurnitureOwnerId(object)`. Sent by whichever side pressed cancel; the server
 * relays a CancelMysteryBoxWait (3840) to the other one.
 *
 * @see sources/win63_version/habbo/communication/messages/outgoing/mysterybox/MysteryBoxWaitingCanceledMessageComposer.as
 *
 * WIN63 primary: `src/unknowns/_SafePkg_2599/_SafeCls_2598.as`, registered at
 * `_SafeCls_2046.as::_composers[1063]`.
 */
export class MysteryBoxWaitingCanceledMessageComposer extends MessageComposer<[number]>
{
    private _data: [number];

    // AS3: MysteryBoxWaitingCanceledMessageComposer.as::MysteryBoxWaitingCanceledMessageComposer()
    constructor(furnitureOwnerId: number)
    {
        super();

        this._data = [furnitureOwnerId];
    }

    // AS3: MysteryBoxWaitingCanceledMessageComposer.as::getMessageArray()
    getMessageArray(): [number]
    {
        return this._data;
    }
}
