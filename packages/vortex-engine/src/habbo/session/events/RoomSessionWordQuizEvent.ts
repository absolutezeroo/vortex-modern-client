import type {IRoomSession} from '../IRoomSession';
import {RoomSessionEvent} from './RoomSessionEvent';

/**
 * Room session word quiz event
 *
 * @see source_as_win63/habbo/session/events/RoomSessionWordQuizEvent.as
 */
export class RoomSessionWordQuizEvent extends RoomSessionEvent
{
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/session/events/RoomSessionWordQuizEvent.as::RWPUW_NEW_QUESTION
    public static readonly RWPUW_NEW_QUESTION = 'RWPUW_NEW_QUESTION';
    public static readonly RWPUW_QUESTION_FINISHED = 'RWPUW_QUESION_FINSIHED';
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/session/events/RoomSessionWordQuizEvent.as::RWPUW_QUESTION_ANSWERED
    public static readonly RWPUW_QUESTION_ANSWERED = 'RWPUW_QUESTION_ANSWERED';

    constructor(type: string, session: IRoomSession, id: number = -1)
    {
        super(type, session);
        this._id = id;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/session/events/RoomSessionWordQuizEvent.as::_id
    private _id: number = -1;

    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionWordQuizEvent.as::get id()
    get id(): number
    {
        return this._id;
    }

    set id(value: number)
    {
        this._id = value;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/session/events/RoomSessionWordQuizEvent.as::_pollType
    private _pollType: string | null = null;

    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionWordQuizEvent.as::get pollType()
    get pollType(): string | null
    {
        return this._pollType;
    }

    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionWordQuizEvent.as::set pollType()
    set pollType(value: string | null)
    {
        this._pollType = value;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/session/events/RoomSessionWordQuizEvent.as::_pollId
    private _pollId: number = -1;

    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionWordQuizEvent.as::get pollId()
    get pollId(): number
    {
        return this._pollId;
    }

    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionWordQuizEvent.as::set pollId()
    set pollId(value: number)
    {
        this._pollId = value;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/session/events/RoomSessionWordQuizEvent.as::_questionId
    private _questionId: number = -1;

    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionWordQuizEvent.as::get questionId()
    get questionId(): number
    {
        return this._questionId;
    }

    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionWordQuizEvent.as::set questionId()
    set questionId(value: number)
    {
        this._questionId = value;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/session/events/RoomSessionWordQuizEvent.as::_duration
    private _duration: number = -1;

    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionWordQuizEvent.as::get duration()
    get duration(): number
    {
        return this._duration;
    }

    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionWordQuizEvent.as::set duration()
    set duration(value: number)
    {
        this._duration = value;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/session/events/RoomSessionWordQuizEvent.as::_question
    private _question: Record<string, unknown> | null = null;

    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionWordQuizEvent.as::get question()
    get question(): Record<string, unknown> | null
    {
        return this._question;
    }

    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionWordQuizEvent.as::set question()
    set question(value: Record<string, unknown> | null)
    {
        this._question = value;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/session/events/RoomSessionWordQuizEvent.as::_userId
    private _userId: number = -1;

    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionWordQuizEvent.as::get userId()
    get userId(): number
    {
        return this._userId;
    }

    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionWordQuizEvent.as::set userId()
    set userId(value: number)
    {
        this._userId = value;
    }

    // AS3: sources/win63_version/habbo/session/events/RoomSessionWordQuizEvent.as::_value
    private _value: string = '';

    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionWordQuizEvent.as::get value()
    get value(): string
    {
        return this._value;
    }

    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionWordQuizEvent.as::set value()
    set value(value: string)
    {
        this._value = value;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/session/events/RoomSessionWordQuizEvent.as::_answerCounts
    private _answerCounts: Map<string, number> = new Map();

    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionWordQuizEvent.as::get answerCounts()
    get answerCounts(): Map<string, number>
    {
        return this._answerCounts;
    }

    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionWordQuizEvent.as::set answerCounts()
    set answerCounts(value: Map<string, number>)
    {
        this._answerCounts = value;
    }
}
