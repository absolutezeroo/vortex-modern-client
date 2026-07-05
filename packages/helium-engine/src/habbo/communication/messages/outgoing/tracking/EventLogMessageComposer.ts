import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Send event log for tracking
 * Message ID: 2297
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/tracking/class_955.as (EventLogMessageComposer)
 */
export class EventLogMessageComposer extends MessageComposer<ConstructorParameters<typeof EventLogMessageComposer>>
{
    private _data: ConstructorParameters<typeof EventLogMessageComposer>;

    constructor(
        category: string,
        type: string,
        action: string,
        extraString: string = '',
        extraInt: number = 0
    )
    {
        super();

        this._data = [category, type, action, extraString, extraInt];
    }

    getMessageArray()
    {
        return this._data;
    }
}
