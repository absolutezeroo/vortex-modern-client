import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * GetEmailStatusComposer
 *
 * Based on AS3: com.sulake.habbo.communication.messages.outgoing.users.GetEmailStatusComposer
 */
export class GetEmailStatusComposer extends MessageComposer<[]>
{
    getMessageArray(): []
    {
        return [];
    }
}
