import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Send an avatar expression (wave, laugh, blow kiss, etc.)
 *
 * Based on AS3: com.sulake.habbo.communication.messages.outgoing.room.avatar.AvatarExpressionMessageComposer
 */
export class AvatarExpressionMessageComposer extends MessageComposer<[number]>
{
    private _data: [number];

    constructor(expressionId: number)
    {
        super();
        this._data = [expressionId];
    }

    getMessageArray(): [number]
    {
        return this._data;
    }
}
