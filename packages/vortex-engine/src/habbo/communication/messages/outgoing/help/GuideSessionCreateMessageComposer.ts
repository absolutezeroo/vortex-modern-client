import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Creates a new guide session request.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/help/GuideSessionCreateMessageComposer.as
 */
export class GuideSessionCreateMessageComposer extends MessageComposer<ConstructorParameters<typeof GuideSessionCreateMessageComposer>>
{
    private _data: ConstructorParameters<typeof GuideSessionCreateMessageComposer>;

    constructor(requestType: number, message: string)
    {
        super();
        this._data = [requestType, message];
    }

    getMessageArray()
    {
        return this._data;
    }
}
