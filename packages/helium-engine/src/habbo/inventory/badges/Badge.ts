/**
 * Badge data model
 *
 * Based on AS3 com.sulake.habbo.inventory.badges.Badge (ENGINE only)
 */
export class Badge
{
	constructor(
		badgeId: string,
		name: string,
		description: string,
		isUnseen: boolean = false
	)
	{
		this._badgeId = badgeId;
		this._name = name;
		this._description = description;
		this._isUnseen = isUnseen;
	}

	private _badgeId: string;

	get badgeId(): string
	{
		return this._badgeId;
	}

	private _name: string;

	get name(): string
	{
		return this._name;
	}

	private _description: string;

	get description(): string
	{
		return this._description;
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

	private _isUnseen: boolean = false;

	get isUnseen(): boolean
	{
		return this._isUnseen;
	}

	set isUnseen(value: boolean)
	{
		this._isUnseen = value;
	}

	dispose(): void
	{
		// Nothing to clean up for ENGINE-only version
	}
}
