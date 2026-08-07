import {RoomWidgetMessage} from './RoomWidgetMessage';

/**
 * Accepting, refusing or answering a poll. One class for all three, because the handler only
 * needs the id for the first two.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/messages/RoomWidgetPollMessage.as
 */
export class RoomWidgetPollMessage extends RoomWidgetMessage
{
    // AS3: .../widget/messages/RoomWidgetPollMessage.as::START
    public static readonly START: string = 'RWPM_START';

    // AS3: .../widget/messages/RoomWidgetPollMessage.as::REJECT
    public static readonly REJECT: string = 'RWPM_REJECT';

    // AS3: .../widget/messages/RoomWidgetPollMessage.as::ANSWER
    public static readonly ANSWER: string = 'RWPM_ANSWER';

    // AS3: .../widget/messages/RoomWidgetPollMessage.as::_id
    private _id: number = -1;

    // AS3: .../widget/messages/RoomWidgetPollMessage.as::_questionId
    private _questionId: number = 0;

    // AS3: .../widget/messages/RoomWidgetPollMessage.as::_answers
    private _answers: string[] | null = null;

    // AS3: .../widget/messages/RoomWidgetPollMessage.as::RoomWidgetPollMessage()
    // AS3 assigns the id *before* calling super, which TypeScript forbids; the order is
    // unobservable here because the base only stores the type.
    constructor(type: string, id: number)
    {
        super(type);

        this._id = id;
    }

    // AS3: .../widget/messages/RoomWidgetPollMessage.as::get id()
    get id(): number
    {
        return this._id;
    }

    // AS3: .../widget/messages/RoomWidgetPollMessage.as::get questionId()
    get questionId(): number
    {
        return this._questionId;
    }

    // AS3: .../widget/messages/RoomWidgetPollMessage.as::set questionId()
    set questionId(value: number)
    {
        this._questionId = value;
    }

    // AS3: .../widget/messages/RoomWidgetPollMessage.as::get answers()
    get answers(): string[] | null
    {
        return this._answers;
    }

    // AS3: .../widget/messages/RoomWidgetPollMessage.as::set answers()
    set answers(value: string[] | null)
    {
        this._answers = value;
    }
}
