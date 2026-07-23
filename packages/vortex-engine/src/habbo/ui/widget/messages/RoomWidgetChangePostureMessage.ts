/**
 * RoomWidgetChangePostureMessage
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/messages/RoomWidgetChangePostureMessage.as
 *
 * Sent by the own-avatar bubble to sit/stand. posture: 0 = stand, 1 = sit.
 */
import {RoomWidgetMessage} from './RoomWidgetMessage';

export class RoomWidgetChangePostureMessage extends RoomWidgetMessage
{
    // AS3: RoomWidgetChangePostureMessage.as::CHANGE_POSTURE
    public static readonly CHANGE_POSTURE: string = 'RWCPM_MESSAGE_CHANGE_POSTURE';

    // AS3: RoomWidgetChangePostureMessage.as::STAND
    public static readonly STAND: number = 0;

    // AS3: RoomWidgetChangePostureMessage.as::SIT
    public static readonly SIT: number = 1;

    private _posture: number;

    // AS3: RoomWidgetChangePostureMessage.as::RoomWidgetChangePostureMessage()
    constructor(posture: number)
    {
        super(RoomWidgetChangePostureMessage.CHANGE_POSTURE);
        this._posture = posture;
    }

    // AS3: RoomWidgetChangePostureMessage.as::get posture()
    public get posture(): number
    {
        return this._posture;
    }
}
