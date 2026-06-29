/**
 * ILoginViewer
 *
 * @see sources/win63_2021_version/com/sulake/habbo/communication/login/ILoginViewer.as
 *
 * Callback interface for WebApiLoginProvider → LoginFlow communication.
 * The login viewer (LoginFlow) implements this interface so the provider
 * can call back with results from the Web API.
 */
import type {AvatarData} from './AvatarData';

export interface ILoginViewer
{
	/**
	 * AS3: getProperty(key, dict)
	 * Retrieve a configuration property.
	 */
	getProperty(key: string): string | null;

	/**
	 * AS3: environmentReady()
	 * Called when /api/public/info/hello succeeds — environment is ready.
	 */
	environmentReady(): void;

	/**
	 * AS3: populateCharacterList(avatars)
	 * Called when the avatar list is received and multiple avatars need selection.
	 */
	populateCharacterList(avatars: AvatarData[]): void;

	/**
	 * AS3: showErrorMessage(msg) — combined from showRegistrationError, showInvalidLoginError, etc.
	 * Displays an error message to the user.
	 */
	showErrorMessage(message: string): void;

	/**
	 * AS3: showScreen(screen)
	 * Switch to a login screen.
	 */
	showScreen(screen: number): void;
}
