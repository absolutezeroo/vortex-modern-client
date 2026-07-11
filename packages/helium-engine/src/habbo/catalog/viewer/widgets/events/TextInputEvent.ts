/**
 * Fired on the widget event bus when the user types into a catalog text-input widget.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/events/TextInputEvent.as
 */
export class TextInputEvent
{
    static readonly TEXT_INPUT: string = 'TEXT_INPUT';

    private _text: string;

    constructor(text: string)
    {
        this._text = text;
    }

    get type(): string
    {
        return TextInputEvent.TEXT_INPUT;
    }

    get text(): string
    {
        return this._text;
    }
}
