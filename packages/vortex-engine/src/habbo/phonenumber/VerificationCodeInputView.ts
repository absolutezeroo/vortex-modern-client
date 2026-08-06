import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextFieldWindow} from '@core/window/components/ITextFieldWindow';
import type {ILabelWindow} from '@core/window/components/ILabelWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {HabboPhoneNumber} from './HabboPhoneNumber';

/**
 * The dialog that asks for the code texted to the player, with a countdown before the
 * "I did not get it" link becomes available again.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/phonenumber/VerificationCodeInputView.as
 */
export class VerificationCodeInputView
{
    // AS3: .../phonenumber/VerificationCodeInputView.as::INPUT_MAX_CHARS
    private static readonly INPUT_MAX_CHARS: number = 10;

    // AS3: .../phonenumber/VerificationCodeInputView.as::_SafeStr_4617
    private _phoneNumber: HabboPhoneNumber | null;

    // AS3: .../phonenumber/VerificationCodeInputView.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: .../phonenumber/VerificationCodeInputView.as::_inputTextNeedsClearing
    private _inputTextNeedsClearing: boolean = true;

    /**
     * AS3: .../phonenumber/VerificationCodeInputView.as::_SafeStr_5348
     *
     * AS3 uses a repeating `Timer(1000)`; the port holds a `setInterval` handle.
     */
    private _waitTimer: ReturnType<typeof setInterval> | null = null;

    // AS3: .../phonenumber/VerificationCodeInputView.as::VerificationCodeInputView()
    constructor(phoneNumber: HabboPhoneNumber)
    {
        this._phoneNumber = phoneNumber;

        this.onInputButtons = this.onInputButtons.bind(this);
        this.onWaitTimer = this.onWaitTimer.bind(this);

        this.createWindow();
    }

    /**
     * AS3: .../phonenumber/VerificationCodeInputView.as::handleSubmitFailure()
     *
     * Turns the code red and re-enables the field, so the player can correct it in place.
     */
    handleSubmitFailure(resultCode: number): void
    {
        this._phoneNumber?.windowManager?.alert(
            '${generic.alert.title}',
            '${phone.number.verify.error.' + resultCode + '}',
            0,
            null
        );

        const input = this._window?.findChildByName('verification_code_input');
        const textField = input as unknown as ITextFieldWindow | null;

        if(textField)
        {
            textField.textColor = 16711680;
        }

        input?.enable();

        this._inputTextNeedsClearing = true;
    }

    /**
     * AS3: .../phonenumber/VerificationCodeInputView.as::showRetry()
     *
     * Public in AS3, though only this class calls it.
     */
    showRetry(): void
    {
        const link = this._window?.findChildByName('did_not_receive_code_link');
        const label = this._window?.findChildByName('retry_wait_label');

        if(link) link.visible = true;
        if(label) label.visible = false;
    }

    /**
     * AS3: .../phonenumber/VerificationCodeInputView.as::showWaitForRetry()
     *
     * The parameter is declared and ignored in AS3 — the remaining time is read from the
     * component's `retryEnableTime` instead.
     */
    showWaitForRetry(_seconds: number = 0): void
    {
        const link = this._window?.findChildByName('did_not_receive_code_link');
        const label = this._window?.findChildByName('retry_wait_label');

        if(link) link.visible = false;
        if(label) label.visible = true;

        this.onWaitTimer();

        if(this._waitTimer !== null)
        {
            clearInterval(this._waitTimer);
        }

        this._waitTimer = setInterval(this.onWaitTimer, 1000);
    }

    // AS3: .../phonenumber/VerificationCodeInputView.as::createWindow()
    private createWindow(): void
    {
        if(this._window) return;

        this._window = this._phoneNumber?.windowManager
            ?.buildWidgetLayout('phonenumber_verify_xml') as IWindowContainer | null ?? null;

        if(!this._window) return;

        this._window.center();

        const waitLink = this._window.findChildByName('wait_link');

        if(waitLink)
        {
            waitLink.procedure = this.onInputButtons;
        }

        const okButton = this._window.findChildByName('ok_button');

        if(okButton)
        {
            okButton.procedure = this.onInputButtons;
        }

        const closeButton = this._window.findChildByName('header_button_close');

        if(closeButton)
        {
            closeButton.visible = false;
        }

        const input = this._window.findChildByName('verification_code_input');

        if(input)
        {
            input.procedure = this.onInputButtons;
        }

        const resendLink = this._window.findChildByName('did_not_receive_code_link');

        if(resendLink)
        {
            resendLink.procedure = this.onInputButtons;
        }

        okButton?.disable();
        input?.enable();

        if((this._phoneNumber?.retryEnableTime ?? 0) - HabboPhoneNumber.getTimer() <= 0)
        {
            this.showRetry();
        }
        else
        {
            this.showWaitForRetry();
        }

        const textField = input as unknown as ITextFieldWindow | null;

        if(textField)
        {
            textField.maxChars = VerificationCodeInputView.INPUT_MAX_CHARS;
        }

        this._inputTextNeedsClearing = true;
    }

    /**
     * AS3: .../phonenumber/VerificationCodeInputView.as::onInputButtons()
     *
     * One procedure for every control, on WME_CLICK — the collect dialog uses WME_DOWN for the
     * same job.
     */
    private onInputButtons(event: WindowEvent, window: IWindow): void
    {
        if(event.type !== WindowMouseEvent.CLICK)
        {
            return;
        }

        switch(window.name)
        {
            case 'header_button_close':
            case 'wait_link':
                this._phoneNumber?.setVerifyViewMinimized(true);
                break;
            case 'did_not_receive_code_link':
                this._phoneNumber?.requestPhoneNumberCollectionReset();
                break;
            case 'ok_button':
                this._phoneNumber?.sendTryVerificationCode(
                    this._window?.findChildByName('verification_code_input')?.caption ?? ''
                );
                this._window?.findChildByName('ok_button')?.disable();
                this._window?.findChildByName('verification_code_input')?.disable();
                break;
            case 'verification_code_input':
            {
                const input = this._window?.findChildByName('verification_code_input');

                if(this._inputTextNeedsClearing && input)
                {
                    input.caption = '';
                    this._inputTextNeedsClearing = false;
                }

                this._window?.findChildByName('ok_button')?.enable();

                const textField = input as unknown as ITextFieldWindow | null;

                if(textField)
                {
                    textField.textColor = 0;
                }
            }
        }
    }

    /**
     * AS3: .../phonenumber/VerificationCodeInputView.as::onWaitTimer()
     *
     * Substitutes the remaining seconds into `phone.number.verify.wait.remaining` and stops itself
     * once they reach zero, swapping the label back for the retry link.
     */
    private onWaitTimer(): void
    {
        const template = this._phoneNumber?.localizationManager
            ?.getLocalization('phone.number.verify.wait.remaining', '') ?? '';

        const remaining = Math.max(
            0,
            Math.trunc(((this._phoneNumber?.retryEnableTime ?? 0) - HabboPhoneNumber.getTimer()) / 1000)
        );

        const label = this._window?.findChildByName('retry_wait_label') as unknown as ILabelWindow | null;

        if(label)
        {
            label.text = template.replace('{0}', String(remaining));
        }

        if(remaining === 0)
        {
            if(this._waitTimer !== null)
            {
                clearInterval(this._waitTimer);
            }

            this._waitTimer = null;

            this.showRetry();
        }
    }

    // AS3: .../phonenumber/VerificationCodeInputView.as::dispose()
    dispose(): void
    {
        if(this._window)
        {
            this._window.dispose();
            this._window = null;
        }

        if(this._waitTimer !== null)
        {
            clearInterval(this._waitTimer);
            this._waitTimer = null;
        }

        this._phoneNumber = null;
    }
}
