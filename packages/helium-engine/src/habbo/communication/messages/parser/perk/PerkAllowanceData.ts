/**
 * Perk allowance data.
 *
 * @see sources/win63_version/habbo/communication/messages/parser/perk/class_2995.as
 */
export class PerkAllowanceData
{
	private _code: string = '';
	private _isAllowed: boolean = false;
	private _errorMessage: string = '';

	get code(): string
	{
		return this._code;
	}

	set code(value: string)
	{
		this._code = value;
	}

	get isAllowed(): boolean
	{
		return this._isAllowed;
	}

	set isAllowed(value: boolean)
	{
		this._isAllowed = value;
	}

	get errorMessage(): string
	{
		return this._errorMessage;
	}

	set errorMessage(value: string)
	{
		this._errorMessage = value;
	}
}
