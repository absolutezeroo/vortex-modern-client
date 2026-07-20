import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {WiredVariable} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariable';

/**
 * SharedVariable — a WiredVariable shared from another room, tagged with the source
 * room's id and name. Constructed inline from the message stream: room id, room name,
 * then the WiredVariable payload.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3851/SharedVariable.as
 */
export class SharedVariable
{
    // AS3: SharedVariable.as::_SafeStr_6722 (roomId backing field)
    private _roomId: number;

    // AS3: SharedVariable.as::_roomName
    private _roomName: string;

    // AS3: SharedVariable.as::_SafeStr_9730 (wiredVariable backing field)
    private _wiredVariable: WiredVariable;

    // AS3: SharedVariable.as::SharedVariable()
    constructor(wrapper: IMessageDataWrapper)
    {
        this._roomId = wrapper.readInt();
        this._roomName = wrapper.readString();
        this._wiredVariable = new WiredVariable(wrapper);
    }

    // AS3: SharedVariable.as::get wiredVariable()
    get wiredVariable(): WiredVariable
    {
        return this._wiredVariable;
    }

    // AS3: SharedVariable.as::get roomId()
    get roomId(): number
    {
        return this._roomId;
    }

    // AS3: SharedVariable.as::get roomName()
    get roomName(): string
    {
        return this._roomName;
    }
}
