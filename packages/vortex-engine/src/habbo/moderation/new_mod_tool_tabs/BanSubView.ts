/**
 * BanSubView — the new mod tool's "ban a user" panel.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/moderation/new_mod_tool_tabs/_SafeCls_3888.as
 *
 * Derived name — `_SafeCls_3888`; named after `NewModerationTool.banSubView`, the getter that owns
 * the window it is built on. See `NewModToolSubView` for why these are "sub views".
 *
 * **Nothing is sent.** Clicking ban overwrites whatever the moderator typed with their *own* name,
 * forces the radio back to BAN and the duration to the longest entry, then opens a confirm dialog
 * describing that. Confirming only marks tool 0 complete. The panel is a prop.
 *
 * `getUnbanRadio` is declared in AS3 and never read — the caption still says UNBAN when the radio
 * is unselected, because `onBanClick()` re-selects the ban radio *before* building the message.
 */
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IDisposable} from '@core/runtime/IDisposable';
import type {IRadioButtonWindow} from '@core/window/components/IRadioButtonWindow';
import type {ITextFieldWindow} from '@core/window/components/ITextFieldWindow';
import type {IDropMenuWindow} from '@core/window/components/IDropMenuWindow';
import type {NewModerationTool} from '../NewModerationTool';
import {NewModToolSubView} from './NewModToolSubView';

export class BanSubView extends NewModToolSubView
{
    // AS3: .../new_mod_tool_tabs/_SafeCls_3888.as::_SafeCls_3888()
    constructor(tool: NewModerationTool, window: IWindowContainer)
    {
        super(tool, window);

        this.banRadio?.select();
        this.performBanAction?.addEventListener('WME_CLICK', this.onBanClick);
    }

    // AS3: .../new_mod_tool_tabs/_SafeCls_3888.as::onBanClick()
    private onBanClick = (): void =>
    {
        const usernameInput = this.usernameInput;
        const banRadio = this.banRadio;
        const durationSelector = this.durationSelector;
        const tool = this.tool;

        if(usernameInput === null || banRadio === null || durationSelector === null) return;

        usernameInput.text = tool.sessionDataManager?.userName ?? '';
        banRadio.select();
        durationSelector.selection = durationSelector.numMenuItems - 1;

        tool.windowManager?.confirm(
            '${moderation.ban_management.do.title}',
            tool.localizationManager?.getLocalizationWithParams(
                'moderation.ban_management.do.desc',
                '',
                'action', banRadio.isSelected ? 'BAN' : 'UNBAN',
                'user', usernameInput.text,
                'duration', durationSelector.enumerateSelection()[durationSelector.selection]
            ) ?? '',
            0,
            this.onConfirmClicked
        );
    };

    // AS3: .../new_mod_tool_tabs/_SafeCls_3888.as::onConfirmClicked()
    private onConfirmClicked = (dialog: IDisposable): void =>
    {
        dialog.dispose();

        this.tool.setToolCompletion(0);
    };

    // AS3: .../new_mod_tool_tabs/_SafeCls_3888.as::get usernameInput()
    private get usernameInput(): ITextFieldWindow | null
    {
        return this.window?.findChildByName('ban_username_input') as unknown as ITextFieldWindow | null;
    }

    // AS3: .../new_mod_tool_tabs/_SafeCls_3888.as::get getBanRadio()
    private get banRadio(): IRadioButtonWindow | null
    {
        return this.window?.findChildByName('ban_radio') as unknown as IRadioButtonWindow | null;
    }

    /** Declared in AS3 and never read — see the class note. */
    // AS3: .../new_mod_tool_tabs/_SafeCls_3888.as::get getUnbanRadio()
    private get unbanRadio(): IRadioButtonWindow | null
    {
        return this.window?.findChildByName('unban_radio') as unknown as IRadioButtonWindow | null;
    }

    // AS3: .../new_mod_tool_tabs/_SafeCls_3888.as::get getDurationSelector()
    private get durationSelector(): IDropMenuWindow | null
    {
        return this.window?.findChildByName('duration_selector') as unknown as IDropMenuWindow | null;
    }

    // AS3: .../new_mod_tool_tabs/_SafeCls_3888.as::get performBanAction()
    private get performBanAction(): IWindow | null
    {
        return this.window?.findChildByName('ban_btn') ?? null;
    }
}
