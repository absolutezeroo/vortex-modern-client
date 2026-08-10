/**
 * RoomWidgetSongUpdateEvent
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetSongUpdateEvent.as
 *
 * Carries the currently-known name/creator of a song to the two infostand views that show it:
 * SONG_PLAYING_CHANGED when the jukebox switches track, SONG_DATA_RECEIVED when the server
 * answers a song-info request for a disk. InfoStandWidgetHandler raises both.
 */
import {RoomWidgetUpdateEvent} from './RoomWidgetUpdateEvent';

export class RoomWidgetSongUpdateEvent extends RoomWidgetUpdateEvent
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetSongUpdateEvent.as::SONG_PLAYING_CHANGED
    public static readonly SONG_PLAYING_CHANGED: string = 'RWSUE_PLAYING_CHANGED';

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetSongUpdateEvent.as::SONG_DATA_RECEIVED
    public static readonly SONG_DATA_RECEIVED: string = 'RWSUE_DATA_RECEIVED';

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetSongUpdateEvent.as::_songId
    private _songId: number;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetSongUpdateEvent.as::_songName
    private _songName: string;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetSongUpdateEvent.as::_songAuthor
    private _songAuthor: string;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetSongUpdateEvent.as::RoomWidgetSongUpdateEvent()
    constructor(type: string, songId: number, songName: string, songAuthor: string)
    {
        super(type);

        this._songId = songId;
        this._songName = songName;
        this._songAuthor = songAuthor;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetSongUpdateEvent.as::get songId()
    public get songId(): number
    {
        return this._songId;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetSongUpdateEvent.as::get songName()
    public get songName(): string
    {
        return this._songName;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetSongUpdateEvent.as::get songAuthor()
    public get songAuthor(): string
    {
        return this._songAuthor;
    }
}
