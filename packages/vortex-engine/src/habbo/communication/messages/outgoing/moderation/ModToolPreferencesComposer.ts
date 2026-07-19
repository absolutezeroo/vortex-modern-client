import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Saves moderator tool window preferences (position/size).
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/moderator/ModToolPreferencesComposer.as
 */
export class ModToolPreferencesComposer extends MessageComposer<ConstructorParameters<typeof ModToolPreferencesComposer>>
{
    private _data: ConstructorParameters<typeof ModToolPreferencesComposer>;

    constructor(x: number, y: number, width: number, height: number)
    {
        super();
        this._data = [x, y, width, height];
    }

    getMessageArray()
    {
        return this._data;
    }
}
