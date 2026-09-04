import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {Logger} from '@core/utils/Logger';
import {HabboWebTools} from '@habbo/utils/HabboWebTools';
import type {IModalDialog} from '@habbo/window/utils/IModalDialog';

import type {HabboNotifications} from './HabboNotifications';

const log = Logger.getLogger('habbo.notifications.NotificationPopup');

/**
 * The full-size notification: a modal dialog with a title, an illustration, a message and at most
 * one call to action.
 *
 * This is the other half of `HabboNotifications.showNotification()` — everything that is *not*
 * `display: BUBBLE` lands here. The port had that branch emitting a `'showNotification'` event
 * "for the UI layer", and nothing was listening, so a server notification without the BUBBLE flag
 * was silently dropped.
 *
 * **`linkUrl` picks the button, and the prefix picks which one.** An `event:` prefix means an
 * internal link and lights up the `action` button, which strips the prefix and hands the rest to
 * `createLinkEvent()`; anything else lights up `link`, which opens a browser tab. With no
 * `linkUrl` at all, neither button is made visible — the layout ships both hidden.
 *
 * The `WE_RESIZED` arm is what lets a tall illustration push the dialog open: the image's own
 * container takes its height as a minimum, so the frame grows with the artwork rather than
 * cropping it.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/NotificationPopup.as
 */
export class NotificationPopup implements IDisposable
{
    // AS3: .../notifications/NotificationPopup.as::_notifications
    private _notifications: HabboNotifications | null;

    // AS3: .../notifications/NotificationPopup.as::_SafeStr_4929 (name derived: the modal dialog)
    private _dialog: IModalDialog | null = null;

    // AS3: .../notifications/NotificationPopup.as::_SafeStr_4778 (name derived: the notification type)
    private _type: string | null;

    // AS3: .../notifications/NotificationPopup.as::_parameters
    private _parameters: Map<string, string> | null;

    // AS3: .../notifications/NotificationPopup.as::NotificationPopup()
    constructor(notifications: HabboNotifications, type: string, parameters: Map<string, string>)
    {
        this._notifications = notifications;
        this._type = type;
        this._parameters = parameters;

        const title = this.getNotificationPart('title', true) ?? '';
        const message = (this.getNotificationPart('message', true) ?? '').replace(/\\r/g, '\r');
        const linkUrl = this.getNotificationPart('linkUrl', false);
        const isInternalLink = linkUrl !== null && linkUrl.substr(0, 6) === 'event:';

        let linkTitle: string | null = null;

        if(linkUrl !== null)
        {
            linkTitle = this.getNotificationPart('linkTitle', false) ?? linkUrl;
        }

        const layout = (notifications.assets?.getAssetByName('layout_notification_popup_xml')?.content as string | null)
            ?? null;

        if(layout === null || notifications.windowManager === null)
        {
            log.warn('Missing layout "layout_notification_popup_xml" — the notification popup is not built');

            return;
        }

        this._dialog = notifications.windowManager.buildModalDialogFromXML(layout);

        const root = (this._dialog?.rootWindow as unknown as IWindowContainer | null) ?? null;

        if(root === null) return;

        (root as unknown as IWindow).procedure = this.windowProcedure;
        (root as unknown as IWindow).caption = title;

        if(linkUrl !== null)
        {
            const button = root.findChildByName(isInternalLink ? 'action' : 'link');

            if(button !== null)
            {
                button.visible = true;
                button.caption = linkTitle ?? '';
            }
        }

        const messageWindow = root.findChildByName('message');

        if(messageWindow !== null) messageWindow.caption = message;

        const illustration = root.findChildByName('illustration') as IStaticBitmapWrapperWindow | null;

        if(illustration !== null)
        {
            illustration.assetUri = notifications.getNotificationImageUrl(parameters, type) ?? '';
        }
    }

    // AS3: .../notifications/NotificationPopup.as::dispose()
    dispose(): void
    {
        if(this.disposed) return;

        this._dialog?.dispose();
        this._dialog = null;
        this._notifications = null;
        this._type = null;
        this._parameters = null;
    }

    // AS3: .../notifications/NotificationPopup.as::get disposed()
    get disposed(): boolean
    {
        return this._dialog === null;
    }

    // AS3: .../notifications/NotificationPopup.as::windowProcedure()
    private windowProcedure = (event: WindowEvent, window: IWindow): void =>
    {
        if(this.disposed) return;

        switch(event.type)
        {
            case 'WME_CLICK':
                switch(window.name)
                {
                    case 'header_button_close':
                        this.dispose();
                        break;
                    case 'action':
                        this._notifications?.createLinkEvent(
                            (this.getNotificationPart('linkUrl', false) ?? '').substr(6)
                        );
                        this.dispose();
                        break;
                    case 'link':
                        HabboWebTools.openWebPage(this.getNotificationPart('linkUrl', false) ?? '', 'habboMain');
                        break;
                }
                break;
            case 'WE_RESIZED':
                if(window.name === 'illustration' && window.parent !== null)
                {
                    window.parent.limits.minHeight = window.height;
                }
                break;
        }
    };

    // AS3: .../notifications/NotificationPopup.as::getNotificationPart()
    private getNotificationPart(part: string, required: boolean): string | null
    {
        if(this._notifications === null || this._parameters === null || this._type === null) return null;

        return this._notifications.getNotificationPart(this._parameters, this._type, part, required);
    }
}
