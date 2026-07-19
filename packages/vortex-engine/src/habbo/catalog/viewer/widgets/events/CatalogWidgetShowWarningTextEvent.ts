/**
 * Fired on the widget event bus to display a warning message via WarningCatalogWidget.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/events/CatalogWidgetShowWarningTextEvent.as
 */
export class CatalogWidgetShowWarningTextEvent
{
    static readonly CWE_SHOW_WARNING_TEXT: string = 'CWE_SHOW_WARNING_TEXT';

    private _text: string;

    constructor(text: string)
    {
        this._text = text;
    }

    get type(): string
    {
        return CatalogWidgetShowWarningTextEvent.CWE_SHOW_WARNING_TEXT;
    }

    get text(): string
    {
        return this._text;
    }
}
