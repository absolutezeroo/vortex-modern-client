/**
 * ByteArray - Equivalent to Flash's ByteArray
 * Handles binary data reading/writing with big-endian byte order
 */
export class ByteArray
{
    private static readonly _encoder: TextEncoder = new TextEncoder();
    private static readonly _decoder: TextDecoder = new TextDecoder('utf-8');

    private buffer: ArrayBuffer;
    private view: DataView;

    constructor(buffer?: ArrayBuffer | number)
    {
        if(buffer instanceof ArrayBuffer)
        {
            this.buffer = buffer;
            this._length = buffer.byteLength;
        }
        else
        {
            const size = buffer ?? 1024;
            this.buffer = new ArrayBuffer(size);
            this._length = 0;
        }
        this.view = new DataView(this.buffer);
    }

    private _position: number = 0;

    /**
	 * Current position in the byte array
	 */
    get position(): number
    {
        return this._position;
    }

    set position(value: number)
    {
        this._position = Math.max(0, Math.min(value, this._length));
    }

    private _length: number = 0;

    /**
	 * Length of the data in the byte array
	 */
    get length(): number
    {
        return this._length;
    }

    set length(value: number)
    {
        if(value > this.buffer.byteLength)
        {
            this.expand(value);
        }
        this._length = value;
    }

    /**
	 * Number of bytes available to read from current position
	 */
    get bytesAvailable(): number
    {
        return this._length - this._position;
    }

    /**
	 * Create ByteArray from Uint8Array
	 */
    static fromUint8Array(array: Uint8Array): ByteArray
    {
        const byteArray = new ByteArray(array.length);
        const targetArray = new Uint8Array(byteArray.buffer);
        targetArray.set(array);
        byteArray._length = array.length;
        return byteArray;
    }

    /**
	 * Create ByteArray from ArrayBuffer
	 */
    static fromArrayBuffer(buffer: ArrayBuffer): ByteArray
    {
        const byteArray = new ByteArray(buffer);
        byteArray._length = buffer.byteLength;
        return byteArray;
    }

    /**
	 * Access byte at index
	 */
    getByte(index: number): number
    {
        if(index < 0 || index >= this._length)
        {
            throw new RangeError(`Index ${index} out of bounds`);
        }
        return this.view.getUint8(index);
    }

    /**
	 * Set byte at index
	 */
    setByte(index: number, value: number): void
    {
        if(index < 0)
        {
            throw new RangeError(`Index ${index} out of bounds`);
        }
        if(index >= this.buffer.byteLength)
        {
            this.expand(index + 1);
        }
        this.view.setUint8(index, value & 0xFF);
        if(index >= this._length)
        {
            this._length = index + 1;
        }
    }

    writeByte(value: number): void
    {
        this.ensureCapacity(1);
        this.view.setInt8(this._position, value);
        this._position += 1;
        if(this._position > this._length)
        {
            this._length = this._position;
        }
    }

    writeUnsignedByte(value: number): void
    {
        this.ensureCapacity(1);
        this.view.setUint8(this._position, value);
        this._position += 1;
        if(this._position > this._length)
        {
            this._length = this._position;
        }
    }

    writeShort(value: number): void
    {
        this.ensureCapacity(2);
        this.view.setInt16(this._position, value, false); // Big-endian
        this._position += 2;
        if(this._position > this._length)
        {
            this._length = this._position;
        }
    }

    writeUnsignedShort(value: number): void
    {
        this.ensureCapacity(2);
        this.view.setUint16(this._position, value, false);
        this._position += 2;
        if(this._position > this._length)
        {
            this._length = this._position;
        }
    }

    writeInt(value: number): void
    {
        this.ensureCapacity(4);
        this.view.setInt32(this._position, value, false);
        this._position += 4;
        if(this._position > this._length)
        {
            this._length = this._position;
        }
    }

    writeUnsignedInt(value: number): void
    {
        this.ensureCapacity(4);
        this.view.setUint32(this._position, value, false);
        this._position += 4;
        if(this._position > this._length)
        {
            this._length = this._position;
        }
    }

    writeFloat(value: number): void
    {
        this.ensureCapacity(4);
        this.view.setFloat32(this._position, value, false);
        this._position += 4;
        if(this._position > this._length)
        {
            this._length = this._position;
        }
    }

    writeDouble(value: number): void
    {
        this.ensureCapacity(8);
        this.view.setFloat64(this._position, value, false);
        this._position += 8;
        if(this._position > this._length)
        {
            this._length = this._position;
        }
    }

    writeBoolean(value: boolean): void
    {
        this.writeByte(value ? 1 : 0);
    }

    /**
	 * Write UTF-8 string with length prefix (2 bytes)
	 */
    writeUTF(value: string): void
    {
        const encoded = ByteArray._encoder.encode(value);
        this.writeUnsignedShort(encoded.length);
        this.ensureCapacity(encoded.length);
        new Uint8Array(this.buffer).set(encoded, this._position);
        this._position += encoded.length;
        if(this._position > this._length)
        {
            this._length = this._position;
        }
    }

    /**
	 * Write UTF-8 string without length prefix
	 */
    writeUTFBytes(value: string): void
    {
        const encoded = ByteArray._encoder.encode(value);
        this.ensureCapacity(encoded.length);
        new Uint8Array(this.buffer).set(encoded, this._position);
        this._position += encoded.length;
        if(this._position > this._length)
        {
            this._length = this._position;
        }
    }

    /**
	 * Write bytes from another ByteArray
	 */
    writeBytes(source: ByteArray, offset: number = 0, length: number = 0): void
    {
        if(length === 0)
        {
            length = source.length - offset;
        }

        this.ensureCapacity(length);

        const sourceArray = new Uint8Array(source.buffer, offset, length);
        const targetArray = new Uint8Array(this.buffer);
        targetArray.set(sourceArray, this._position);

        this._position += length;
        if(this._position > this._length)
        {
            this._length = this._position;
        }
    }

    readByte(): number
    {
        if(this.bytesAvailable < 1)
        {
            throw new RangeError('End of buffer');
        }
        const value = this.view.getInt8(this._position);
        this._position += 1;
        return value;
    }

    readUnsignedByte(): number
    {
        if(this.bytesAvailable < 1)
        {
            throw new RangeError('End of buffer');
        }
        const value = this.view.getUint8(this._position);
        this._position += 1;
        return value;
    }

    readShort(): number
    {
        if(this.bytesAvailable < 2)
        {
            throw new RangeError('End of buffer');
        }
        const value = this.view.getInt16(this._position, false);
        this._position += 2;
        return value;
    }

    readUnsignedShort(): number
    {
        if(this.bytesAvailable < 2)
        {
            throw new RangeError('End of buffer');
        }
        const value = this.view.getUint16(this._position, false);
        this._position += 2;
        return value;
    }

    readInt(): number
    {
        if(this.bytesAvailable < 4)
        {
            throw new RangeError('End of buffer');
        }
        const value = this.view.getInt32(this._position, false);
        this._position += 4;
        return value;
    }

    readUnsignedInt(): number
    {
        if(this.bytesAvailable < 4)
        {
            throw new RangeError('End of buffer');
        }
        const value = this.view.getUint32(this._position, false);
        this._position += 4;
        return value;
    }

    readFloat(): number
    {
        if(this.bytesAvailable < 4)
        {
            throw new RangeError('End of buffer');
        }
        const value = this.view.getFloat32(this._position, false);
        this._position += 4;
        return value;
    }

    readDouble(): number
    {
        if(this.bytesAvailable < 8)
        {
            throw new RangeError('End of buffer');
        }
        const value = this.view.getFloat64(this._position, false);
        this._position += 8;
        return value;
    }

    readBoolean(): boolean
    {
        return this.readByte() !== 0;
    }

    /**
	 * Read UTF-8 string with length prefix (2 bytes)
	 */
    readUTF(): string
    {
        const length = this.readUnsignedShort();
        return this.readUTFBytes(length);
    }

    /**
	 * Read UTF-8 string of specified length
	 */
    readUTFBytes(length: number): string
    {
        if(this.bytesAvailable < length)
        {
            throw new RangeError('End of buffer');
        }

        const bytes = new Uint8Array(this.buffer, this._position, length);
        const value = ByteArray._decoder.decode(bytes);
        this._position += length;
        return value;
    }

    /**
	 * Read bytes into target ByteArray
	 */
    readBytes(target: ByteArray, offset: number = 0, length: number = 0): void
    {
        if(length === 0)
        {
            length = this.bytesAvailable;
        }

        if(this.bytesAvailable < length)
        {
            throw new RangeError('End of buffer');
        }

        const sourceArray = new Uint8Array(this.buffer, this._position, length);

        if(offset + length > target.buffer.byteLength)
        {
            target.length = offset + length;
        }

        const targetArray = new Uint8Array(target.buffer);
        targetArray.set(sourceArray, offset);

        if(offset + length > target.length)
        {
            target.length = offset + length;
        }

        this._position += length;
    }

    /**
	 * Clear the byte array
	 */
    clear(): void
    {
        this._position = 0;
        this._length = 0;
    }

    /**
	 * Get a Uint8Array view of the data (no copy — modifications affect the underlying buffer)
	 */
    getUint8ArrayView(): Uint8Array
    {
        return new Uint8Array(this.buffer, 0, this._length);
    }

    /**
	 * Get a copy of the data as Uint8Array
	 */
    toUint8Array(): Uint8Array
    {
        return new Uint8Array(this.buffer.slice(0, this._length));
    }

    /**
	 * Get the underlying ArrayBuffer (trimmed to length)
	 */
    toArrayBuffer(): ArrayBuffer
    {
        return this.buffer.slice(0, this._length);
    }

    /**
	 * Clone this ByteArray
	 */
    clone(): ByteArray
    {
        const clone = new ByteArray(this._length);
        const sourceArray = new Uint8Array(this.buffer, 0, this._length);
        const targetArray = new Uint8Array(clone.buffer);
        targetArray.set(sourceArray);
        clone._length = this._length;
        clone._position = this._position;
        return clone;
    }

    /**
	 * Expand buffer capacity
	 */
    private expand(minCapacity: number): void
    {
        let newCapacity = this.buffer.byteLength;
        while(newCapacity < minCapacity)
        {
            newCapacity = Math.max(newCapacity * 2, 16);
        }

        const newBuffer = new ArrayBuffer(newCapacity);
        const newView = new Uint8Array(newBuffer);
        const oldView = new Uint8Array(this.buffer);
        newView.set(oldView.subarray(0, this._length));

        this.buffer = newBuffer;
        this.view = new DataView(this.buffer);
    }

    /**
	 * Ensure capacity for writing
	 */
    private ensureCapacity(additionalBytes: number): void
    {
        const required = this._position + additionalBytes;
        if(required > this.buffer.byteLength)
        {
            this.expand(required);
        }
    }
}
