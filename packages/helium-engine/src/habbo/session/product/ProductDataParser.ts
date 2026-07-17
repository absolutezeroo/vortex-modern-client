import {EventEmitter} from 'eventemitter3';
import {Logger} from '@core/utils/Logger';
import {ProductData} from './ProductData';

import type {IProductData} from './IProductData';

const log = Logger.getLogger('ProductDataParser');

/**
 * Events emitted by ProductDataParser
 */
export interface IProductDataParserEvents
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

    private _events: EventEmitter<IProductDataParserEvents> = new EventEmitter();

    get events(): EventEmitter<IProductDataParserEvents>
    {
        return this._events;
    }

    /**
	 * Dispose the parser
	 */
    dispose(): void
    {
        if(this._disposed) return;

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

            if(!response.ok)
            {
                throw new Error(`Failed to load product data: ${response.status}`);
            }

            // AS3 reads the body as text and dispatches on its first non-space
            // character — the format is never assumed from the URL or a header.
            // Calling response.json() outright meant Habbo's own productdata.txt
            // parsed as zero products.
            const body = await response.text();
            const trimmed = body.replace(/^\s+/, '');

            if(trimmed.length === 0)
            {
                throw new Error('Product data was empty');
            }

            if(trimmed.charAt(0) === '<')
            {
                this.parseXmlFormat(trimmed);
            }
            else if(trimmed.charAt(0) === '{' || trimmed.charAt(0) === '[')
            {
                // Port-specific: AS3 has no JSON branch, but this client has shipped
                // JSON productdata, so both have to keep working.
                this.parseJsonFormat(JSON.parse(body) as Record<string, unknown>);
            }
            else
            {
                this.parseLingoFormat(body);
            }

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
	 * Parses the XML productdata format — `<product code="..."><name>...</name>`.
	 *
	 * AS3 reads the code off the attribute and the name off the child element; the
	 * two are not interchangeable.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/session/product/ProductDataParser.as::parseXmlFormat()
    private parseXmlFormat(data: string): void
    {
        const document = new DOMParser().parseFromString(data, 'text/xml');

        if(document.getElementsByTagName('parsererror').length > 0)
        {
            throw new Error('XML product data was malformed');
        }

        for(const item of Array.from(document.getElementsByTagName('product')))
        {
            const code = item.getAttribute('code') ?? '';
            const name = item.getElementsByTagName('name').item(0)?.textContent ?? '';

            this._products.set(code, new ProductData(code, name));
        }
    }

    /**
	 * Parses the classic Lingo productdata — Habbo's own `productdata.txt`.
	 *
	 * The format is bracket groups, any number per line:
	 * `[["code","name"],["code2","name2"]]`. AS3 strips every quote first, then
	 * takes each `[...]` group, splits on commas and shifts the first two fields —
	 * code, then name. Anything after them is ignored, which is why shift() is used
	 * rather than indexing.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/session/product/ProductDataParser.as::parseLingoFormat()
    private parseLingoFormat(data: string): void
    {
        const lines = data.replace(/"{1,}/gm, '').split(/\n\r{1,}|\n{1,}|\r{1,}/gm);

        for(const line of lines)
        {
            const groups = line.match(/\[+?((.)*?)\]/g);

            if(!groups) continue;

            for(const group of groups)
            {
                const fields = group.replace(/\[{1,}/gm, '').replace(/\]{1,}/gm, '').split(',');
                const code = fields.shift();
                const name = fields.shift();

                if(code === undefined || name === undefined) continue;

                this._products.set(code, new ProductData(code, name));
            }
        }
    }

    /**
	 * Parses the JSON productdata this client has shipped.
	 *
	 * Port-specific: AS3 has no JSON branch. Kept alongside the two real formats so
	 * both keep working.
	 */
    private parseJsonFormat(data: Record<string, unknown>): void
    {
        const productdata = (data.productdata ?? null) as Record<string, unknown> | null;

        if(!productdata?.product) return;

        const products = productdata.product as unknown[];

        for(const item of products)
        {
            const raw = item as Record<string, unknown>;
            if(!raw) continue;

            const code = String(raw.code || '');
            const name = String(raw.name || '');
            const description = String(raw.description || '');

            this._products.set(code, new ProductData(code, name, description));
        }
    }
}
