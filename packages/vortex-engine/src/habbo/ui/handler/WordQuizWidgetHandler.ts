import type {IRoomWidgetHandler} from '../IRoomWidgetHandler';
import type {IRoomWidgetHandlerContainer} from '../IRoomWidgetHandlerContainer';
import type {RoomWidgetMessage} from '../widget/messages/RoomWidgetMessage';
import type {RoomWidgetUpdateEvent} from '../widget/events/RoomWidgetUpdateEvent';
import type {IRoomEngine} from '@habbo/room/IRoomEngine';
import type {IRoomSession} from '@habbo/session/IRoomSession';
import {RoomWidgetWordQuizUpdateEvent} from '../widget/events/RoomWidgetWordQuizUpdateEvent';
import {RoomSessionWordQuizEvent} from '@habbo/session/events/RoomSessionWordQuizEvent';
import {AvatarAction} from '@habbo/avatar/enum/AvatarAction';

/**
 * The like/dislike quiz that runs over the room: turns the session's three quiz events into
 * widget events, and — on an answer — makes the answering avatar smile or frown.
 *
 * The gesture is the only side effect a widget handler has on the room itself, and it is what
 * makes a quiz readable at a glance: the room fills with smiling or sad faces.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/WordQuizWidgetHandler.as
 */
export class WordQuizWidgetHandler implements IRoomWidgetHandler
{
    // AS3: .../handler/WordQuizWidgetHandler.as::VALUE_DISLIKE
    // Name DERIVED: AS3 compares the answer value to the string "0" inline. `WordQuizWidget`
    // declares the same two values as VALUE_KEY_DISLIKE/VALUE_KEY_LIKE, which is where the names
    // come from.
    private static readonly VALUE_DISLIKE: string = '0';

    // AS3: .../handler/WordQuizWidgetHandler.as::GESTURE_SAD
    // Name DERIVED: the two gesture ids AS3 looks up inline.
    private static readonly GESTURE_SAD: string = 'sad';

    // AS3: .../handler/WordQuizWidgetHandler.as::GESTURE_SMILE
    private static readonly GESTURE_SMILE: string = 'sml';

    // AS3: .../handler/WordQuizWidgetHandler.as::_disposed
    private _disposed: boolean = false;

    // AS3: .../handler/WordQuizWidgetHandler.as::_container
    private _container: IRoomWidgetHandlerContainer | null = null;

    // AS3: .../handler/WordQuizWidgetHandler.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../handler/WordQuizWidgetHandler.as::get type()
    // The double Z is AS3's.
    get type(): string
    {
        return 'RWE_WORD_QUIZZ';
    }

    // AS3: .../handler/WordQuizWidgetHandler.as::get container()
    get container(): IRoomWidgetHandlerContainer | null
    {
        return this._container;
    }

    // AS3: .../handler/WordQuizWidgetHandler.as::set container()
    set container(value: IRoomWidgetHandlerContainer | null)
    {
        this._container = value;
    }

    // AS3: .../handler/WordQuizWidgetHandler.as::get roomSession()
    get roomSession(): IRoomSession | null
    {
        return this._container !== null ? this._container.roomSession : null;
    }

    // AS3: .../handler/WordQuizWidgetHandler.as::get roomEngine()
    get roomEngine(): IRoomEngine | null
    {
        return this._container !== null ? this._container.roomEngine : null;
    }

    /**
     * The same three types as `getProcessedEvents()`. AS3 registers them as widget *messages* too
     * even though `processWidgetMessage()` ignores everything — so the handler is listed against
     * three message types it never acts on.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/WordQuizWidgetHandler.as::getWidgetMessages()
    getWidgetMessages(): string[]
    {
        return [
            RoomWidgetWordQuizUpdateEvent.QUESTION_ANSWERED,
            RoomWidgetWordQuizUpdateEvent.FINISHED,
            RoomWidgetWordQuizUpdateEvent.NEW_QUESTION
        ];
    }

    // AS3: .../handler/WordQuizWidgetHandler.as::processWidgetMessage()
    processWidgetMessage(_message: RoomWidgetMessage): RoomWidgetUpdateEvent | null
    {
        return null;
    }

    // AS3: .../handler/WordQuizWidgetHandler.as::getProcessedEvents()
    getProcessedEvents(): string[]
    {
        return [
            RoomWidgetWordQuizUpdateEvent.QUESTION_ANSWERED,
            RoomWidgetWordQuizUpdateEvent.FINISHED,
            RoomWidgetWordQuizUpdateEvent.NEW_QUESTION
        ];
    }

    /**
     * The answered case does two things and can abandon halfway: it builds the widget event
     * first, then looks the answering user up — and **returns without dispatching** if that user
     * is not in the room. So an answer from someone who has left updates no counts at all, not
     * just no gesture.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/WordQuizWidgetHandler.as::processEvent()
    processEvent(event: RoomSessionWordQuizEvent): void
    {
        if(this._container === null || this._container.roomSession === null) return;

        if(!(event instanceof RoomSessionWordQuizEvent)) return;

        let update: RoomWidgetWordQuizUpdateEvent | null = null;

        switch(event.type)
        {
            case RoomWidgetWordQuizUpdateEvent.QUESTION_ANSWERED:
            {
                update = new RoomWidgetWordQuizUpdateEvent(event.id, RoomWidgetWordQuizUpdateEvent.QUESTION_ANSWERED);
                update.value = event.value;
                update.userId = event.userId;
                update.answerCounts = event.answerCounts;

                const userData = this._container.roomSession.userDataManager?.getUserData(event.userId) ?? null;

                if(userData === null) return;

                const gesture = update.value === WordQuizWidgetHandler.VALUE_DISLIKE
                    ? WordQuizWidgetHandler.GESTURE_SAD
                    : WordQuizWidgetHandler.GESTURE_SMILE;

                // AS3 calls this `updateObjectUserGesture`; this port named it
                // `updateRoomObjectUserGesture` when it was added for the avatar postures.
                this._container.roomEngine?.updateRoomObjectUserGesture(
                    this._container.roomSession.roomId,
                    userData.roomObjectId,
                    AvatarAction.getGestureId(gesture)
                );

                break;
            }

            case RoomWidgetWordQuizUpdateEvent.FINISHED:
                update = new RoomWidgetWordQuizUpdateEvent(event.id, RoomWidgetWordQuizUpdateEvent.FINISHED);
                update.pollId = event.pollId;
                update.questionId = event.questionId;
                update.answerCounts = event.answerCounts;

                break;

            case RoomWidgetWordQuizUpdateEvent.NEW_QUESTION:
                update = new RoomWidgetWordQuizUpdateEvent(event.id, RoomWidgetWordQuizUpdateEvent.NEW_QUESTION);
                update.question = event.question;
                update.duration = event.duration;
                update.pollType = event.pollType;
                update.questionId = event.questionId;
                update.pollId = event.pollId;

                break;
        }

        if(update === null) return;

        this._container.desktopEvents.emit(update.type, update);
    }

    // AS3: .../handler/WordQuizWidgetHandler.as::update()
    // Empty in AS3 too.
    update(): void
    {
    }

    // AS3: .../handler/WordQuizWidgetHandler.as::dispose()
    dispose(): void
    {
        this._disposed = true;
        this._container = null;
    }
}
