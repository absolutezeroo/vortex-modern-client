import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

/**
 * SelectorDefinition — a Triggerable whose definition-specifics slot carries two selector flags:
 * whether the selector acts as a filter, and whether its match is inverted. Constructed inline
 * from the message stream via the base Triggerable constructor.
 *
 * Wire note: the base Triggerable constructor calls readDefinitionSpecifics() DURING super(), so
 * both flags are set before this subclass's field initializers would run. Under TS
 * `useDefineForClassFields` (target ES2022) a normal field declaration re-defines the field to
 * `undefined` right after super() returns, silently clobbering the wire-read values — hence the
 * `declare` modifier, which emits no field definition and preserves what super() set.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/incoming/userdefinedroomevents/SelectorDefinition.as
 */
export class SelectorDefinition extends Triggerable
{
    // AS3: SelectorDefinition.as::isFilter (backing field; assigned in readDefinitionSpecifics during super())
    private declare _isFilter: boolean;

    // AS3: SelectorDefinition.as::isInvert (backing field; assigned in readDefinitionSpecifics during super())
    private declare _isInvert: boolean;

    // AS3: SelectorDefinition.as::SelectorDefinition()
    constructor(wrapper: IMessageDataWrapper)
    {
        super(wrapper);
    }

    // AS3: SelectorDefinition.as::readDefinitionSpecifics()
    protected override readDefinitionSpecifics(wrapper: IMessageDataWrapper): void
    {
        this._isFilter = wrapper.readBoolean();
        this._isInvert = wrapper.readBoolean();
    }

    // AS3: SelectorDefinition.as::get isFilter()
    get isFilter(): boolean
    {
        return this._isFilter;
    }

    // AS3: SelectorDefinition.as::set isFilter()
    set isFilter(value: boolean)
    {
        this._isFilter = value;
    }

    // AS3: SelectorDefinition.as::get isInvert()
    get isInvert(): boolean
    {
        return this._isInvert;
    }

    // AS3: SelectorDefinition.as::set isInvert()
    set isInvert(value: boolean)
    {
        this._isInvert = value;
    }
}
