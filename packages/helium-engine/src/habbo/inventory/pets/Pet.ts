import type {PetFigureData} from './PetFigureData';

/**
 * Pet data model
 *
 * Based on AS3 com.sulake.habbo.communication.messages.parser.inventory.pets.class_1679
 */
export class Pet
{
	constructor(
		id: number,
		name: string,
		figureData: PetFigureData,
		level: number
	)
	{
		this._id = id;
		this._name = name;
		this._figureData = figureData;
		this._level = level;
	}

	private _id: number;

	get id(): number
	{
		return this._id;
	}

	private _name: string;

	get name(): string
	{
		return this._name;
	}

	private _figureData: PetFigureData;

	get figureData(): PetFigureData
	{
		return this._figureData;
	}

	private _level: number;

	get level(): number
	{
		return this._level;
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

	get typeId(): number
	{
		return this._figureData.typeId;
	}

	get paletteId(): number
	{
		return this._figureData.paletteId;
	}

	get color(): string
	{
		return this._figureData.color;
	}

	get breedId(): number
	{
		return this._figureData.breedId;
	}

	get customPartCount(): number
	{
		return this._figureData.customPartCount;
	}

	get figureString(): string
	{
		return this._figureData.figureString;
	}

	dispose(): void
	{
		// Nothing to clean up
	}
}
