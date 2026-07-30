import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Hands the item the avatar is carrying to a pet (header 1429), sent by InfoStandWidgetHandler for
 * the "RWUAM_GIVE_CARRY_ITEM_TO_PET" action on the pet menu.
 *
 * Body is a single int (the pet's web id). Note this is a different message from the avatar-to-avatar
 * hand-off ("RWUAM_PASS_CARRY_ITEM", header 1101), which carries a user id instead.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2424/_SafeCls_2543.as
 * (obfuscated in the primary dump; `_composers[1429] = _SafeCls_2543` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as:646, and
 * the class name is recovered from
 * sources/win63_version/habbo/communication/messages/outgoing/room/avatar/PassCarryItemToPetMessageComposer.as).
 */
export class PassCarryItemToPetMessageComposer extends MessageComposer<ConstructorParameters<typeof PassCarryItemToPetMessageComposer>>
{
    private _data: ConstructorParameters<typeof PassCarryItemToPetMessageComposer>;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2424/_SafeCls_2543.as::PassCarryItemToPetMessageComposer()
    constructor(petId: number)
    {
        super();
        this._data = [petId];
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2424/_SafeCls_2543.as::getMessageArray()
    getMessageArray()
    {
        return this._data;
    }
}
