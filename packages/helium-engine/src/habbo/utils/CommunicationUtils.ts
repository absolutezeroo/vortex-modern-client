import type {IEncryptedLocalStorage} from './IEncryptedLocalStorage';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('CommunicationUtils');

/**
 * Communication and local storage utility.
 *
 * Provides static methods for persistent storage (using localStorage
 * as the web equivalent of Flash SharedObjects), XOR cipher operations,
 * fingerprint generation, and protocol manipulation.
 *
 * @see source_as_win63/habbo/utils/CommunicationUtils.as
 */
export class CommunicationUtils
{
	public static readonly SOL_PROPERTY_ENVIRONMENT: string = 'environment';
	public static readonly SOL_PROPERTY_LOGIN_NAME: string = 'login';
	public static readonly SOL_PROPERTY_CHARACTER_ID: string = 'userid';
	public static readonly SOL_PROPERTY_CHARACTER_UNIQUE_ID: string = 'useruniqueid';
	public static readonly SOL_PROPERTY_REMEMBER_LOGIN: string = 'autologin';
	public static readonly SOL_PROPERTY_LOGIN_METHOD: string = 'loginmethod';
	public static readonly SOL_PROPERTY_MACHINE_ID: string = 'machineid';
	public static readonly SOL_PROPERTY_APP_RATER_STATUS: string = 'ratingstatus';
	public static readonly SOL_PROPERTY_APP_RATER_TIMESTAMP: string = 'ratingstatustime';
	public static readonly LOGIN_METHOD_HABBO: string = 'habbo';
	public static readonly LOGIN_METHOD_FACEBOOK: string = 'facebook';

	private static readonly SOL_ID: string = 'fuselogin';
	private static readonly SOL_PROPERTY_PASSWORD: string = 'password';

	private static _forcedAutoLoginEnabled: boolean = false;

	/**
	 * Whether forced auto-login is enabled.
	 */
	static get forcedAutoLoginEnabled(): boolean
	{
		return CommunicationUtils._forcedAutoLoginEnabled;
	}

	static set forcedAutoLoginEnabled(value: boolean)
	{
		CommunicationUtils._forcedAutoLoginEnabled = value;
	}

	private static _encryptedLocalStorage: IEncryptedLocalStorage | null = null;

	/**
	 * Set the encrypted local storage implementation.
	 *
	 * @param storage The encrypted storage provider
	 */
	static set encryptedLocalStorage(storage: IEncryptedLocalStorage)
	{
		CommunicationUtils._encryptedLocalStorage = storage;
	}

	/**
	 * Write a value to persistent storage.
	 *
	 * @param key The storage key
	 * @param value The value to store (null to remove)
	 */
	static writeProperty(key: string, value: string | null): void
	{
		try
		{
			const storageKey = CommunicationUtils.SOL_ID + '.' + key;

			if (value === null)
			{
				localStorage.removeItem(storageKey);
			}
			else
			{
				localStorage.setItem(storageKey, value);
			}
		}
		catch (e)
		{
			log.error('Error writing property \'' + key + '\' with value \'' + value + '\'');
		}
	}

	/**
	 * Read a string value from persistent storage.
	 *
	 * @param key The storage key
	 * @param defaultValue The default value if not found
	 * @returns The stored value or the default value
	 */
	static readProperty(key: string, defaultValue: string | null = null): string | null
	{
		try
		{
			const storageKey = CommunicationUtils.SOL_ID + '.' + key;
			let value = localStorage.getItem(storageKey);

			if (value === null)
			{
				value = defaultValue;
			}

			if (key === 'environment' && value)
			{
				value = value.replace('hh', '');
				value = value.replace('br', 'pt');
				value = value.replace('us', 'en');
			}

			return value;
		}
		catch (e)
		{
			log.error('Error reading property \'' + key + '\'');
		}

		return defaultValue;
	}

	/**
	 * Read a boolean value from persistent storage.
	 *
	 * @param key The storage key
	 * @param defaultValue The default value if not found
	 * @returns The boolean value
	 */
	static readPropertyBoolean(key: string, defaultValue: string | null = null): boolean
	{
		const value = CommunicationUtils.readProperty(key, defaultValue);

		return value !== null && (value.toLowerCase() === 'true' || value === '1');
	}

	/**
	 * Read an integer value from persistent storage.
	 *
	 * @param key The storage key
	 * @param defaultValue The default value if not found
	 * @returns The integer value
	 */
	static readPropertyInt(key: string, defaultValue: string | null = null): number
	{
		const value = CommunicationUtils.readProperty(key, defaultValue);

		return parseInt(String(value)) || 0;
	}

	/**
	 * Check if a storage property exists.
	 *
	 * @param key The storage key
	 * @returns True if the property exists
	 */
	static propertyExists(key: string): boolean
	{
		try
		{
			const storageKey = CommunicationUtils.SOL_ID + '.' + key;

			return localStorage.getItem(storageKey) !== null;
		}
		catch (e)
		{
			return false;
		}
	}

	/**
	 * Clear all login-related stored data.
	 */
	static clearAllLoginData(): void
	{
		CommunicationUtils.writeProperty('loginmethod', null);
		CommunicationUtils.writeProperty('environment', null);
		CommunicationUtils.writeProperty('userid', null);
		CommunicationUtils.writeProperty('autologin', null);
		CommunicationUtils.writeProperty('password', null);
		CommunicationUtils.forcedAutoLoginEnabled = false;
	}

	/**
	 * Reset the stored password.
	 */
	static resetPassword(): void
	{
		if (CommunicationUtils._encryptedLocalStorage)
		{
			CommunicationUtils._encryptedLocalStorage.reset();
		}

		CommunicationUtils.writeProperty('password', '');
	}

	/**
	 * Store a password using encrypted storage if available, otherwise plain localStorage.
	 *
	 * @param password The password to store
	 */
	static storePassword(password: string | null): void
	{
		if (CommunicationUtils._encryptedLocalStorage)
		{
			if (password !== null && CommunicationUtils._encryptedLocalStorage.storeString('password', password))
			{
				CommunicationUtils.writeProperty('password', '');
			}
			else
			{
				CommunicationUtils.writeProperty('password', password);
			}
		}
		else
		{
			CommunicationUtils.writeProperty('password', password);
		}
	}

	/**
	 * Restore a stored password.
	 *
	 * @returns The restored password or null
	 */
	static restorePassword(): string | null
	{
		let value: string | null = null;

		if (CommunicationUtils._encryptedLocalStorage)
		{
			value = CommunicationUtils._encryptedLocalStorage.restoreString('password');
		}

		if (!value)
		{
			value = CommunicationUtils.readProperty('password', '');
		}

		return value;
	}

	/**
	 * Generate a random hexadecimal string.
	 *
	 * @param length The number of random bytes to generate (default 16)
	 * @returns The random hex string
	 */
	static generateRandomHexString(length: number = 16): string
	{
		let result = '';

		for (let i = 0; i < length; i++)
		{
			const byte = Math.floor(Math.random() * 255);
			result += byte.toString(16);
		}

		return result;
	}

	/**
	 * Remove the protocol (http:// or https://) from a URL.
	 *
	 * @param url The URL to process
	 * @returns The URL without the protocol prefix
	 */
	static removeProtocol(url: string): string
	{
		url = url.replace('http://', '');

		return url.replace('https://', '');
	}

	/**
	 * Perform a simple XOR cipher on a string.
	 *
	 * @param str The string to cipher
	 * @param key The cipher key
	 * @returns The XOR ciphered string
	 */
	static xor(str: string, key: string): string
	{
		let result = '';
		let keyIndex = 0;

		for (let i = 0; i < str.length; i++)
		{
			const charCode = str.charCodeAt(i);
			result += String.fromCharCode(charCode ^ key.charCodeAt(keyIndex));
			keyIndex++;

			if (keyIndex === key.length)
			{
				keyIndex = 0;
			}
		}

		return result;
	}

	/**
	 * Generate a browser fingerprint.
	 *
	 * In the original AS3, this used Flash capabilities, fonts, and plugins
	 * to generate an MD5 hash fingerprint. In the web version, we generate
	 * a simplified random hex string since browser fingerprinting APIs differ.
	 *
	 * @returns A fingerprint string
	 */
	static generateFingerprint(): string
	{
		return CommunicationUtils.generateRandomHexString(32);
	}
}
