import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

/**
 * ActionDefinition — the wired-furni "action" flavour of a {@link Triggerable} definition.
 * Beyond the shared Triggerable payload it carries a single extra field, the action's delay
 * in game pulses, read via the readDefinitionSpecifics() hook the base Triggerable constructor
 * invokes mid-parse.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/incoming/userdefinedroomevents/ActionDefinition.as
 */
export class ActionDefinition extends Triggerable
{
    // AS3: ActionDefinition.as::_delayInPulses
    // Declared (never initialized) on purpose: readDefinitionSpecifics() assigns it DURING super(),
    // and TS runs a derived field initializer AFTER super() returns — a real field here would clobber
    // that value back to undefined. `declare` emits no field, so the mid-super assignment survives.
    private declare _delayInPulses: number;

    // AS3: ActionDefinition.as::ActionDefinition()
    constructor(wrapper: IMessageDataWrapper)
    {
        super(wrapper);
    }

    // AS3: ActionDefinition.as::readDefinitionSpecifics()
    protected override readDefinitionSpecifics(wrapper: IMessageDataWrapper): void
    {
        this._delayInPulses = wrapper.readInt();
    }

    // AS3: ActionDefinition.as::get delayInPulses()
    get delayInPulses(): number
    {
        return this._delayInPulses;
    }

    // AS3: ActionDefinition.as::set delayInPulses()
    set delayInPulses(value: number)
    {
        this._delayInPulses = value;
    }
}
