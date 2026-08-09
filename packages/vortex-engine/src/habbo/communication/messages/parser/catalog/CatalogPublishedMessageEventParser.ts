import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * `win63_version` is cited only for the readable class name: this message is obfuscated in the
 * primary tree, which is where every member trace below points, because that tree is the
 * authority on behaviour and this one has shipped two bad decompiles today alone.
 *
 * @see sources/win63_version/habbo/communication/messages/parser/catalog/CatalogPublishedMessageEventParser.as
 */
export class CatalogPublishedMessageEventParser implements IMessageParser
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1714/_SafeCls_3506.as::get instantlyRefreshCatalogue()
    private _instantlyRefreshCatalogue: boolean = false;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1714/_SafeCls_3506.as::_newFurniDataHash
    private _newFurniDataHash: string = '';

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1714/_SafeCls_3506.as::get instantlyRefreshCatalogue()
    get instantlyRefreshCatalogue(): boolean
    {
        return this._instantlyRefreshCatalogue;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1714/_SafeCls_3506.as::get newFurniDataHash()
    get newFurniDataHash(): string
    {
        return this._newFurniDataHash;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1714/_SafeCls_3506.as::flush()
    flush(): boolean
    {
        return true;
    }

    /**
     * The hash is optional on the wire - AS3 guards on `bytesAvailable` before reading it, so an
     * older server that sends only the boolean stays readable.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1714/_SafeCls_3506.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._instantlyRefreshCatalogue = wrapper.readBoolean();

        if(wrapper.bytesAvailable)
        {
            this._newFurniDataHash = wrapper.readString();
        }

        return true;
    }
}
