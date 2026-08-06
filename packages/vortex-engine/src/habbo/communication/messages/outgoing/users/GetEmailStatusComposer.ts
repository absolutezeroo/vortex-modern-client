import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * GetEmailStatusComposer
 *
 * Based on AS3: com.sulake.habbo.communication.messages.outgoing.users.GetEmailStatusComposer
 */
export class GetEmailStatusComposer extends MessageComposer<[]>
{
    // AS3: sources/win63_version/habbo/communication/messages/outgoing/users/GetEmailStatusComposer.as::getMessageArray()
    getMessageArray(): []
    {
        return [];
    }
}
