import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * ObjectIdAndValuePair — a wired variable entry pairing a room object id with an
 * integer value. Constructed inline from the message stream.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3851/ObjectIdAndValuePair.as
 */
export class ObjectIdAndValuePair
{
    // AS3: ObjectIdAndValuePair.as::objectId (backing field _SafeStr_4841)
    private _objectId: number;

    // AS3: ObjectIdAndValuePair.as::value (backing field _SafeStr_4717)
    private _value: number;

    // AS3: ObjectIdAndValuePair.as::ObjectIdAndValuePair()
    constructor(wrapper: IMessageDataWrapper)
    {
        this._objectId = wrapper.readInt();
        this._value = wrapper.readInt();
    }

    // AS3: ObjectIdAndValuePair.as::get objectId()
    get objectId(): number
    {
        return this._objectId;
    }

    // AS3: ObjectIdAndValuePair.as::get value()
    get value(): number
    {
        return this._value;
    }
}
