/**
 * A Trax song's samples all arrived, or one of them failed to.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/sound/events/TraxSongLoadEvent.as
 */
export class TraxSongLoadEvent
{
    // AS3: .../TraxSongLoadEvent.as::TRAX_LOAD_COMPLETE
    static readonly TRAX_LOAD_COMPLETE: string = 'TSLE_TRAX_LOAD_COMPLETE';

    // AS3: .../TraxSongLoadEvent.as::TRAX_LOAD_FAILED
    static readonly TRAX_LOAD_FAILED: string = 'TSLE_TRAX_LOAD_FAILED';

    readonly type: string;

    // AS3: .../TraxSongLoadEvent.as::get id()
    readonly id: number;

    // AS3: .../TraxSongLoadEvent.as::TraxSongLoadEvent()
    constructor(type: string, id: number)
    {
        this.type = type;
        this.id = id;
    }
}
