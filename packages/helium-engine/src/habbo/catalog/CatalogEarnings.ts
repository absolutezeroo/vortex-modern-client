import type {ICatalogEarnings} from './ICatalogEarnings';

/**
 * Catalog earnings indicator state.
 *
 * @see sources/win63_version/habbo/catalog/earnings/class_1839.as
 */
export class CatalogEarnings implements ICatalogEarnings
{
    private _showingIndicator: boolean = false;

    get showingIndicator(): boolean
    {
        return this._showingIndicator;
    }

    set showingIndicator(value: boolean)
    {
        this._showingIndicator = value;
    }
}
