/**
 * Byte wrapper class for message composition
 * Used to explicitly mark a value as a single byte in message arrays
 */
export class Byte
{
	public readonly value: number;

	constructor(value: number)
	{
		this.value = value & 0xFF;
	}

	toString(): string
	{
		return `Byte(${this.value})`;
	}
}
