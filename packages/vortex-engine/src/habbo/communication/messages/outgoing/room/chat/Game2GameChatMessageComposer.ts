import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Send a chat message in game/arena mode.
 *
 * Used when RoomSession.isGameSession is true instead of ChatMessageComposer.
 *
 * @see sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3158/Game2GameChatMessageComposer.as
 */
export class Game2GameChatMessageComposer extends MessageComposer<[string]>
{
    private _data: [string];

    constructor(message: string)
    {
        super();
        this._data = [message];
    }

    // AS3: .../src/unknowns/_SafePkg_3158/Game2GameChatMessageComposer.as::getMessageArray()
    getMessageArray(): [string]
    {
        return this._data;
    }
}
