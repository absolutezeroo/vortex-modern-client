import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Header 2242 — open a mystery trophy, engraving it with the text the user typed.
 *
 * @see sources/win63_version/habbo/communication/messages/outgoing/room/furniture/OpenMysteryTrophyMessageComposer.as
 *
 * WIN63 primary: `src/unknowns/_SafePkg_2609/_SafeCls_3679.as`, registered at
 * `_SafeCls_2046.as::_composers[2242]`.
 */
export class OpenMysteryTrophyMessageComposer extends MessageComposer<[number, string]>
{
    private _data: [number, string];

    // AS3: OpenMysteryTrophyMessageComposer.as::OpenMysteryTrophyMessageComposer()
    constructor(objectId: number, inscription: string)
    {
        super();

        this._data = [objectId, inscription];
    }

    // AS3: OpenMysteryTrophyMessageComposer.as::getMessageArray()
    getMessageArray(): [number, string]
    {
        return this._data;
    }
}
