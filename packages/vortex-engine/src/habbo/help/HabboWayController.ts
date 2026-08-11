import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {Logger} from '@core/utils/Logger';
import type {IModalDialog} from '@habbo/window/utils/IModalDialog';
import type {IProgressIndicatorWidget} from '@habbo/window/widgets/IProgressIndicatorWidget';

import type {HabboHelp} from './HabboHelp';

const log = Logger.getLogger('habbo.help.HabboWayController');

/**
 * The Habbo Way booklet
 *
 * A page-turner: each page pairs a "correct" and a "wrong" example, illustrated from the external
 * image library, and the last page swaps the whole body for a closing panel offering the quiz.
 * The page count is a hotel config value rather than a constant, so a hotel can ship more or fewer
 * pages without a client change.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/HabboWayController.as
 */
export class HabboWayController
{
    // AS3: .../src/com/sulake/habbo/help/HabboWayController.as::START_PAGE
    private static readonly START_PAGE: number = 0;

    // AS3: .../src/com/sulake/habbo/help/HabboWayController.as::_habboHelp
    private _habboHelp: HabboHelp | null;

    // AS3: .../src/com/sulake/habbo/help/HabboWayController.as::_dialog
    // Name derived (`_SafeStr_4929`).
    private _dialog: IModalDialog | null = null;

    // AS3: .../src/com/sulake/habbo/help/HabboWayController.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: .../src/com/sulake/habbo/help/HabboWayController.as::_currentPage
    // Name derived (`_SafeStr_4846`).
    private _currentPage: number = 0;

    // AS3: .../src/com/sulake/habbo/help/HabboWayController.as::_disposed
    private _disposed: boolean = false;

    // AS3: .../src/com/sulake/habbo/help/HabboWayController.as::HabboWayController()
    constructor(habboHelp: HabboHelp)
    {
        this._habboHelp = habboHelp;
    }

    // AS3: .../src/com/sulake/habbo/help/HabboWayController.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    /**
	 * The index at which the booklet shows its closing panel instead of a page
	 */
    // AS3: .../src/com/sulake/habbo/help/HabboWayController.as::get finalPage()
    private get finalPage(): number
    {
        return this._habboHelp?.getInteger('help.habboway.page.count', 6) ?? 6;
    }

    // AS3: .../src/com/sulake/habbo/help/HabboWayController.as::showHabboWay()
    showHabboWay(): void
    {
        this.closeWindow();

        const dialog = this._habboHelp?.getModalXmlWindow('habbo_way') ?? null;

        if(!dialog)
        {
            log.error('showHabboWay: getModalXmlWindow("habbo_way") returned null - layout not registered?');

            return;
        }

        this._dialog = dialog;
        this._window = dialog.rootWindow as IWindowContainer | null;

        if(!this._window) return;

        this._window.procedure = this.onWindowEvent;

        const pager = this.getPageWidget();

        if(pager) pager.size = this.finalPage;

        this.setCurrentPage(HabboWayController.START_PAGE);
    }

    // AS3: .../src/com/sulake/habbo/help/HabboWayController.as::closeWindow()
    closeWindow(): void
    {
        this._window = null;

        if(this._dialog)
        {
            this._dialog.dispose();
            this._dialog = null;
        }
    }

    // AS3: .../src/com/sulake/habbo/help/HabboWayController.as::onWindowEvent()
    private onWindowEvent = (event: WindowEvent, window: IWindow): void =>
    {
        if(this._disposed || !this._window || event.type !== 'WME_CLICK') return;

        switch(window.name)
        {
            case 'header_button_close':
                this.closeWindow();
                break;

            case 'next_button':
                this.setCurrentPage(Math.min(this.finalPage, this._currentPage + 1));
                // Tracked after the move, so the label carries the page landed on, not the one
                // left — as in AS3.
                this._habboHelp?.trackGoogle('habboWay', `clickNextPage_${this._currentPage}`);
                break;

            case 'back_button':
            case 'previous_button':
                this.setCurrentPage(Math.max(0, this._currentPage - 1));
                this._habboHelp?.trackGoogle('habboWay', `clickPrevPage_${this._currentPage}`);
                break;

            case 'quiz_button':
                this._habboHelp?.trackGoogle('habboWay', 'clickQuiz');
                this._habboHelp?.showHabboWayQuiz();
                break;
        }
    };

    /**
	 * Draw one page, or the closing panel once past the last one
	 */
    // AS3: .../src/com/sulake/habbo/help/HabboWayController.as::setCurrentPage()
    private setCurrentPage(page: number): void
    {
        if(!this._window) return;

        this._currentPage = page;

        const illustration = this._window.findChildByName('illustration') as IStaticBitmapWrapperWindow | null;
        const dove = this._window.findChildByName('dove_image') as IStaticBitmapWrapperWindow | null;
        const pager = this.getPageWidget();
        const pageContainer = this._window.findChildByName('page_container');
        const finalPanel = this._window.findChildByName('final_page');

        if(this._currentPage < this.finalPage)
        {
            const previous = this._window.findChildByName('previous_button');

            if(previous) previous.visible = this._currentPage !== 0;

            // `${image.library.url}` is resolved by the window system when the uri is set.
            if(illustration) illustration.assetUri = `\${image.library.url}habboway/page_${this._currentPage}.png`;
            if(dove) dove.assetUri = 'help_habboway_dove_off';
            if(pager) pager.position = this._currentPage + 1;

            this.setCaption('correct_title', `\${habbo.way.page.${this._currentPage}.correct.title}`);
            this.setCaption('correct_description', `\${habbo.way.page.${this._currentPage}.correct.description}`);
            this.setCaption('wrong_title', `\${habbo.way.page.${this._currentPage}.wrong.title}`);
            this.setCaption('wrong_description', `\${habbo.way.page.${this._currentPage}.wrong.description}`);

            if(pageContainer) pageContainer.visible = true;
            if(finalPanel) finalPanel.visible = false;

            pageContainer?.invalidate();

            return;
        }

        // The closing panel: the dove lights up and the pager resets to 0, which is how this
        // widget shows "no page selected".
        if(illustration) illustration.assetUri = '${image.library.url}habboway/page_end.png';
        if(dove) dove.assetUri = 'help_habboway_dove_on';
        if(pager) pager.position = 0;

        if(pageContainer) pageContainer.visible = false;
        if(finalPanel) finalPanel.visible = true;

        finalPanel?.invalidate();
    }

    // TS-only: AS3 writes `findChildByName(name).caption = …` inline; extracted because this port
    // must null-check each lookup.
    private setCaption(name: string, caption: string): void
    {
        const target = this._window?.findChildByName(name);

        if(target) target.caption = caption;
    }

    // TS-only: AS3 inlines the widget-window double cast at each of its three use sites.
    private getPageWidget(): IProgressIndicatorWidget | null
    {
        const holder = this._window?.findChildByName('page_widget') as IWidgetWindow | null;

        return (holder?.widget as IProgressIndicatorWidget | null) ?? null;
    }

    // AS3: .../src/com/sulake/habbo/help/HabboWayController.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this.closeWindow();

        this._habboHelp = null;
        this._disposed = true;
    }
}
