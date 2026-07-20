import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

/**
 * VariableDefinition — the wired "variable" definition flavour. A thin Triggerable subclass that
 * reads nothing of its own: the full definition (furni limits, stuff ids, params, input sources,
 * wired context, default int params) is parsed by the Triggerable base constructor, and this type
 * neither overrides readDefinitionSpecifics()/readTypeSpecifics() nor adds fields. It exists only
 * to type the "variable" definition in the wired furni protocol.
 *
 * Name derived: sibling of ActionDefinition/ConditionDefinition/AddonDefinition, the "variable"
 * flavour of a Triggerable definition (WIN63 obfuscated _SafeCls_3390; no counterpart in
 * vortex-flash-client).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/incoming/userdefinedroomevents/_SafeCls_3390.as
 */
export class VariableDefinition extends Triggerable
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/incoming/userdefinedroomevents/_SafeCls_3390.as::VariableDefinition()
    constructor(wrapper: IMessageDataWrapper)
    {
        super(wrapper);
    }
}
