import {RoomWidgetUpdateEvent} from './RoomWidgetUpdateEvent';

/**
 * One of the three states of a word quiz: a new question, somebody answering, or the question
 * closing. One class for all three, with only the fields its own case fills.
 *
 * The two typos in the constants — `QUESION`, `FINSIHED` — are AS3's, and are matched literally
 * on both sides of the wire and the bus, so they survive the port.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetWordQuizUpdateEvent.as
 */
export class RoomWidgetWordQuizUpdateEvent extends RoomWidgetUpdateEvent
{
    // AS3: .../widget/events/RoomWidgetWordQuizUpdateEvent.as::NEW_QUESTION
    // Name DERIVED (`_SafeStr_10396`): obfuscated in every tree, named after its own value.
    public static readonly NEW_QUESTION: string = 'RWPUW_NEW_QUESTION';

    // AS3: .../widget/events/RoomWidgetWordQuizUpdateEvent.as::FINISHED
    public static readonly FINISHED: string = 'RWPUW_QUESION_FINSIHED';

    // AS3: .../widget/events/RoomWidgetWordQuizUpdateEvent.as::QUESTION_ANSWERED
    // Name DERIVED (`_SafeStr_10426`), likewise.
    public static readonly QUESTION_ANSWERED: string = 'RWPUW_QUESTION_ANSWERED';

    // AS3: .../widget/events/RoomWidgetWordQuizUpdateEvent.as::_id
    private _id: number = -1;

    // AS3: .../widget/events/RoomWidgetWordQuizUpdateEvent.as::_pollType
    public pollType: string | null = null;

    // AS3: .../widget/events/RoomWidgetWordQuizUpdateEvent.as::_pollId
    public pollId: number = -1;

    // AS3: .../widget/events/RoomWidgetWordQuizUpdateEvent.as::_questionId
    public questionId: number = -1;

    // AS3: .../widget/events/RoomWidgetWordQuizUpdateEvent.as::_duration
    public duration: number = -1;

    // AS3: .../widget/events/RoomWidgetWordQuizUpdateEvent.as::_question
    public question: Record<string, unknown> | null = null;

    // AS3: .../widget/events/RoomWidgetWordQuizUpdateEvent.as::_userId
    public userId: number = -1;

    // AS3: .../widget/events/RoomWidgetWordQuizUpdateEvent.as::_value
    public value: string = '';

    // AS3: .../widget/events/RoomWidgetWordQuizUpdateEvent.as::_answerCounts
    public answerCounts: Map<string, number> | null = null;

    // AS3: .../widget/events/RoomWidgetWordQuizUpdateEvent.as::RoomWidgetWordQuizUpdateEvent()
    // Id first and type second, as in `RoomWidgetPollUpdateEvent` — both invert the usual order.
    constructor(id: number, type: string)
    {
        super(type);

        this._id = id;
    }

    // AS3: .../widget/events/RoomWidgetWordQuizUpdateEvent.as::get id()
    get id(): number
    {
        return this._id;
    }
}
