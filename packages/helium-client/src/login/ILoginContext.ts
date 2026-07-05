/**
 * ILoginContext
 *
 * @see sources/win63_2021_version/login/ILoginContext.as
 *
 * Interface for the login flow context, implemented by LoginFlow.
 * Views call these methods to trigger login actions and screen navigation.
 */
import type {AvatarData} from '@habbo/communication/login/AvatarData';
import type {IAvatarRenderManager} from '@habbo/avatar/IAvatarRenderManager';

export interface ILoginContext
{
    /**
	 * Initiate login with email and password credentials.
	 *
	 * @param email - User email
	 * @param password - User password
	 */
    initLogin(email: string, password: string): void;

    /**
	 * Initiate login with a direct SSO token.
	 *
	 * @param envId - Environment identifier (e.g., 'en', 'pt', 'de')
	 * @param token - SSO token (uuid1.uuid2 format)
	 */
    initLoginWithSsoToken(envId: string, token: string): void;

    /**
	 * Login with a selected avatar (for multi-avatar accounts).
	 *
	 * @param avatar - The selected avatar data
	 */
    loginWithAvatar(avatar: AvatarData): void;

    /**
	 * Switch to a different login screen.
	 *
	 * @param screen - Screen constant (1=Environment, 2=Login, 3=Avatars, 4=SsoToken)
	 */
    showScreen(screen: number): void;

    /**
	 * Update the current environment/hotel selection.
	 *
	 * @param envId - Environment identifier
	 * @param previewOnly - If true, only preview (reload localization); if false, commit the change
	 */
    updateEnvironment(envId: string, previewOnly: boolean): void;

    /**
	 * Get a configuration property value.
	 *
	 * @param key - Property key
	 * @returns The property value or null
	 */
    getProperty(key: string): string | null;

    /**
	 * AS3: registerAccount(email, password)
	 * Register a new account, then advance to avatar creation.
	 */
    registerAccount(email: string, password: string): void;

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
	 * AS3: get avatarRenderManager():IAvatarRenderManager
	 * The shared avatar render manager, used by the AvatarCreate screen to render
	 * live figure previews. Already bootstrapped by the time the login flow shows
	 * (Helium.bootstrap() runs before showLoginFlow() in HeliumApp.init()).
	 */
    readonly avatarRenderManager: IAvatarRenderManager | null;
}
