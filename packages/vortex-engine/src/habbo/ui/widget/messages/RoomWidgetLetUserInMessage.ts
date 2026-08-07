import {RoomWidgetMessage} from './RoomWidgetMessage';

/**
 * The answer to a doorbell: let this user in, or turn them away.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/messages/RoomWidgetLetUserInMessage.as
 */
export class RoomWidgetLetUserInMessage extends RoomWidgetMessage
{
    // AS3: .../RoomWidgetLetUserInMessage.as::LET_USER_IN
    static readonly LET_USER_IN: string = 'RWLUIM_LET_USER_IN';

    // AS3: .../RoomWidgetLetUserInMessage.as::_userName
    private _userName: string;

    // AS3: .../RoomWidgetLetUserInMessage.as::_canEnter
    // Name DERIVED (`_SafeStr_9128`); `canEnter` is the accessor that returns it.
    private _canEnter: boolean;

    // AS3: .../RoomWidgetLetUserInMessage.as::RoomWidgetLetUserInMessage()
    constructor(userName: string, canEnter: boolean)
    {
        super(RoomWidgetLetUserInMessage.LET_USER_IN);

        this._userName = userName;
        this._canEnter = canEnter;
    }

    // AS3: .../RoomWidgetLetUserInMessage.as::get userName()
    get userName(): string
    {
        return this._userName;
    }

    // AS3: .../RoomWidgetLetUserInMessage.as::get canEnter()
    get canEnter(): boolean
    {
        return this._canEnter;
    }
}
