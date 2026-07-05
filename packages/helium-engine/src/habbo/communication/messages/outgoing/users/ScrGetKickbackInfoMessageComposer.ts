import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * ScrGetKickbackInfoMessageComposer
 *
 * Based on AS3: com.sulake.habbo.communication.messages.outgoing.users.ScrGetKickbackInfoMessageComposer
 */
export class ScrGetKickbackInfoMessageComposer extends MessageComposer<[]>
{
    getMessageArray(): []
    {
        return [];
    }
}
