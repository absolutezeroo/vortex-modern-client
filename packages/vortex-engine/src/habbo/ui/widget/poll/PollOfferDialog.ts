import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import {Logger} from '@core/utils/Logger';
import {RoomWidgetPollMessage} from '../messages/RoomWidgetPollMessage';
import type {IPollDialog} from './IPollDialog';
import type {PollWidget} from './PollWidget';

const log = Logger.getLogger('habbo.ui.widget.poll.PollOfferDialog');

/**
 * "Would you like to take a survey?" — the three-button window that precedes the questions.
 *
 * Every button is guarded by the same one-shot state check: whichever is pressed first wins and
 * the rest become no-ops, so a double click cannot both start and reject the same poll.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/poll/PollOfferDialog.as
 */
export class PollOfferDialog implements IPollDialog
{
    // AS3: .../widget/poll/PollOfferDialog.as::OK
    public static readonly OK: string = 'POLL_OFFER_STATE_OK';

    // AS3: .../widget/poll/PollOfferDialog.as::CANCEL
    public static readonly CANCEL: string = 'POLL_OFFER_STATE_CANCEL';

    // AS3: .../widget/poll/PollOfferDialog.as::UNKNOWN
    public static readonly UNKNOWN: string = 'POLL_OFFER_STATE_UNKNOWN';

    // AS3: .../widget/poll/PollOfferDialog.as::_disposed
    private _disposed: boolean = false;

    // AS3: .../widget/poll/PollOfferDialog.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: .../widget/poll/PollOfferDialog.as::_state
    private _state: string = PollOfferDialog.UNKNOWN;

    // AS3: .../widget/poll/PollOfferDialog.as::_widget
    private _widget: PollWidget | null;

    // AS3: .../widget/poll/PollOfferDialog.as::_id
    private _id: number = -1;

    /**
     * AS3: .../widget/poll/PollOfferDialog.as::PollOfferDialog()
     *
     * The whole window is built here rather than in `start()`, which is empty — the offer has
     * nothing to sequence, unlike the question dialog.
     *
     * Both texts grow the window: each is wrapped in an item list, and the frame gains however
     * much the scrollable region overflows its visible one, so long copy is never clipped.
     */
    constructor(id: number, headline: string, summary: string, widget: PollWidget)
    {
        this._id = id;
        this._widget = widget;

        this._window = widget.windowManager.buildWidgetLayout('poll_offer') as IWindowContainer | null;

        if(this._window === null || this._window === undefined)
        {
            log.warn('poll_offer did not build — the survey offer cannot be shown');
            this._window = null;

            return;
        }

        this._window.center();

        this.bind('poll_offer_button_ok', this.onOk);
        this.bind('poll_offer_button_cancel', this.onCancel);
        this.bind('poll_offer_button_later', this.onLater);
        this.bind('header_button_close', this.onClose);

        this.setHtml('poll_offer_headline', 'poll_offer_headline_wrapper', headline);
        this.setHtml('poll_offer_summary', 'poll_offer_summary_wrapper', summary);
    }

    // AS3: .../widget/poll/PollOfferDialog.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../widget/poll/PollOfferDialog.as::get state()
    get state(): string
    {
        return this._state;
    }

    // AS3: .../widget/poll/PollOfferDialog.as::start()
    // Empty in AS3 too — the constructor already did the work.
    start(): void
    {
    }

    // AS3: .../widget/poll/PollOfferDialog.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;

        if(this._window !== null)
        {
            this._window.dispose();
            this._window = null;
        }

        this._widget = null;
    }

    // AS3: .../widget/poll/PollOfferDialog.as::PollOfferDialog()
    // AS3 repeats these four blocks inline; folded here because they differ only in name and
    // handler.
    private bind(name: string, handler: () => void): void
    {
        const button = this._window?.findChildByName(name) ?? null;

        if(button !== null) button.addEventListener('WME_CLICK', handler);
    }

    // AS3: .../widget/poll/PollOfferDialog.as::PollOfferDialog()
    // The two text blocks, likewise folded. The height is only grown when the wrapper exists.
    private setHtml(textName: string, wrapperName: string, value: string): void
    {
        const text = this._window?.findChildByName(textName) as ITextWindow | null;

        if(text === null || text === undefined || this._window === null) return;

        text.htmlText = value;

        const wrapper = this._window.findChildByName(wrapperName) as IItemListWindow | null;

        if(wrapper === null || wrapper === undefined) return;

        this._window.height += wrapper.scrollableRegion.height - wrapper.visibleRegion.height;
    }

    // AS3: .../widget/poll/PollOfferDialog.as::onOk()
    // Accepting does not close the offer — the content dialog arriving is what replaces it.
    private onOk = (): void =>
    {
        if(this._state !== PollOfferDialog.UNKNOWN) return;

        this._state = PollOfferDialog.OK;

        this._widget?.messageListener?.processWidgetMessage(
            new RoomWidgetPollMessage(RoomWidgetPollMessage.START, this._id)
        );
    };

    // AS3: .../widget/poll/PollOfferDialog.as::onCancel()
    private onCancel = (): void =>
    {
        if(this._state !== PollOfferDialog.UNKNOWN) return;

        this._state = PollOfferDialog.CANCEL;

        this._widget?.messageListener?.processWidgetMessage(
            new RoomWidgetPollMessage(RoomWidgetPollMessage.REJECT, this._id)
        );
        this._widget?.pollCancelled(this._id);
    };

    // AS3: .../widget/poll/PollOfferDialog.as::onLater()
    // "Later" is the only exit that tells the server nothing — the poll can be offered again.
    private onLater = (): void =>
    {
        if(this._state !== PollOfferDialog.UNKNOWN) return;

        this._state = PollOfferDialog.CANCEL;

        this._widget?.pollCancelled(this._id);
    };

    // AS3: .../widget/poll/PollOfferDialog.as::onClose()
    // The window's X is a reject, not a "later".
    private onClose = (): void =>
    {
        if(this._state !== PollOfferDialog.UNKNOWN) return;

        this._state = PollOfferDialog.CANCEL;

        this._widget?.messageListener?.processWidgetMessage(
            new RoomWidgetPollMessage(RoomWidgetPollMessage.REJECT, this._id)
        );
        this._widget?.pollCancelled(this._id);
    };
}
