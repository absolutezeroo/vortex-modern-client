import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * ScrGetUserInfoMessageComposer
 *
 * Based on AS3: com.sulake.habbo.communication.messages.outgoing.users.ScrGetUserInfoMessageComposer
 */
export class ScrGetUserInfoMessageComposer extends MessageComposer<ConstructorParameters<typeof ScrGetUserInfoMessageComposer>>
{
    private _data: ConstructorParameters<typeof ScrGetUserInfoMessageComposer>;

    constructor(productName: string)
    {
        super();

        this._data = [productName];
    }

    // AS3: sources/win63_version/habbo/communication/messages/outgoing/users/ScrGetUserInfoMessageComposer.as::getMessageArray()
    getMessageArray(): [string]
    {
        return this._data;
    }
}
