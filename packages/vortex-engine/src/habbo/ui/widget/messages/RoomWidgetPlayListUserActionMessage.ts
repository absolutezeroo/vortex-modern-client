import {RoomWidgetMessage} from './RoomWidgetMessage';

/**
 * Tracking-only message: the player pressed the "get more music" catalogue button.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/messages/RoomWidgetPlayListUserActionMessage.as
 */
export class RoomWidgetPlayListUserActionMessage extends RoomWidgetMessage
{
    /**
     * Obfuscated in every available tree; the member name is DERIVED from its value.
     */
    // AS3: .../RoomWidgetPlayListUserActionMessage.as::_SafeStr_10900
    static readonly OPEN_CATALOGUE_BUTTON_PRESSED: string = 'RWPLUA_OPEN_CATALOGUE_BUTTON_PRESSED';

    // AS3: .../RoomWidgetPlayListUserActionMessage.as::RoomWidgetPlayListUserActionMessage()
    constructor(type: string)
    {
        super(type);
    }
}
