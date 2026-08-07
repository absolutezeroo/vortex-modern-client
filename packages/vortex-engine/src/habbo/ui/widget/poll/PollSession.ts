import type {IDisposable} from '@core/runtime/IDisposable';
import type {PollQuestion} from '@habbo/communication/messages/parser/poll/PollQuestion';
import type {IPollDialog} from './IPollDialog';
import {PollOfferDialog} from './PollOfferDialog';
import {PollContentDialog} from './PollContentDialog';
import type {PollWidget} from './PollWidget';

/**
 * One poll's life, from offer to thanks. It owns the two dialogs and the end message, and is
 * what the widget keys by poll id — several polls can be in flight at once.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/poll/PollSession.as
 */
export class PollSession implements IDisposable
{
    // AS3: .../widget/poll/PollSession.as::_id
    private _id: number = -1;

    // AS3: .../widget/poll/PollSession.as::_widget
    private _widget: PollWidget | null;

    // AS3: .../widget/poll/PollSession.as::_offerDialog
    private _offerDialog: IPollDialog | null = null;

    // AS3: .../widget/poll/PollSession.as::_contentDialog
    private _contentDialog: IPollDialog | null = null;

    // AS3: .../widget/poll/PollSession.as::_endMessage
    // Kept from the content message so `showThanks()` can display it after the dialog is gone.
    private _endMessage: string = '';

    // AS3: .../widget/poll/PollSession.as::_disposed
    private _disposed: boolean = false;

    // AS3: .../widget/poll/PollSession.as::PollSession()
    constructor(id: number, widget: PollWidget)
    {
        this._id = id;
        this._widget = widget;
    }

    // AS3: .../widget/poll/PollSession.as::get id()
    get id(): number
    {
        return this._id;
    }

    // AS3: .../widget/poll/PollSession.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../widget/poll/PollSession.as::showOffer()
    // Hides any previous offer first, so a re-offered poll replaces rather than stacks.
    showOffer(headline: string, summary: string): void
    {
        this.hideOffer();

        if(this._widget === null) return;

        this._offerDialog = new PollOfferDialog(this._id, headline, summary, this._widget);
        this._offerDialog.start();
    }

    // AS3: .../widget/poll/PollSession.as::hideOffer()
    // The `is PollOfferDialog` test is AS3's — the field is typed as the interface, so the check
    // is what stops it disposing a content dialog that somehow landed there.
    hideOffer(): void
    {
        if(!(this._offerDialog instanceof PollOfferDialog)) return;

        if(!this._offerDialog.disposed) this._offerDialog.dispose();

        this._offerDialog = null;
    }

    // AS3: .../widget/poll/PollSession.as::showContent()
    // Closes the offer as well as any previous content — accepting is what replaces the offer.
    showContent(startMessage: string, endMessage: string, questions: PollQuestion[] | null, npsPoll: boolean): void
    {
        this.hideOffer();
        this.hideContent();

        this._endMessage = endMessage;

        if(this._widget === null) return;

        this._contentDialog = new PollContentDialog(this._id, startMessage, questions, this._widget, npsPoll);
        this._contentDialog.start();
    }

    // AS3: .../widget/poll/PollSession.as::hideContent()
    hideContent(): void
    {
        if(!(this._contentDialog instanceof PollContentDialog)) return;

        if(!this._contentDialog.disposed) this._contentDialog.dispose();

        this._contentDialog = null;
    }

    // AS3: .../widget/poll/PollSession.as::showThanks()
    // The end message the content event carried, shown once every question is answered.
    showThanks(): void
    {
        this._widget?.windowManager.alert('${poll_thanks_title}', this._endMessage, 0, (dialog) => dialog.dispose());
    }

    // AS3: .../widget/poll/PollSession.as::dispose()
    // AS3 sets `_disposed = true` twice, at the top and the bottom; once is enough.
    dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;

        if(this._offerDialog !== null)
        {
            this._offerDialog.dispose();
            this._offerDialog = null;
        }

        if(this._contentDialog !== null)
        {
            this._contentDialog.dispose();
            this._contentDialog = null;
        }

        this._widget = null;
    }
}
