import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Hands the item the avatar is carrying to another *user* (header 1101), sent by
 * InfoStandWidgetHandler for the "RWUAM_PASS_CARRY_ITEM" action on another avatar's menu.
 *
 * Body is a single int (the target's room index, as every other user-action composer in this
 * handler takes). The pet counterpart is a different message —
 * `PassCarryItemToPetMessageComposer`, header 1429.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2424/_SafeCls_3124.as
 * (obfuscated in the primary dump; `_composers[1101] = _SafeCls_3124` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as:600, and
 * the class name is recovered from
 * sources/win63_version/habbo/communication/messages/outgoing/room/avatar/PassCarryItemMessageComposer.as).
 */
export class PassCarryItemMessageComposer extends MessageComposer<ConstructorParameters<typeof PassCarryItemMessageComposer>>
{
    // TS-only: the port's MessageComposer keeps its body in a typed tuple; AS3 stores the single
    // int in a plain field (`var_1270`).
    private _data: ConstructorParameters<typeof PassCarryItemMessageComposer>;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2424/_SafeCls_3124.as::PassCarryItemMessageComposer()
    constructor(userId: number)
    {
        super();
        this._data = [userId];
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2424/_SafeCls_3124.as::getMessageArray()
    getMessageArray()
    {
        return this._data;
    }
}
