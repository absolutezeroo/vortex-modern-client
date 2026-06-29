/**
 * ILoginContext
 *
 * @see sources/win63_2021_version/login/ILoginContext.as
 *
 * Interface for the login flow context, implemented by LoginFlow.
 * Views call these methods to trigger login actions and screen navigation.
 */
import type {AvatarData} from '@habbo/communication/login/AvatarData';

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
}
