import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Request owned NFT chat styles.
 *
 * @see sources/win63_version/habbo/communication/messages/outgoing/users/GetUserNftChatStylesMessageComposer.as
 */
export class GetUserNftChatStylesMessageComposer extends MessageComposer<ConstructorParameters<typeof GetUserNftChatStylesMessageComposer>>
{
    private _data: ConstructorParameters<typeof GetUserNftChatStylesMessageComposer>;

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
