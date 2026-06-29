/**
 * Represents a single frame within an animation action part.
 *
 * @see sources/win63_version/habbo/avatar/structure/animation/AnimationFrame.as
 */
export class AnimationFrame
{
	constructor(data: any)
	{
		this._number = parseInt(data.number) || 0;
		// Nitro: assetPartDefinition (camelCase), XML-JSON: assetpartdefinition (lowercase)
		this._assetPartDefinition = String(data.assetPartDefinition ?? data.assetpartdefinition ?? '');
	}

	private _number: number;

	public get number(): number
	{
		return this._number;
	}

	private _assetPartDefinition: string;

	public get assetPartDefinition(): string
	{
		return this._assetPartDefinition;
	}
}
