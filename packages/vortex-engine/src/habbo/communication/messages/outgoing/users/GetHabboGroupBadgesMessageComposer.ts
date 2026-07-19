import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Send event log for tracking
 * Message ID: 2317
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/users/GetHabboGroupBadgesMessageComposer.as
 */
export class GetHabboGroupBadgesMessageComposer extends MessageComposer<ConstructorParameters<typeof GetHabboGroupBadgesMessageComposer>>
{
    private _data: ConstructorParameters<typeof GetHabboGroupBadgesMessageComposer>;

    constructor()
    {
        super();

        this._data = [];
    }

    getMessageArray()
    {
        return this._data;
    }
}