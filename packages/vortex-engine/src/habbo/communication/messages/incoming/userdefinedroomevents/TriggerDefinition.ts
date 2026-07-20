import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

/**
 * TriggerDefinition — the wired-furni "trigger" flavour of a {@link Triggerable} definition.
 * It adds no fields of its own; the entire read is delegated to the Triggerable base
 * constructor, so this subclass exists purely to name the trigger variant.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/incoming/userdefinedroomevents/TriggerDefinition.as
 */
export class TriggerDefinition extends Triggerable
{
    // AS3: TriggerDefinition.as::TriggerDefinition()
    constructor(wrapper: IMessageDataWrapper)
    {
        super(wrapper);
    }
}
