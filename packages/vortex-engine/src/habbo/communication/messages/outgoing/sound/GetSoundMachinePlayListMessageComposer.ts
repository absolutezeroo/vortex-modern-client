import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Ask the room's sound machine for its play list. Carries no payload.
 *
 * AS3: sources/win63_version/habbo/communication/messages/outgoing/sound/GetSoundMachinePlayListMessageComposer.as
 * (`_SafeCls_3689` in the primary tree; header 3633 from its registry)
 */
export class GetSoundMachinePlayListMessageComposer extends MessageComposer<[]>
{
    getMessageArray(): []
    {
        return [];
    }
}
