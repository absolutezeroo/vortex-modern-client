/**
 * Represents a set of body parts for avatar rendering.
 *
 * @see sources/win63_version/habbo/avatar/geometry/AvatarSet.as
 */
export class AvatarSet
{
	private _subSets: Map<string, AvatarSet>;
	private _bodyPartIds: string[];
	private _allBodyPartIds: string[];

	constructor(data: any)
	{
		this._id = String(data.id);

		// Nitro: data.main (boolean), XML-JSON: data.main (string "1"/"0")
		this._isMain = Boolean(typeof data.main === 'boolean' ? data.main : parseInt(data.main));
		this._subSets = new Map();
		this._bodyPartIds = [];

		// Nitro: avatarSets (camelCase), XML-JSON: avatarsets (lowercase)
		const subSets = data.avatarSets || data.avatarsets;

		if (subSets)
		{
			for (const subData of subSets)
			{
				const subSet = new AvatarSet(subData);

				this._subSets.set(String(subData.id), subSet);
			}
		}

		// Nitro: bodyParts (camelCase), XML-JSON: bodyparts (lowercase)
		const bodyParts = data.bodyParts || data.bodyparts;

		if (bodyParts)
		{
			for (const bp of bodyParts)
			{
				this._bodyPartIds.push(String(bp.id));
			}
		}

		const all = [...this._bodyPartIds];

		for (const subSet of this._subSets.values())
		{
			all.push(...subSet.getBodyParts());
		}

		this._allBodyPartIds = all;
	}

	private _id: string;

	public get id(): string
	{
		return this._id;
	}

	private _isMain: boolean;

	public get isMain(): boolean
	{
		if (this._isMain) return true;

		for (const subSet of this._subSets.values())
		{
			if (subSet.isMain) return true;
		}

		return false;
	}

	public findAvatarSet(id: string): AvatarSet | null
	{
		if (id === this._id) return this;

		for (const subSet of this._subSets.values())
		{
			if (subSet.findAvatarSet(id) != null) return subSet;
		}

		return null;
	}

	public getBodyParts(): string[]
	{
		return [...this._allBodyPartIds];
	}
}
