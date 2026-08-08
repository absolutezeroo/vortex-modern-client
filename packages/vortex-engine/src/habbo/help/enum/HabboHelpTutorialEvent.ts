/**
 * Help tutorial event constants
 *
 * Event types dispatched during the new user tutorial flow,
 * including avatar editor opening/closing and tutorial start.
 *
 * @see source_as_win63/habbo/help/enum/HabboHelpTutorialEvent.as
 */
export class HabboHelpTutorialEvent
{
    // AS3: .../src/com/sulake/habbo/help/enum/HabboHelpTutorialEvent.as::AVATAR_TUTORIAL_START
    // Name DERIVED (`_SafeStr_10446`), from its value.
    public static readonly AVATAR_TUTORIAL_START: string = 'HHTPNUFWE_AVATAR_TUTORIAL_START';
    // AS3: .../src/com/sulake/habbo/help/enum/HabboHelpTutorialEvent.as::LIGHT_CLOTHES_ICON
    // Name DERIVED (`_SafeStr_11435`), from its value.
    public static readonly LIGHT_CLOTHES_ICON: string = 'HHTPNUFWE_LIGHT_CLOTHES_ICON';
    // AS3: .../src/com/sulake/habbo/help/enum/HabboHelpTutorialEvent.as::DONE_AVATAR_EDITOR_OPENING
    public static readonly DONE_AVATAR_EDITOR_OPENING: string = 'HHTE_DONE_AVATAR_EDITOR_OPENING';
    // AS3: .../src/com/sulake/habbo/help/enum/HabboHelpTutorialEvent.as::DONE_AVATAR_EDITOR_CLOSING
    public static readonly DONE_AVATAR_EDITOR_CLOSING: string = 'HHTE_DONE_AVATAR_EDITOR_CLOSING';

    // AS3: .../src/com/sulake/habbo/help/enum/HabboHelpTutorialEvent.as::type
    private readonly _type: string;

    /**
     * AS3 extends `flash.events.Event`, so this class carried a `type` all along — the port had
     * only the constants, because nothing had yet raised or received one. The two Flash Event
     * flags AS3 forwards to `super` are dropped: these travel on an EventEmitter.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/enum/HabboHelpTutorialEvent.as::HabboHelpTutorialEvent()
    constructor(type: string)
    {
        this._type = type;
    }

    // AS3: .../src/com/sulake/habbo/help/enum/HabboHelpTutorialEvent.as::get type()
    public get type(): string
    {
        return this._type;
    }
}
