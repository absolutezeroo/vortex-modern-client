import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Sets the view mode for a search code in the navigator
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/newnavigator/NavigatorSetSearchCodeViewModeMessageComposer.as
 */
export class NavigatorSetSearchCodeViewModeMessageComposer extends MessageComposer<ConstructorParameters<typeof NavigatorSetSearchCodeViewModeMessageComposer>>
{
    private _data: ConstructorParameters<typeof NavigatorSetSearchCodeViewModeMessageComposer>;

    constructor(searchCode: string, viewMode: number)
    {
        super();

        this._data = [searchCode, viewMode];
    }

    getMessageArray()
    {
        return this._data;
    }
}
