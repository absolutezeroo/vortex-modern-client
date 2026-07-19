/**
 * Fired on the widget event bus to show/hide a named widget (e.g. hide the purchase
 * widget while a room-ad flow drives its own confirmation UI).
 *
 * @see sources/win63_version/habbo/catalog/viewer/widgets/events/CatalogWidgetToggleEvent.as
 */
export class CatalogWidgetToggleEvent
{
    static readonly CWE_TOGGLE: string = 'CWE_TOGGLE';

    private _widgetId: string;

    private _enabled: boolean;

    constructor(widgetId: string, enabled: boolean)
    {
        this._widgetId = widgetId;
        this._enabled = enabled;
    }

    get type(): string
    {
        return CatalogWidgetToggleEvent.CWE_TOGGLE;
    }

    get widgetId(): string
    {
        return this._widgetId;
    }

    get enabled(): boolean
    {
        return this._enabled;
    }
}
