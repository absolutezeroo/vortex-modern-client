import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {HabboPhoneNumber} from './HabboPhoneNumber';

/**
 * The verify dialog folded into a toolbar badge: click it to get the dialog back.
 *
 * Identical to `PhoneNumberCollectMinimizedView` bar its layout and which view it restores; AS3
 * keeps them as two classes.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/phonenumber/VerificationCodeInputMinimizedView.as
 */
export class VerificationCodeInputMinimizedView
{
    // AS3: .../phonenumber/VerificationCodeInputMinimizedView.as::BG_COLOR_LIGHT
    private static readonly BG_COLOR_LIGHT: number = 4286084205;

    // AS3: .../phonenumber/VerificationCodeInputMinimizedView.as::BG_COLOR_DARK
    private static readonly BG_COLOR_DARK: number = 4283781966;

    // AS3: .../phonenumber/VerificationCodeInputMinimizedView.as::_SafeStr_4617
    private _phoneNumber: HabboPhoneNumber | null;

    // AS3: .../phonenumber/VerificationCodeInputMinimizedView.as::_window
    private _window: IWindow | null = null;

    // AS3: .../phonenumber/VerificationCodeInputMinimizedView.as::VerificationCodeInputMinimizedView()
    constructor(phoneNumber: HabboPhoneNumber)
    {
        this._phoneNumber = phoneNumber;

        this.onClicked = this.onClicked.bind(this);
        this.onContainerMouseOver = this.onContainerMouseOver.bind(this);
        this.onContainerMouseOut = this.onContainerMouseOut.bind(this);

        this.createWindow();
    }

    // AS3: .../phonenumber/VerificationCodeInputMinimizedView.as::get window()
    get window(): IWindow | null
    {
        return this._window;
    }

    // AS3: .../phonenumber/VerificationCodeInputMinimizedView.as::createWindow()
    private createWindow(): void
    {
        if(this._window) return;

        this._window = this._phoneNumber?.windowManager
            ?.buildWidgetLayout('phonenumber_verify_minimized_xml') ?? null;

        if(!this._window) return;

        this._window.addEventListener(WindowMouseEvent.CLICK, this.onClicked);
        this._window.addEventListener(WindowMouseEvent.OVER, this.onContainerMouseOver);
        this._window.addEventListener(WindowMouseEvent.OUT, this.onContainerMouseOut);

        this.setBackgroundColor(VerificationCodeInputMinimizedView.BG_COLOR_DARK);
    }

    /**
     * TS-only: AS3 repeats `IRegionWindow(_window).findChildByTag("BGCOLOR").color = …` at three
     * call sites; the lookup is the same each time.
     */
    private setBackgroundColor(color: number): void
    {
        const background = (this._window as unknown as IWindowContainer | null)?.findChildByTag('BGCOLOR');

        if(background)
        {
            background.color = color;
        }
    }

    // AS3: .../phonenumber/VerificationCodeInputMinimizedView.as::onClicked()
    private onClicked(): void
    {
        this._phoneNumber?.setVerifyViewMinimized(false);
    }

    // AS3: .../phonenumber/VerificationCodeInputMinimizedView.as::onContainerMouseOver()
    private onContainerMouseOver(): void
    {
        this.setBackgroundColor(VerificationCodeInputMinimizedView.BG_COLOR_LIGHT);
    }

    // AS3: .../phonenumber/VerificationCodeInputMinimizedView.as::onContainerMouseOut()
    private onContainerMouseOut(): void
    {
        this.setBackgroundColor(VerificationCodeInputMinimizedView.BG_COLOR_DARK);
    }

    // AS3: .../phonenumber/VerificationCodeInputMinimizedView.as::dispose()
    dispose(): void
    {
        if(this._window)
        {
            this._window.removeEventListener(WindowMouseEvent.CLICK, this.onClicked);
            this._window.dispose();
            this._window = null;
        }

        this._phoneNumber = null;
    }
}
