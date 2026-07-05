import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Request ignored users list.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/users/GetIgnoredUsersMessageComposer.as
 */
export class GetIgnoredUsersMessageComposer extends MessageComposer<ConstructorParameters<typeof GetIgnoredUsersMessageComposer>>
{
    private _data: ConstructorParameters<typeof GetIgnoredUsersMessageComposer>;

    constructor()
    {
        super();

        this._data = [];
    }

    getMessageArray()
    {
        return this._data;
    }
}
