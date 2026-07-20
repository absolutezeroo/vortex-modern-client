import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {OrderedMap} from '@core/utils/OrderedMap';
import {WiredVariableDataType} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariableDataType';

/**
 * WiredVariable — a single wired variable descriptor sent in the userdefinedroomevents protocol:
 * its id, type, display name, availability/target codes, a block of capability flags, and an
 * optional "text connector" (an ordered int -> string map). Constructed inline from the message
 * stream; the field read order below is authoritative for the wire format.
 *
 * The optional text connector is AS3's `_SafeCls_481` (com.sulake.core.utils), ported as
 * {@link OrderedMap}. `availabilityType` is compared against {@link WiredVariableDataType}
 * constants in `isPersisted`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3851/WiredVariable.as
 */
export class WiredVariable
{
    // AS3: WiredVariable.as::_SafeStr_4685 (value "n") — name derived: the fallback/default variable
    // id used across wired_setup when no variable is selected (e.g. variableIds[0] ?? this); the
    // identifier is obfuscated with no counterpart in any source tree.
    static readonly DEFAULT_VARIABLE_ID: string = 'n';

    // AS3: WiredVariable.as::_SafeStr_9014 (variableId backing field)
    private _variableId: string;

    // AS3: WiredVariable.as::_SafeStr_9526 (variableType backing field)
    private _variableType: number;

    // AS3: WiredVariable.as::_variableName
    private _variableName: string;

    // AS3: WiredVariable.as::_SafeStr_6508 (availabilityType backing field)
    private _availabilityType: number;

    // AS3: WiredVariable.as::_SafeStr_5920 (variableTarget backing field)
    private _variableTarget: number;

    // AS3: WiredVariable.as::_SafeStr_9224 (alwaysAvailable backing field)
    private _alwaysAvailable: boolean;

    // AS3: WiredVariable.as::_SafeStr_10109 (canCreateAndDelete backing field)
    private _canCreateAndDelete: boolean;

    // AS3: WiredVariable.as::_SafeStr_9636 (hasValue backing field)
    private _hasValue: boolean;

    // AS3: WiredVariable.as::_SafeStr_9789 (canWriteValue backing field)
    private _canWriteValue: boolean;

    // AS3: WiredVariable.as::_SafeStr_10075 (canInterceptChanges backing field)
    private _canInterceptChanges: boolean;

    // AS3: WiredVariable.as::_SafeStr_10088 (isInvisible backing field)
    private _isInvisible: boolean;

    // AS3: WiredVariable.as::_SafeStr_9740 (canReadCreationTime backing field)
    private _canReadCreationTime: boolean;

    // AS3: WiredVariable.as::_SafeStr_9333 (canReadLastUpdateTime backing field)
    private _canReadLastUpdateTime: boolean;

    // AS3: WiredVariable.as::_SafeStr_7685 (textConnector backing field, _SafeCls_481 -> OrderedMap)
    private _textConnector: OrderedMap<number, string> | null = null;

    // AS3: WiredVariable.as::WiredVariable()
    constructor(wrapper: IMessageDataWrapper)
    {
        this._variableId = wrapper.readString();
        this._variableType = wrapper.readInt();
        this._variableName = wrapper.readString();
        this._availabilityType = wrapper.readInt();
        this._variableTarget = wrapper.readInt();
        this._alwaysAvailable = wrapper.readBoolean();
        this._canCreateAndDelete = wrapper.readBoolean();
        this._hasValue = wrapper.readBoolean();
        this._canWriteValue = wrapper.readBoolean();
        this._canInterceptChanges = wrapper.readBoolean();
        this._isInvisible = wrapper.readBoolean();
        this._canReadCreationTime = wrapper.readBoolean();
        this._canReadLastUpdateTime = wrapper.readBoolean();

        const hasTextConnector: boolean = wrapper.readBoolean();

        if(hasTextConnector)
        {
            this._textConnector = new OrderedMap<number, string>();

            const count: number = wrapper.readInt();

            for(let i = 0; i < count; i++)
            {
                const key: number = wrapper.readInt();
                const value: string = wrapper.readString();

                this._textConnector.add(key, value);
            }
        }
    }

    // AS3: WiredVariable.as::get variableId()
    get variableId(): string
    {
        return this._variableId;
    }

    // AS3: WiredVariable.as::get variableType()
    get variableType(): number
    {
        return this._variableType;
    }

    // AS3: WiredVariable.as::get variableName()
    get variableName(): string
    {
        return this._variableName;
    }

    // AS3: WiredVariable.as::get availabilityType()
    get availabilityType(): number
    {
        return this._availabilityType;
    }

    // AS3: WiredVariable.as::get variableTarget()
    get variableTarget(): number
    {
        return this._variableTarget;
    }

    // AS3: WiredVariable.as::get alwaysAvailable()
    get alwaysAvailable(): boolean
    {
        return this._alwaysAvailable;
    }

    // AS3: WiredVariable.as::get canCreateAndDelete()
    get canCreateAndDelete(): boolean
    {
        return this._canCreateAndDelete;
    }

    // AS3: WiredVariable.as::get hasValue()
    get hasValue(): boolean
    {
        return this._hasValue;
    }

    // AS3: WiredVariable.as::get canWriteValue()
    get canWriteValue(): boolean
    {
        return this._canWriteValue;
    }

    // AS3: WiredVariable.as::get canInterceptChanges()
    get canInterceptChanges(): boolean
    {
        return this._canInterceptChanges;
    }

    // AS3: WiredVariable.as::get isInvisible()
    get isInvisible(): boolean
    {
        return this._isInvisible;
    }

    // AS3: WiredVariable.as::get canReadCreationTime()
    get canReadCreationTime(): boolean
    {
        return this._canReadCreationTime;
    }

    // AS3: WiredVariable.as::get canReadLastUpdateTime()
    get canReadLastUpdateTime(): boolean
    {
        return this._canReadLastUpdateTime;
    }

    // AS3: WiredVariable.as::get hasTextConnector()
    get hasTextConnector(): boolean
    {
        return this._textConnector !== null;
    }

    // AS3: WiredVariable.as::get textConnector()
    get textConnector(): OrderedMap<number, string> | null
    {
        return this._textConnector;
    }

    // AS3: WiredVariable.as::get isStored()
    get isStored(): boolean
    {
        return this._availabilityType < 100;
    }

    // AS3: WiredVariable.as::get isPersisted()
    get isPersisted(): boolean
    {
        return this._availabilityType === WiredVariableDataType.AVAILABILITY_10
            || this._availabilityType === WiredVariableDataType.AVAILABILITY_11
            || this._availabilityType === WiredVariableDataType.AVAILABILITY_20;
    }
}
