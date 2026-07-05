import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Performs a search in the new navigator
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/newnavigator/NewNavigatorSearchComposer.as
 */
export class NewNavigatorSearchComposer extends MessageComposer<ConstructorParameters<typeof NewNavigatorSearchComposer>>
{
    private _data: ConstructorParameters<typeof NewNavigatorSearchComposer>;

    constructor(searchCode: string, filtering: string)
    {
        super();

        this._data = [searchCode, filtering];
    }

    getMessageArray()
    {
        return this._data;
    }
}
