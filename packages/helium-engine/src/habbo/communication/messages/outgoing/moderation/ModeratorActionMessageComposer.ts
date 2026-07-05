import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Sends a moderator action on an issue.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/moderator/ModeratorActionMessageComposer.as
 */
export class ModeratorActionMessageComposer extends MessageComposer<ConstructorParameters<typeof ModeratorActionMessageComposer>>
{
    public static readonly ACTION_ALERT: number = 0;
    public static readonly ACTION_MUTE: number = 1;
    public static readonly ACTION_BAN: number = 3;
    public static readonly ACTION_KICK: number = 4;

    private _data: ConstructorParameters<typeof ModeratorActionMessageComposer>;

    constructor(actionType: number, message: string, cfhTopic: string)
    {
        super();
        this._data = [actionType, message, cfhTopic];
    }

    getMessageArray()
    {
        return this._data;
    }
}
