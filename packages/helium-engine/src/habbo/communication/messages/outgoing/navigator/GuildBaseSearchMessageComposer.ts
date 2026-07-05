import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Search guild base
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/navigator/GuildBaseSearchMessageComposer.as
 */
export class GuildBaseSearchMessageComposer extends MessageComposer<ConstructorParameters<typeof GuildBaseSearchMessageComposer>>
{
    private _data: ConstructorParameters<typeof GuildBaseSearchMessageComposer>;

    constructor(guildId: number)
    {
        super();

        this._data = [guildId];
    }

    getMessageArray()
    {
        return this._data;
    }
}
