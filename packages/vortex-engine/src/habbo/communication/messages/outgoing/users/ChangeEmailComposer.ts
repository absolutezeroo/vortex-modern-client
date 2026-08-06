import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * ChangeEmailComposer
 *
 * Based on AS3: com.sulake.habbo.communication.messages.outgoing.users.ChangeEmailComposer
 */
export class ChangeEmailComposer extends MessageComposer<ConstructorParameters<typeof ChangeEmailComposer>>
{
    private _data: ConstructorParameters<typeof ChangeEmailComposer>;

    constructor(email: string)
    {
        super();

        this._data = [email];
    }

    // AS3: sources/win63_version/habbo/communication/messages/outgoing/users/ChangeEmailComposer.as::getMessageArray()
    getMessageArray(): [string]
    {
        return this._data;
    }
}
