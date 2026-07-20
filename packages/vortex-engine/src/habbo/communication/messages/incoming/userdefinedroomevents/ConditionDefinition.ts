import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

/**
 * ConditionDefinition — the wired-furni "condition" flavour of a {@link Triggerable} definition.
 * On top of the base Triggerable read it carries a quantifier (code + type) and an invert flag,
 * populated through the base constructor's {@link Triggerable.readDefinitionSpecifics} /
 * {@link Triggerable.readTypeSpecifics} hooks that this subclass overrides.
 *
 * The extra fields use `declare`: the base constructor sets them during `super()` via those virtual
 * hooks, so a real (initialised or bare) field declaration would re-run after `super()` under
 * ES2022 define-semantics and clobber the wire-read value back to `undefined`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/incoming/userdefinedroomevents/ConditionDefinition.as
 */
export class ConditionDefinition extends Triggerable
{
    // AS3: ConditionDefinition.as::quantifierCode (set in readDefinitionSpecifics())
    private declare _quantifierCode: number;

    // AS3: ConditionDefinition.as::quantifierType (set in readTypeSpecifics(), read as a byte)
    private declare _quantifierType: number;

    // AS3: ConditionDefinition.as::isInvert (set in readTypeSpecifics())
    private declare _isInvert: boolean;

    // AS3: ConditionDefinition.as::ConditionDefinition()
    constructor(wrapper: IMessageDataWrapper)
    {
        super(wrapper);
    }

    // AS3: ConditionDefinition.as::readDefinitionSpecifics()
    protected override readDefinitionSpecifics(wrapper: IMessageDataWrapper): void
    {
        this._quantifierCode = wrapper.readInt();
    }

    // AS3: ConditionDefinition.as::readTypeSpecifics()
    protected override readTypeSpecifics(wrapper: IMessageDataWrapper): void
    {
        this._quantifierType = wrapper.readByte();
        this._isInvert = wrapper.readBoolean();
    }

    // AS3: ConditionDefinition.as::get quantifierCode()
    get quantifierCode(): number
    {
        return this._quantifierCode;
    }

    // AS3: ConditionDefinition.as::set quantifierCode()
    set quantifierCode(value: number)
    {
        this._quantifierCode = value;
    }

    // AS3: ConditionDefinition.as::get quantifierType()
    get quantifierType(): number
    {
        return this._quantifierType;
    }

    // AS3: ConditionDefinition.as::get isInvert()
    get isInvert(): boolean
    {
        return this._isInvert;
    }

    // AS3: ConditionDefinition.as::get usingCustomInputSources()
    override get usingCustomInputSources(): boolean
    {
        return super.usingCustomInputSources || this.quantifierCode !== 0;
    }
}
