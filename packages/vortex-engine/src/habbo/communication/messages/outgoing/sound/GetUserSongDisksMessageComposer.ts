import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Ask for your own song disks. Carries no payload.
 *
 * AS3: sources/win63_version/habbo/communication/messages/outgoing/sound/GetUserSongDisksMessageComposer.as
 * (`_SafeCls_2691` in the primary tree; header 1685 from its registry)
 */
export class GetUserSongDisksMessageComposer extends MessageComposer<[]>
{
    getMessageArray(): []
    {
        return [];
    }
}
