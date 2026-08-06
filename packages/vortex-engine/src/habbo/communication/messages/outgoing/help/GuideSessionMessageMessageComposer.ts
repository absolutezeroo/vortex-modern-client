import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Sends a chat message within a guide session.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/help/GuideSessionMessageMessageComposer.as
 */
export class GuideSessionMessageMessageComposer extends MessageComposer<ConstructorParameters<typeof GuideSessionMessageMessageComposer>>
{
    private _data: ConstructorParameters<typeof GuideSessionMessageMessageComposer>;

    constructor(message: string)
    {
        super();
        this._data = [message];
    }

    // AS3: sources/win63_version/habbo/communication/messages/outgoing/help/GuideSessionMessageMessageComposer.as::getMessageArray()
    getMessageArray()
    {
        return this._data;
    }
}
