import type {HabboNotificationItemStyle} from './HabboNotificationItemStyle';
import type {SingularNotificationController} from './SingularNotificationController';

/**
 * Data model wrapping notification content string and style.
 * Represents a single notification bubble item in the queue.
 *
 * @see source_as_win63/habbo/notifications/singular/HabboNotificationItem.as
 */
export class HabboNotificationItem
{
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/notifications/singular/HabboNotificationItem.as::_controller
    private _controller: SingularNotificationController | null;

    constructor(
        content: string,
        style: HabboNotificationItemStyle,
        controller: SingularNotificationController
    )
    {
        this._content = content;
        this._style = style;
        this._controller = controller;
    }

    // AS3: .../src/com/sulake/habbo/notifications/singular/HabboNotificationItem.as::_style
    private _style: HabboNotificationItemStyle | null;

    // AS3: .../src/com/sulake/habbo/notifications/singular/HabboNotificationItem.as::get style()
    get style(): HabboNotificationItemStyle | null
    {
        return this._style;
    }

    // AS3: .../src/com/sulake/habbo/notifications/singular/HabboNotificationItem.as::_content
    private _content: string | null;

    // AS3: .../src/com/sulake/habbo/notifications/singular/HabboNotificationItem.as::get content()
    get content(): string | null
    {
        return this._content;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/HabboNotificationItem.as::get notificationId()
    get notificationId(): string | null
    {
        if(this._style == null || this._style.extraData == null)
        {
            return null;
        }

        return (this._style.extraData['id'] as string | null) ?? null;
    }

    /**
	 * Execute internal link associated with this notification
	 */
    executeUiLinks(): void
    {
        if(this._style?.internalLink)
        {
            this._controller?.onInternalLink(this._style.internalLink);
        }
    }

    // AS3: .../src/com/sulake/habbo/notifications/singular/HabboNotificationItem.as::dispose()
    dispose(): void
    {
        this._content = null;

        if(this._style != null)
        {
            this._style.dispose();
            this._style = null;
        }

        this._controller = null;
    }
}
