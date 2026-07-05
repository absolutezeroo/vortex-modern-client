import {PreEncryptionMessageComposer} from '@core/communication/messages/PreEncryptionMessageComposer';

/**
 * Complete Diffie-Hellman key exchange with our public key
 * Message ID: 2616
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/handshake/CompleteDiffieHandshakeMessageComposer.as
 */
export class CompleteDiffieHandshakeMessageComposer extends PreEncryptionMessageComposer<ConstructorParameters<typeof CompleteDiffieHandshakeMessageComposer>>
{
    private _data: ConstructorParameters<typeof CompleteDiffieHandshakeMessageComposer>;

    constructor(publicKey: string)
    {
        super();

        this._data = [publicKey];
    }

    getMessageArray()
    {
        return this._data;
    }
}
