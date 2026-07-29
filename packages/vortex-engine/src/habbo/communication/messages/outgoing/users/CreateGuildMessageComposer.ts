import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * CreateGuildMessageComposer (header 207)
 *
 * The purchase itself: name, description, base room, the two guild colours, then the
 * badge as a flat run of ints prefixed by its length — three ints per layer
 * (part, colour, position), which is why the caller passes an already-flattened array.
 *
 * Class name recovered from
 * sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/communication/messages/outgoing/users/CreateGuildMessageComposer.as
 * and corroborated by the emulator's `CreateGuildMessageEvent = 207`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1789/_SafeCls_2496.as
 */
export class CreateGuildMessageComposer extends MessageComposer<unknown[]>
{
    private _data: unknown[] = [];

    // AS3: .../_SafeCls_2496.as::_SafeCls_2496()
    constructor(name: string, description: string, roomId: number, primaryColorId: number, secondaryColorId: number, badgeSettings: number[])
    {
        super();

        this._data.push(name);
        this._data.push(description);
        this._data.push(roomId);
        this._data.push(primaryColorId);
        this._data.push(secondaryColorId);
        this._data.push(badgeSettings.length);

        for(let i = 0; i < badgeSettings.length; i++)
        {
            this._data.push(badgeSettings[i] | 0);
        }
    }

    // AS3: .../_SafeCls_2496.as::getMessageArray()
    getMessageArray(): unknown[]
    {
        return this._data;
    }
}
