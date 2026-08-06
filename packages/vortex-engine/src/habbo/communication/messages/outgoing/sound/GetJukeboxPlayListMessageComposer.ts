import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Ask for the jukebox's play list, sent the moment a jukebox appears in the room. Carries no
 * payload.
 *
 * AS3: sources/win63_version/habbo/communication/messages/outgoing/sound/GetJukeboxPlayListMessageComposer.as
 * (`_SafeCls_3734` in the primary tree; header 1281 from its registry)
 */
export class GetJukeboxPlayListMessageComposer extends MessageComposer<[]>
{
    // AS3: sources/win63_version/habbo/communication/messages/outgoing/sound/GetJukeboxPlayListMessageComposer.as::getMessageArray()
    getMessageArray(): []
    {
        return [];
    }
}
