/**
 * Interface for key exchange algorithms (e.g., Diffie-Hellman)
 */
export interface IKeyExchange
{
    /**
	 * Initialize with private key
	 * @param privateKeyHex Private key as hex string
	 * @param radix Number base (default 16 for hex)
	 * @returns Success status
	 */
    init(privateKeyHex: string, radix?: number): boolean;

    /**
	 * Generate shared key from server's public key
	 * @param serverPublicKeyHex Server's public key as hex string
	 * @param radix Number base (default 16 for hex)
	 * @returns Shared key as hex string
	 */
    generateSharedKey(serverPublicKeyHex: string, radix?: number): string;

    /**
	 * Get the shared key
	 * @param radix Number base for output (default 16 for hex)
	 */
    getSharedKey(radix?: number): string;

    /**
	 * Get our public key to send to server
	 * @param radix Number base for output (default 16 for hex)
	 */
    getPublicKey(radix?: number): string;

    /**
	 * Validate server's public key
	 */
    isValidServerPublicKey(): boolean;

    /**
	 * Validate the computed shared key
	 */
    isValidSharedKey(): boolean;
}
