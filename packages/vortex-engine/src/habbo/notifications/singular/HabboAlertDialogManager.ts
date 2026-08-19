import type {IDisposable} from '@core/runtime/IDisposable';
import type {IHabboHelp} from '@habbo/help/IHabboHelp';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';

/**
 * The alerts the *server* pushes at a player: moderator cautions and messages, ban notices, and the
 * hotel's closing / maintenance warnings.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/HabboAlertDialogManager.as
 *
 * Nothing here is a notification bubble — every method opens a modal dialog through the window
 * manager, which is why this class needs one at all.
 *
 * **A caution ends in the Habbo Way, a message does not.** Both render identically; the only
 * difference is the callback fired when the dialog's link is clicked, and `handleModeratorMessage()`
 * is the one that suppresses it.
 *
 * The two hotel-hours dialogs go through `alert()` rather than `simpleAlert()` and dispose
 * themselves on close, because they have no link and no illustration.
 */
export class HabboAlertDialogManager
{
    /** The illustration every moderation dialog carries. */
    // AS3: HabboAlertDialogManager.as::showModerationMessage()
    private static readonly MODERATION_ILLUSTRATION: string =
        'illumina_alert_illustrations_frank_neutral_png';

    // AS3: HabboAlertDialogManager.as::_windowManager
    private _windowManager: IHabboWindowManager | null;

    // AS3: HabboAlertDialogManager.as::_localization
    private _localization: IHabboLocalizationManager | null;

    // AS3: HabboAlertDialogManager.as::_habboHelp
    private _habboHelp: IHabboHelp | null;

    // TS-only: guards the idempotent `dispose()` this port's convention requires.
    private _disposed: boolean = false;

    // AS3: HabboAlertDialogManager.as::HabboAlertDialogManager()
    constructor(
        windowManager: IHabboWindowManager | null,
        localization: IHabboLocalizationManager | null,
        habboHelp: IHabboHelp | null
    )
    {
        this._windowManager = windowManager;
        this._localization = localization;
        this._habboHelp = habboHelp;
    }

    // TS-only: no AS3 counterpart; the port's components all expose it.
    get disposed(): boolean
    {
        return this._disposed;
    }

    /** Zero-pads an hour or minute to two digits. */
    // AS3: HabboAlertDialogManager.as::getTimeZeroPadded()
    private static getTimeZeroPadded(value: number): string
    {
        const padded = '0' + String(value);

        return padded.substring(padded.length - 2);
    }

    // AS3: HabboAlertDialogManager.as::handleModeratorCaution()
    handleModeratorCaution(message: string, url: string = ''): void
    {
        this.showModerationMessage(message, url);
    }

    // AS3: HabboAlertDialogManager.as::handleModeratorMessage()
    handleModeratorMessage(message: string, url: string = ''): void
    {
        this.showModerationMessage(message, url, false);
    }

    // AS3: HabboAlertDialogManager.as::handleUserBannedMessage()
    handleUserBannedMessage(message: string): void
    {
        this.showModerationMessage(message, '');
    }

    /**
     * The server sends the message with literal `\r` two-character sequences rather than carriage
     * returns, so they are unescaped before the dialog sees them.
     */
    // AS3: HabboAlertDialogManager.as::showModerationMessage()
    private showModerationMessage(message: string, url: string, showHabboWay: boolean = true): void
    {
        const cleanMessage = message.replace(/\\r/g, '\r');

        this._windowManager?.simpleAlert(
            '',
            '${mod.alert.title}',
            cleanMessage,
            '${mod.alert.link}',
            url,
            null,
            HabboAlertDialogManager.MODERATION_ILLUSTRATION,
            null,
            () =>
            {
                if(this._habboHelp !== null && showHabboWay) this._habboHelp.showHabboWay();
            }
        );
    }

    // AS3: HabboAlertDialogManager.as::handleHotelClosingMessage()
    handleHotelClosingMessage(minutesUntilClosing: number): void
    {
        this._localization?.registerParameter(
            'opening.hours.shutdown', 'm', String(minutesUntilClosing)
        );

        this._windowManager?.simpleAlert('', '${opening.hours.title}', '${opening.hours.shutdown}');
    }

    // AS3: HabboAlertDialogManager.as::handleHotelMaintenanceMessage()
    handleHotelMaintenanceMessage(minutesUntilMaintenance: number, duration: number): void
    {
        this._localization?.registerParameter(
            'maintenance.shutdown', 'm', String(minutesUntilMaintenance)
        );
        this._localization?.registerParameter('maintenance.shutdown', 'd', String(duration));

        this._windowManager?.simpleAlert('', '${opening.hours.title}', '${maintenance.shutdown}');
    }

    /** Two near-identical branches in AS3; only the localization key differs. */
    // AS3: HabboAlertDialogManager.as::handleHotelClosedMessage()
    handleHotelClosedMessage(openHour: number, openMinute: number, userThrownOutAtClose: boolean): void
    {
        const key = userThrownOutAtClose ? 'opening.hours.disconnected' : 'opening.hours.closed';

        this.showOpeningHoursAlert(key, openHour, openMinute);
    }

    // AS3: HabboAlertDialogManager.as::handleLoginFailedHotelClosedMessage()
    handleLoginFailedHotelClosedMessage(openHour: number, openMinute: number): void
    {
        this.showOpeningHoursAlert('opening.hours.disconnected', openHour, openMinute);
    }

    // TS-only: the shape AS3 repeats three times across the two hotel-hours handlers.
    private showOpeningHoursAlert(key: string, openHour: number, openMinute: number): void
    {
        this._localization?.registerParameter(key, 'h', HabboAlertDialogManager.getTimeZeroPadded(openHour));
        this._localization?.registerParameter(key, 'm', HabboAlertDialogManager.getTimeZeroPadded(openMinute));

        this._windowManager?.alert(
            '${opening.hours.title}', `\${${key}}`, 0, (dialog: IDisposable) => dialog.dispose()
        );
    }

    /**
     * The ban notice shown at login. A server-supplied `localizedReason` wins and has `{expiryDate}`
     * substituted into it; otherwise the text is assembled from two localization keys.
     *
     * `expiryDateSeconds` is a *duration from now*, not an absolute date — and `-1` or less means
     * permanent, which leaves the date blank.
     */
    // AS3: HabboAlertDialogManager.as::handleBanInfoMessage()
    handleBanInfoMessage(reason: string, expiryDateSeconds: number, localizedReason: string): void
    {
        const expiry = new Date();

        expiry.setTime(expiry.getTime() + expiryDateSeconds * 1000);

        const dateText = expiryDateSeconds > -1 ? expiry.toLocaleString() : '';

        let description: string;

        if(localizedReason !== null && localizedReason !== '')
        {
            description = localizedReason.replace('{expiryDate}', dateText);
        }
        else
        {
            const until = this._localization?.getLocalization('login.banned.until') ?? '';
            const reasonLabel = this._localization?.getLocalization('login.banned.reason') ?? '';

            description = `<b>${until}</b><br>${dateText}<br><b>${reasonLabel}</b><br>${reason}`;
        }

        this._windowManager?.simpleAlert('', '', description);
    }

    // AS3: HabboAlertDialogManager.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;

        this._windowManager = null;
        this._localization = null;
        this._habboHelp = null;
    }
}
