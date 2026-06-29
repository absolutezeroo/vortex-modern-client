import {ByteArray} from '../util/ByteArray';

/**
 * Interface for encryption/decryption
 * Supports state preservation for handling incomplete messages
 */
export interface IEncryption
{
	/**
	 * Initialize the cipher with a key
	 */
	init(key: ByteArray): void;

	/**
	 * Encrypt data in-place
	 */
	encipher(data: ByteArray): void;

	/**
	 * Decrypt data in-place
	 */
	decipher(data: ByteArray): void;

	/**
	 * Mark/save current cipher state
	 * Used when reading incomplete messages
	 */
	mark(): void;

	/**
	 * Reset to marked state
	 * Used to restore state when message was incomplete
	 */
	reset(): void;
}
