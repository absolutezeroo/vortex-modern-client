import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import {Logger} from '@core/utils/Logger';
import type {WordQuizWidget} from './WordQuizWidget';

const log = Logger.getLogger('habbo.ui.widget.wordquiz.WordQuizView');

/**
 * The strip at the top of the room carrying the question, the two vote buttons and the countdown
 * — and, once the question closes, the two tallies.
 *
 * Both states are the same class with a different layout: `createWindow(0)` is the question,
 * `createWindow(1)` the result.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/wordquiz/WordQuizView.as
 */
export class WordQuizView
{
    // AS3: .../widget/wordquiz/WordQuizView.as::STATE_QUESTION
    public static readonly STATE_QUESTION: number = 0;

    // AS3: .../widget/wordquiz/WordQuizView.as::STATE_RESULT
    public static readonly STATE_RESULT: number = 1;

    // AS3: .../widget/wordquiz/WordQuizView.as::CONTAINER_IN_BOTTOM
    // Declared and read by nothing, in AS3 too.
    private static readonly CONTAINER_IN_BOTTOM: boolean = false;

    // AS3: .../widget/wordquiz/WordQuizView.as::MAX_TOPIC_WIDTH
    // Name DERIVED: the 660 AS3 writes inline, both as the measuring width and as the cap.
    private static readonly MAX_TOPIC_WIDTH: number = 660;

    // AS3: .../widget/wordquiz/WordQuizView.as::TOPIC_WIDTH_PADDING
    // Name DERIVED: the `+ 6` added to the measured text width.
    private static readonly TOPIC_WIDTH_PADDING: number = 6;

    // AS3: .../widget/wordquiz/WordQuizView.as::TOPIC_Y
    private static readonly TOPIC_Y: number = 3;

    // AS3: .../widget/wordquiz/WordQuizView.as::WINDOW_Y
    private static readonly WINDOW_Y: number = 6;

    // AS3: .../widget/wordquiz/WordQuizView.as::ANSWER_KEY_DISLIKE
    // Name DERIVED: AS3 indexes the answer-count map with the literals "0" and "1".
    private static readonly ANSWER_KEY_DISLIKE: string = '0';

    // AS3: .../widget/wordquiz/WordQuizView.as::ANSWER_KEY_LIKE
    private static readonly ANSWER_KEY_LIKE: string = '1';

    // AS3: .../widget/wordquiz/WordQuizView.as::_resultViewTime
    // Static in AS3 — read from config once, in the *instance* constructor, so a second view
    // overwrites it. Kept static here for the same reason.
    private static _resultViewTime: number = 0;

    // AS3: .../widget/wordquiz/WordQuizView.as::_widget
    private _widget: WordQuizWidget | null;

    // AS3: .../widget/wordquiz/WordQuizView.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: .../widget/wordquiz/WordQuizView.as::_waitTimer
    private _waitTimer: ReturnType<typeof setTimeout> | null = null;

    // AS3: .../widget/wordquiz/WordQuizView.as::_topic
    // Kept across the question→result rebuild, so the result strip shows the same question.
    private _topic: string = '';

    // AS3: .../widget/wordquiz/WordQuizView.as::WordQuizView()
    constructor(widget: WordQuizWidget)
    {
        this._widget = widget;

        WordQuizView._resultViewTime =
            (widget.handler?.container?.config?.getInteger('poll.word.quiz.result.view.seconds', 4) ?? 4) * 1000;
    }

    // AS3: .../widget/wordquiz/WordQuizView.as::get mainWindow()
    get mainWindow(): IWindow | null
    {
        return this._window;
    }

    /**
     * Builds either strip. The topic width is measured by building a *throwaway* copy of the same
     * layout, setting the caption on it and reading `textWidth` back — the live window's own
     * width has already been constrained by then.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/wordquiz/WordQuizView.as::createWindow()
    createWindow(state: number, topic: string | null = null): void
    {
        this.removeWindow();

        const layout = state === WordQuizView.STATE_QUESTION ? 'wordquiz_question_xml' : 'wordquiz_result_xml';

        this._window = this._widget?.windowManager.buildWidgetLayout(layout) as IWindowContainer | null;

        if(this._window === null || this._window === undefined)
        {
            // AS3 throws "Failed to construct window from XML!" here. This is reached from a
            // server event, and a throw would take the room UI down with it.
            log.warn(`${layout} did not build — the word quiz cannot be shown`);
            this._window = null;

            return;
        }

        const like = this._window.findChildByName('button_like');

        if(like !== null) like.addEventListener('WME_CLICK', this.onLike);

        const dislike = this._window.findChildByName('button_dislike');

        if(dislike !== null) dislike.addEventListener('WME_CLICK', this.onDislike);

        if(topic !== null) this._topic = topic;

        const quizTopic = this._window.findChildByName('quiz_topic') as ITextWindow | null;

        if(quizTopic !== null && quizTopic !== undefined)
        {
            quizTopic.caption = this._topic;
            quizTopic.width = Math.min(
                WordQuizView.MAX_TOPIC_WIDTH,
                this.getCorrectTextWidth(state, this._topic) + WordQuizView.TOPIC_WIDTH_PADDING
            );
            quizTopic.y = WordQuizView.TOPIC_Y;
        }

        this.positionWindow();

        this._window.desktop?.addEventListener('WE_RESIZED', this.onDesktopResized);
    }

    /**
     * AS3: .../widget/wordquiz/WordQuizView.as::removeWindow()
     *
     * Two AS3 oddities kept: it bails when the window has no children — so an empty strip is
     * never torn down — and it **adds** the desktop resize listener where it plainly meant to
     * remove it, leaking one listener per rebuild.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/wordquiz/WordQuizView.as::removeWindow()
    removeWindow(): void
    {
        if(this._window === null || this._window.numChildren === 0) return;

        this._window.desktop?.addEventListener('WE_RESIZED', this.onDesktopResized);
        this._window.dispose();
        this._window = null;

        if(this._waitTimer !== null)
        {
            clearTimeout(this._waitTimer);
            this._waitTimer = null;
        }
    }

    // AS3: .../widget/wordquiz/WordQuizView.as::updateCounter()
    // A countdown of "0" is blanked rather than shown.
    updateCounter(value: string): void
    {
        const countdown = this._window?.findChildByName('countdown') as ITextWindow | null;

        if(countdown === null || countdown === undefined) return;

        countdown.caption = value === '0' ? '' : value;
    }

    // AS3: .../widget/wordquiz/WordQuizView.as::updateResults()
    // A missing key counts as zero, so the tallies show 0 rather than blank before any vote.
    updateResults(answerCounts: Map<string, number> | null): void
    {
        if(this._window === null || answerCounts === null) return;

        const dislike = this._window.findChildByName('lbl_dislike_count') as ITextWindow | null;

        if(dislike !== null && dislike !== undefined)
        {
            dislike.text = (answerCounts.get(WordQuizView.ANSWER_KEY_DISLIKE) ?? 0).toString();
        }

        const like = this._window.findChildByName('lbl_like_count') as ITextWindow | null;

        if(like !== null && like !== undefined)
        {
            like.text = (answerCounts.get(WordQuizView.ANSWER_KEY_LIKE) ?? 0).toString();
        }
    }

    // AS3: .../widget/wordquiz/WordQuizView.as::displayResults()
    // The result strip removes itself after the configured delay rather than on any input.
    displayResults(answerCounts: Map<string, number> | null): void
    {
        this.createWindow(WordQuizView.STATE_RESULT);
        this.updateResults(answerCounts);

        this._waitTimer = setTimeout(() => this.removeWindow(), WordQuizView._resultViewTime);
    }

    // AS3: .../widget/wordquiz/WordQuizView.as::dispose()
    // AS3 clears the widget *before* removeWindow(), which is why removeWindow() can never reach
    // the widget — kept, since nothing in it does.
    dispose(): void
    {
        this._widget = null;

        this.removeWindow();

        if(this._window !== null)
        {
            this._window.desktop?.removeEventListener('WE_RESIZED', this.onDesktopResized);
            this._window.dispose();
            this._window = null;
        }

        void WordQuizView.CONTAINER_IN_BOTTOM;
    }

    /**
     * AS3: .../widget/wordquiz/WordQuizView.as::getCorrectTextWidth()
     *
     * Builds a second copy of the layout purely to measure. It is widened to the cap first so the
     * text is not wrapped by the layout's own width before `textWidth` is read.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/wordquiz/WordQuizView.as::getCorrectTextWidth()
    private getCorrectTextWidth(state: number, topic: string | null): number
    {
        const layout = state === WordQuizView.STATE_QUESTION ? 'wordquiz_question_xml' : 'wordquiz_result_xml';
        const probe = this._widget?.windowManager.buildWidgetLayout(layout) as IWindowContainer | null;

        if(probe === null || probe === undefined) return 0;

        const quizTopic = probe.findChildByName('quiz_topic') as ITextWindow | null;

        let width = 0;

        if(quizTopic !== null && quizTopic !== undefined)
        {
            quizTopic.caption = topic ?? '';
            quizTopic.width = WordQuizView.MAX_TOPIC_WIDTH;
            width = Math.trunc(quizTopic.textWidth);
        }

        probe.dispose();

        return width;
    }

    // AS3: .../widget/wordquiz/WordQuizView.as::onLike()
    private onLike = (): void =>
    {
        this._widget?.sendAnswer(1);
    };

    // AS3: .../widget/wordquiz/WordQuizView.as::onDislike()
    private onDislike = (): void =>
    {
        this._widget?.sendAnswer(0);
    };

    // AS3: .../widget/wordquiz/WordQuizView.as::onDesktopResized()
    private onDesktopResized = (): void =>
    {
        this.positionWindow();
    };

    // AS3: .../widget/wordquiz/WordQuizView.as::positionWindow()
    // Centred on the *first child's* width, not the window's — the frame is full-width and the
    // strip inside it is not.
    private positionWindow(): void
    {
        if(this._window === null || this._window.numChildren === 0) return;

        const child = this._window.getChildAt(0);
        const desktop = this._window.desktop;

        if(child === null || desktop === null) return;

        this._window.x = desktop.width / 2 - child.width / 2;
        this._window.y = WordQuizView.WINDOW_Y;
    }
}
