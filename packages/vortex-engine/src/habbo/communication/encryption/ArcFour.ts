import type {ByteArray} from '@core/communication/util/ByteArray';
import type {IEncryption} from '@core/communication/encryption/IEncryption';

/**
 * ArcFour (RC4) stream cipher implementation
 * Used for encrypting/decrypting Habbo communication
 */
export class ArcFour implements IEncryption
{
    private _i: number = 0;
    private _j: number = 0;
    private _sbox: Uint8Array = new Uint8Array(256);

    // Marked state for rollback
    private _markedI: number = 0;
    private _markedJ: number = 0;
    private _markedSbox: Uint8Array = new Uint8Array(256);

    /**
	 * Initialize the cipher with a key (Key-Scheduling Algorithm)
	 */
    init(key: ByteArray): void
    {
        // Initialize S-box with identity permutation
        for(let i = 0; i < 256; i++)
        {
            this._sbox[i] = i;
        }

        // Key-scheduling algorithm (KSA)
        let j = 0;
        const keyLength = key.length;

        for(let i = 0; i < 256; i++)
        {
            j = (j + this._sbox[i] + key.getByte(i % keyLength)) & 0xFF;
            // Swap sbox[i] and sbox[j]
            const temp = this._sbox[i];
            this._sbox[i] = this._sbox[j];
            this._sbox[j] = temp;
        }

        this._i = 0;
        this._j = 0;
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
        this._markedI = this._i;
        this._markedJ = this._j;
        this._markedSbox.set(this._sbox);
    }

    /**
	 * Restore to marked state
	 */
    reset(): void
    {
        this._i = this._markedI;
        this._j = this._markedJ;
        this._sbox.set(this._markedSbox);
    }

    /**
	 * Generate next keystream byte (PRGA)
	 */
    private next(): number
    {
        this._i = (this._i + 1) & 0xFF;
        this._j = (this._j + this._sbox[this._i]) & 0xFF;

        // Swap sbox[i] and sbox[j]
        const temp = this._sbox[this._i];
        this._sbox[this._i] = this._sbox[this._j];
        this._sbox[this._j] = temp;

        // Return keystream byte
        return this._sbox[(this._sbox[this._i] + this._sbox[this._j]) & 0xFF];
    }
}
