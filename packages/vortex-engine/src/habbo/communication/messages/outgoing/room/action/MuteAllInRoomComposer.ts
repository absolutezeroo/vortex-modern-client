import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Toggles mute-all for the current room.
 *
 * @see sources/win63_version/habbo/communication/messages/outgoing/room/action/MuteAllInRoomComposer.as
 */
export class MuteAllInRoomComposer extends MessageComposer<[]>
{
    getMessageArray(): []
    {
        return [];
    }
}
