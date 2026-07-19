import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for InitDiffieHandshake response from server
 * Message ID: 771
 * Contains the encrypted prime and generator for Diffie-Hellman
 *
 * @see source_as_win63/habbo/communication/messages/parser/handshake/InitDiffieHandshakeEventParser.as
 */
export class InitDiffieHandshakeMessageParser implements IMessageParser
{
    private _encryptedPrime: string = '';

    get encryptedPrime(): string
    {
        return this._encryptedPrime;
    }

    private _encryptedGenerator: string = '';

    get encryptedGenerator(): string
    {
        return this._encryptedGenerator;
    }

    flush(): boolean
    {
        this._encryptedPrime = '';
        this._encryptedGenerator = '';
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(wrapper.bytesAvailable < 2) return false;

        this._encryptedPrime = wrapper.readString();
        this._encryptedGenerator = wrapper.readString();

        return true;
    }
}
