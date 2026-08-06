import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Get user's event categories
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/navigator/GetUserEventCatsMessageComposer.as
 */
export class GetUserEventCatsMessageComposer extends MessageComposer<ConstructorParameters<typeof GetUserEventCatsMessageComposer>>
{
    private _data: ConstructorParameters<typeof GetUserEventCatsMessageComposer>;

    constructor()
    {
        super();

        this._data = [];
    }

    // AS3: sources/win63_version/habbo/communication/messages/outgoing/navigator/GetUserEventCatsMessageComposer.as::getMessageArray()
    getMessageArray()
    {
        return this._data;
    }
}
