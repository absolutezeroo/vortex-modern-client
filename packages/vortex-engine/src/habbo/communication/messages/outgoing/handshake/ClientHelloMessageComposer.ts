import {PreEncryptionMessageComposer} from '@core/communication/messages/PreEncryptionMessageComposer';

/**
 * First message sent to server to initiate connection
 * Message ID: 4000
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/handshake/ClientHelloMessageComposer.as
 */
export class ClientHelloMessageComposer extends PreEncryptionMessageComposer<ConstructorParameters<typeof ClientHelloMessageComposer>>
{
    private _data: ConstructorParameters<typeof ClientHelloMessageComposer>;

    constructor(
        releaseVersion: string = 'WIN63-202601121721-391685409',
        type: string = 'FLASH20',
        platform: number = 6,
        category: number = 4
    )
    {
        super();

        this._data = [releaseVersion, type, platform, category];
    }

    getMessageArray()
    {
        return this._data;
    }
}
