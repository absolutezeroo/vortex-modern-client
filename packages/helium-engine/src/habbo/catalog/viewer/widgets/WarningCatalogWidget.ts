import type {IWindowContainer} from '@core/window/IWindowContainer';
import {CatalogWidgetShowWarningTextEvent} from './events/CatalogWidgetShowWarningTextEvent';
import {CatalogWidget} from './CatalogWidget';

/**
 * Displays a warning message dispatched by another widget on the shared warning_text label.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/WarningCatalogWidget.as
 */
export class WarningCatalogWidget extends CatalogWidget
{
    constructor(window: IWindowContainer)
    {
        super(window);
    }

    override dispose(): void
    {
        if(this.disposed) return;

        this.events.off(CatalogWidgetShowWarningTextEvent.CWE_SHOW_WARNING_TEXT, this.onWarningText);
        super.dispose();
    }

    override init(): boolean
    {
        if(!super.init()) return false;

        const label = this.window.findChildByName('warning_text');

        if(label) label.caption = '';

        this.events.on(CatalogWidgetShowWarningTextEvent.CWE_SHOW_WARNING_TEXT, this.onWarningText);

        return true;
    }

    private onWarningText = (event: CatalogWidgetShowWarningTextEvent): void =>
    {
        const label = this.window.findChildByName('warning_text');

        if(label) label.caption = event.text;
    };
}
