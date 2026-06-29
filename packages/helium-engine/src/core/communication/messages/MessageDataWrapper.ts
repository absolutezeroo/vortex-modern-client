import {ByteArray} from '../util/ByteArray';
import type {IMessageDataWrapper} from './IMessageDataWrapper';

/**
 * Implementation of message data wrapper
 * Provides typed access to message contents
 */
export class MessageDataWrapper implements IMessageDataWrapper
{
	private readonly messageId: number;
	private readonly data: ByteArray;

	constructor(messageId: number, data: ByteArray)
	{
		this.messageId = messageId;
		this.data = data;
	}

	get bytesAvailable(): number
	{
		return this.data.bytesAvailable;
	}

	getMessageId(): number
	{
		return this.messageId;
	}

	readString(): string
	{
		return this.data.readUTF();
	}

	readInt(): number
	{
		return this.data.readInt();
	}

	readLong(): number
	{
		// Read as two 32-bit unsigned integers (big-endian)
		const high = this.data.readUnsignedInt();
		const low = this.data.readUnsignedInt();

		// Check if negative (high bit set)
		const isNegative = (high & 0x80000000) !== 0;

		if (isNegative)
		{
			// Two's complement for negative numbers
			// Invert and add 1
			let invHigh = (~high) >>> 0;
			let invLow = (~low) >>> 0;

			invLow = (invLow + 1) >>> 0;
			if (invLow === 0)
			{
				invHigh = (invHigh + 1) >>> 0;
			}

			return -(invHigh * 0x100000000 + invLow);
		}

		return high * 0x100000000 + low;
	}

	readBoolean(): boolean
	{
		return this.data.readBoolean();
	}

	readShort(): number
	{
		return this.data.readShort();
	}

	readByte(): number
	{
		return this.data.readByte();
	}

	readFloat(): number
	{
		return this.data.readFloat();
	}

	readDouble(): number
	{
		return this.data.readDouble();
	}
}
