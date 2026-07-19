import type {SellablePetPalette} from '@habbo/communication/messages/parser/catalog/SellablePetPalette';

/**
 * Fired on the widget event bus when the sellable palettes for a pet product code arrive.
 *
 * AS3's `bubbles`/`cancelable` constructor params are dropped, matching every other ported widget
 * event in this directory (this bus is not a flash.events.EventDispatcher).
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/events/CatalogWidgetSellablePetPalettesEvent.as
 */
export class CatalogWidgetSellablePetPalettesEvent
{
    static readonly SELLABLE_PET_PALETTES: string = 'SELLABLE_PET_PALETTES';

    private _productCode: string;

    private _sellablePalettes: SellablePetPalette[] | null;

    constructor(productCode: string, sellablePalettes: SellablePetPalette[] | null)
    {
        this._productCode = productCode;
        this._sellablePalettes = sellablePalettes;
    }

    get type(): string
    {
        return CatalogWidgetSellablePetPalettesEvent.SELLABLE_PET_PALETTES;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/events/CatalogWidgetSellablePetPalettesEvent.as::get productCode()
    get productCode(): string
    {
        return this._productCode;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/events/CatalogWidgetSellablePetPalettesEvent.as::get sellablePalettes()
    get sellablePalettes(): SellablePetPalette[]
    {
        if(this._sellablePalettes != null) return this._sellablePalettes.slice();

        return [];
    }
}
