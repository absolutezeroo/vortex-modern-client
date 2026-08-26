import {RoomWidgetUpdateEvent} from './RoomWidgetUpdateEvent';

/**
 * The now-playing state changed: a new song started (in the room's playlist or as the player's
 * own preview), or the player's preview stopped.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetPlayListEditorNowPlayingEvent.as
 */
export class RoomWidgetPlayListEditorNowPlayingEvent extends RoomWidgetUpdateEvent
{
    // AS3: .../RoomWidgetPlayListEditorNowPlayingEvent.as::USER_PLAY_SONG
    static readonly USER_PLAY_SONG: string = 'RWPLENPE_USER_PLAY_SONG';

    // AS3: .../RoomWidgetPlayListEditorNowPlayingEvent.as::USER_STOP_SONG
    static readonly USER_STOP_SONG: string = 'RWPLENPW_USER_STOP_SONG';

    // AS3: .../RoomWidgetPlayListEditorNowPlayingEvent.as::NOW_PLAYING_SONG_CHANGED
    static readonly NOW_PLAYING_SONG_CHANGED: string = 'RWPLENPE_SONG_CHANGED';

    // AS3: .../RoomWidgetPlayListEditorNowPlayingEvent.as::_SafeStr_4872 (id)
    private readonly _id: number;

    // AS3: .../RoomWidgetPlayListEditorNowPlayingEvent.as::_SafeStr_6812 (position)
    private readonly _position: number;

    // AS3: .../RoomWidgetPlayListEditorNowPlayingEvent.as::_priority
    private readonly _priority: number;

    // AS3: .../RoomWidgetPlayListEditorNowPlayingEvent.as::RoomWidgetPlayListEditorNowPlayingEvent()
    constructor(type: string, id: number, position: number, priority: number)
    {
        super(type);

        this._id = id;
        this._position = position;
        this._priority = priority;
    }

    // AS3: .../RoomWidgetPlayListEditorNowPlayingEvent.as::get id()
    get id(): number
    {
        return this._id;
    }

    // AS3: .../RoomWidgetPlayListEditorNowPlayingEvent.as::get position()
    get position(): number
    {
        return this._position;
    }

    // AS3: .../RoomWidgetPlayListEditorNowPlayingEvent.as::get priority()
    get priority(): number
    {
        return this._priority;
    }
}
