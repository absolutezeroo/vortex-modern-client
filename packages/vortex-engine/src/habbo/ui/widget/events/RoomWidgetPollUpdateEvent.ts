import type {PollQuestion} from '@habbo/communication/messages/parser/poll/PollQuestion';
import {RoomWidgetUpdateEvent} from './RoomWidgetUpdateEvent';

/**
 * A poll being offered, refused with an error, or delivered in full. One class for all three
 * states, with the fields of whichever one built it — the handler fills only what its case needs.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetPollUpdateEvent.as
 */
export class RoomWidgetPollUpdateEvent extends RoomWidgetUpdateEvent
{
    // AS3: .../widget/events/RoomWidgetPollUpdateEvent.as::OFFER
    public static readonly OFFER: string = 'RWPUW_OFFER';

    // AS3: .../widget/events/RoomWidgetPollUpdateEvent.as::ERROR
    public static readonly ERROR: string = 'RWPUW_ERROR';

    // AS3: .../widget/events/RoomWidgetPollUpdateEvent.as::CONTENT
    public static readonly CONTENT: string = 'RWPUW_CONTENT';

    // AS3: .../widget/events/RoomWidgetPollUpdateEvent.as::_id
    private _id: number = -1;

    // AS3: .../widget/events/RoomWidgetPollUpdateEvent.as::_summary
    public summary: string = '';

    // AS3: .../widget/events/RoomWidgetPollUpdateEvent.as::_headline
    public headline: string = '';

    // AS3: .../widget/events/RoomWidgetPollUpdateEvent.as::_numQuestions
    public numQuestions: number = 0;

    // AS3: .../widget/events/RoomWidgetPollUpdateEvent.as::_startMessage
    public startMessage: string = '';

    // AS3: .../widget/events/RoomWidgetPollUpdateEvent.as::_endMessage
    public endMessage: string = '';

    // AS3: .../widget/events/RoomWidgetPollUpdateEvent.as::_questionArray
    public questionArray: PollQuestion[] | null = null;

    // AS3: .../widget/events/RoomWidgetPollUpdateEvent.as::_pollType
    // Written and read by nothing in any tree — the handler never sets it. Kept because the
    // accessor pair is real.
    public pollType: string = '';

    // AS3: .../widget/events/RoomWidgetPollUpdateEvent.as::_npsPoll
    public npsPoll: boolean = false;

    // AS3: .../widget/events/RoomWidgetPollUpdateEvent.as::RoomWidgetPollUpdateEvent()
    // Note the argument order: AS3 takes the *id* first and the type second, unlike every other
    // widget update event.
    constructor(id: number, type: string)
    {
        super(type);

        this._id = id;
    }

    // AS3: .../widget/events/RoomWidgetPollUpdateEvent.as::get id()
    get id(): number
    {
        return this._id;
    }
}
