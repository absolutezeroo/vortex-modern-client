import {Component, ComponentDependency, type IContext} from '@core/runtime';
import type {IConnection} from '@core/communication/connection/IConnection';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {ISessionDataManager} from '@habbo/session/ISessionDataManager';
import type {IHabboToolbar} from '@habbo/toolbar/IHabboToolbar';
import {
    PhoneCollectionStateMessageEvent
} from '@habbo/communication/messages/incoming/gifts/PhoneCollectionStateMessageEvent';
import {
    TryPhoneNumberResultMessageEvent
} from '@habbo/communication/messages/incoming/gifts/TryPhoneNumberResultMessageEvent';
import {
    TryVerificationCodeResultMessageEvent
} from '@habbo/communication/messages/incoming/gifts/TryVerificationCodeResultMessageEvent';
import {
    TryPhoneNumberMessageComposer
} from '@habbo/communication/messages/outgoing/preferences/TryPhoneNumberMessageComposer';
import {
    VerifyCodeMessageComposer
} from '@habbo/communication/messages/outgoing/preferences/VerifyCodeMessageComposer';
import {
    SetPhoneNumberVerificationStatusMessageComposer
} from '@habbo/communication/messages/outgoing/preferences/SetPhoneNumberVerificationStatusMessageComposer';
import {
    ResetPhoneNumberStateMessageComposer
} from '@habbo/communication/messages/outgoing/preferences/ResetPhoneNumberStateMessageComposer';
import {IID_HabboCommunicationManager} from '@iid/IIDHabboCommunicationManager';
import {IID_HabboWindowManager} from '@iid/IIDHabboWindowManager';
import {IID_HabboLocalizationManager} from '@iid/IIDHabboLocalizationManager';
import {IID_SessionDataManager} from '@iid/IIDSessionDataManager';
import {IID_HabboToolbar} from '@iid/IIDHabboToolbar';
import {Logger} from '@core/utils/Logger';
import {PhoneNumberCollectView} from './PhoneNumberCollectView';
import {PhoneNumberCollectMinimizedView} from './PhoneNumberCollectMinimizedView';
import {VerificationCodeInputView} from './VerificationCodeInputView';
import {VerificationCodeInputMinimizedView} from './VerificationCodeInputMinimizedView';

const log = Logger.getLogger('habbo.phonenumber.HabboPhoneNumber');

/**
 * SMS identity verification: collect a phone number, then the code texted to it.
 *
 * Each of the two steps has a full dialog and a minimized badge that lives in the toolbar's
 * extension strip, and the component owns all four — `setCollectViewMinimized()` /
 * `setVerifyViewMinimized()` swap between them.
 *
 * The whole feature is gated on `sms.identity.verification.enabled`: with it off, `initComponent`
 * subscribes to nothing, so no state message ever reaches the views.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/phonenumber/HabboPhoneNumber.as
 */
export class HabboPhoneNumber extends Component
{
    // AS3: .../phonenumber/HabboPhoneNumber.as::_communicationManager
    protected _communicationManager: IHabboCommunicationManager | null = null;

    // AS3: .../phonenumber/HabboPhoneNumber.as::_localizationManager
    protected _localizationManager: IHabboLocalizationManager | null = null;

    // AS3: .../phonenumber/HabboPhoneNumber.as::_sessionDataManager
    protected _sessionDataManager: ISessionDataManager | null = null;

    // AS3: .../phonenumber/HabboPhoneNumber.as::_toolbar
    protected _toolbar: IHabboToolbar | null = null;

    // AS3: .../phonenumber/HabboPhoneNumber.as::_windowManager
    protected _windowManager: IHabboWindowManager | null = null;

    // AS3: .../phonenumber/HabboPhoneNumber.as::_SafeStr_4568
    private _connection: IConnection | null = null;

    // AS3: .../phonenumber/HabboPhoneNumber.as::_SafeStr_6192
    private _collectView: PhoneNumberCollectView | null = null;

    // AS3: .../phonenumber/HabboPhoneNumber.as::_SafeStr_5955
    private _collectMinimizedView: PhoneNumberCollectMinimizedView | null = null;

    // AS3: .../phonenumber/HabboPhoneNumber.as::_SafeStr_6325
    private _verifyView: VerificationCodeInputView | null = null;

    // AS3: .../phonenumber/HabboPhoneNumber.as::_SafeStr_6089
    private _verifyMinimizedView: VerificationCodeInputMinimizedView | null = null;

    // AS3: .../phonenumber/HabboPhoneNumber.as::_retryEnableTime
    private _retryEnableTime: number = 0;

    // AS3: .../phonenumber/HabboPhoneNumber.as::HabboPhoneNumber()
    constructor(context: IContext)
    {
        super(context);
    }

    /**
     * AS3: flash.utils.getTimer() — TS-only helper, no `HabboPhoneNumber.as` member of this name.
     * Same shape as `HabboCatalog`'s own `getTimer()`.
     */
    public static getTimer(): number
    {
        if(typeof performance !== 'undefined')
        {
            return Math.floor(performance.now());
        }

        return Date.now();
    }

    // AS3: .../phonenumber/HabboPhoneNumber.as::get windowManager()
    get windowManager(): IHabboWindowManager | null
    {
        return this._windowManager;
    }

    // AS3: .../phonenumber/HabboPhoneNumber.as::get localizationManager()
    get localizationManager(): IHabboLocalizationManager | null
    {
        return this._localizationManager;
    }

    // AS3: .../phonenumber/HabboPhoneNumber.as::get retryEnableTime()
    get retryEnableTime(): number
    {
        return this._retryEnableTime;
    }

    // AS3: .../phonenumber/HabboPhoneNumber.as::get dependencies()
    protected override get dependencies(): Array<ComponentDependency<any>>
    {
        return [
            new ComponentDependency(
                IID_HabboCommunicationManager,
                (manager: IHabboCommunicationManager | null) => { this._communicationManager = manager; },
                true
            ),
            new ComponentDependency(
                IID_SessionDataManager,
                (manager: ISessionDataManager | null) => { this._sessionDataManager = manager; }
            ),
            new ComponentDependency(
                IID_HabboWindowManager,
                (manager: IHabboWindowManager | null) => { this._windowManager = manager; }
            ),
            new ComponentDependency(
                IID_HabboLocalizationManager,
                (manager: IHabboLocalizationManager | null) => { this._localizationManager = manager; }
            ),
            new ComponentDependency(
                IID_HabboToolbar,
                (toolbar: IHabboToolbar | null) => { this._toolbar = toolbar; }
            )
        ];
    }

    // AS3: .../phonenumber/HabboPhoneNumber.as::sendTryPhoneNumber()
    sendTryPhoneNumber(countryCode: string, phoneNumber: string): void
    {
        this._connection?.send(new TryPhoneNumberMessageComposer(countryCode, phoneNumber));
    }

    /**
     * AS3: .../phonenumber/HabboPhoneNumber.as::sendTryVerificationCode()
     *
     * Codes are upper-cased before sending; empty input is dropped without a message.
     */
    sendTryVerificationCode(verificationCode: string): void
    {
        if(!verificationCode)
        {
            return;
        }

        this._connection?.send(new VerifyCodeMessageComposer(verificationCode.toUpperCase()));
    }

    // AS3: .../phonenumber/HabboPhoneNumber.as::setNeverAgain()
    setNeverAgain(): void
    {
        this._connection?.send(new SetPhoneNumberVerificationStatusMessageComposer(2));
        this.destroyCollectView();
    }

    // AS3: .../phonenumber/HabboPhoneNumber.as::setCollectViewMinimized()
    setCollectViewMinimized(minimized: boolean): void
    {
        if(minimized)
        {
            this.destroyCollectView();
            this.createCollectMinimizedView();
        }
        else
        {
            this.destroyCollectMinimizedView();
            this.createCollectView();
        }
    }

    // AS3: .../phonenumber/HabboPhoneNumber.as::setVerifyViewMinimized()
    setVerifyViewMinimized(minimized: boolean): void
    {
        if(minimized)
        {
            this.destroyVerifyView();
            this.createVerifyMinimizedView();
        }
        else
        {
            this.destroyVerifyMinimizedView();
            this.createVerifyView();
        }
    }

    /**
     * AS3: .../phonenumber/HabboPhoneNumber.as::requestPhoneNumberCollectionReset()
     *
     * The "I did not get the code" path: drops the verify dialog and asks the server to start over.
     */
    requestPhoneNumberCollectionReset(): void
    {
        this.destroyVerifyView();
        this._connection?.send(new ResetPhoneNumberStateMessageComposer());
    }

    /**
     * AS3: .../phonenumber/HabboPhoneNumber.as::initComponent()
     *
     * Nothing is subscribed when the feature is disabled — the connection field stays null too, so
     * every send below is a no-op in that state.
     */
    protected override initComponent(): void
    {
        if(this.getBoolean('sms.identity.verification.enabled'))
        {
            this._connection = this._communicationManager?.connection ?? null;

            this._connection?.addMessageEvent(
                new PhoneCollectionStateMessageEvent(this.onStateMessage.bind(this))
            );
            this._connection?.addMessageEvent(
                new TryPhoneNumberResultMessageEvent(this.onPhoneNumberResultMessage.bind(this))
            );
            this._connection?.addMessageEvent(
                new TryVerificationCodeResultMessageEvent(this.onVerificationCodeResultMessage.bind(this))
            );

            log.debug('Phone number verification initialized');
        }
    }

    /**
     * AS3: .../phonenumber/HabboPhoneNumber.as::onPhoneNumberResultMessage()
     *
     * AS3 switches on `resultCode - 1`; the equivalent `PhoneNumberStatusEnum` values are spelled
     * out here. The error branch has no `break`, but it is the last one, so nothing falls through.
     */
    private onPhoneNumberResultMessage(event: IMessageEvent): void
    {
        const parser = (event as TryPhoneNumberResultMessageEvent).tryPhoneNumberResultParser;

        if(!parser) return;

        switch(parser.resultCode)
        {
            // TOKEN_SENT / OK / NON_VERIFIED — the number was accepted, ask for the code.
            case 1:
            case 3:
            case 9:
                this.destroyCollectView();
                this._retryEnableTime = parser.millisToAllowProcessReset + HabboPhoneNumber.getTimer();
                this.createVerifyView();
                break;
            // VERIFIED — nothing left to do.
            case 2:
                this.destroyCollectView();
                break;
            // ERROR / RATE_LIMIT / NUMBER_MISTYPED / NUMBER_ALREADY_VERIFIED — show the dialog
            // again (un-minimizing it if needed) and report the failure into it.
            case 4:
            case 5:
            case 6:
            case 10:
                if(!this._collectMinimizedView && !this._collectView)
                {
                    this.createCollectView();
                }
                else if(this._collectMinimizedView)
                {
                    this.setCollectViewMinimized(false);
                }

                this._windowManager?.alert(
                    '${generic.alert.title}',
                    '${phone.number.collect.error.' + parser.resultCode + '}',
                    0,
                    null
                );
                this._collectView?.handleSubmitFailure(parser.resultCode);
        }
    }

    /**
     * AS3: .../phonenumber/HabboPhoneNumber.as::onVerificationCodeResultMessage()
     *
     * AS3 switches on `resultCode - 2`.
     */
    private onVerificationCodeResultMessage(event: IMessageEvent): void
    {
        const parser = (event as TryVerificationCodeResultMessageEvent).tryVerificationCodeResultParser;

        if(!parser) return;

        switch(parser.resultCode)
        {
            // VERIFIED / OK — done.
            case 2:
            case 3:
                this.destroyVerifyView();
                break;
            // ERROR — the code was wrong; put the dialog back and report it.
            case 4:
                if(!this._verifyMinimizedView && !this._verifyView)
                {
                    this._retryEnableTime = HabboPhoneNumber.getTimer() + parser.millisecondsToAllowProcessReset;
                    this.createVerifyView();
                }
                else if(this._verifyMinimizedView)
                {
                    this.setVerifyViewMinimized(false);
                }

                this._verifyView?.handleSubmitFailure(parser.resultCode);
        }
    }

    /**
     * AS3: .../phonenumber/HabboPhoneNumber.as::onStateMessage()
     *
     * Mirrors both codes into configuration before deciding anything, so the rest of the client
     * can read `phone.collection.status` / `phone.verification.status` without listening here.
     */
    private onStateMessage(event: IMessageEvent): void
    {
        const parser = (event as PhoneCollectionStateMessageEvent).phoneCollectionStateParser;

        if(!parser) return;

        const collectionStatusCode = parser.collectionStatusCode;
        const phoneStatusCode = parser.phoneStatusCode;

        this.context.configuration?.setProperty('phone.collection.status', collectionStatusCode.toString());
        this.context.configuration?.setProperty('phone.verification.status', phoneStatusCode.toString());

        // NEVER_AGAIN — the player has opted out for good.
        if(collectionStatusCode === 2)
        {
            return;
        }

        // TOKEN_INPUT, and the server is waiting on a code (NON_VERIFIED or TOKEN_SENT).
        if(collectionStatusCode === 3 && (phoneStatusCode === 9 || phoneStatusCode === 1))
        {
            this.destroyCollectView();

            // Dead branch, ported as written: `collectionStatusCode` is 3 inside this `if`, so it
            // can never be 1 here. AS3 does the same test.
            if(collectionStatusCode as number === 1)
            {
                this.createVerifyMinimizedView();
            }
            else
            {
                this._retryEnableTime = parser.millisecondsToAllowProcessReset + HabboPhoneNumber.getTimer();
                this.createVerifyView();
            }

            return;
        }

        switch(phoneStatusCode)
        {
            // NON_EXISTING / NON_VERIFIED — ask for a number.
            case 0:
            case 9:
                this.createCollectView();
                break;
            // VERIFIED / OK — nothing to show.
            case 2:
            case 3:
                this.destroyCollectView();
                this.destroyVerifyView();
                break;
            // ERROR / RATE_LIMIT / NUMBER_MISTYPED — these belong to the two result messages.
            case 4:
            case 5:
            case 6:
                log.warn('INVALID STATE!! Phone number / verify errors should not be handled here!');
        }
    }

    /**
     * AS3: .../phonenumber/HabboPhoneNumber.as::createCollectView()
     *
     * The preferred countries come from configuration as a comma-separated list and are floated to
     * the top of the country menu by the view.
     */
    private createCollectView(): void
    {
        this.destroyCollectView();

        const preferred = this.context.configuration?.getProperty('phone.number.preferred.countries') ?? '';

        this._collectView = new PhoneNumberCollectView(this, preferred.split(','));
    }

    // AS3: .../phonenumber/HabboPhoneNumber.as::createVerifyView()
    private createVerifyView(): void
    {
        this.destroyVerifyView();

        this._verifyView = new VerificationCodeInputView(this);
    }

    // AS3: .../phonenumber/HabboPhoneNumber.as::createCollectMinimizedView()
    private createCollectMinimizedView(): void
    {
        this.destroyCollectMinimizedView();

        this._collectMinimizedView = new PhoneNumberCollectMinimizedView(this);

        this._toolbar?.extensionView?.attachExtension('phone_number', this._collectMinimizedView.window, 12);
    }

    // AS3: .../phonenumber/HabboPhoneNumber.as::createVerifyMinimizedView()
    private createVerifyMinimizedView(): void
    {
        this.destroyVerifyMinimizedView();

        this._verifyMinimizedView = new VerificationCodeInputMinimizedView(this);

        this._toolbar?.extensionView?.attachExtension('verification_code', this._verifyMinimizedView.window, 12);
    }

    // AS3: .../phonenumber/HabboPhoneNumber.as::destroyCollectView()
    private destroyCollectView(): void
    {
        if(this._collectView)
        {
            this._collectView.dispose();
            this._collectView = null;
        }
    }

    // AS3: .../phonenumber/HabboPhoneNumber.as::destroyVerifyView()
    private destroyVerifyView(): void
    {
        if(this._verifyView)
        {
            this._verifyView.dispose();
            this._verifyView = null;
        }
    }

    /**
     * AS3: .../phonenumber/HabboPhoneNumber.as::destroyCollectMinimizedView()
     *
     * Detaches unconditionally, before the null check — AS3 does too, so a stale extension is
     * cleared even when the view is already gone.
     */
    private destroyCollectMinimizedView(): void
    {
        this._toolbar?.extensionView?.detachExtension('phone_number');

        if(this._collectMinimizedView)
        {
            this._collectMinimizedView.dispose();
            this._collectMinimizedView = null;
        }
    }

    // AS3: .../phonenumber/HabboPhoneNumber.as::destroyVerifyMinimizedView()
    private destroyVerifyMinimizedView(): void
    {
        this._toolbar?.extensionView?.detachExtension('verification_code');

        if(this._verifyMinimizedView)
        {
            this._verifyMinimizedView.dispose();
            this._verifyMinimizedView = null;
        }
    }

    /**
     * TS-only: `HabboPhoneNumber.as` declares no `dispose()` override, so the four views would
     * outlive the component. Tearing them down here mirrors what `HabboNuxDialogs.dispose()` does
     * with its own.
     */
    override dispose(): void
    {
        if(this._disposed) return;

        this.destroyCollectView();
        this.destroyCollectMinimizedView();
        this.destroyVerifyView();
        this.destroyVerifyMinimizedView();

        super.dispose();
    }
}
