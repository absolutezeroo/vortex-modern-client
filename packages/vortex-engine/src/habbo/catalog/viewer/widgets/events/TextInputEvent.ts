/**
 * Fired on the widget event bus when the user types into a catalog text-input widget.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/events/TextInputEvent.as
 */
export class TextInputEvent
{
    static readonly TEXT_INPUT: string = 'TEXT_INPUT';

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/events/TextInputEvent.as::_text
    private _text: string;

    constructor(text: string)
    {
        this._text = text;
    }

    get type(): string
    {
        return TextInputEvent.TEXT_INPUT;
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/events/TextInputEvent.as::get text()
    get text(): string
    {
        return this._text;
    }
}
