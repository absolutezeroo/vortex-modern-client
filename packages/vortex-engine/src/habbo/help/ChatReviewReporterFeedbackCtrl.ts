import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {Logger} from '@core/utils/Logger';

import type {HabboHelp} from './HabboHelp';

const log = Logger.getLogger('habbo.help.ChatReviewReporterFeedbackCtrl');

/**
 * Tells a reporter what came of the chat review they triggered
 *
 * Shown twice in a report's life: once when the guide ticket is created, once when it is
 * resolved. Both messages carry only a localization code, and the three captions are looked up
 * from it — falling back to a generic wording when the code has no specific text, which is what
 * lets the server introduce new outcomes without the client shipping copy for each.
 *
 * The whole panel is gated on `chatreviewreporterfeedbackctrl.enabled`; with the flag off nothing
 * is built at all.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/ChatReviewReporterFeedbackCtrl.as
 */
export class ChatReviewReporterFeedbackCtrl
{
    // AS3: .../src/com/sulake/habbo/help/ChatReviewReporterFeedbackCtrl.as::_habboHelp
    private _habboHelp: HabboHelp | null;

    // AS3: .../src/com/sulake/habbo/help/ChatReviewReporterFeedbackCtrl.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: .../src/com/sulake/habbo/help/ChatReviewReporterFeedbackCtrl.as::ChatReviewReporterFeedbackCtrl()
    // AS3 subscribes the ticket-resolution and ticket-creation events here; this port centralises
    // every help subscription in `HelpMessageHandler`, which calls `show()` from both.
    constructor(habboHelp: HabboHelp)
    {
        this._habboHelp = habboHelp;
    }

    // AS3: .../src/com/sulake/habbo/help/ChatReviewReporterFeedbackCtrl.as::get disposed()
    // AS3 derives this from the reference it nulls in dispose() rather than keeping a flag.
    get disposed(): boolean
    {
        return this._habboHelp === null;
    }

    /**
	 * Show the panel for one outcome
	 *
	 * @param localizationCode The outcome code the server sent
	 */
    // AS3: .../src/com/sulake/habbo/help/ChatReviewReporterFeedbackCtrl.as::show()
    show(localizationCode: string): void
    {
        if(!this.enabled) return;

        this.prepare();

        if(!this._window) return;

        this.setText('caption_txt', localizationCode, 'caption');
        this.setText('body_txt', localizationCode, 'body');
        this.setText('note_txt', localizationCode, 'note');

        // The caption wraps to an unknown number of lines, so the body is pushed below whatever
        // height it actually took rather than sitting at a fixed offset.
        const caption = this._window.findChildByName('caption_txt') as ITextWindow | null;
        const body = this._window.findChildByName('body_txt');

        if(caption && body) body.y = caption.y + caption.textHeight + 5;

        this._window.visible = true;
    }

    /**
	 * Resolve one caption, falling back to the generic wording
	 *
	 * AS3 tests the specific key by asking for it with an empty default and comparing against `''`
	 * — kept exactly, because that is a presence test and this port's lookup never returns null.
	 */
    // AS3: .../src/com/sulake/habbo/help/ChatReviewReporterFeedbackCtrl.as::setText()
    private setText(windowName: string, localizationCode: string, part: string): void
    {
        let key = `guide.bully.request.reporter.${localizationCode}.${part}`;

        if((this._habboHelp?.localization?.getLocalizationWithParams(key, '') ?? '') === '')
        {
            key = `guide.bully.request.reporter.${part}`;
        }

        const target = this._window?.findChildByName(windowName);

        // The caption is set as a `${…}` reference, not a resolved string: the window system
        // re-resolves it when the language changes.
        if(target) target.caption = `\${${key}}`;
    }

    /**
	 * Build the panel once and keep it
	 */
    // AS3: .../src/com/sulake/habbo/help/ChatReviewReporterFeedbackCtrl.as::prepare()
    private prepare(): void
    {
        if(this._window !== null) return;

        const window = this._habboHelp?.getXmlWindow('chat_review_reporter_feedback') as IWindowContainer | null;

        if(!window)
        {
            log.error('prepare: getXmlWindow("chat_review_reporter_feedback") returned null - layout not registered?');

            return;
        }

        this._window = window;
        this._window.procedure = this.windowProcedure;
        this._window.center();
    }

    // AS3: .../src/com/sulake/habbo/help/ChatReviewReporterFeedbackCtrl.as::windowProcedure()
    private windowProcedure = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK' || this._window === null || this._window.disposed) return;

        // Hidden, not disposed: the panel is rebuilt only once and shown again on the next
        // outcome.
        if(window.name === 'close_button' || window.name === 'header_button_close') this._window.visible = false;
    };

    // AS3: .../src/com/sulake/habbo/help/ChatReviewReporterFeedbackCtrl.as::get enabled()
    private get enabled(): boolean
    {
        return this._habboHelp?.getBoolean('chatreviewreporterfeedbackctrl.enabled') ?? false;
    }

    // AS3: .../src/com/sulake/habbo/help/ChatReviewReporterFeedbackCtrl.as::dispose()
    dispose(): void
    {
        this._habboHelp = null;

        if(this._window)
        {
            this._window.dispose();
            this._window = null;
        }
    }
}
