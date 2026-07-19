import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for CompleteDiffieHandshake response from server
 * Message ID: 3777
 * Contains the server's encrypted public key
 *
 * @see source_as_win63/habbo/communication/messages/parser/handshake/CompleteDiffieHandshakeEventParser.as
 */
export class CompleteDiffieHandshakeMessageParser implements IMessageParser
{
    private _encryptedPublicKey: string = '';

    get encryptedPublicKey(): string
    {
        return this._encryptedPublicKey;
    }

    private _serverClientEncryption: boolean = false;

    get serverClientEncryption(): boolean
    {
        return this._serverClientEncryption;
    }

    flush(): boolean
    {
        this._encryptedPublicKey = '';
        this._serverClientEncryption = false;
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(wrapper.bytesAvailable < 2) return false;

        this._encryptedPublicKey = wrapper.readString();

        if(wrapper.bytesAvailable > 0)
        {
            this._serverClientEncryption = wrapper.readBoolean();
        }

        return true;
    }
}

// Alias for backwards compatibility
export {CompleteDiffieHandshakeMessageParser as GenerateSecretKeyMessageParser};
