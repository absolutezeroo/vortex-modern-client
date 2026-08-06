import type {ICatalogEarnings} from './ICatalogEarnings';

/**
 * Catalog earnings indicator state.
 *
 * @see sources/win63_version/habbo/catalog/earnings/class_1839.as
 */
export class CatalogEarnings implements ICatalogEarnings
{
    private _showingIndicator: boolean = false;

    // AS3: sources/win63_version/habbo/catalog/earnings/class_1839.as::get showingIndicator()
    get showingIndicator(): boolean
    {
        return this._showingIndicator;
    }

    set showingIndicator(value: boolean)
    {
        this._showingIndicator = value;
    }
}
