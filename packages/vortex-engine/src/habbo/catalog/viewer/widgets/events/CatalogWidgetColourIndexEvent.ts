/**
 * Fired on the widget event bus when the user picks a colour swatch index.
 *
 * @see sources/win63_version/habbo/catalog/viewer/widgets/events/CatalogWidgetColourIndexEvent.as
 */
export class CatalogWidgetColourIndexEvent
{
    static readonly COLOUR_INDEX: string = 'COLOUR_INDEX';

    // AS3: sources/win63_version/habbo/catalog/viewer/widgets/events/CatalogWidgetColourIndexEvent.as::_index
    private _index: number;

    constructor(index: number)
    {
        this._index = index;
    }

    get type(): string
    {
        return CatalogWidgetColourIndexEvent.COLOUR_INDEX;
    }

    // AS3: sources/win63_version/habbo/catalog/viewer/widgets/events/CatalogWidgetColourIndexEvent.as::get index()
    get index(): number
    {
        return this._index;
    }
}
