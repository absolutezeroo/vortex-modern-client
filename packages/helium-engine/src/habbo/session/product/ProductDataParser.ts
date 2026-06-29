import {EventEmitter} from 'eventemitter3';
import {Logger} from '@core/utils/Logger';
import {ProductData} from './ProductData';

import type {IProductData} from './IProductData';

const log = Logger.getLogger('ProductDataParser');

/**
 * Events emitted by ProductDataParser
 */
export interface ProductDataParserEvents
{
	PDP_product_data_ready: [];
	PDP_product_data_error: [error: Error];
}

/**
 * Parses product data from JSON (modern Habbo format).
 *
 * Receives products dictionary by reference and fills it during parsing.
 * Emits `PDP_product_data_ready` when parsing is complete.
 *
 * @see source_as_win63/habbo/session/product/ProductDataParser.as
 */
export class ProductDataParser
{
	private _products: Map<string, IProductData>;
	private _disposed: boolean = false;

	constructor(url: string, products: Map<string, IProductData>)
	{
		this._products = products;

		this.loadData(url);
	}

	private _events: EventEmitter<ProductDataParserEvents> = new EventEmitter();

	get events(): EventEmitter<ProductDataParserEvents>
	{
		return this._events;
	}

	/**
	 * Dispose the parser
	 */
	dispose(): void
	{
		if (this._disposed) return;

		this._events.removeAllListeners();
		this._disposed = true;
	}

	/**
	 * Load and parse product data from URL
	 * @see source_as_win63/habbo/session/product/ProductDataParser.as constructor
	 */
	private async loadData(url: string): Promise<void>
	{
		try
		{
			const response = await fetch(url);

			if (!response.ok)
			{
				throw new Error(`Failed to load product data: ${response.status}`);
			}

			const data = await response.json();

			this.parseJsonFormat(data);

			log.info(`Parsed ${this._products.size} products`);
			this._events.emit('PDP_product_data_ready');
		}
		catch (error)
		{
			log.error('Failed to parse product data:', error);
			this._events.emit('PDP_product_data_error', error as Error);
		}
	}

	/**
	 * Parse JSON product data format
	 *
	 * @see source_as_win63/habbo/session/product/ProductDataParser.as parseXmlFormat()
	 */
	private parseJsonFormat(data: Record<string, unknown>): void
	{
		const productdata = (data.productdata ?? null) as Record<string, unknown> | null;

		if (!productdata?.product) return;

		const products = productdata.product as unknown[];

		for (const item of products)
		{
			const raw = item as Record<string, unknown>;
			if (!raw) continue;

			const code = String(raw.code || '');
			const name = String(raw.name || '');
			const description = String(raw.description || '');

			this._products.set(code, new ProductData(code, name, description));
		}
	}
}
