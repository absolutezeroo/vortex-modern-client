/**
 * A song started or stopped at a given priority.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/sound/events/NowPlayingEvent.as
 */
export class NowPlayingEvent
{
    // AS3: .../NowPlayingEvent.as::USER_PLAY_SONG
    static readonly USER_PLAY_SONG: string = 'NPE_USER_PLAY_SONG';

    // AS3: .../NowPlayingEvent.as::USER_STOP_SONG
    // The constant's name says PLAY where its value says stop; AS3's own value is `NPW_...`, with
    // a W. Both kept as they are — listeners match on the value.
    static readonly USER_STOP_SONG: string = 'NPW_USER_STOP_SONG';

    // AS3: .../NowPlayingEvent.as::NOW_PLAYING_SONG_CHANGED
    static readonly NOW_PLAYING_SONG_CHANGED: string = 'NPE_SONG_CHANGED';

    readonly type: string;

    // AS3: .../NowPlayingEvent.as::get priority()
    readonly priority: number;

    // AS3: .../NowPlayingEvent.as::get id()
    readonly id: number;

    // AS3: .../NowPlayingEvent.as::get position()
    readonly position: number;

    // AS3: .../NowPlayingEvent.as::NowPlayingEvent()
    // Note the parameter order: priority comes before the song id.
    constructor(type: string, priority: number, id: number, position: number)
    {
        this.type = type;
        this.priority = priority;
        this.id = id;
        this.position = position;
    }
}
