import type {ByteArray} from '@core/communication/util/ByteArray';
import type {IEncryption} from '@core/communication/encryption/IEncryption';

/**
 * ArcFour (RC4) stream cipher implementation
 * Used for encrypting/decrypting Habbo communication
 */
export class ArcFour implements IEncryption
{
    private i: number = 0;
    private j: number = 0;
    private sbox: Uint8Array = new Uint8Array(256);

    // Marked state for rollback
    private markedI: number = 0;
    private markedJ: number = 0;
    private markedSbox: Uint8Array = new Uint8Array(256);

    /**
	 * Initialize the cipher with a key (Key-Scheduling Algorithm)
	 */
    init(key: ByteArray): void
    {
        // Initialize S-box with identity permutation
        for(let i = 0; i < 256; i++)
        {
            this.sbox[i] = i;
        }

        // Key-scheduling algorithm (KSA)
        let j = 0;
        const keyLength = key.length;

        for(let i = 0; i < 256; i++)
        {
            j = (j + this.sbox[i] + key.getByte(i % keyLength)) & 0xFF;
            // Swap sbox[i] and sbox[j]
            const temp = this.sbox[i];
            this.sbox[i] = this.sbox[j];
            this.sbox[j] = temp;
        }

        this.i = 0;
        this.j = 0;
    }

    /**
	 * Encrypt data in-place
	 */
    encipher(data: ByteArray): void
    {
        const bytes = data.getUint8ArrayView();

        for(let k = 0; k < bytes.length; k++)
        {
            bytes[k] ^= this.next();
        }
    }

    /**
	 * Decrypt data in-place
	 * RC4 is symmetric - encryption and decryption are the same
	 */
    decipher(data: ByteArray): void
    {
        this.encipher(data);
    }

    /**
	 * Save current cipher state
	 */
    mark(): void
    {
        this.markedI = this.i;
        this.markedJ = this.j;
        this.markedSbox.set(this.sbox);
    }

    /**
	 * Restore to marked state
	 */
    reset(): void
    {
        this.i = this.markedI;
        this.j = this.markedJ;
        this.sbox.set(this.markedSbox);
    }

    /**
	 * Generate next keystream byte (PRGA)
	 */
    private next(): number
    {
        this.i = (this.i + 1) & 0xFF;
        this.j = (this.j + this.sbox[this.i]) & 0xFF;

        // Swap sbox[i] and sbox[j]
        const temp = this.sbox[this.i];
        this.sbox[this.i] = this.sbox[this.j];
        this.sbox[this.j] = temp;

        // Return keystream byte
        return this.sbox[(this.sbox[this.i] + this.sbox[this.j]) & 0xFF];
    }
}
