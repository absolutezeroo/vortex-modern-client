import {ByteArray} from '../util/ByteArray';
import {Byte} from '../util/Byte';
import {Short} from '../util/Short';
import {Long} from '../util/Long';
import {MessageDataWrapper} from '../messages/MessageDataWrapper';
import type {IMessageDataWrapper} from '../messages/IMessageDataWrapper';
import type {IWireFormatter} from './IWireFormatter';
import type {IConnection} from '../connection/IConnection';

/**
 * Wire format encoder/decoder implementation
 * Handles the binary protocol for Habbo communication
 */
export class WireFormatter implements IWireFormatter
{
	/** Maximum message data size (256KB) */
	private static readonly MAX_DATA_SIZE = 262144;

	private _disposed: boolean = false;

	get disposed(): boolean
	{
		return this._disposed;
	}

	/**
	 * Encode a message for sending
	 * Format: [4 bytes length][2 bytes messageId][...data]
	 */
	encode(messageId: number, messageArray: unknown[]): ByteArray
	{
		const message = new ByteArray();

		// Write placeholder for length (will be updated at the end)
		message.writeInt(0);

		// Write message ID
		message.writeShort(messageId);

		// Write each parameter based on type
		for (const param of messageArray)
		{
			this.writeValue(message, param);
		}

		// Update message length (excluding the 4-byte length field itself)
		const totalLength = message.length;
		message.position = 0;
		message.writeInt(totalLength - 4);
		message.position = totalLength;

		return message;
	}

	/**
	 * Split received data into individual messages
	 */
	splitMessages(buffer: ByteArray, connection: IConnection): IMessageDataWrapper[]
	{
		const messages: IMessageDataWrapper[] = [];
		const encryption = connection.getServerToClientEncryption();

		while (buffer.bytesAvailable >= 6)
		{
			const startPosition = buffer.position;

			// Read message length
			let length: number;

			if (encryption)
			{
				encryption.mark();

				// Read and decrypt length
				const lengthBytes = new ByteArray(4);
				buffer.readBytes(lengthBytes, 0, 4);
				lengthBytes.position = 0;
				encryption.decipher(lengthBytes);
				lengthBytes.position = 0;
				length = lengthBytes.readInt();
			}
			else
			{
				length = buffer.readInt();
			}

			// Validate length
			if (length < 2 || length > WireFormatter.MAX_DATA_SIZE)
			{
				throw new Error(`Invalid message length: ${length}`);
			}

			// Check if we have enough data
			if (buffer.bytesAvailable < length)
			{
				// Not enough data - restore state and wait
				buffer.position = startPosition;
				if (encryption)
				{
					encryption.reset();
				}
				break;
			}

			// Read message data
			let messageData: ByteArray;

			if (encryption)
			{
				// Read and decrypt data
				const encrypted = new ByteArray(length);
				buffer.readBytes(encrypted, 0, length);
				encrypted.position = 0;
				encryption.decipher(encrypted);

				messageData = new ByteArray(length);
				encrypted.position = 0;
				messageData.writeBytes(encrypted, 0, length);
				messageData.position = 0;
			}
			else
			{
				messageData = new ByteArray(length);
				buffer.readBytes(messageData, 0, length);
				messageData.position = 0;
			}

			// Read message ID (first 2 bytes of message data)
			const messageId = messageData.readShort();

			// Create wrapper with remaining data
			messages.push(new MessageDataWrapper(messageId, messageData));
		}

		// Compact buffer - remove processed data
		if (buffer.position > 0 && buffer.bytesAvailable > 0)
		{
			const src = buffer.getUint8ArrayView();
			const pos = buffer.position;
			const remaining = buffer.bytesAvailable;
			src.copyWithin(0, pos, pos + remaining);
			buffer.length = remaining;
			buffer.position = 0;
		}
		else if (buffer.position > 0)
		{
			buffer.clear();
		}

		return messages;
	}

	dispose(): void
	{
		if (this._disposed)
		{
			return;
		}
		this._disposed = true;
	}

	/**
	 * Write a value to the message based on its type
	 */
	private writeValue(message: ByteArray, value: unknown): void
	{
		if (value === null || value === undefined)
		{
			return;
		}

		if (typeof value === 'string')
		{
			message.writeUTF(value);
		}
		else if (typeof value === 'boolean')
		{
			message.writeBoolean(value);
		}
		else if (value instanceof Byte)
		{
			message.writeByte(value.value);
		}
		else if (value instanceof Short)
		{
			message.writeShort(value.value);
		}
		else if (value instanceof Long)
		{
			this.writeLong(message, value.value);
		}
		else if (value instanceof ByteArray)
		{
			// Write ByteArray with length prefix
			message.writeInt(value.length);
			const savedPosition = value.position;
			value.position = 0;
			message.writeBytes(value);
			value.position = savedPosition;
		}
		else if (typeof value === 'number')
		{
			// Default number type is int
			if (Number.isInteger(value))
			{
				message.writeInt(value);
			}
			else
			{
				// Float for non-integers
				message.writeFloat(value);
			}
		}
		else if (Array.isArray(value))
		{
			// Write array length then each element
			message.writeInt(value.length);
			for (const item of value)
			{
				this.writeValue(message, item);
			}
		}
	}

	/**
	 * Write a 64-bit integer as two 32-bit unsigned integers
	 */
	private writeLong(message: ByteArray, value: number): void
	{
		const isNegative = value < 0;
		let absValue = isNegative ? -value : value;

		let high = Math.floor(absValue / 0x100000000);
		let low = absValue >>> 0;

		if (isNegative)
		{
			// Two's complement
			high = (~high) >>> 0;
			low = (~low) >>> 0;
			low = (low + 1) >>> 0;
			if (low === 0)
			{
				high = (high + 1) >>> 0;
			}
		}

		message.writeUnsignedInt(high);
		message.writeUnsignedInt(low);
	}
}
