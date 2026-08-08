import {RoomWidgetMessage} from './RoomWidgetMessage';

/**
 * "The me-menu was opened" — the message that makes the handler push the club, purse and avatar
 * state the menu needs, rather than the menu pulling them.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/messages/RoomWidgetMeMenuMessage.as
 */
export class RoomWidgetMeMenuMessage extends RoomWidgetMessage
{
    // AS3: .../widget/messages/RoomWidgetMeMenuMessage.as::ME_MENU_OPENED
    // Name DERIVED (`_SafeStr_10812`), from its value "RWMMM_MESSAGE_ME_MENU_OPENED".
    public static readonly ME_MENU_OPENED: string = 'RWMMM_MESSAGE_ME_MENU_OPENED';

    // AS3: .../widget/messages/RoomWidgetMeMenuMessage.as::RoomWidgetMeMenuMessage()
    constructor(type: string)
    {
        super(type);
    }
}
