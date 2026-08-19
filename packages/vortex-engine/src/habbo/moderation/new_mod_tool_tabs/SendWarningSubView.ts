/**
 * SendWarningSubView — the new mod tool's "send a warning" panel.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/moderation/new_mod_tool_tabs/_SafeCls_2922.as
 *
 * Derived name — `_SafeCls_2922`; named after `NewModerationTool.sendWarningSubView`.
 *
 * **The validation can never be satisfied.** A warning shorter than 50 characters is rejected as
 * too short, longer than 40 as too long, and 40..50 falls through both branches and does nothing at
 * all. Completion requires having tripped *both* rejections, so the panel is finished by being
 * wrong twice — once short, once long. `A` and `B` really are 50 and 40 in that order in AS3; the
 * inversion is the joke, not a decompiler artefact.
 *
 * `usernameInput` is declared in AS3 and never read.
 */
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IDisposable} from '@core/runtime/IDisposable';
import type {ITextFieldWindow} from '@core/window/components/ITextFieldWindow';
import type {NewModerationTool} from '../NewModerationTool';
import {NewModToolSubView} from './NewModToolSubView';

export class SendWarningSubView extends NewModToolSubView
{
    // AS3: .../new_mod_tool_tabs/_SafeCls_2922.as::A
    private static readonly A: number = 50;

    // AS3: .../new_mod_tool_tabs/_SafeCls_2922.as::B
    private static readonly B: number = 40;

    /** Derived name — `_SafeStr_9548`: the "too short" rejection has been seen. */
    // AS3: .../new_mod_tool_tabs/_SafeCls_2922.as::_SafeStr_9548
    private _rejectedAsTooShort: boolean = false;

    /** Derived name — `_SafeStr_9262`: the "too long" rejection has been seen. */
    // AS3: .../new_mod_tool_tabs/_SafeCls_2922.as::_SafeStr_9262
    private _rejectedAsTooLong: boolean = false;

    // AS3: .../new_mod_tool_tabs/_SafeCls_2922.as::_SafeCls_2922()
    constructor(tool: NewModerationTool, window: IWindowContainer)
    {
        super(tool, window);

        this.sendWarningButton?.addEventListener('WME_CLICK', this.onSendWarningClick);
    }

    // AS3: .../new_mod_tool_tabs/_SafeCls_2922.as::onSendWarningClick()
    private onSendWarningClick = (): void =>
    {
        const input = this.warningInput;
        const tool = this.tool;

        if(input === null) return;

        if(input.length < SendWarningSubView.A)
        {
            tool.windowManager?.alert(
                '${moderation.warning.send.warn_title}',
                tool.localizationManager?.getLocalizationWithParams(
                    'moderation.warning.send.validation_short', '', 'x', String(SendWarningSubView.A)
                ) ?? '',
                0,
                this.onAlertConfirm
            );

            this._rejectedAsTooShort = true;
        }
        else if(input.length > SendWarningSubView.B)
        {
            tool.windowManager?.alert(
                '${moderation.warning.send.warn_title}',
                tool.localizationManager?.getLocalizationWithParams(
                    'moderation.warning.send.validation_long', '', 'x', String(SendWarningSubView.B)
                ) ?? '',
                0,
                this.onAlertConfirm
            );

            this._rejectedAsTooLong = true;
        }
    };

    // AS3: .../new_mod_tool_tabs/_SafeCls_2922.as::onAlertConfirm()
    private onAlertConfirm = (dialog: IDisposable): void =>
    {
        dialog.dispose();

        if(this._rejectedAsTooShort && this._rejectedAsTooLong) this.tool.setToolCompletion(2);
    };

    /** Declared in AS3 and never read — see the class note. */
    // AS3: .../new_mod_tool_tabs/_SafeCls_2922.as::get usernameInput()
    private get usernameInput(): ITextFieldWindow | null
    {
        return this.window?.findChildByName('warning_username_input') as unknown as ITextFieldWindow | null;
    }

    // AS3: .../new_mod_tool_tabs/_SafeCls_2922.as::get warningInput()
    private get warningInput(): ITextFieldWindow | null
    {
        return this.window?.findChildByName('warning_input') as unknown as ITextFieldWindow | null;
    }

    // AS3: .../new_mod_tool_tabs/_SafeCls_2922.as::get sendWarningButton()
    private get sendWarningButton(): IWindow | null
    {
        return this.window?.findChildByName('send_warning_btn') ?? null;
    }
}
