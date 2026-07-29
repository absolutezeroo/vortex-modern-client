import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * UpdateGuildBadgeMessageComposer (header 3882)
 *
 * Saves the badge of an existing group. Same flattened badge encoding as
 * `CreateGuildMessageComposer`: a length followed by three ints per layer.
 *
 * Class name recovered from
 * sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/communication/messages/outgoing/users/UpdateGuildBadgeMessageComposer.as
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1789/_SafeCls_3981.as
 */
export class UpdateGuildBadgeMessageComposer extends MessageComposer<unknown[]>
{
    private _data: unknown[] = [];

    // AS3: .../_SafeCls_3981.as::_SafeCls_3981()
    constructor(groupId: number, badgeSettings: number[])
    {
        super();

        this._data.push(groupId);
        this._data.push(badgeSettings.length);

        for(let i = 0; i < badgeSettings.length; i++)
        {
            this._data.push(badgeSettings[i] | 0);
        }
    }

    // AS3: .../_SafeCls_3981.as::getMessageArray()
    getMessageArray(): unknown[]
    {
        return this._data;
    }
}
