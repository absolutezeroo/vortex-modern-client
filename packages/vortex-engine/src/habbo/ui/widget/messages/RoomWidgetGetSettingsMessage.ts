import {RoomWidgetMessage} from './RoomWidgetMessage';

/**
 * "Send me the current sound volumes." The sound-settings page asks for them on open rather than
 * reading the sound manager itself — the handler answers with a `RoomWidgetSettingsUpdateEvent`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/messages/RoomWidgetGetSettingsMessage.as
 */
export class RoomWidgetGetSettingsMessage extends RoomWidgetMessage
{
    // AS3: .../widget/messages/RoomWidgetGetSettingsMessage.as::GET_SETTINGS
    // Name DERIVED: the value the sound view passes inline.
    public static readonly GET_SETTINGS: string = 'RWGSM_GET_SETTINGS';

    // AS3: .../widget/messages/RoomWidgetGetSettingsMessage.as::RoomWidgetGetSettingsMessage()
    constructor(type: string)
    {
        super(type);
    }
}
