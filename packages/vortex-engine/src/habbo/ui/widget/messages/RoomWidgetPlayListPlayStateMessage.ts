import {RoomWidgetMessage} from './RoomWidgetMessage';

/**
 * Toggle play/pause on the room's jukebox playlist.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/messages/RoomWidgetPlayListPlayStateMessage.as
 */
export class RoomWidgetPlayListPlayStateMessage extends RoomWidgetMessage
{
    // AS3: .../RoomWidgetPlayListPlayStateMessage.as::TOGGLE_PLAY_PAUSE
    static readonly TOGGLE_PLAY_PAUSE: string = 'RWPLPS_TOGGLE_PLAY_PAUSE';

    // AS3: .../RoomWidgetPlayListPlayStateMessage.as::_SafeStr_6628 (furniId)
    private readonly _furniId: number;

    // AS3: .../RoomWidgetPlayListPlayStateMessage.as::_SafeStr_6812 (position)
    private readonly _position: number;

    // AS3: .../RoomWidgetPlayListPlayStateMessage.as::RoomWidgetPlayListPlayStateMessage()
    constructor(type: string, furniId: number, position: number = -1)
    {
        super(type);

        this._furniId = furniId;
        this._position = position;
    }

    // AS3: .../RoomWidgetPlayListPlayStateMessage.as::get furniId()
    get furniId(): number
    {
        return this._furniId;
    }

    // AS3: .../RoomWidgetPlayListPlayStateMessage.as::get position()
    get position(): number
    {
        return this._position;
    }
}
