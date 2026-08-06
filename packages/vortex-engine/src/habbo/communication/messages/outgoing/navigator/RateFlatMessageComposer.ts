import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Rate a flat/room
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/navigator/RateFlatMessageComposer.as
 */
export class RateFlatMessageComposer extends MessageComposer<ConstructorParameters<typeof RateFlatMessageComposer>>
{
    private _data: ConstructorParameters<typeof RateFlatMessageComposer>;

    constructor(rating: number)
    {
        super();

        this._data = [rating];
    }

    // AS3: sources/win63_version/habbo/communication/messages/outgoing/navigator/RateFlatMessageComposer.as::getMessageArray()
    getMessageArray()
    {
        return this._data;
    }
}
