import type {IRoomSession} from '../IRoomSession';
import {RoomSessionEvent} from './RoomSessionEvent';

/**
 * Room session word quiz event
 *
 * @see source_as_win63/habbo/session/events/RoomSessionWordQuizEvent.as
 */
export class RoomSessionWordQuizEvent extends RoomSessionEvent
{
    public static readonly RWPUW_NEW_QUESTION = 'RWPUW_NEW_QUESTION';
    public static readonly RWPUW_QUESTION_FINISHED = 'RWPUW_QUESION_FINSIHED';
    public static readonly RWPUW_QUESTION_ANSWERED = 'RWPUW_QUESTION_ANSWERED';

    constructor(type: string, session: IRoomSession, id: number = -1)
    {
        super(type, session);
        this._id = id;
    }

    private _id: number = -1;

    get id(): number
    {
        return this._id;
    }

    set id(value: number)
    {
        this._id = value;
    }

    private _pollType: string | null = null;

    get pollType(): string | null
    {
        return this._pollType;
    }

    set pollType(value: string | null)
    {
        this._pollType = value;
    }

    private _pollId: number = -1;

    get pollId(): number
    {
        return this._pollId;
    }

    set pollId(value: number)
    {
        this._pollId = value;
    }

    private _questionId: number = -1;

    get questionId(): number
    {
        return this._questionId;
    }

    set questionId(value: number)
    {
        this._questionId = value;
    }

    private _duration: number = -1;

    get duration(): number
    {
        return this._duration;
    }

    set duration(value: number)
    {
        this._duration = value;
    }

    private _question: Record<string, unknown> | null = null;

    get question(): Record<string, unknown> | null
    {
        return this._question;
    }

    set question(value: Record<string, unknown> | null)
    {
        this._question = value;
    }

    private _userId: number = -1;

    get userId(): number
    {
        return this._userId;
    }

    set userId(value: number)
    {
        this._userId = value;
    }

    private _value: string = '';

    get value(): string
    {
        return this._value;
    }

    set value(value: string)
    {
        this._value = value;
    }

    private _answerCounts: Map<string, number> = new Map();

    get answerCounts(): Map<string, number>
    {
        return this._answerCounts;
    }

    set answerCounts(value: Map<string, number>)
    {
        this._answerCounts = value;
    }
}
