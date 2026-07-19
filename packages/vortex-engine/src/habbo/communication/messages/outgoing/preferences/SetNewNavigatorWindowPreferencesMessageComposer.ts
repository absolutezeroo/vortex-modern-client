import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Persist new navigator window preferences.
 *
 * @see sources/win63_version/habbo/communication/messages/outgoing/preferences/SetNewNavigatorWindowPreferencesMessageComposer.as
 */
export class SetNewNavigatorWindowPreferencesMessageComposer extends MessageComposer<ConstructorParameters<typeof SetNewNavigatorWindowPreferencesMessageComposer>>
{
    private _data: ConstructorParameters<typeof SetNewNavigatorWindowPreferencesMessageComposer>;

    constructor(x: number, y: number, width: number, height: number, leftPaneHidden: boolean, resultsMode: number)
    {
        super();

        this._data = [x, y, width, height, leftPaneHidden, resultsMode];
    }

    getMessageArray()
    {
        return this._data;
    }
}
