/**
 * A room play list changed, or refused another disc.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/sound/events/PlayListStatusEvent.as
 */
export class PlayListStatusEvent
{
    // AS3: .../PlayListStatusEvent.as::PLAY_LIST_UPDATED
    static readonly PLAY_LIST_UPDATED: string = 'PLUE_PLAY_LIST_UPDATED';

    // AS3: .../PlayListStatusEvent.as::PLAY_LIST_FULL
    static readonly PLAY_LIST_FULL: string = 'PLUE_PLAY_LIST_FULL';

    readonly type: string;

    // AS3: .../PlayListStatusEvent.as::PlayListStatusEvent()
    constructor(type: string)
    {
        this.type = type;
    }
}
