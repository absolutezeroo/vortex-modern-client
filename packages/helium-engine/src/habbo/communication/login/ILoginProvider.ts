/**
 * ILoginProvider
 *
 * @see sources/win63_2021_version/com/sulake/habbo/communication/login/ILoginProvider.as
 *
 * Interface for the login provider (WebApiLoginProvider).
 * Extends EventEmitter for SSO_TOKEN_AVAILABLE event dispatch.
 */
import type {IHabboCommunicationManager} from '../IHabboCommunicationManager';

export interface ILoginProvider
{
    /**
	 * AS3: init(communication)
	 * Initialize the provider with the communication manager.
	 */
    init(communication?: IHabboCommunicationManager | null): void;

    /**
	 * AS3: loginWithCredentials(email, password, captchaToken)
	 * Login with email and password.
	 */
    loginWithCredentials(email: string, password: string): void;

    /**
	 * AS3: loginWithCredentialsWeb(uniqueId)
	 * Select an avatar by unique ID after login.
	 */
    loginWithCredentialsWeb(uniqueId: string): void;

    /**
	 * AS3: selectAvatarUniqueid(uniqueId)
	 * Select an avatar by unique ID.
	 */
    selectAvatarUniqueid(uniqueId: string): void;

    /**
	 * AS3: register(email, password, day, month, year, termsOfServiceAccepted, captchaToken)
	 * Register a new account. Our port omits the birthdate/captcha fields not surfaced
	 * by the onboarding register step.
	 */
    register(email: string, password: string): void;

    /**
	 * AS3: createAvatar(name, figure, gender)
	 * Create the first avatar for a freshly registered account.
	 */
    createAvatar(name: string, figure: string, gender: string): void;

    /**
	 * AS3: checkName(name)
	 * Check whether an avatar name is available.
	 */
    checkName(name: string): void;

    /**
	 * Subscribe to events.
	 */
    on(event: string, fn: (...args: any[]) => void): this;

    /**
	 * Unsubscribe from events.
	 */
    off(event: string, fn: (...args: any[]) => void): this;

    /**
	 * Dispose the provider.
	 */
    dispose(): void;
}
