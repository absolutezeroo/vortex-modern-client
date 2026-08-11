import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {ISelectableWindow} from '@core/window/components/ISelectableWindow';
import type {ISelectorListWindow} from '@core/window/components/ISelectorListWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {Logger} from '@core/utils/Logger';
import {GetQuizQuestionsComposer} from '@habbo/communication/messages/outgoing/help/GetQuizQuestionsComposer';
import {PostQuizAnswersComposer} from '@habbo/communication/messages/outgoing/help/PostQuizAnswersComposer';
import type {QuizDataMessageParser} from '@habbo/communication/messages/parser/help/QuizDataMessageParser';
import type {QuizResultsMessageParser} from '@habbo/communication/messages/parser/help/QuizResultsMessageParser';
import type {IModalDialog} from '@habbo/window/utils/IModalDialog';

import type {HabboHelp} from './HabboHelp';

const log = Logger.getLogger('habbo.help.HabboWayQuizController');

/**
 * Both quizzes — Habbo Way and safety — in one window
 *
 * The two differ only in a quiz code, a set of illustrations and a localization prefix; the
 * question flow, the scoring and the review screen are shared. Neither is opened directly: the
 * entry points ask the server for the question ids and the window opens when they arrive.
 *
 * Answers are held client-side until the last question is passed, then submitted in one message —
 * so the player can go back and change an answer. The options of each question are shuffled once
 * and the order remembered, so stepping back and forward does not reshuffle them under the
 * player's cursor.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/HabboWayQuizController.as
 */
export class HabboWayQuizController
{
    // AS3: .../src/com/sulake/habbo/help/HabboWayQuizController.as::HABBO_WAY_QUIZ_CODE
    private static readonly HABBO_WAY_QUIZ_CODE: string = 'HabboWay1';
    // AS3: .../src/com/sulake/habbo/help/HabboWayQuizController.as::SAFETY_QUIZ_CODE
    private static readonly SAFETY_QUIZ_CODE: string = 'SafetyQuiz1';

    // AS3: .../src/com/sulake/habbo/help/HabboWayQuizController.as::PAGE_QUESTION
    private static readonly PAGE_QUESTION: number = 1;
    // AS3: .../src/com/sulake/habbo/help/HabboWayQuizController.as::PAGE_SUCCESS
    private static readonly PAGE_SUCCESS: number = 2;
    // AS3: .../src/com/sulake/habbo/help/HabboWayQuizController.as::PAGE_FAILURE
    private static readonly PAGE_FAILURE: number = 3;
    // AS3: .../src/com/sulake/habbo/help/HabboWayQuizController.as::PAGE_ANALYSIS
    private static readonly PAGE_ANALYSIS: number = 4;

    // AS3: .../src/com/sulake/habbo/help/HabboWayQuizController.as::_habboHelp
    private _habboHelp: HabboHelp | null;

    // AS3: .../src/com/sulake/habbo/help/HabboWayQuizController.as::_dialog
    // Name derived (`_SafeStr_4929`).
    private _dialog: IModalDialog | null = null;

    // AS3: .../src/com/sulake/habbo/help/HabboWayQuizController.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: .../src/com/sulake/habbo/help/HabboWayQuizController.as::_questionPane
    // Name derived (`_SafeStr_7208`).
    private _questionPane: IWindowContainer | null = null;

    // AS3: .../src/com/sulake/habbo/help/HabboWayQuizController.as::_answerList
    // Name derived (`_SafeStr_5358`).
    private _answerList: ISelectorListWindow | null = null;

    // AS3: .../src/com/sulake/habbo/help/HabboWayQuizController.as::_answerTemplate
    // Name derived (`_SafeStr_6224`): the layout's first answer row, lifted out and cloned per
    // option. Removed from the list so it never shows as an answer of its own.
    private _answerTemplate: ISelectableWindow | null = null;

    // AS3: .../src/com/sulake/habbo/help/HabboWayQuizController.as::_analysisPane
    // Name derived (`_SafeStr_5491`).
    private _analysisPane: IItemListWindow | null = null;

    // AS3: .../src/com/sulake/habbo/help/HabboWayQuizController.as::_analysisRowTemplate
    // Name derived (`_SafeStr_6242`).
    private _analysisRowTemplate: IWindow | null = null;

    // AS3: .../src/com/sulake/habbo/help/HabboWayQuizController.as::_quizCode
    private _quizCode: string = '';

    // AS3: .../src/com/sulake/habbo/help/HabboWayQuizController.as::_questionIds
    // Name derived (`_SafeStr_6805`): the question ids the server sent, in asking order.
    private _questionIds: number[] = [];

    // AS3: .../src/com/sulake/habbo/help/HabboWayQuizController.as::_answers
    // Name derived (`_SafeStr_6874`): the chosen option index per question, parallel to
    // `_questionIds`. Sparse until every question has been answered.
    private _answers: Array<number | null> = [];

    // AS3: .../src/com/sulake/habbo/help/HabboWayQuizController.as::_answerOrders
    private _answerOrders: Array<number[] | null> = [];

    // AS3: .../src/com/sulake/habbo/help/HabboWayQuizController.as::_questionIdsForWrongAnswers
    private _questionIdsForWrongAnswers: number[] = [];

    // AS3: .../src/com/sulake/habbo/help/HabboWayQuizController.as::_currentQuestion
    // Name derived (`_SafeStr_5420`).
    private _currentQuestion: number = 0;

    // AS3: .../src/com/sulake/habbo/help/HabboWayQuizController.as::_disposed
    private _disposed: boolean = false;

    // AS3: .../src/com/sulake/habbo/help/HabboWayQuizController.as::HabboWayQuizController()
    // AS3 subscribes the quiz-data and quiz-results events here; this port centralises every help
    // subscription in `HelpMessageHandler`, which calls `handleQuizData()`/`handleQuizResults()`.
    constructor(habboHelp: HabboHelp)
    {
        this._habboHelp = habboHelp;
    }

    // AS3: .../src/com/sulake/habbo/help/HabboWayQuizController.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../src/com/sulake/habbo/help/HabboWayQuizController.as::showHabboWayQuiz()
    showHabboWayQuiz(): void
    {
        this._habboHelp?.sendMessage(new GetQuizQuestionsComposer(HabboWayQuizController.HABBO_WAY_QUIZ_CODE));
    }

    // AS3: .../src/com/sulake/habbo/help/HabboWayQuizController.as::showSafetyQuiz()
    showSafetyQuiz(): void
    {
        this._habboHelp?.sendMessage(new GetQuizQuestionsComposer(HabboWayQuizController.SAFETY_QUIZ_CODE));
    }

    /**
	 * The question set arrived — close whichever booklet asked for it and open the quiz
	 */
    // AS3: .../src/com/sulake/habbo/help/HabboWayQuizController.as::onQuizData()
    handleQuizData(parser: QuizDataMessageParser): void
    {
        this._habboHelp?.closeHabboWay();
        this._habboHelp?.closeSafetyBooklet();

        this.showWindow(parser.quizCode, parser.questionIds);
    }

    /**
	 * The server marked the answers
	 */
    // AS3: .../src/com/sulake/habbo/help/HabboWayQuizController.as::onQuizResults()
    handleQuizResults(parser: QuizResultsMessageParser): void
    {
        this._questionIdsForWrongAnswers = parser.questionIdsForWrongAnswers;

        this.showPage(
            this._questionIdsForWrongAnswers.length === 0
                ? HabboWayQuizController.PAGE_SUCCESS
                : HabboWayQuizController.PAGE_FAILURE
        );
    }

    /**
	 * Build the quiz window and dress it for whichever quiz this is
	 */
    // AS3: .../src/com/sulake/habbo/help/HabboWayQuizController.as::showWindow()
    private showWindow(quizCode: string, questionIds: number[]): void
    {
        this.closeWindow();

        const dialog = this._habboHelp?.getModalXmlWindow('habbo_way_quiz') ?? null;

        if(!dialog)
        {
            log.error('showWindow: getModalXmlWindow("habbo_way_quiz") returned null - layout not registered?');

            return;
        }

        this._dialog = dialog;
        this._window = dialog.rootWindow as IWindowContainer | null;

        if(!this._window) return;

        this._window.procedure = this.onWindowEvent;

        this._questionPane = this._window.findChildByName('question_pane') as IWindowContainer | null;
        this._answerList = this._questionPane?.findChildByName('answer_list') as unknown as ISelectorListWindow | null;

        // The layout ships one answer row and one analysis row; both are lifted out as templates
        // and their lists emptied, so nothing shows before the first question is drawn.
        if(this._answerList)
        {
            this._answerTemplate = this._answerList.getSelectableAt(0);

            if(this._answerTemplate) this._answerList.removeSelectable(this._answerTemplate);
        }

        this._analysisPane = this._window.findChildByName('analysis_pane') as IItemListWindow | null;

        if(this._analysisPane)
        {
            this._analysisRowTemplate = this._analysisPane.getListItemAt(0);
            this._analysisPane.removeListItems();
            this._analysisPane.spacing = 4;
        }

        this._quizCode = quizCode;
        this._questionIds = questionIds;
        this._answers = new Array(this.questionCount).fill(null);
        this._answerOrders = new Array(this.questionCount).fill(null);

        this.setCurrentQuestion(0);

        const explanationContainer = (this._analysisRowTemplate as IItemListWindow | null)
            ?.getListItemByName('explanation_container') as IWindowContainer | null;

        switch(this._quizCode)
        {
            case HabboWayQuizController.HABBO_WAY_QUIZ_CODE:
                this.setAsset('question_illustration', '${image.library.url}habboway/quiz_question.png');
                this.setAsset('indicator_image', 'help_habboway_dove_on');
                this.setAsset('success_illustration', '${image.library.url}habboway/quiz_success.png');
                this.setAssetOn(explanationContainer, 'explanation_illustration', 'help_habboway_dove_quizz');
                break;

            case HabboWayQuizController.SAFETY_QUIZ_CODE:
                this.setAsset('question_illustration', '${image.library.url}safetyquiz/question_illustration.png');
                this.setAsset('indicator_image', '${image.library.url}safetyquiz/safety_on.png');
                // The Habbo Way branch above sets no failure illustration — only the safety quiz
                // does. Faithful: the layout's own default stands for the other quiz.
                this.setAsset('failure_illustration', '${image.library.url}safetyquiz/result_failure.png');
                this.setAsset('success_illustration', '${image.library.url}safetyquiz/result_success.png');
                this.setAssetOn(explanationContainer, 'explanation_illustration', '${image.library.url}safetyquiz/safety_on.png');
                break;
        }

        this.showPage(HabboWayQuizController.PAGE_QUESTION);
    }

    // AS3: .../src/com/sulake/habbo/help/HabboWayQuizController.as::closeWindow()
    private closeWindow(): void
    {
        this._window = null;

        if(this._dialog !== null)
        {
            this._dialog.dispose();
            this._dialog = null;
        }
    }

    /**
	 * Swap between the question, success, failure and review panes
	 */
    // AS3: .../src/com/sulake/habbo/help/HabboWayQuizController.as::showPage()
    private showPage(page: number): void
    {
        if(!this._window) return;

        this.setVisible('question_pane', page === HabboWayQuizController.PAGE_QUESTION);
        this.setVisible('success_pane', page === HabboWayQuizController.PAGE_SUCCESS);
        this.setVisible('failure_pane', page === HabboWayQuizController.PAGE_FAILURE);

        if(this._analysisPane) this._analysisPane.visible = page === HabboWayQuizController.PAGE_ANALYSIS;

        this.setVisible('prev_next_buttons', page === HabboWayQuizController.PAGE_QUESTION);
        this.setVisible('failure_buttons', page === HabboWayQuizController.PAGE_FAILURE);
        this.setVisible(
            'exit_button_container',
            page === HabboWayQuizController.PAGE_SUCCESS || page === HabboWayQuizController.PAGE_ANALYSIS
        );

        const topIndicator = this._window.findChildByName('top_indicator');
        const indicatorImage = this._window.findChildByName('indicator_image');
        const localization = this._habboHelp?.localization ?? null;

        switch(page)
        {
            case HabboWayQuizController.PAGE_QUESTION:
                this._window.caption = this.getFullLocalizationKey('question.title');

                if(indicatorImage) indicatorImage.visible = true;

                if(topIndicator)
                {
                    // Ported as written. AS3 builds the substituted "page 1 of N" string and then
                    // overwrites it on the very next line with the raw key, so the first question
                    // shows an unsubstituted `${…}` until prev/next runs setCurrentQuestion(),
                    // which sets it properly. The dead assignment is the original client's.
                    topIndicator.caption = localization?.getLocalizationWithParams(
                        this.getRawLocalizationKey('question.page'), '', 'current_page', '1', 'page_count', `${this.questionCount}`
                    ) ?? '';
                    topIndicator.caption = this.getFullLocalizationKey('question.page');
                    topIndicator.visible = true;
                }
                break;

            case HabboWayQuizController.PAGE_SUCCESS:
                this._window.caption = this.getFullLocalizationKey('success.title');

                this.setCaption('failure_advice', this.getFullLocalizationKey('failure.advice'));
                this.setCaption('success_results', localization?.getLocalizationWithParams(
                    this.getRawLocalizationKey('success.results'), '', 'question_count', `${this.questionCount}`
                ) ?? '');

                this.hideIndicators(indicatorImage, topIndicator);
                break;

            case HabboWayQuizController.PAGE_FAILURE:
            {
                const correct = this._questionIds.length - this._questionIdsForWrongAnswers.length;

                this._window.caption = this.getFullLocalizationKey('failure.title');

                this.setCaption('failure_advice', this.getFullLocalizationKey('failure.advice'));
                this.setCaption('failure_results', localization?.getLocalizationWithParams(
                    this.getRawLocalizationKey('failure.results'), '',
                    'correct_count', `${correct}`, 'total_count', `${this.questionCount}`
                ) ?? '');

                this.hideIndicators(indicatorImage, topIndicator);
                break;
            }

            case HabboWayQuizController.PAGE_ANALYSIS:
                this._window.caption = this.getFullLocalizationKey('analysis.title');

                if(indicatorImage) indicatorImage.visible = true;

                if(topIndicator)
                {
                    topIndicator.visible = true;
                    topIndicator.caption = this.getFullLocalizationKey('analysis.top');
                }

                this.populateAnalysis();
                break;
        }
    }

    /**
	 * List every question the player got wrong, with their answer and why it is wrong
	 */
    // AS3: inlined in `showPage()`'s analysis branch.
    private populateAnalysis(): void
    {
        if(!this._analysisPane || !this._analysisRowTemplate) return;

        for(const questionId of this._questionIdsForWrongAnswers)
        {
            const answer = this._answers[this._questionIds.indexOf(questionId)] ?? 0;
            const row = this._analysisRowTemplate.clone() as unknown as IItemListWindow;

            const prefix = `\${quiz.${this._quizCode}.`;
            const suffix = `.${questionId}.${answer}}`;

            const question = row.getListItemByName('question');

            if(question) question.caption = `${prefix}question.${questionId}}`;

            const answerContainer = row.getListItemByName('answer_container') as IWindowContainer | null;
            const answerLabel = answerContainer?.findChildByName('answer');

            if(answerLabel) answerLabel.caption = `${prefix}answer${suffix}`;

            const explanationContainer = row.getListItemByName('explanation_container') as IWindowContainer | null;
            const explanationLabel = explanationContainer?.findChildByName('explanation');

            if(explanationLabel) explanationLabel.caption = `${prefix}explanation${suffix}`;

            this._analysisPane.addListItem(row as unknown as IWindow);
        }

        // The rows carry a trailing separator; the last one's is thrown away so the list does not
        // end on a rule.
        const last = this._analysisPane.getListItemAt(this._analysisPane.numListItems - 1) as unknown as IItemListWindow | null;

        last?.getListItemByName('separator')?.dispose();
    }

    // AS3: .../src/com/sulake/habbo/help/HabboWayQuizController.as::onWindowEvent()
    private onWindowEvent = (event: WindowEvent, window: IWindow): void =>
    {
        if(this._disposed || this._window === null || event.type !== 'WME_CLICK') return;

        // An answer row: record the choice and let the player move on. AS3 tests
        // `is ISelectableWindow`, which TypeScript cannot express for an interface — the answer
        // rows are the only children of this window carrying `isSelected`.
        if((window as unknown as ISelectableWindow).isSelected !== undefined)
        {
            this._answers[this._currentQuestion] = parseInt(window.name, 10);

            this.setVisible('next_dimmer', false);

            return;
        }

        switch(window.name)
        {
            case 'header_button_close':
            case 'exit_button':
                this.closeWindow();
                break;

            case 'prev_button':
                this.setCurrentQuestion(this._currentQuestion - 1);
                break;

            case 'next_button':
                this.setCurrentQuestion(this._currentQuestion + 1);
                break;

            case 'review_button':
                this.showPage(HabboWayQuizController.PAGE_ANALYSIS);
                break;
        }
    };

    /**
	 * Draw one question, or submit once the player steps past the last
	 *
	 * The options are shuffled the first time a question is shown and the order kept, so stepping
	 * back and forward leaves them where the player last saw them.
	 */
    // AS3: .../src/com/sulake/habbo/help/HabboWayQuizController.as::setCurrentQuestion()
    private setCurrentQuestion(index: number): void
    {
        if(index >= this.questionCount)
        {
            this._habboHelp?.sendMessage(new PostQuizAnswersComposer(this._quizCode, this._answers.map((a) => a ?? 0)));

            return;
        }

        if(index < 0 || !this._window || !this._answerList || !this._answerTemplate) return;

        this._currentQuestion = index;

        this.setVisible('prev_dimmer', index <= 0);
        // The next button stays dimmed until this question has an answer.
        this.setVisible('next_dimmer', this._answers[this._currentQuestion] === null);

        this.setCaption('top_indicator', this._habboHelp?.localization?.getLocalizationWithParams(
            this.getRawLocalizationKey('question.page'), '',
            'current_page', `${index + 1}`, 'page_count', `${this.questionCount}`
        ) ?? '');

        while(this._answerList.numSelectables > 0)
        {
            const selectable = this._answerList.getSelectableAt(0);

            if(!selectable) break;

            this._answerList.removeSelectable(selectable)?.dispose();
        }

        const questionId = this._questionIds[this._currentQuestion];
        const options: ISelectableWindow[] = [];

        const questionLabel = this._questionPane?.findChildByName('question');

        if(questionLabel) questionLabel.caption = `\${quiz.${this._quizCode}.question.${questionId}}`;

        // The option count is not sent: AS3 walks the localization table until a key is missing.
        // `getLocalizationWithParams(key, '')` is this port's presence test, as the lookup never
        // returns null.
        let optionCount = 0;

        for(;;)
        {
            const caption = this._habboHelp?.localization?.getLocalizationWithParams(
                `quiz.${this._quizCode}.answer.${questionId}.${optionCount}`, ''
            ) ?? '';

            if(caption.length <= 0) break;

            const option = this._answerTemplate.clone() as unknown as ISelectableWindow;

            (option as unknown as IWindow).caption = caption;
            (option as unknown as IWindow).name = optionCount.toString();

            options.push(option);
            optionCount++;
        }

        const remembered = this._answerOrders[this._currentQuestion];

        if(remembered === null || remembered === undefined)
        {
            const order: number[] = [];
            const pool = options.slice();

            for(let i = 0; i < optionCount; i++)
            {
                const picked = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];

                this._answerList.addSelectable(picked);
                order.push(parseInt((picked as unknown as IWindow).name, 10));
            }

            this._answerOrders[this._currentQuestion] = order;
        }
        else
        {
            // Replaying the remembered order indexes the freshly-built options by their original
            // position, which is what their name still holds.
            for(const original of remembered) this._answerList.addSelectable(options[original]);
        }

        const chosen = this._answerList.getSelectableByName(`${this._answers[this._currentQuestion]}`);

        chosen?.select();
    }

    // AS3: .../src/com/sulake/habbo/help/HabboWayQuizController.as::get questionCount()
    private get questionCount(): number
    {
        return this._questionIds.length;
    }

    // AS3: .../src/com/sulake/habbo/help/HabboWayQuizController.as::getFullLocalizationKey()
    private getFullLocalizationKey(key: string): string
    {
        return `\${${this.getRawLocalizationKey(key)}}`;
    }

    /**
	 * The Habbo Way quiz has its own key prefix; every other quiz is keyed by its code
	 */
    // AS3: .../src/com/sulake/habbo/help/HabboWayQuizController.as::getRawLocalizationKey()
    private getRawLocalizationKey(key: string): string
    {
        if(this._quizCode !== HabboWayQuizController.HABBO_WAY_QUIZ_CODE) return `quiz.${this._quizCode}.${key}`;

        return `habbo.way.quiz.${key}`;
    }

    // TS-only: AS3 inlines each `findChildByName(...).visible = …`; extracted for the null check.
    private setVisible(name: string, visible: boolean): void
    {
        const target = this._window?.findChildByName(name);

        if(target) target.visible = visible;
    }

    // TS-only: as above, for captions.
    private setCaption(name: string, caption: string): void
    {
        const target = this._window?.findChildByName(name);

        if(target) target.caption = caption;
    }

    // TS-only: as above, for the illustration slots.
    private setAsset(name: string, assetUri: string): void
    {
        const target = this._window?.findChildByName(name) as IStaticBitmapWrapperWindow | null;

        if(target) target.assetUri = assetUri;
    }

    // TS-only: the one illustration that lives inside the analysis row rather than the window.
    private setAssetOn(container: IWindowContainer | null, name: string, assetUri: string): void
    {
        const target = container?.findChildByName(name) as IStaticBitmapWrapperWindow | null;

        if(target) target.assetUri = assetUri;
    }

    // TS-only: the success and failure pages hide the same two indicators the same way.
    private hideIndicators(indicatorImage: IWindow | null, topIndicator: IWindow | null): void
    {
        if(indicatorImage) indicatorImage.visible = false;

        if(topIndicator)
        {
            topIndicator.visible = false;
            topIndicator.caption = '';
        }
    }

    // AS3: .../src/com/sulake/habbo/help/HabboWayQuizController.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this._questionPane = null;
        this._answerList = null;

        if(this._answerTemplate !== null)
        {
            this._answerTemplate.dispose();
            this._answerTemplate = null;
        }

        this._analysisPane = null;

        if(this._analysisRowTemplate !== null)
        {
            this._analysisRowTemplate.dispose();
            this._analysisRowTemplate = null;
        }

        this.closeWindow();

        this._habboHelp = null;
        this._disposed = true;
    }
}
