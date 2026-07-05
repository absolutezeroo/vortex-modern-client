import type {IKeyExchange} from '@core/communication/handshake/IKeyExchange';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('Encryption');

/**
 * Simple BigInteger implementation for Diffie-Hellman
 * Uses native BigInt for calculations
 */
class BigIntWrapper
{
    private value: bigint;

    constructor(value: bigint | string | number = 0n)
    {
        if(typeof value === 'string')
        {
            this.value = BigInt(value);
        }
        else if(typeof value === 'number')
        {
            this.value = BigInt(value);
        }
        else
        {
            this.value = value;
        }
    }

    static fromRadix(str: string, radix: number = 16): BigIntWrapper
    {
        if(radix === 16)
        {
            return new BigIntWrapper(BigInt('0x' + str));
        }
        else if(radix === 10)
        {
            return new BigIntWrapper(BigInt(str));
        }
        else
        {
            // Manual conversion for other radixes
            let result = 0n;
            const base = BigInt(radix);

            for(const char of str)
            {
                const digit = parseInt(char, radix);

                result = result * base + BigInt(digit);
            }

            return new BigIntWrapper(result);
        }
    }

    toRadix(radix: number = 16): string
    {
        if(radix === 16)
        {
            return this.value.toString(16);
        }
        else if(radix === 10)
        {
            return this.value.toString(10);
        }
        else
        {
            // Manual conversion for other radixes
            if(this.value === 0n) return '0';

            const base = BigInt(radix);
            const digits: string[] = [];

            let remaining = this.value;

            while(remaining > 0n)
            {
                const digit = Number(remaining % base);

                digits.unshift(digit.toString(radix));

                remaining = remaining / base;
            }

            return digits.join('');
        }
    }

    /**
	 * Modular exponentiation: base^exp mod mod
	 */
    modPow(exponent: BigIntWrapper, modulus: BigIntWrapper): BigIntWrapper
    {
        let result = 1n;
        let base = this.value % modulus.value;
        let exp = exponent.value;

        while(exp > 0n)
        {
            if(exp % 2n === 1n)
            {
                result = (result * base) % modulus.value;
            }

            exp = exp / 2n;
            base = (base * base) % modulus.value;
        }

        return new BigIntWrapper(result);
    }

    compareTo(other: BigIntWrapper): number
    {
        if(this.value < other.value) return -1;

        if(this.value > other.value) return 1;

        return 0;
    }

    getValue(): bigint
    {
        return this.value;
    }
}

/**
 * Diffie-Hellman key exchange implementation
 */
export class DiffieHellman implements IKeyExchange
{
    private prime: BigIntWrapper;
    private generator: BigIntWrapper;
    private privateKey: BigIntWrapper | null = null;
    private publicKey: BigIntWrapper | null = null;
    private serverPublicKey: BigIntWrapper | null = null;
    private sharedKey: BigIntWrapper | null = null;

    private readonly minimumPublicKey = new BigIntWrapper(2n);
    private readonly minimumSharedKey = new BigIntWrapper(2n);

    /**
	 * Create a new Diffie-Hellman key exchange
	 * @param primeHex Prime number (p) as hex string
	 * @param generatorHex Generator (g) as hex string
	 */
    constructor(primeHex: string, generatorHex: string)
    {
        this.prime = BigIntWrapper.fromRadix(primeHex, 16);
        this.generator = BigIntWrapper.fromRadix(generatorHex, 16);
    }

    /**
	 * Initialize with our private key
	 */
    init(privateKeyHex: string, radix: number = 16): boolean
    {
        try
        {
            this.privateKey = BigIntWrapper.fromRadix(privateKeyHex, radix);

            // Calculate public key: g^privateKey mod p
            this.publicKey = this.generator.modPow(this.privateKey, this.prime);

            return true;
        }
        catch (error)
        {
            log.error('DiffieHellman init error:', error);

            return false;
        }
    }

    /**
	 * Generate shared key from server's public key
	 */
    generateSharedKey(serverPublicKeyHex: string, radix: number = 16): string
    {
        if(!this.privateKey)
        {
            throw new Error('DiffieHellman not initialized');
        }

        this.serverPublicKey = BigIntWrapper.fromRadix(serverPublicKeyHex, radix);

        // Calculate shared key: serverPublicKey^privateKey mod p
        this.sharedKey = this.serverPublicKey.modPow(this.privateKey, this.prime);

        return this.getSharedKey(radix);
    }

    /**
	 * Get our public key
	 */
    getPublicKey(radix: number = 16): string
    {
        if(!this.publicKey)
        {
            throw new Error('DiffieHellman not initialized');
        }

        return this.publicKey.toRadix(radix);
    }

    /**
	 * Get the shared key
	 */
    getSharedKey(radix: number = 16): string
    {
        if(!this.sharedKey)
        {
            throw new Error('Shared key not generated');
        }
        return this.sharedKey.toRadix(radix);
    }

    /**
	 * Validate server's public key (should be >= 2)
	 */
    isValidServerPublicKey(): boolean
    {
        if(!this.serverPublicKey) return false;
        return this.serverPublicKey.compareTo(this.minimumPublicKey) >= 0;
    }

    /**
	 * Validate the shared key (should be >= 2)
	 */
    isValidSharedKey(): boolean
    {
        if(!this.sharedKey) return false;
        return this.sharedKey.compareTo(this.minimumSharedKey) >= 0;
    }
}
