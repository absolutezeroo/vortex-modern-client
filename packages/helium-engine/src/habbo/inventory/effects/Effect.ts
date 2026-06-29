/**
 * Effect data model
 *
 * Based on AS3 com.sulake.habbo.inventory.effects.Effect (ENGINE only)
 */
export class Effect
{
	private _activationTimestamp: number = 0;

	private _type: number = 0;

	get type(): number
	{
		return this._type;
	}

	set type(value: number)
	{
		this._type = value;
	}

	private _subType: number = 0;

	get subType(): number
	{
		return this._subType;
	}

	set subType(value: number)
	{
		this._subType = value;
	}

	private _duration: number = 0;

	get duration(): number
	{
		return this._duration;
	}

	set duration(value: number)
	{
		this._duration = value;
	}

	private _secondsLeft: number = 0;

	/**
	 * Get seconds remaining
	 * Calculates based on activation time if active
	 */
	get secondsLeft(): number
	{
		if (this._isActive)
		{
			const elapsed = (Date.now() - this._activationTimestamp) / 1000;
			const remaining = this._secondsLeft - elapsed;

			return Math.max(0, Math.floor(remaining));
		}

		return this._secondsLeft;
	}

	set secondsLeft(value: number)
	{
		this._secondsLeft = value;
	}

	private _amountInInventory: number = 1;

	get amountInInventory(): number
	{
		return this._amountInInventory;
	}

	set amountInInventory(value: number)
	{
		this._amountInInventory = value;
	}

	private _isPermanent: boolean = false;

	get isPermanent(): boolean
	{
		return this._isPermanent;
	}

	set isPermanent(value: boolean)
	{
		this._isPermanent = value;
	}

	private _isActive: boolean = false;

	get isActive(): boolean
	{
		return this._isActive;
	}

	set isActive(value: boolean)
	{
		if (value && !this._isActive)
		{
			this._activationTimestamp = Date.now();
		}

		this._isActive = value;
	}

	private _isInUse: boolean = false;

	get isInUse(): boolean
	{
		return this._isInUse;
	}

	set isInUse(value: boolean)
	{
		this._isInUse = value;
	}

	private _isSelected: boolean = false;

	get isSelected(): boolean
	{
		return this._isSelected;
	}

	set isSelected(value: boolean)
	{
		this._isSelected = value;
	}

	/**
	 * Called when one effect instance expires
	 */
	setOneEffectExpired(): void
	{
		this._amountInInventory--;

		if (this._amountInInventory < 0)
		{
			this._amountInInventory = 0;
		}

		// Reset to full duration
		this._secondsLeft = this._duration;
		this._isActive = false;
		this._isInUse = false;
	}

	dispose(): void
	{
		// Nothing to clean up
	}
}
