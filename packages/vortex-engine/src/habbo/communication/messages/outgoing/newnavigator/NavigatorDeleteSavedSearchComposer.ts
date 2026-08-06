import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Deletes a saved search from the navigator
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/newnavigator/NavigatorDeleteSavedSearchComposer.as
 */
export class NavigatorDeleteSavedSearchComposer extends MessageComposer<ConstructorParameters<typeof NavigatorDeleteSavedSearchComposer>>
{
    private _data: ConstructorParameters<typeof NavigatorDeleteSavedSearchComposer>;

    constructor(searchId: number)
    {
        super();

        this._data = [searchId];
    }

    // AS3: sources/win63_version/habbo/communication/messages/outgoing/newnavigator/NavigatorDeleteSavedSearchComposer.as::getMessageArray()
    getMessageArray()
    {
        return this._data;
    }
}
