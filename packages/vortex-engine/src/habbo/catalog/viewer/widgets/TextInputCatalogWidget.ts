import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextFieldWindow} from '@core/window/components/ITextFieldWindow';
import {WindowKeyboardEvent} from '@core/window/events/WindowKeyboardEvent';
import {TextInputEvent} from './events/TextInputEvent';
import {CatalogWidget} from './CatalogWidget';

/**
 * Wraps a plain text field, re-broadcasting keystrokes as a TextInputEvent on the widget bus.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/TextInputCatalogWidget.as
 */
export class TextInputCatalogWidget extends CatalogWidget
{
    private _inputText: ITextFieldWindow | null = null;

    constructor(window: IWindowContainer)
    {
        super(window);
    }

    override dispose(): void
    {
        if(this.disposed) return;

        this._inputText?.removeEventListener(WindowKeyboardEvent.KEY_UP, this.onKey);
        this._inputText = null;
        super.dispose();
    }

    override init(): boolean
    {
        if(!super.init()) return false;

        this._inputText = this.window.findChildByName('input_text') as unknown as ITextFieldWindow | null;
        this._inputText?.addEventListener(WindowKeyboardEvent.KEY_UP, this.onKey);

        return true;
    }

    private onKey = (_event: WindowKeyboardEvent): void =>
    {
        if(this._inputText == null) return;

        this.events.emit(TextInputEvent.TEXT_INPUT, new TextInputEvent(this._inputText.text));
    };
}
