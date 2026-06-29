import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

export interface PetData
{
	id: number;
	name: string;
	figureData: {
		typeId: number;
		paletteId: number;
		color: string;
		customParts: number[];
	};
	level: number;
}

/**
 * Parser for pet inventory message
 *
 * @see source_as_win63/habbo/communication/messages/parser/inventory/pets/PetInventoryEventParser.as
 */
export class PetInventoryMessageParser implements IMessageParser
{
	private _totalFragments: number = 1;

	get totalFragments(): number
	{
		return this._totalFragments;
	}

	private _fragmentNo: number = 0;

	get fragmentNo(): number
	{
		return this._fragmentNo;
	}

	private _pets: PetData[] = [];

	get pets(): PetData[]
	{
		return this._pets;
	}

	flush(): boolean
	{
		this._pets = [];
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		this._totalFragments = wrapper.readInt();
		this._fragmentNo = wrapper.readInt();

		const count = wrapper.readInt();

		for (let i = 0; i < count; i++)
		{
			const id = wrapper.readInt();
			const name = wrapper.readString();

			// Pet figure data
			const typeId = wrapper.readInt();
			const paletteId = wrapper.readInt();
			const color = wrapper.readString();

			// Custom parts
			const customPartCount = wrapper.readInt();
			const customParts: number[] = [];
			for (let j = 0; j < customPartCount; j++)
			{
				customParts.push(wrapper.readInt());
			}

			// Other pet data
			wrapper.readBoolean(); // hasCustomLayerPart
			wrapper.readInt(); // petRarity

			this._pets.push({
				id,
				name,
				figureData: {
					typeId,
					paletteId,
					color,
					customParts,
				},
				level: 1, // Level comes in separate message
			});
		}

		return true;
	}
}
