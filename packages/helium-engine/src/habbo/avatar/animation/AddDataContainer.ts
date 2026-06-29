/**
 * Container for additional effect data in animations.
 *
 * @see sources/win63_version/habbo/avatar/animation/AddDataContainer.as
 */
export class AddDataContainer
{
	constructor(data: any)
	{
		this._id = String(data.id || '');
		this._align = String(data.align || '');
		this._base = String(data.base || '');
		this._ink = String(data.ink || '');

		const blendStr = String(data.blend || '');

		if (blendStr.length > 0)
		{
			this._blend = Number(blendStr);

			if (this._blend > 1)
			{
				this._blend /= 100;
			}
		}
	}

	private _id: string;

	public get id(): string
	{
		return this._id;
	}

	private _align: string;

	public get align(): string
	{
		return this._align;
	}

	private _base: string;

	public get base(): string
	{
		return this._base;
	}

	private _ink: string;

	public get ink(): string
	{
		return this._ink;
	}

	private _blend: number = 1;

	public get blend(): number
	{
		return this._blend;
	}

	public get isBlended(): boolean
	{
		return this._blend !== 1;
	}
}
