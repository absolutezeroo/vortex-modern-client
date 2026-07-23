import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {InputSourcesConf} from '@habbo/communication/messages/incoming/userdefinedroomevents/InputSourcesConf';
import {WiredContext} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredcontext/WiredContext';

/**
 * Triggerable — the base wired-furni "definition" DTO parsed inline from the message stream.
 * It carries the shared shape of every wired definition flavour (trigger / action / condition /
 * addon / variable): the furni limit, selected stuff ids, int/string params, allowed and default
 * furni/user selection sources ({@link InputSourcesConf}), and the wired execution
 * {@link WiredContext}. Subclasses (TriggerDefinition, ActionDefinition, ConditionDefinition,
 * AddonDefinition, VariableDefinition) override the protected {@link readDefinitionSpecifics} /
 * {@link readTypeSpecifics} hooks to read their extra fields at the exact stream position AS3 does.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/incoming/userdefinedroomevents/Triggerable.as
 */
export class Triggerable
{
    // AS3: Triggerable.as::get furniLimit()
    private _furniLimit: number = 0;

    // AS3: Triggerable.as::get stuffIds()
    private _stuffIds: number[] = [];

    // AS3: Triggerable.as::get stuffIds2()
    private _stuffIds2: number[] = [];

    // AS3: Triggerable.as::get id()
    private _id: number = 0;

    // AS3: Triggerable.as::get stringParam()
    private _stringParam: string = '';

    // AS3: Triggerable.as::get intParams()
    private _intParams: number[] = [];

    // AS3: Triggerable.as::get variableIds()
    private _variableIds: string[] = [];

    // AS3: Triggerable.as::get stuffTypeId()
    private _stuffTypeId: number = 0;

    // AS3: Triggerable.as::get code()
    private _code: number = 0;

    // AS3: Triggerable.as::get furniSourceTypes()
    private _furniSourceTypes: number[] = [];

    // AS3: Triggerable.as::get userSourceTypes()
    private _userSourceTypes: number[] = [];

    // AS3: Triggerable.as::get advancedMode()
    private _advancedMode: boolean = false;

    // AS3: Triggerable.as::get inputSourcesConf()
    private _inputSourcesConf: InputSourcesConf;

    // AS3: Triggerable.as::get allowWallFurni()
    private _allowWallFurni: boolean = false;

    // AS3: Triggerable.as::get wiredContext()
    private _wiredContext: WiredContext;

    // AS3: Triggerable.as::get defaultIntParams()
    private _defaultIntParams: number[] = [];

    // AS3: Triggerable.as::Triggerable()
    constructor(wrapper: IMessageDataWrapper)
    {
        this._furniLimit = wrapper.readInt();

        const stuffIdsCount: number = wrapper.readInt();
        for(let i = 0; i < stuffIdsCount; i++)
        {
            this._stuffIds.push(wrapper.readInt());
        }

        const stuffIds2Count: number = wrapper.readInt();
        for(let i = 0; i < stuffIds2Count; i++)
        {
            this._stuffIds2.push(wrapper.readInt());
        }

        this._stuffTypeId = wrapper.readInt();
        this._id = wrapper.readInt();
        this._stringParam = wrapper.readString();

        const intParamsCount: number = wrapper.readInt();
        for(let i = 0; i < intParamsCount; i++)
        {
            this._intParams.push(wrapper.readInt());
        }

        const variableIdsCount: number = wrapper.readInt();
        for(let i = 0; i < variableIdsCount; i++)
        {
            this._variableIds.push(wrapper.readString());
        }

        const furniSourceTypesCount: number = wrapper.readInt();
        for(let i = 0; i < furniSourceTypesCount; i++)
        {
            this._furniSourceTypes.push(wrapper.readInt());
        }

        const userSourceTypesCount: number = wrapper.readInt();
        for(let i = 0; i < userSourceTypesCount; i++)
        {
            this._userSourceTypes.push(wrapper.readInt());
        }

        this._code = wrapper.readInt();
        this.readDefinitionSpecifics(wrapper);
        this._advancedMode = wrapper.readBoolean();
        this._inputSourcesConf = new InputSourcesConf(wrapper);
        this._allowWallFurni = wrapper.readBoolean();
        this.readTypeSpecifics(wrapper);
        this._wiredContext = new WiredContext(wrapper);

        const defaultIntParamsCount: number = wrapper.readInt();
        for(let i = 0; i < defaultIntParamsCount; i++)
        {
            this._defaultIntParams.push(wrapper.readInt());
        }
    }

    // AS3: Triggerable.as::get furniLimit()
    get furniLimit(): number
    {
        return this._furniLimit;
    }

    // AS3: Triggerable.as::get stuffIds()
    get stuffIds(): number[]
    {
        return this._stuffIds;
    }

    // AS3: Triggerable.as::set stuffIds()
    set stuffIds(value: number[])
    {
        this._stuffIds = value;
    }

    // AS3: Triggerable.as::get stuffIds2()
    get stuffIds2(): number[]
    {
        return this._stuffIds2;
    }

    // AS3: Triggerable.as::set stuffIds2()
    set stuffIds2(value: number[])
    {
        this._stuffIds2 = value;
    }

    // AS3: Triggerable.as::get id()
    get id(): number
    {
        return this._id;
    }

    // AS3: Triggerable.as::get stringParam()
    get stringParam(): string
    {
        return this._stringParam;
    }

    // AS3: Triggerable.as::set stringParam()
    set stringParam(value: string)
    {
        this._stringParam = value;
    }

    // AS3: Triggerable.as::get intParams()
    get intParams(): number[]
    {
        return this._intParams;
    }

    // AS3: Triggerable.as::set intParams()
    set intParams(value: number[])
    {
        this._intParams = value;
    }

    // AS3: Triggerable.as::get variableIds()
    get variableIds(): string[]
    {
        return this._variableIds;
    }

    // AS3: Triggerable.as::set variableIds()
    set variableIds(value: string[])
    {
        this._variableIds = value;
    }

    // AS3: Triggerable.as::get furniSourceTypes()
    get furniSourceTypes(): number[]
    {
        return this._furniSourceTypes;
    }

    // AS3: Triggerable.as::set furniSourceTypes()
    set furniSourceTypes(value: number[])
    {
        this._furniSourceTypes = value;
    }

    // AS3: Triggerable.as::get userSourceTypes()
    get userSourceTypes(): number[]
    {
        return this._userSourceTypes;
    }

    // AS3: Triggerable.as::set userSourceTypes()
    set userSourceTypes(value: number[])
    {
        this._userSourceTypes = value;
    }

    // AS3: Triggerable.as::get advancedMode()
    get advancedMode(): boolean
    {
        return this._advancedMode;
    }

    // AS3: Triggerable.as::get inputSourcesConf()
    get inputSourcesConf(): InputSourcesConf
    {
        return this._inputSourcesConf;
    }

    // AS3: Triggerable.as::get code()
    get code(): number
    {
        return this._code;
    }

    // AS3: Triggerable.as::get stuffTypeId()
    get stuffTypeId(): number
    {
        return this._stuffTypeId;
    }

    // AS3: Triggerable.as::getBoolean()
    getBoolean(index: number): boolean
    {
        return this._intParams[index] === 1;
    }

    // AS3: Triggerable.as::getString()
    getString(index: number = -1, separator: string = '\t'): string
    {
        if(index === -1)
        {
            return this._stringParam;
        }
        const parts: string[] = this._stringParam.split(separator);
        return parts.length > index ? parts[index] : '';
    }

    // AS3: Triggerable.as::getInt()
    getInt(index: number): number
    {
        // AS3 `getInt():int` returns `_intParams[index]` through an `:int` return type, which implicitly
        // coerces via int(): a missing (out-of-range) or NaN slot becomes 0, fractionals truncate toward
        // zero. TS erases the return type so the coercion must be explicit — otherwise a missing param
        // surfaces as `undefined`/NaN and shows up as "NaN" in number inputs (e.g. Date/TimeMatches).
        const value = this._intParams[index];
        return value === undefined || Number.isNaN(value) ? 0 : Math.trunc(value);
    }

    // AS3: Triggerable.as::get allowWallFurni()
    get allowWallFurni(): boolean
    {
        return this._allowWallFurni;
    }

    // AS3: Triggerable.as::get wiredContext()
    get wiredContext(): WiredContext
    {
        return this._wiredContext;
    }

    // AS3: Triggerable.as::get defaultIntParams()
    get defaultIntParams(): number[]
    {
        return this._defaultIntParams;
    }

    // AS3: Triggerable.as::readDefinitionSpecifics()
    protected readDefinitionSpecifics(_wrapper: IMessageDataWrapper): void
    {
    }

    // AS3: Triggerable.as::readTypeSpecifics()
    protected readTypeSpecifics(_wrapper: IMessageDataWrapper): void
    {
    }

    // AS3: Triggerable.as::get usingCustomInputSources()
    get usingCustomInputSources(): boolean
    {
        return this._inputSourcesConf.isUsingAdvancedSettings(this.furniSourceTypes, this.userSourceTypes);
    }
}
