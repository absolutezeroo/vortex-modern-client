import {RoomWidgetMessage} from './RoomWidgetMessage';

/**
 * Add a disk to the playlist, or pull one out of it.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/messages/RoomWidgetPlayListModificationMessage.as
 */
export class RoomWidgetPlayListModificationMessage extends RoomWidgetMessage
{
    // AS3: .../RoomWidgetPlayListModificationMessage.as::ADD_TO_PLAYLIST
    static readonly ADD_TO_PLAYLIST: string = 'RWPLAM_ADD_TO_PLAYLIST';

    // AS3: .../RoomWidgetPlayListModificationMessage.as::REMOVE_FROM_PLAYLIST
    static readonly REMOVE_FROM_PLAYLIST: string = 'RWPLAM_REMOVE_FROM_PLAYLIST';

    // AS3: .../RoomWidgetPlayListModificationMessage.as::_slotNumber
    private readonly _slotNumber: number;

    // AS3: .../RoomWidgetPlayListModificationMessage.as::_SafeStr_8999 (diskId)
    private readonly _diskId: number;

    // AS3: .../RoomWidgetPlayListModificationMessage.as::RoomWidgetPlayListModificationMessage()
    constructor(type: string, slotNumber: number = -1, diskId: number = -1)
    {
        super(type);

        this._slotNumber = slotNumber;
        this._diskId = diskId;
    }

    // AS3: .../RoomWidgetPlayListModificationMessage.as::get diskId()
    get diskId(): number
    {
        return this._diskId;
    }

    // AS3: .../RoomWidgetPlayListModificationMessage.as::get slotNumber()
    get slotNumber(): number
    {
        return this._slotNumber;
    }
}
