/**
 * RSA encryption/decryption for Habbo handshake
 * Uses the standard Habbo public key with exponent 3
 */
export class RSA
{
    private static readonly DEFAULT_MODULUS = 'E228E8E9C40CFB0D2081B165376E921B844B5E581D88DBEA54CC038DA3CD9B00DC7281C172FCF3DF64D595EAA12BFF08BE7B346E95A920D05FC84B4E079C071BFFBF810D0BD0C994A302DD61200DDEFE28DC59BB3B803B243625FCEDC6665715ADCCF7CD94EA7A4B70AF8F0A7BD1097B50B306B871CBEAD90966CF1A1A4809C3';
    private static readonly DEFAULT_EXPONENT = '3';

    private readonly _modulus: bigint;
    private readonly _exponent: bigint;
    private readonly _blockSize: number;

    constructor(modulusHex?: string, exponentHex?: string)
    {
        this._modulus = BigInt('0x' + (modulusHex || RSA.DEFAULT_MODULUS));
        this._exponent = BigInt('0x' + (exponentHex || RSA.DEFAULT_EXPONENT));

        // Calculate block size (modulus byte length)
        this._blockSize = Math.ceil(this._modulus.toString(16).length / 2);
    }

    /**
	 * Encrypt data with the public key
	 * Used to encrypt our DH public key before sending to server
	 */
    encrypt(data: Uint8Array): Uint8Array
    {
        // Convert data to BigInt
        const dataInt = this.bytesToBigInt(data);

        // RSA encrypt: ciphertext = plaintext^e mod n
        const encrypted = this.modPow(dataInt, this._exponent, this._modulus);

        // Convert back to bytes with proper padding
        return this.bigIntToBytes(encrypted, this._blockSize);
    }

    /**
	 * Verify (decrypt with public key) signed data from server
	 * Used to decrypt the prime and generator received from server
	 */
    verify(signature: Uint8Array): Uint8Array
    {
        // Convert signature to BigInt
        const sigInt = this.bytesToBigInt(signature);

        // RSA verify: plaintext = signature^e mod n
        const decrypted = this.modPow(sigInt, this._exponent, this._modulus);

        // Convert back to bytes
        return this.bigIntToBytes(decrypted);
    }

    /**
	 * Decrypt a hex string and return the decrypted string value
	 * This matches the server's DecryptBigInteger behavior
	 */
    decryptString(hexString: string): string
    {
        const bytes = this.hexToBytes(hexString);
        const decrypted = this.verify(bytes);

        // Remove PKCS1 padding and convert to string
        return this.removePKCS1Padding(decrypted);
    }

    /**
	 * Encrypt a string and return as hex
	 * This matches the server's EncryptBigInteger behavior
	 */
    encryptString(value: string): string
    {
        const bytes = new TextEncoder().encode(value);
        const padded = this.addPKCS1Padding(bytes);
        const encrypted = this.encrypt(padded);

        return this.bytesToHex(encrypted);
    }

    /**
	 * Modular exponentiation: base^exp mod mod
	 */
    private modPow(base: bigint, exp: bigint, mod: bigint): bigint
    {
        let result = 1n;

        base = base % mod;

        while(exp > 0n)
        {
            if(exp % 2n === 1n)
            {
                result = (result * base) % mod;
            }

            exp = exp / 2n;

            base = (base * base) % mod;
        }

        return result;
    }

    /**
	 * Convert bytes to BigInt
	 */
    private bytesToBigInt(bytes: Uint8Array): bigint
    {
        let hex = '';

        for(const byte of bytes)
        {
            hex += byte.toString(16).padStart(2, '0');
        }

        return hex.length > 0 ? BigInt('0x' + hex) : 0n;
    }

    /**
	 * Convert BigInt to bytes with optional padding
	 */
    private bigIntToBytes(value: bigint, minLength?: number): Uint8Array
    {
        let hex = value.toString(16);

        if(hex.length % 2 !== 0)
        {
            hex = '0' + hex;
        }

        const bytes = new Uint8Array(hex.length / 2);

        for(let i = 0; i < bytes.length; i++)
        {
            bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
        }

        // Pad to minimum length if needed
        if(minLength && bytes.length < minLength)
        {
            const padded = new Uint8Array(minLength);

            padded.set(bytes, minLength - bytes.length);

            return padded;
        }

        return bytes;
    }

    /**
	 * Hex string to bytes
	 */
    private hexToBytes(hex: string): Uint8Array
    {
        if(hex.length % 2 !== 0)
        {
            hex = '0' + hex;
        }

        const bytes = new Uint8Array(hex.length / 2);

        for(let i = 0; i < bytes.length; i++)
        {
            bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
        }

        return bytes;
    }

    /**
	 * Bytes to hex string
	 */
    private bytesToHex(bytes: Uint8Array): string
    {
        let hex = '';

        for(const byte of bytes)
        {
            hex += byte.toString(16).padStart(2, '0');
        }

        return hex;
    }

    /**
	 * Remove PKCS1 v1.5 padding
	 */
    private removePKCS1Padding(data: Uint8Array): string
    {
        // PKCS1 format: 0x00 0x02 [random non-zero bytes] 0x00 [data]
        // Or for signing: 0x00 0x01 [0xFF bytes] 0x00 [data]

        let i = 0;

        // Skip leading zeros
        while(i < data.length && data[i] === 0)
        {
            i++;
        }

        // Check for type byte (0x01 for signing or 0x02 for encryption)
        if(i < data.length && (data[i] === 0x01 || data[i] === 0x02))
        {
            i++;

            // Skip padding bytes until 0x00
            while(i < data.length && data[i] !== 0)
            {
                i++;
            }

            // Skip the 0x00 separator
            if(i < data.length)
            {
                i++;
            }
        }

        // Return the remaining data as string
        const result = data.slice(i);

        return new TextDecoder().decode(result);
    }

    /**
	 * Add PKCS1 v1.5 padding for encryption
	 */
    private addPKCS1Padding(data: Uint8Array): Uint8Array
    {
        // PKCS1 format: 0x00 0x02 [random non-zero bytes] 0x00 [data]
        const paddingLength = this._blockSize - data.length - 3;

        if(paddingLength < 8)
        {
            throw new Error('Data too long for RSA encryption');
        }

        const padded = new Uint8Array(this._blockSize);

        padded[0] = 0x00;
        padded[1] = 0x02;

        // Fill with random non-zero bytes
        for(let i = 2; i < 2 + paddingLength; i++)
        {
            padded[i] = Math.floor(Math.random() * 255) + 1;
        }

        padded[2 + paddingLength] = 0x00;
        padded.set(data, 3 + paddingLength);

        return padded;
    }
}
