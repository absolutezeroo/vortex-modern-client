/**
 * Interface for reading parsed message data
 * Provides typed access to message contents
 */
export interface IMessageDataWrapper
{
    /**
	 * Number of bytes remaining to read
	 */
    readonly bytesAvailable: number;

    /**
	 * Get the message ID
	 */
    getMessageId(): number;

    /**
	 * Read a UTF-8 string (with length prefix)
	 */
    readString(): string;

    /**
	 * Read a 32-bit signed integer
	 */
    readInt(): number;

    /**
	 * Read a 64-bit integer (as JavaScript number)
	 */
    readLong(): number;

    /**
	 * Read a boolean (1 byte)
	 */
    readBoolean(): boolean;

    /**
	 * Read a 16-bit signed integer
	 */
    readShort(): number;

    /**
	 * Read a single byte
	 */
    readByte(): number;

    /**
	 * Read a 32-bit float
	 */
    readFloat(): number;

    /**
	 * Read a 64-bit double
	 */
    readDouble(): number;
}
