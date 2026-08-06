import {
    SetRoomSessionTagsMessageComposer
} from '@habbo/communication/messages/outgoing/navigator/SetRoomSessionTagsMessageComposer';

/**
 * Holds a pair of room session tags and produces the composer to send them.
 *
 * @see source_as_win63/habbo/navigator/domain/RoomSessionTags.as
 */
export class RoomSessionTags
{
    // AS3: .../src/com/sulake/habbo/navigator/domain/RoomSessionTags.as::_tag1
    private _tag1: string;
    // AS3: .../src/com/sulake/habbo/navigator/domain/RoomSessionTags.as::_tag2
    private _tag2: string;

    constructor(tag1: string, tag2: string)
    {
        this._tag1 = tag1;
        this._tag2 = tag2;
    }

    // AS3: .../src/com/sulake/habbo/navigator/domain/RoomSessionTags.as::getMsg()
    getMsg(): SetRoomSessionTagsMessageComposer
    {
        return new SetRoomSessionTagsMessageComposer(this._tag1, this._tag2);
    }
}
