import type {IProductData} from './IProductData';

/**
 * Product data implementation
 *
 * @see source_as_win63/habbo/session/product/ProductData.as
 * @see source_as_flash/com/sulake/habbo/session/product/ProductData.as
 */
export class ProductData implements IProductData
{
	constructor(type: string, name: string, description: string = '')
	{
		this._type = type;
		this._name = name;
		this._description = description;
	}

	private _type: string;

	get type(): string
	{
		return this._type;
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
}
