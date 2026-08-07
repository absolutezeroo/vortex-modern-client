import type EventEmitter from 'eventemitter3';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IRoomEngineRectangle} from '@habbo/room/RoomEngine';
import {RoomObjectCategoryEnum} from '@habbo/room/object/RoomObjectCategoryEnum';
import {Logger} from '@core/utils/Logger';
import type {IRoomWidgetHandler} from '../../IRoomWidgetHandler';
import type {WordQuizWidgetHandler} from '../../handler/WordQuizWidgetHandler';
import {RoomWidgetBase} from '../RoomWidgetBase';
import {RoomWidgetWordQuizUpdateEvent} from '../events/RoomWidgetWordQuizUpdateEvent';
import {RoomWidgetPollMessage} from '../messages/RoomWidgetPollMessage';
import {WordQuizView} from './WordQuizView';

const log = Logger.getLogger('habbo.ui.widget.wordquiz.WordQuizWidget');

/**
 * The room-wide like/dislike quiz: the question strip at the top, and a thumb sign floating over
 * every avatar who answers.
 *
 * The signs are the bulk of it. Each is a pooled window keyed `<pollId>_<userId>_<layout>`, it
 * follows its avatar on a 40ms timer, and it fades in, holds, then fades out while drifting up —
 * all driven by one countdown per sign rather than by a tween.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/wordquiz/WordQuizWidget.as
 */
export class WordQuizWidget extends RoomWidgetBase
{
    // AS3: .../widget/wordquiz/WordQuizWidget.as::ASSET_NAME_LIKE
    private static readonly ASSET_NAME_LIKE: string = 'wordquiz_like_xml';

    // AS3: .../widget/wordquiz/WordQuizWidget.as::ASSET_NAME_DISLIKE
    private static readonly ASSET_NAME_DISLIKE: string = 'wordquiz_unlike_xml';

    // AS3: .../widget/wordquiz/WordQuizWidget.as::SIGN_FADE_IN_TIME
    private static readonly SIGN_FADE_IN_TIME: number = 750;

    // AS3: .../widget/wordquiz/WordQuizWidget.as::SIGN_FADE_OUT_TIME
    private static readonly SIGN_FADE_OUT_TIME: number = 750;

    // AS3: .../widget/wordquiz/WordQuizWidget.as::UPDATE_FREQUENCY
    private static readonly UPDATE_FREQUENCY: number = 40;

    // AS3: .../widget/wordquiz/WordQuizWidget.as::VALUE_KEY_DISLIKE
    public static readonly VALUE_KEY_DISLIKE: string = '0';

    // AS3: .../widget/wordquiz/WordQuizWidget.as::VALUE_KEY_LIKE
    public static readonly VALUE_KEY_LIKE: string = '1';

    // AS3: .../widget/wordquiz/WordQuizWidget.as::FADE_IN_STEP
    // Name DERIVED: the 0.1875 added per tick, which is 1 / (750 / 40) — four ticks to opaque.
    private static readonly FADE_IN_STEP: number = 0.1875;

    // AS3: .../widget/wordquiz/WordQuizWidget.as::SIGN_OFFSET_X
    // Name DERIVED: the placement offsets. Note they differ between the first placement (+20,
    // -20) and every subsequent one (+29, -11) — AS3 writes two different pairs.
    private static readonly SIGN_INITIAL_OFFSET_X: number = 20;

    // AS3: .../widget/wordquiz/WordQuizWidget.as::SIGN_INITIAL_OFFSET_Y
    private static readonly SIGN_INITIAL_OFFSET_Y: number = -20;

    // AS3: .../widget/wordquiz/WordQuizWidget.as::SIGN_OFFSET_X
    private static readonly SIGN_OFFSET_X: number = 29;

    // AS3: .../widget/wordquiz/WordQuizWidget.as::SIGN_OFFSET_Y
    private static readonly SIGN_OFFSET_Y: number = -11;

    // AS3: .../widget/wordquiz/WordQuizWidget.as::_view
    private _view: WordQuizView | null = null;

    // AS3: .../widget/wordquiz/WordQuizWidget.as::_countdownTimer
    private _countdownTimer: ReturnType<typeof setInterval> | null = null;

    // AS3: .../widget/wordquiz/WordQuizWidget.as::_locationTimer
    private _locationTimer: ReturnType<typeof setInterval> | null = null;

    // AS3: .../widget/wordquiz/WordQuizWidget.as::_showResultTime
    private _showResultTime: number = 0;

    // AS3: .../widget/wordquiz/WordQuizWidget.as::_countdown
    private _countdown: number = 0;

    // AS3: .../widget/wordquiz/WordQuizWidget.as::_pollId
    private _pollId: number = -1;

    // AS3: .../widget/wordquiz/WordQuizWidget.as::_question
    private _question: Record<string, unknown> | null = null;

    // AS3: .../widget/wordquiz/WordQuizWidget.as::_showSignCounters
    // One countdown per sign, in milliseconds, decremented by UPDATE_FREQUENCY per tick. It is
    // what drives the whole fade — there is no tween.
    private _showSignCounters: Map<string, number> = new Map();

    // AS3: .../widget/wordquiz/WordQuizWidget.as::_answerWindows
    private _answerWindows: IWindowContainer[] = [];

    // AS3: .../widget/wordquiz/WordQuizWidget.as::_likePool
    // Name DERIVED (`_SafeStr_6953`/`_SafeStr_7079`): the two recycling pools, one per sign type.
    private _likePool: IWindowContainer[] = [];

    // AS3: .../widget/wordquiz/WordQuizWidget.as::_dislikePool
    private _dislikePool: IWindowContainer[] = [];

    // AS3: .../widget/wordquiz/WordQuizWidget.as::_hasAnswered
    // Name DERIVED (`_SafeStr_7623`): one vote per question, cleared by each new question.
    private _hasAnswered: boolean = false;

    /**
     * AS3 passes its own `handler` **getter** to super rather than `param1`, which reads the
     * field before it is set — so super receives null — and then assigns `param1` on the next
     * line. The net effect is the same, and this port just passes the handler.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/wordquiz/WordQuizWidget.as::WordQuizWidget()
    constructor(
        handler: IRoomWidgetHandler,
        windowManager: IHabboWindowManager,
        assets: IAssetLibrary | null,
        localizations: IHabboLocalizationManager | null
    )
    {
        super(handler, windowManager, assets, localizations);

        this._view = new WordQuizView(this);
        this._showResultTime =
            (this.handler?.container?.config?.getInteger('poll.word.quiz.answer.bubble.seconds', 3) ?? 3) * 1000;
    }

    // AS3: .../widget/wordquiz/WordQuizWidget.as::get handler()
    get handler(): WordQuizWidgetHandler | null
    {
        return (this._handler as unknown as WordQuizWidgetHandler | null) ?? null;
    }

    // AS3: .../widget/wordquiz/WordQuizWidget.as::get mainWindow()
    override get mainWindow(): IWindow | null
    {
        return this._view !== null ? this._view.mainWindow : null;
    }

    // AS3: .../widget/wordquiz/WordQuizWidget.as::registerUpdateEvents()
    override registerUpdateEvents(events: EventEmitter | null): void
    {
        if(events === null) return;

        events.on(RoomWidgetWordQuizUpdateEvent.NEW_QUESTION, this.newQuestion);
        events.on(RoomWidgetWordQuizUpdateEvent.QUESTION_ANSWERED, this.answeredQuestion);
        events.on(RoomWidgetWordQuizUpdateEvent.FINISHED, this.questionFinished);

        super.registerUpdateEvents(events);
    }

    // AS3: .../widget/wordquiz/WordQuizWidget.as::unregisterUpdateEvents()
    // This one *does* call its super, unlike most of its siblings.
    override unregisterUpdateEvents(events: EventEmitter | null): void
    {
        if(events === null) return;

        events.off(RoomWidgetWordQuizUpdateEvent.NEW_QUESTION, this.newQuestion);
        events.off(RoomWidgetWordQuizUpdateEvent.QUESTION_ANSWERED, this.answeredQuestion);
        events.off(RoomWidgetWordQuizUpdateEvent.FINISHED, this.questionFinished);

        super.unregisterUpdateEvents(events);
    }

    // AS3: .../widget/wordquiz/WordQuizWidget.as::dispose()
    override dispose(): void
    {
        if(this.disposed) return;

        if(this._view !== null)
        {
            this._view.dispose();
            this._view = null;
        }

        this.clearTimers();

        for(const window of this._answerWindows)
        {
            this.windowManager.removeWindow(window.name);
        }

        this._answerWindows.length = 0;

        for(const window of [...this._likePool, ...this._dislikePool])
        {
            window.dispose();
        }

        this._likePool.length = 0;
        this._dislikePool.length = 0;

        super.dispose();
    }

    /**
     * The vote. It closes the strip **before** the guard, so a second click still dismisses the
     * question even though it sends nothing.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/wordquiz/WordQuizWidget.as::sendAnswer()
    sendAnswer(value: number): void
    {
        this._view?.removeWindow();

        if(this._hasAnswered) return;

        const message = new RoomWidgetPollMessage(RoomWidgetPollMessage.ANSWER, this._pollId);

        message.questionId = Number(this._question?.['id'] ?? 0);
        message.answers = [`${value}`];

        this.messageListener?.processWidgetMessage(message);

        this._hasAnswered = true;

        this._view?.createWindow(WordQuizView.STATE_RESULT);
    }

    // AS3: .../widget/wordquiz/WordQuizWidget.as::newQuestion()
    private newQuestion = (event: RoomWidgetWordQuizUpdateEvent): void =>
    {
        this._pollId = event.id;
        this._question = event.question;
        this._hasAnswered = false;
        this._showSignCounters = new Map();

        this.showNewQuestion(this._question, event.duration);
    };

    // AS3: .../widget/wordquiz/WordQuizWidget.as::questionFinished()
    // The results are only shown when the finished question is the one on screen; the signs are
    // pooled either way.
    private questionFinished = (event: RoomWidgetWordQuizUpdateEvent): void =>
    {
        this.clearTimers();

        if(this._view !== null && this._question !== null && this._question['id'] === event.questionId)
        {
            this._view.displayResults(event.answerCounts);
        }

        for(const window of this._answerWindows)
        {
            this.poolWindow(window.name);
        }

        this._answerWindows.length = 0;
    };

    /**
     * Somebody voted: update the tallies, then raise a sign over them. The sign is taken from the
     * matching pool if one is free, and its countdown starts at fade-in + hold + fade-out.
     *
     * The location timer is started here as well as in `showNewQuestion()`, because a vote can
     * arrive for a question this client never saw start.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/wordquiz/WordQuizWidget.as::answeredQuestion()
    private answeredQuestion = (event: RoomWidgetWordQuizUpdateEvent): void =>
    {
        this._view?.updateResults(event.answerCounts);

        const isLike = event.value === WordQuizWidget.VALUE_KEY_LIKE;
        const pool = isLike ? this._likePool : this._dislikePool;
        const layout = isLike ? WordQuizWidget.ASSET_NAME_LIKE : WordQuizWidget.ASSET_NAME_DISLIKE;
        const name = `${this._pollId}_${event.userId}_${layout}`;

        let sign = pool.pop() ?? null;

        if(sign === null)
        {
            sign = this.windowManager.buildWidgetLayout(layout) as IWindowContainer | null;
        }

        if(sign === null || sign === undefined)
        {
            log.warn(`${layout} did not build — the quiz answer sign cannot be shown`);

            return;
        }

        sign.name = name;
        this._answerWindows.push(sign);

        this._showSignCounters.set(
            name,
            this._showResultTime + WordQuizWidget.SIGN_FADE_IN_TIME + WordQuizWidget.SIGN_FADE_OUT_TIME
        );

        const rect = this.getAvatarRect(event.userId);

        if(rect !== null)
        {
            sign.x = rect.left + WordQuizWidget.SIGN_INITIAL_OFFSET_X;
            sign.y = rect.top + WordQuizWidget.SIGN_INITIAL_OFFSET_Y;
        }

        if(this._locationTimer === null)
        {
            this._locationTimer = setInterval(this.onLocationTimer, WordQuizWidget.UPDATE_FREQUENCY);
        }

        const colored = sign.getChildByName('colored');

        if(colored !== null) colored.blend = 0;
    };

    /**
     * Every 40ms: move each sign onto its avatar and advance its fade.
     *
     * Two AS3 details survive here. The user id is recovered by **splitting the window's own
     * name** rather than being stored, and losing the avatar `return`s out of the whole loop
     * rather than continuing — so one departed voter freezes every sign behind it for that tick.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/wordquiz/WordQuizWidget.as::onLocationTimer()
    private onLocationTimer = (): void =>
    {
        for(const sign of this._answerWindows)
        {
            if(sign === null || sign === undefined) continue;

            const parts = String(sign.name).split('_');

            if(parts.length <= 1) continue;

            const userId = Number(parts[1]);
            const rect = this.getAvatarRect(userId);

            if(rect === null)
            {
                this.poolWindow(sign.name);

                return;
            }

            sign.x = rect.left + WordQuizWidget.SIGN_OFFSET_X;
            sign.y = rect.top + WordQuizWidget.SIGN_OFFSET_Y;

            this.handleSignWindowVisibility(sign);
        }
    };

    /**
     * One sign's fade, expressed entirely in terms of its remaining countdown:
     * above hold+fade-out it fades in a step at a time, between the two it is fully opaque, below
     * fade-out it fades the *whole window* and drifts it upward, and at zero it is pooled.
     *
     * The drift is AS3's own expression, `y -= 20 + (70 - blend * 120)`, which is negative while
     * the blend is above ~0.75 — so the sign dips slightly before rising. Kept verbatim.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/wordquiz/WordQuizWidget.as::handleSignWindowVisibility()
    private handleSignWindowVisibility(sign: IWindowContainer): void
    {
        const colored = sign.getChildByName('colored');
        const buttonLike = sign.getChildByName('button_like');

        if(!this._showSignCounters.has(sign.name) || colored === null || buttonLike === null) return;

        const remaining = (this._showSignCounters.get(sign.name) ?? 0) - WordQuizWidget.UPDATE_FREQUENCY;

        this._showSignCounters.set(sign.name, remaining);

        if(remaining > this._showResultTime + WordQuizWidget.SIGN_FADE_OUT_TIME)
        {
            colored.blend += WordQuizWidget.FADE_IN_STEP;
            buttonLike.blend = colored.blend;
        }
        else if(remaining > WordQuizWidget.SIGN_FADE_OUT_TIME)
        {
            colored.blend = 1;
            buttonLike.blend = 1;
        }
        else if(remaining < WordQuizWidget.SIGN_FADE_OUT_TIME && remaining > 0)
        {
            const step = WordQuizWidget.SIGN_FADE_OUT_TIME / WordQuizWidget.UPDATE_FREQUENCY;

            sign.blend -= step * 0.01;
            sign.y -= 20 + (70 - sign.blend * 120);
        }
        else if(remaining < 0)
        {
            sign.y -= 20 + (70 - sign.blend * 120);
            this.poolWindow(sign.name);
        }
    }

    // AS3: .../widget/wordquiz/WordQuizWidget.as::poolWindow()
    // Despite the name it does not pool anything — it hands the window back to the window
    // manager. The two pools are only ever filled by `dispose()`, and so are never read.
    private poolWindow(name: string): void
    {
        this.windowManager.removeWindow(name);
    }

    /**
     * AS3: .../widget/wordquiz/WordQuizWidget.as::getAvatarRect()
     *
     * Goes through the **session manager** to re-fetch the session by room id rather than using
     * `container.roomSession` directly, which the guard just checked. Kept, because the two can
     * differ during a room change.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/wordquiz/WordQuizWidget.as::getAvatarRect()
    private getAvatarRect(userId: number): IRoomEngineRectangle | null
    {
        const container = this.handler?.container ?? null;

        if(container === null || container.roomSession === null || container.roomEngine === null) return null;

        const roomId = container.roomSession.roomId;
        const userData = container.roomSessionManager?.getSession(roomId)?.userDataManager?.getUserData(userId) ?? null;

        if(userData === null) return null;

        return container.roomEngine.getRoomObjectBoundingRectangle(
            roomId,
            userData.roomObjectId,
            RoomObjectCategoryEnum.OBJECT_CATEGORY_USER,
            container.getFirstCanvasId()
        );
    }

    // AS3: .../widget/wordquiz/WordQuizWidget.as::onCountdownDownTimer()
    // At zero it stops the timers and takes the strip down — the server's "finished" is not
    // waited for.
    private onCountdownDownTimer = (): void =>
    {
        if(this._countdownTimer === null) return;

        this._countdown = this._countdown - 1;

        this._view?.updateCounter(String(this._countdown));

        if(this._countdown === 0)
        {
            this.clearTimers();
            this._view?.removeWindow();
        }
    };

    /**
     * AS3: .../widget/wordquiz/WordQuizWidget.as::showNewQuestion()
     *
     * `_countdown = 4` is assigned and then immediately overwritten whenever a duration is given
     * — so it only survives for a question with no duration, where nothing decrements it either.
     * Kept as AS3 has it.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/wordquiz/WordQuizWidget.as::showNewQuestion()
    private showNewQuestion(question: Record<string, unknown> | null, duration: number): void
    {
        if(question === null) return;

        this._view?.createWindow(WordQuizView.STATE_QUESTION, String(question['content'] ?? ''));

        this._countdown = 4;

        if(duration <= 0) return;

        this._countdown = Math.trunc(duration / 1000);
        this._countdownTimer = setInterval(this.onCountdownDownTimer, 1000);
        this._locationTimer = setInterval(this.onLocationTimer, WordQuizWidget.UPDATE_FREQUENCY);

        this._view?.updateCounter(String(this._countdown));
    }

    // AS3: .../widget/wordquiz/WordQuizWidget.as::clearTimers()
    private clearTimers(): void
    {
        if(this._countdownTimer !== null)
        {
            clearInterval(this._countdownTimer);
            this._countdownTimer = null;
        }

        if(this._locationTimer !== null)
        {
            clearInterval(this._locationTimer);
            this._locationTimer = null;
        }
    }
}
