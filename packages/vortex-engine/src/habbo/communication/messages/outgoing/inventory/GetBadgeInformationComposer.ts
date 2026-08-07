import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Asks the server for one badge's rarity and owner count, by badge code.
 *
 * Header 3159, from WIN63's registry (`_composers[3159] = _SafeCls_3448`). The emulator has no
 * counterpart — its only 3159 is an unrelated *server→client* composer, which is a different
 * table and so not a conflict. Class name DERIVED: the identifier exists in no tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2020/_SafeCls_3448.as
 */
export class GetBadgeInformationComposer extends MessageComposer<[string]>
{
    // AS3: .../src/unknowns/_SafePkg_2020/_SafeCls_3448.as::_data
    private _data: [string];

    // AS3: .../src/unknowns/_SafePkg_2020/_SafeCls_3448.as::_SafeCls_3448()
    constructor(badgeCode: string)
    {
        super();

        this._data = [badgeCode];
    }

    // AS3: .../src/unknowns/_SafePkg_2020/_SafeCls_3448.as::getMessageArray()
    getMessageArray(): [string]
    {
        return this._data;
    }
}
