/**
 * Generic widget-bus event (type-only payload) used for simple lifecycle signals.
 *
 * @see sources/win63_version/habbo/catalog/viewer/widgets/events/CatalogWidgetEvent.as
 */
export class CatalogWidgetEvent
{
    static readonly WIDGETS_INITIALIZED: string = 'WIDGETS_INITIALIZED';

    private _type: string;

    constructor(type: string)
    {
        this._type = type;
    }

    get type(): string
    {
        return this._type;
    }
}
