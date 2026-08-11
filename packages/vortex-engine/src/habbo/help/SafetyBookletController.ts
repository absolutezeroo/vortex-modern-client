import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {Logger} from '@core/utils/Logger';
import type {IModalDialog} from '@habbo/window/utils/IModalDialog';
import type {IProgressIndicatorWidget} from '@habbo/window/widgets/IProgressIndicatorWidget';

import type {HabboHelp} from './HabboHelp';

const log = Logger.getLogger('habbo.help.SafetyBookletController');

/**
 * The safety booklet
 *
 * The same page-turner shape as `HabboWayController`, with three differences that keep it a
 * separate class rather than a variant: the page count is a constant instead of a config value,
 * every page turn is logged to the talent-track event log as well as to Google, and the closing
 * panel comes in two versions — one offering the safety quiz, one for hotels where the quiz is
 * switched off.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/SafetyBookletController.as
 */
export class SafetyBookletController
{
    // AS3: .../src/com/sulake/habbo/help/SafetyBookletController.as::START_PAGE
    private static readonly START_PAGE: number = 0;

    // AS3: .../src/com/sulake/habbo/help/SafetyBookletController.as::FINAL_PAGE
    private static readonly FINAL_PAGE: number = 7;

    // AS3: .../src/com/sulake/habbo/help/SafetyBookletController.as::_habboHelp
    private _habboHelp: HabboHelp | null;

    // AS3: .../src/com/sulake/habbo/help/SafetyBookletController.as::_dialog
    // Name derived (`_SafeStr_4929`).
    private _dialog: IModalDialog | null = null;

    // AS3: .../src/com/sulake/habbo/help/SafetyBookletController.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: .../src/com/sulake/habbo/help/SafetyBookletController.as::_currentPage
    // Name derived (`_SafeStr_4846`).
    private _currentPage: number = 0;

    // AS3: .../src/com/sulake/habbo/help/SafetyBookletController.as::_disposed
    private _disposed: boolean = false;

    // AS3: .../src/com/sulake/habbo/help/SafetyBookletController.as::SafetyBookletController()
    constructor(habboHelp: HabboHelp)
    {
        this._habboHelp = habboHelp;
    }

    // AS3: .../src/com/sulake/habbo/help/SafetyBookletController.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../src/com/sulake/habbo/help/SafetyBookletController.as::openSafetyBooklet()
    openSafetyBooklet(): void
    {
        this.closeWindow();

        const dialog = this._habboHelp?.getModalXmlWindow('safety_booklet') ?? null;

        if(!dialog)
        {
            log.error('openSafetyBooklet: getModalXmlWindow("safety_booklet") returned null - layout not registered?');

            return;
        }

        this._dialog = dialog;
        this._window = dialog.rootWindow as IWindowContainer | null;

        if(!this._window) return;

        this._window.procedure = this.onWindowEvent;

        this.setCurrentPage(SafetyBookletController.START_PAGE);

        // Logged under "Quiz" rather than "Help": the booklet is the reading half of the safety
        // quiz, and the talent track counts them together.
        this._habboHelp?.tracking?.trackEventLog('Quiz', '', 'talent.quiz.open');
    }

    // AS3: .../src/com/sulake/habbo/help/SafetyBookletController.as::closeWindow()
    closeWindow(): void
    {
        this._window = null;

        if(this._dialog)
        {
            this._dialog.dispose();
            this._dialog = null;
        }
    }

    // AS3: .../src/com/sulake/habbo/help/SafetyBookletController.as::onWindowEvent()
    private onWindowEvent = (event: WindowEvent, window: IWindow): void =>
    {
        if(this._disposed || !this._window || event.type !== 'WME_CLICK') return;

        switch(window.name)
        {
            case 'header_button_close':
                this.closeWindow();
                break;

            case 'next_button':
                this.setCurrentPage(Math.min(SafetyBookletController.FINAL_PAGE, this._currentPage + 1));
                this._habboHelp?.tracking?.trackEventLog('Quiz', `${this._currentPage}`, 'talent.quiz.change_page');
                this._habboHelp?.trackGoogle('safetyBooklet', `clickNextPage_${this._currentPage}`);
                break;

            case 'back_button':
            case 'previous_button':
                this.setCurrentPage(Math.max(0, this._currentPage - 1));
                this._habboHelp?.tracking?.trackEventLog('Quiz', `${this._currentPage}`, 'talent.quiz.change_page');
                this._habboHelp?.trackGoogle('safetyBooklet', `clickPrevPage_${this._currentPage}`);
                break;

            case 'quiz_button':
                this._habboHelp?.trackGoogle('safetyBooklet', 'clickQuiz');
                this._habboHelp?.showSafetyQuiz();
                break;

            case 'ok_button':
                // The closing panel's own button: open the quiz and shut the booklet behind it.
                this._habboHelp?.trackGoogle('safetyBooklet', 'clickOk');
                this._habboHelp?.showSafetyQuiz();
                this._habboHelp?.closeSafetyBooklet();
                break;
        }
    };

    /**
	 * Draw one page, or whichever closing panel this hotel's quiz setting calls for
	 */
    // AS3: .../src/com/sulake/habbo/help/SafetyBookletController.as::setCurrentPage()
    private setCurrentPage(page: number): void
    {
        if(!this._window) return;

        this._currentPage = page;

        const quizDisabled = this._habboHelp?.safetyQuizDisabled ?? false;

        const explanation = this._window.findChildByName('safety.quiz.explanation');

        if(explanation) explanation.visible = !quizDisabled;

        const illustration = this._window.findChildByName('illustration') as IStaticBitmapWrapperWindow | null;
        const safetyImage = this._window.findChildByName('safety_image') as IStaticBitmapWrapperWindow | null;
        const pager = this.getPageWidget();
        const pageContainer = this._window.findChildByName('page_container');
        const finalPanel = this._window.findChildByName('final_page');
        const finalPanelNoQuestions = this._window.findChildByName('final_page_no_questions');

        if(this._currentPage < SafetyBookletController.FINAL_PAGE)
        {
            const previous = this._window.findChildByName('previous_button');

            if(previous) previous.visible = this._currentPage !== 0;

            if(illustration) illustration.assetUri = `\${image.library.url}safetyquiz/page_${this._currentPage}.png`;
            if(safetyImage) safetyImage.assetUri = '${image.library.url}safetyquiz/safety_off.png';
            if(pager) pager.position = this._currentPage + 1;

            this.setCaption('title', `\${safety.booklet.page.${this._currentPage}.title}`);
            this.setCaption('description', `\${safety.booklet.page.${this._currentPage}.description}`);

            if(pageContainer) pageContainer.visible = true;
            if(finalPanel) finalPanel.visible = false;
            if(finalPanelNoQuestions) finalPanelNoQuestions.visible = false;

            pageContainer?.invalidate();

            return;
        }

        if(illustration) illustration.assetUri = '${image.library.url}safetyquiz/page_end.png';
        if(safetyImage) safetyImage.assetUri = '${image.library.url}safetyquiz/safety_on.png';
        if(pager) pager.position = 0;

        if(pageContainer) pageContainer.visible = false;

        // Two closing panels: the one inviting the quiz, and the one for hotels that switched the
        // quiz off. Only the chosen one is shown, and only it is invalidated.
        if(quizDisabled)
        {
            if(finalPanelNoQuestions) finalPanelNoQuestions.visible = true;

            finalPanelNoQuestions?.invalidate();
        }
        else
        {
            if(finalPanel) finalPanel.visible = true;

            finalPanel?.invalidate();
        }
    }

    // TS-only: AS3 writes `findChildByName(name).caption = …` inline; extracted for the null check.
    private setCaption(name: string, caption: string): void
    {
        const target = this._window?.findChildByName(name);

        if(target) target.caption = caption;
    }

    // TS-only: AS3 inlines the widget-window double cast at each use site.
    private getPageWidget(): IProgressIndicatorWidget | null
    {
        const holder = this._window?.findChildByName('page_widget') as IWidgetWindow | null;

        return (holder?.widget as IProgressIndicatorWidget | null) ?? null;
    }

    // AS3: .../src/com/sulake/habbo/help/SafetyBookletController.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this.closeWindow();

        this._habboHelp = null;
        this._disposed = true;
    }
}
