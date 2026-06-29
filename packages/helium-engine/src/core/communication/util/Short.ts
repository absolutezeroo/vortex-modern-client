/**
 * Short wrapper class for message composition
 * Used to explicitly mark a value as a 16-bit integer in message arrays
 */
export class Short
{
	public readonly value: number;

	constructor(value: number)
	{
		// Ensure it's a signed 16-bit value
		this.value = (value << 16) >> 16;
	}

	toString(): string
	{
		return `Short(${this.value})`;
	}
}
