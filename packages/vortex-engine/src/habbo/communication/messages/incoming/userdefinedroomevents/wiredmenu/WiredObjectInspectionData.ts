import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {OrderedMap} from '@core/utils/OrderedMap';

/**
 * WiredObjectInspectionData — the inspection tab's per-object payload: the source type (furni / user /
 * global), the object id (furni id or user index depending on type), the variable id -> value map the
 * object holds, and, for furni, the ids of the wireds that reference it. The field read order below is
 * authoritative for the wire format.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2538/WiredObjectInspectionData.as
 */
export class WiredObjectInspectionData
{
    // AS3: WiredObjectInspectionData.as::_SafeStr_10219 (name derived: furni type discriminator)
    private static readonly TYPE_FURNI: number = 0;

    // AS3: WiredObjectInspectionData.as::_SafeStr_10354 (name derived: user type discriminator)
    private static readonly TYPE_USER: number = 1;

    // AS3: WiredObjectInspectionData.as::_SafeStr_4778 (name derived: source type)
    private _type: number;

    // AS3: WiredObjectInspectionData.as::_SafeStr_8298 (name derived: user index)
    private _userIndex: number = 0;

    // AS3: WiredObjectInspectionData.as::_SafeStr_4841 (name derived: object id)
    private _objectId: number = 0;

    // AS3: WiredObjectInspectionData.as::_SafeStr_8727 (name derived: variableId -> value)
    private _variableValues: OrderedMap<string, number>;

    // AS3: WiredObjectInspectionData.as::_SafeStr_8650 (name derived: configured-in wired ids, furni only)
    private _configuredInWireds: number[] | null = null;

    // AS3: WiredObjectInspectionData.as::WiredObjectInspectionData()
    constructor(wrapper: IMessageDataWrapper)
    {
        this._type = wrapper.readInt();

        if(this._type === WiredObjectInspectionData.TYPE_FURNI)
        {
            this._objectId = wrapper.readInt();
        }
        else if(this._type === WiredObjectInspectionData.TYPE_USER)
        {
            this._userIndex = wrapper.readInt();
        }

        this._variableValues = new OrderedMap<string, number>();
        let count: number = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            const key: string = wrapper.readString();
            const value: number = wrapper.readInt();
            this._variableValues.add(key, value);
        }

        if(this._type === WiredObjectInspectionData.TYPE_FURNI)
        {
            count = wrapper.readInt();
            this._configuredInWireds = [];

            for(let i = 0; i < count; i++)
            {
                this._configuredInWireds.push(wrapper.readInt());
            }
        }
    }

    // AS3: WiredObjectInspectionData.as::get type()
    get type(): number
    {
        return this._type;
    }

    // AS3: WiredObjectInspectionData.as::get userIndex()
    get userIndex(): number
    {
        return this._userIndex;
    }

    // AS3: WiredObjectInspectionData.as::get objectId()
    get objectId(): number
    {
        return this._objectId;
    }

    // AS3: WiredObjectInspectionData.as::get variableValues()
    get variableValues(): OrderedMap<string, number>
    {
        return this._variableValues;
    }

    // AS3: WiredObjectInspectionData.as::get configuredInWireds()
    get configuredInWireds(): number[] | null
    {
        return this._configuredInWireds;
    }
}
