/**
 * CommandConfiguration
 *
 * @see sources/win63_version/habbo/ui/widget/infostand/CommandConfiguration.as
 *
 * win63_version decompiles the constructor loop as an infinite loop with an
 * undeclared index variable — a decompiler artifact. The bounded loop below
 * matches win63_2023_version's fuller decompile of the same constructor.
 */
export class CommandConfiguration
{
	private _allCommandIds: number[];
	private _enabled: Set<number> = new Set();

	// AS3: sources/win63_version/habbo/ui/widget/infostand/CommandConfiguration.as::CommandConfiguration()
	constructor(allCommandIds: number[], enabledCommandIds: number[])
	{
		this._allCommandIds = allCommandIds;

		for(const id of enabledCommandIds)
		{
			this._enabled.add(id);
		}
	}

	public get allCommandIds(): number[]
	{
		return this._allCommandIds;
	}

	// AS3: sources/win63_version/habbo/ui/widget/infostand/CommandConfiguration.as::isEnabled()
	public isEnabled(id: number): boolean
	{
		return this._enabled.has(id);
	}
}
