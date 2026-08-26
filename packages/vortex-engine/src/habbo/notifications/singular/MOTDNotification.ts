import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';

/**
 * The centred "message of the day" dialog
 *
 * One row per message, each a clone of `motd_notification_item_xml` grown to its own text height.
 * Unlike its toolbar siblings it attaches to nothing — it is a free window that disposes itself
 * on either close control.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/MOTDNotification.as
 */
export class MOTDNotification
{
    // AS3: .../notifications/singular/MOTDNotification.as::LIST_ITEM_HEIGHT_MARGIN
    private static readonly LIST_ITEM_HEIGHT_MARGIN: number = 20;

    // AS3: .../notifications/singular/MOTDNotification.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: .../notifications/singular/MOTDNotification.as::_messages
    private _messages: string[] = [];

    // AS3: .../notifications/singular/MOTDNotification.as::MOTDNotification()
    constructor(messages: string[], windowManager: IHabboWindowManager | null)
    {
        if(windowManager === null) return;

        this._messages = messages;

        this._window = windowManager.buildWidgetLayout('motd_notification_xml') as IWindowContainer | null;

        if(this._window === null) return;

        this._window.procedure = this.eventHandler;
        this._window.center();

        const template = windowManager.buildWidgetLayout('motd_notification_item_xml') as IWindowContainer | null;
        const list = this._window.findChildByName('message_list') as unknown as IItemListWindow | null;

        if(template === null || list === null) return;

        for(const message of this._messages)
        {
            const row = template.clone() as IWindowContainer;
            const text = row.findChildByName('message_text') as unknown as ITextWindow | null;

            if(text !== null)
            {
                text.text = message;
                row.height = text.textHeight + MOTDNotification.LIST_ITEM_HEIGHT_MARGIN;
            }

            list.addListItem(row);
        }
    }

    // AS3: .../notifications/singular/MOTDNotification.as::eventHandler()
    private eventHandler = (event: WindowEvent, target: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        switch(target.name)
        {
            case 'close':
            case 'header_button_close':
                this.dispose();
                break;
        }
    };

    // AS3: .../notifications/singular/MOTDNotification.as::dispose()
    dispose(): void
    {
        if(this._window !== null)
        {
            this._window.dispose();
            this._window = null;
        }
    }
}
