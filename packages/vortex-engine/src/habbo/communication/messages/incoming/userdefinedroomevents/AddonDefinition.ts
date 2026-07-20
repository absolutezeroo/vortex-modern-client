import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

/**
 * AddonDefinition — the wired "addon" definition DTO. A Triggerable specialization that adds no
 * fields of its own and does not override the readDefinitionSpecifics()/readTypeSpecifics() hooks,
 * so its wire shape is identical to the base Triggerable; the distinct class exists to carry the
 * addon semantics in the type system.
 *
 * Name derived: models the wired-furni "addon" definition alongside ActionDefinition/ConditionDefinition
 * (WIN63 obfuscated _SafeCls_2727 = "_-Ap"; no counterpart in vortex-flash-client).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/incoming/userdefinedroomevents/_SafeCls_2727.as
 */
export class AddonDefinition extends Triggerable
{
    // AS3: _SafeCls_2727.as::_SafeCls_2727()
    constructor(wrapper: IMessageDataWrapper)
    {
        super(wrapper);
    }
}
