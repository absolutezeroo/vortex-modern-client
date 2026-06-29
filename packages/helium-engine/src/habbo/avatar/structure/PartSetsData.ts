import type {IActionDefinition} from '../actions/IActionDefinition';
import type {ActionDefinition} from '../actions/ActionDefinition';
import type {IStructureData} from './IStructureData';
import {ActivePartSet} from './parts/ActivePartSet';
import {PartDefinition} from './parts/PartDefinition';

/**
 * Manages part set definitions and active part sets for avatar rendering.
 *
 * @see sources/win63_version/habbo/avatar/structure/PartSetsData.as
 */
export class PartSetsData implements IStructureData
{
	// AS3: sources/win63_version/habbo/avatar/structure/PartSetsData.as::PartSetsData()
	constructor()
	{
		this._parts = new Map();
		this._activePartSets = new Map();
	}

	private _parts: Map<string, PartDefinition>;

	// AS3: sources/win63_version/habbo/avatar/structure/PartSetsData.as::get parts()
	public get parts(): Map<string, PartDefinition>
	{
		return this._parts;
	}

	private _activePartSets: Map<string, ActivePartSet>;

	// AS3: sources/win63_version/habbo/avatar/structure/PartSetsData.as::get activePartSets()
	public get activePartSets(): Map<string, ActivePartSet>
	{
		return this._activePartSets;
	}

	// AS3: sources/win63_version/habbo/avatar/structure/PartSetsData.as::parse()
	public parse(data: any): boolean
	{
		if (!data) return false;

		if (this.isXmlDocument(data))
		{
			return this.parseXmlElement(data.documentElement);
		}

		if (this.isXmlElement(data))
		{
			return this.parseXmlElement(data);
		}

		return this.parseObject(data);
	}

	// AS3: sources/win63_version/habbo/avatar/structure/PartSetsData.as::appendXML()
	public appendJSON(data: any): boolean
	{
		if (!data) return false;

		return this.parse(data);
	}

	// AS3: sources/win63_version/habbo/avatar/structure/PartSetsData.as::getActiveParts()
	public getActiveParts(action: IActionDefinition): string[]
	{
		const activePartSet = this._activePartSets.get(action.activePartSet);

		if (activePartSet) return activePartSet.parts;

		return [];
	}

	// AS3: sources/win63_version/habbo/avatar/structure/PartSetsData.as::getPartDefinition()
	public getPartDefinition(setType: string): PartDefinition | null
	{
		return this._parts.get(setType) || null;
	}

	// AS3: sources/win63_version/habbo/avatar/structure/PartSetsData.as::addPartDefinition()
	public addPartDefinition(data: any): PartDefinition
	{
		const setType = String(data.setType || data['set-type']);

		if (!this._parts.has(setType))
		{
			this._parts.set(setType, new PartDefinition(data));
		}

		return this._parts.get(setType)!;
	}

	// AS3: sources/win63_version/habbo/avatar/structure/PartSetsData.as::getActivePartSet()
	public getActivePartSet(action: ActionDefinition): ActivePartSet | null
	{
		return this._activePartSets.get(action.activePartSet) || null;
	}

	private parseObject(data: any): boolean
	{
		const partSet = Array.isArray(data.partSet) ? data.partSet[0] : data.partSet;
		const rawParts = partSet?.parts ?? partSet?.part;

		if (rawParts)
		{
			const parts: any[] = Array.isArray(rawParts) ? rawParts : [rawParts];

			for (const partData of parts)
			{
				this._parts.set(String(partData.setType ?? partData['set-type'] ?? ''), new PartDefinition(partData));
			}
		}

		const rawActivePartSets = data.activePartSets ?? data.activePartSet;

		if (rawActivePartSets)
		{
			const activePartSets: any[] = Array.isArray(rawActivePartSets) ? rawActivePartSets : [rawActivePartSets];

			for (const apsData of activePartSets)
			{
				this._activePartSets.set(String(apsData.id ?? apsData['@id'] ?? ''), new ActivePartSet(apsData));
			}
		}

		return true;
	}

	// AS3: sources/win63_version/habbo/avatar/structure/PartSetsData.as::parse()
	private parseXmlElement(root: Element): boolean
	{
		const partSet = root.getElementsByTagName('partSet')[0] ?? root.getElementsByTagName('partset')[0];

		if (partSet)
		{
			for (const child of Array.from(partSet.children))
			{
				if (child.tagName !== 'part')
				{
					continue;
				}

				const partData = {
					'set-type': child.getAttribute('set-type') ?? '',
					'flipped-set-type': child.getAttribute('flipped-set-type') ?? '',
					'remove-set-type': child.getAttribute('remove-set-type') ?? ''
				};

				this._parts.set(partData['set-type'], new PartDefinition(partData));
			}
		}

		for (const activePartSet of Array.from(root.getElementsByTagName('activePartSet')))
		{
			const activePart: Array<Record<string, string>> = [];

			for (const child of Array.from(activePartSet.children))
			{
				if (child.tagName !== 'activePart')
				{
					continue;
				}

				activePart.push({'set-type': child.getAttribute('set-type') ?? ''});
			}

			const activePartSetData = {
				id: activePartSet.getAttribute('id') ?? '',
				activePart
			};

			this._activePartSets.set(activePartSetData.id, new ActivePartSet(activePartSetData));
		}

		return true;
	}

	private isXmlDocument(data: unknown): data is Document
	{
		return typeof Document !== 'undefined' && data instanceof Document;
	}

	private isXmlElement(data: unknown): data is Element
	{
		return typeof Element !== 'undefined' && data instanceof Element;
	}
}