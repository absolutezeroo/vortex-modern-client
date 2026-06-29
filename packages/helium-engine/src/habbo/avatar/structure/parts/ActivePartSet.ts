/**
 * Represents a named set of active body part types used during avatar rendering.
 *
 * @see sources/win63_version/habbo/avatar/structure/parts/ActivePartSet.as
 */
export class ActivePartSet
{
	// AS3: sources/win63_version/habbo/avatar/structure/parts/ActivePartSet.as::ActivePartSet()
	constructor(data: any)
	{
		this._id = String(data.id ?? data['@id'] ?? '');
		this._parts = [];

		// Nitro: activeParts (camelCase array), XML-JSON: activePart
		const rawParts = data.activeParts || data.activePart;

		if (rawParts)
		{
			const activeParts: any[] = Array.isArray(rawParts) ? rawParts : [rawParts];

			for (const part of activeParts)
			{
				// Nitro: camelCase (setType), XML-JSON: hyphenated (set-type)
				this._parts.push(String(part.setType ?? part['set-type'] ?? ''));
			}
		}
	}

	private _id: string;

	public get id(): string
	{
		return this._id;
	}

	private _parts: string[];

	public get parts(): string[]
	{
		return this._parts;
	}
}
