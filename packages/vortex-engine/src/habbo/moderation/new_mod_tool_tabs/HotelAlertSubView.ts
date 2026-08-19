/**
 * HotelAlertSubView — the new mod tool's "send a hotel alert" panel.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/moderation/new_mod_tool_tabs/_SafeCls_3103.as
 *
 * Derived name — `_SafeCls_3103`; named after `NewModerationTool.hotelAlertSubView`.
 *
 * **The alert is shown back to the moderator, not broadcast.** `simpleAlert()` renders the typed
 * text locally under the real broadcast title, the field is cleared, and tool 1 is marked complete.
 */
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextFieldWindow} from '@core/window/components/ITextFieldWindow';
import type {NewModerationTool} from '../NewModerationTool';
import {NewModToolSubView} from './NewModToolSubView';

export class HotelAlertSubView extends NewModToolSubView
{
    /** The illustration AS3 passes positionally as `simpleAlert`'s seventh argument. */
    // AS3: .../new_mod_tool_tabs/_SafeCls_3103.as::onSendClicked()
    private static readonly ALERT_ILLUSTRATION: string = 'illumina_alert_illustrations_frank_neutral_png';

    // AS3: .../new_mod_tool_tabs/_SafeCls_3103.as::_SafeCls_3103()
    constructor(tool: NewModerationTool, window: IWindowContainer)
    {
        super(tool, window);

        this.sendHotelAlertButton?.addEventListener('WME_CLICK', this.onSendClicked);
    }

    // AS3: .../new_mod_tool_tabs/_SafeCls_3103.as::onSendClicked()
    private onSendClicked = (): void =>
    {
        const input = this.hotelAlertInput;

        if(input === null) return;

        this.tool.windowManager?.simpleAlert(
            '${notifications.broadcast.title}',
            '',
            input.text,
            '',
            '',
            null,
            HotelAlertSubView.ALERT_ILLUSTRATION
        );

        input.text = '';

        this.tool.setToolCompletion(1);
    };

    // AS3: .../new_mod_tool_tabs/_SafeCls_3103.as::get hotelAlertInput()
    private get hotelAlertInput(): ITextFieldWindow | null
    {
        return this.window?.findChildByName('hotel_alert_input') as unknown as ITextFieldWindow | null;
    }

    // AS3: .../new_mod_tool_tabs/_SafeCls_3103.as::get sendHotelAlertButton()
    private get sendHotelAlertButton(): IWindow | null
    {
        return this.window?.findChildByName('send_hotel_alert_btn') ?? null;
    }
}
