/**
 * One queued help bubble: the UI element it points at, the text it shows, and whether it dims the
 * rest of the screen.
 *
 * `icon` is declared with a getter and a setter and is written by nobody — `linkReceived()` puts
 * the resolved icon id in `name`, not here.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/uihelpbubbles/HelpBubbleItem.as
 */
export class HelpBubbleItem
{
    // AS3: .../widget/uihelpbubbles/HelpBubbleItem.as::_name
    private _name: string = '';

    // AS3: .../widget/uihelpbubbles/HelpBubbleItem.as::_text
    private _text: string = '';

    // AS3: .../widget/uihelpbubbles/HelpBubbleItem.as::_icon
    private _icon: string = '';

    // AS3: .../widget/uihelpbubbles/HelpBubbleItem.as::_modal
    // Name DERIVED (`_SafeStr_4876`): the field behind `get modal()`. The same obfuscated id names
    // the modal *window* in `UiHelpBubble`, which is how it is identifiable.
    private _modal: boolean = false;

    // AS3: .../widget/uihelpbubbles/HelpBubbleItem.as::get text()
    get text(): string
    {
        return this._text;
    }

    // AS3: .../widget/uihelpbubbles/HelpBubbleItem.as::set text()
    set text(value: string)
    {
        this._text = value;
    }

    // AS3: .../widget/uihelpbubbles/HelpBubbleItem.as::get name()
    get name(): string
    {
        return this._name;
    }

    // AS3: .../widget/uihelpbubbles/HelpBubbleItem.as::set name()
    set name(value: string)
    {
        this._name = value;
    }

    // AS3: .../widget/uihelpbubbles/HelpBubbleItem.as::get icon()
    // Never written — see the class note.
    get icon(): string
    {
        return this._icon;
    }

    // AS3: .../widget/uihelpbubbles/HelpBubbleItem.as::set icon()
    set icon(value: string)
    {
        this._icon = value;
    }

    // AS3: .../widget/uihelpbubbles/HelpBubbleItem.as::get modal()
    get modal(): boolean
    {
        return this._modal;
    }

    // AS3: .../widget/uihelpbubbles/HelpBubbleItem.as::set modal()
    set modal(value: boolean)
    {
        this._modal = value;
    }
}
