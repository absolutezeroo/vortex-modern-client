import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * SharedGlobalPlaceholder — a single shared global placeholder entry inside a WiredContext:
 * the room it belongs to (id + name) and the placeholder's name. Constructed inline from the
 * message stream.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2576/SharedGlobalPlaceholder.as
 */
export class SharedGlobalPlaceholder
{
    // AS3: SharedGlobalPlaceholder.as::roomId (backing field _SafeStr_6722)
    private _roomId: number;

    // AS3: SharedGlobalPlaceholder.as::roomName (backing field _roomName)
    private _roomName: string;

    // AS3: SharedGlobalPlaceholder.as::placeholderName (backing field _placeholderName)
    private _placeholderName: string;

    // AS3: SharedGlobalPlaceholder.as::SharedGlobalPlaceholder()
    constructor(wrapper: IMessageDataWrapper)
    {
        this._roomId = wrapper.readInt();
        this._roomName = wrapper.readString();
        this._placeholderName = wrapper.readString();
    }

    // AS3: SharedGlobalPlaceholder.as::get roomId()
    get roomId(): number
    {
        return this._roomId;
    }

    // AS3: SharedGlobalPlaceholder.as::get roomName()
    get roomName(): string
    {
        return this._roomName;
    }

    // AS3: SharedGlobalPlaceholder.as::get placeholderName()
    get placeholderName(): string
    {
        return this._placeholderName;
    }
}
