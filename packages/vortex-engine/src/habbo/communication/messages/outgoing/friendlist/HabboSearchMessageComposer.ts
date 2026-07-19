import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Searches for Habbo users by name.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/friendlist/HabboSearchMessageComposer.as
 */
export class HabboSearchMessageComposer extends MessageComposer<ConstructorParameters<typeof HabboSearchMessageComposer>>
{
    private _data: ConstructorParameters<typeof HabboSearchMessageComposer>;

    constructor(searchString: string)
    {
        super();
        this._data = [searchString];
    }

    getMessageArray()
    {
        return this._data;
    }
}
