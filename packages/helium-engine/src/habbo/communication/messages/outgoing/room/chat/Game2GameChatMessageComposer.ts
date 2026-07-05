import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Send a chat message in game/arena mode.
 *
 * Used when RoomSession.isGameSession is true instead of ChatMessageComposer.
 *
 * @see sources/win63_version/habbo/communication/messages/outgoing/room/chat/Game2GameChatMessageComposer.as
 */
export class Game2GameChatMessageComposer extends MessageComposer<[string]>
{
    private _data: [string];

    constructor(message: string)
    {
        super();
        this._data = [message];
    }

    getMessageArray(): [string]
    {
        return this._data;
    }
}
