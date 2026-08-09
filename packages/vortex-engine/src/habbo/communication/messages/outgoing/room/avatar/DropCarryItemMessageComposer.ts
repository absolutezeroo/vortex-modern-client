import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Puts down whatever the avatar is carrying (header 1545), sent by InfoStandWidgetHandler for the
 * "RWUAM_DROP_CARRY_ITEM" action on your own avatar's menu.
 *
 * No body: the server knows what you are holding, so the message is the whole instruction.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2424/_SafeCls_2423.as
 * (obfuscated in the primary dump; `_composers[1545] = _SafeCls_2423` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as:661, and
 * the class name is recovered from
 * sources/win63_version/habbo/communication/messages/outgoing/room/avatar/DropCarryItemMessageComposer.as).
 */
export class DropCarryItemMessageComposer extends MessageComposer<[]>
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2424/_SafeCls_2423.as::DropCarryItemMessageComposer()
    constructor()
    {
        super();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2424/_SafeCls_2423.as::getMessageArray()
    getMessageArray(): []
    {
        return [];
    }
}
