/**
 * A song's metadata has arrived and is now in the controller's cache. Anything that showed a
 * placeholder — the inventory tooltip's Trax disc, say — listens for this and re-reads.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/sound/events/SongInfoReceivedEvent.as
 */
export class SongInfoReceivedEvent
{
    // AS3: .../SongInfoReceivedEvent.as::TRAX_SONG_INFO_RECEIVED
    static readonly TRAX_SONG_INFO_RECEIVED: string = 'SIR_TRAX_SONG_INFO_RECEIVED';

    // AS3: .../SongInfoReceivedEvent.as::get id()
    readonly id: number;

    readonly type: string;

    // AS3: .../SongInfoReceivedEvent.as::SongInfoReceivedEvent()
    constructor(type: string, id: number)
    {
        this.type = type;
        this.id = id;
    }
}
