import type {IWindowContainer} from '@core/window/IWindowContainer';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {HabboNuxDialogs} from './HabboNuxDialogs';

/**
 * The "you have not finished the new-user experience" offer: verify your phone number, or skip.
 *
 * Opened by `HabboNuxDialogs` on `NewUserExperienceNotCompleteEvent`. The frame's own close
 * button is hidden — the only ways out are the two buttons, and "skip" goes through a
 * never-ask-again confirm rather than closing directly.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/nux/NuxOfferOldUserView.as
 */
export class NuxOfferOldUserView
{
    // AS3: .../nux/NuxOfferOldUserView.as::_frame
    private _frame: IWindowContainer | null = null;

    // AS3: .../nux/NuxOfferOldUserView.as::_SafeStr_4617
    private _nuxDialogs: HabboNuxDialogs | null;

    // AS3: .../nux/NuxOfferOldUserView.as::NuxOfferOldUserView()
    constructor(nuxDialogs: HabboNuxDialogs)
    {
        this._nuxDialogs = nuxDialogs;

        this.show();
    }

    // AS3: .../nux/NuxOfferOldUserView.as::show()
    private show(): void
    {
        if(this._frame != null) return;

        this._frame = this._nuxDialogs?.windowManager
            ?.buildWidgetLayout('nux_offer_old_user_xml') as IWindowContainer | null ?? null;

        if(this._frame == null)
        {
            throw new Error('Failed to construct window from XML!');
        }

        this._frame.center();

        const closeButton = this._frame.findChildByTag('close');

        if(closeButton)
        {
            closeButton.visible = false;
        }

        this._frame.findChildByName('btnSkip')?.addEventListener(
            WindowMouseEvent.CLICK,
            () => { this.onReject(); }
        );
        this._frame.findChildByName('btnGo')?.addEventListener(
            WindowMouseEvent.CLICK,
            () => { this.onVerify(); }
        );
    }

    /**
     * AS3: .../nux/NuxOfferOldUserView.as::hide()
     *
     * Reached only from `onClose()` below, which nothing attaches — see its note.
     */
    private hide(): void
    {
        this._nuxDialogs?.destroyNuxOfferView();
    }

    /**
     * AS3: .../nux/NuxOfferOldUserView.as::onClose()
     *
     * Dead in AS3: `show()` hides the close button instead of listening to it, so no path
     * reaches this handler. Ported to keep the class's member list matching the source.
     */
    private onClose(): void
    {
        this.hide();
    }

    /**
     * AS3: .../nux/NuxOfferOldUserView.as::onVerify()
     *
     * Closes the view itself — the component sends the "start verifying" status.
     */
    private onVerify(): void
    {
        this._nuxDialogs?.onVerify();
        this.hide();
    }

    /**
     * AS3: .../nux/NuxOfferOldUserView.as::onReject()
     *
     * Deliberately does *not* hide: the view stays up until the never-again confirm is accepted,
     * and it is `HabboNuxDialogs.onNeverAgainConfirmClose()` that destroys it.
     */
    private onReject(): void
    {
        this._nuxDialogs?.onReject();
    }

    // AS3: .../nux/NuxOfferOldUserView.as::dispose()
    dispose(): void
    {
        if(this._frame)
        {
            this._frame.dispose();
            this._frame = null;
        }

        this._nuxDialogs = null;
    }
}
