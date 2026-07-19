import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Send UI flags to the server for persistence
 *
 * @see source_as_flash/com/sulake/habbo/communication/messages/outgoing/preferences/SetUIFlagsMessageComposer.as
 */
export class SetUIFlagsMessageComposer extends MessageComposer<ConstructorParameters<typeof SetUIFlagsMessageComposer>>
{
    private _data: ConstructorParameters<typeof SetUIFlagsMessageComposer>;

    constructor(flags: number)
    {
        super();

        this._data = [flags];
    }

    getMessageArray()
    {
        return this._data;
    }
}
