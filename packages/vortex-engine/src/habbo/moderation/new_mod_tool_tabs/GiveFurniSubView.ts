/**
 * GiveFurniSubView — the new mod tool's "give furniture" panel.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/moderation/new_mod_tool_tabs/_SafeCls_2522.as
 *
 * Derived name — `_SafeCls_2522`; named after `NewModerationTool.giveFurniSubView`.
 *
 * **The donate button always fails.** It opens a "too many requests" error unconditionally, and
 * dismissing that error is what marks tool 4 complete. The plus/minus steppers do work, and clamp
 * the amount to 1..100.
 *
 * `productNameInput` is declared in AS3 and never read.
 */
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IDisposable} from '@core/runtime/IDisposable';
import type {IIconButtonWindow} from '@core/window/components/IIconButtonWindow';
import type {ITextFieldWindow} from '@core/window/components/ITextFieldWindow';
import type {NewModerationTool} from '../NewModerationTool';
import {NewModToolSubView} from './NewModToolSubView';

export class GiveFurniSubView extends NewModToolSubView
{
    // AS3: .../new_mod_tool_tabs/_SafeCls_2522.as::_SafeCls_2522()
    constructor(tool: NewModerationTool, window: IWindowContainer)
    {
        super(tool, window);

        (this.plusButton as unknown as IWindow | null)?.addEventListener('WME_CLICK', this.onPlusButtonClick);
        (this.minusButton as unknown as IWindow | null)?.addEventListener('WME_CLICK', this.onMinusButtonClick);
        this.donateFurniButton?.addEventListener('WME_CLICK', this.onDonateClick);
    }

    // AS3: .../new_mod_tool_tabs/_SafeCls_2522.as::onDonateClick()
    private onDonateClick = (): void =>
    {
        this.tool.windowManager?.alert(
            '${error.title}', '${moderation.give_furni.too_many_requests}', 0, this.onAlertConfirm
        );
    };

    // AS3: .../new_mod_tool_tabs/_SafeCls_2522.as::onAlertConfirm()
    private onAlertConfirm = (dialog: IDisposable): void =>
    {
        dialog.dispose();

        this.tool.setToolCompletion(4);
    };

    // AS3: .../new_mod_tool_tabs/_SafeCls_2522.as::onOpen()
    public override onOpen(): void
    {
        super.onOpen();

        const input = this.usernameInput;

        if(input !== null) input.text = this.tool.sessionDataManager?.userName ?? '';
    }

    // AS3: .../new_mod_tool_tabs/_SafeCls_2522.as::onPlusButtonClick()
    private onPlusButtonClick = (): void =>
    {
        if(this.amount < 100) this.amount = this.amount + 1;
    };

    // AS3: .../new_mod_tool_tabs/_SafeCls_2522.as::onMinusButtonClick()
    private onMinusButtonClick = (): void =>
    {
        if(this.amount > 1) this.amount = this.amount - 1;
    };

    // AS3: .../new_mod_tool_tabs/_SafeCls_2522.as::get amount()
    private get amount(): number
    {
        return parseInt(this.amountFurniInput?.text ?? '', 10);
    }

    // AS3: .../new_mod_tool_tabs/_SafeCls_2522.as::set amount()
    private set amount(value: number)
    {
        const input = this.amountFurniInput;

        if(input !== null) input.text = '' + value;
    }

    // AS3: .../new_mod_tool_tabs/_SafeCls_2522.as::get usernameInput()
    private get usernameInput(): ITextFieldWindow | null
    {
        return this.window?.findChildByName('give_furni_username_input') as unknown as ITextFieldWindow | null;
    }

    /** Declared in AS3 and never read — see the class note. */
    // AS3: .../new_mod_tool_tabs/_SafeCls_2522.as::get productNameInput()
    private get productNameInput(): ITextFieldWindow | null
    {
        return this.window?.findChildByName('product_name_input') as unknown as ITextFieldWindow | null;
    }

    // AS3: .../new_mod_tool_tabs/_SafeCls_2522.as::get amountFurniInput()
    private get amountFurniInput(): ITextFieldWindow | null
    {
        return this.window?.findChildByName('amount_furni_input') as unknown as ITextFieldWindow | null;
    }

    // AS3: .../new_mod_tool_tabs/_SafeCls_2522.as::get plusButton()
    private get plusButton(): IIconButtonWindow | null
    {
        return this.window?.findChildByName('plus_btn_furni') as unknown as IIconButtonWindow | null;
    }

    // AS3: .../new_mod_tool_tabs/_SafeCls_2522.as::get minusButton()
    private get minusButton(): IIconButtonWindow | null
    {
        return this.window?.findChildByName('minus_btn_furni') as unknown as IIconButtonWindow | null;
    }

    // AS3: .../new_mod_tool_tabs/_SafeCls_2522.as::get donateFurniButton()
    private get donateFurniButton(): IWindow | null
    {
        return this.window?.findChildByName('add_furni_btn') ?? null;
    }
}
