import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * ApproveNameMessageComposer
 *
 * Based on AS3: com.sulake.habbo.communication.messages.outgoing.users.ApproveNameMessageComposer
 */
export class ApproveNameMessageComposer extends MessageComposer<ConstructorParameters<typeof ApproveNameMessageComposer>>
{
    private _data: ConstructorParameters<typeof ApproveNameMessageComposer>;

    constructor(name: string, validationType: number)
    {
        super();

        this._data = [name, validationType];
    }

    // AS3: sources/win63_version/habbo/communication/messages/outgoing/users/ApproveNameMessageComposer.as::getMessageArray()
    getMessageArray(): [string, number]
    {
        return this._data;
    }
}
