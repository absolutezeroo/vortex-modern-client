import type {IRoomSession} from '../IRoomSession';
import {RoomSessionEvent} from './RoomSessionEvent';

/**
 * Room session poll event
 *
 * @see source_as_win63/habbo/session/events/RoomSessionPollEvent.as
 */
export class RoomSessionPollEvent extends RoomSessionEvent
{
    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionPollEvent.as::OFFER
    public static readonly OFFER = 'RSPE_POLL_OFFER';
    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionPollEvent.as::ERROR
    public static readonly ERROR = 'RSPE_POLL_ERROR';
    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionPollEvent.as::CONTENT
    public static readonly CONTENT = 'RSPE_POLL_CONTENT';

    constructor(type: string, session: IRoomSession, id: number)
    {
        super(type, session);
        this._id = id;
    }

    private _id: number;

    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionPollEvent.as::get id()
    get id(): number
    {
        return this._id;
    }

    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionPollEvent.as::_headline
    private _headline: string = '';

    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionPollEvent.as::get headline()
    get headline(): string
    {
        return this._headline;
    }

    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionPollEvent.as::set headline()
    set headline(value: string)
    {
        this._headline = value;
    }

    private _summary: string = '';

    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionPollEvent.as::get summary()
    get summary(): string
    {
        return this._summary;
    }

    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionPollEvent.as::set summary()
    set summary(value: string)
    {
        this._summary = value;
    }

    private _numQuestions: number = 0;

    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionPollEvent.as::get numQuestions()
    get numQuestions(): number
    {
        return this._numQuestions;
    }

    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionPollEvent.as::set numQuestions()
    set numQuestions(value: number)
    {
        this._numQuestions = value;
    }

    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionPollEvent.as::_startMessage
    private _startMessage: string = '';

    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionPollEvent.as::get startMessage()
    get startMessage(): string
    {
        return this._startMessage;
    }

    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionPollEvent.as::set startMessage()
    set startMessage(value: string)
    {
        this._startMessage = value;
    }

    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionPollEvent.as::_endMessage
    private _endMessage: string = '';

    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionPollEvent.as::get endMessage()
    get endMessage(): string
    {
        return this._endMessage;
    }

    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionPollEvent.as::set endMessage()
    set endMessage(value: string)
    {
        this._endMessage = value;
    }

    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionPollEvent.as::_questionArray
    private _questionArray: unknown[] | null = null;

    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionPollEvent.as::get questionArray()
    get questionArray(): unknown[] | null
    {
        return this._questionArray;
    }

    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionPollEvent.as::set questionArray()
    set questionArray(value: unknown[] | null)
    {
        this._questionArray = value;
    }

    private _npsPoll: boolean = false;

    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionPollEvent.as::get npsPoll()
    get npsPoll(): boolean
    {
        return this._npsPoll;
    }

    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionPollEvent.as::set npsPoll()
    set npsPoll(value: boolean)
    {
        this._npsPoll = value;
    }
}
