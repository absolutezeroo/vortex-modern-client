/**
 * A Trax song reached its end (or was faded out to nothing).
 *
 * The music controller and both play-list controllers listen for this: it is what advances a sound
 * machine to its next track and what frees the priority slot the song was playing at.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/sound/events/SoundCompleteEvent.as
 */
export class SoundCompleteEvent
{
    // AS3: .../SoundCompleteEvent.as::TRAX_SONG_COMPLETE
    static readonly TRAX_SONG_COMPLETE: string = 'SCE_TRAX_SONG_COMPLETE';

    readonly type: string;

    // AS3: .../SoundCompleteEvent.as::get id()
    readonly id: number;

    // AS3: .../SoundCompleteEvent.as::SoundCompleteEvent()
    constructor(type: string, id: number)
    {
        this.type = type;
        this.id = id;
    }
}
