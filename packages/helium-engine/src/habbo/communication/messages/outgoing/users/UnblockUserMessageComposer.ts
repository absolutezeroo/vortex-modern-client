import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Unblock a user.
 *
 * @see sources/win63_version/habbo/communication/messages/outgoing/users/UnblockUserMessageComposer.as
 */
export class UnblockUserMessageComposer extends MessageComposer<ConstructorParameters<typeof UnblockUserMessageComposer>>
{
    private _data: ConstructorParameters<typeof UnblockUserMessageComposer>;

    constructor(userId: number)
    {
        super();

        this._data = [userId];
    }

    getMessageArray()
    {
        return this._data;
    }
}
