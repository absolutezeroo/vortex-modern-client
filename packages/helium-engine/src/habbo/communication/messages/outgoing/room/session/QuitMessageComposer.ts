import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Quit the current room
 *
 * Based on AS3: com.sulake.habbo.communication.messages.outgoing.room.session.QuitMessageComposer
 */
export class QuitMessageComposer extends MessageComposer<[]>
{
    constructor()
    {
        super();
    }

    getMessageArray(): []
    {
        return [];
    }
}
