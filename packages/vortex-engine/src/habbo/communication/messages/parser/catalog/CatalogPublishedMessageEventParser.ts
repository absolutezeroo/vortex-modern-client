import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * @see sources/win63_version/habbo/communication/messages/parser/catalog/CatalogPublishedMessageEventParser.as
 */
export class CatalogPublishedMessageEventParser implements IMessageParser
{
    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/CatalogPublishedMessageEventParser.as::get instantlyRefreshCatalogue()
    private _instantlyRefreshCatalogue: boolean = false;

    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/CatalogPublishedMessageEventParser.as::_newFurniDataHash
    private _newFurniDataHash: string = '';

    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/CatalogPublishedMessageEventParser.as::get instantlyRefreshCatalogue()
    get instantlyRefreshCatalogue(): boolean
    {
        return this._instantlyRefreshCatalogue;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/CatalogPublishedMessageEventParser.as::get newFurniDataHash()
    get newFurniDataHash(): string
    {
        return this._newFurniDataHash;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/CatalogPublishedMessageEventParser.as::flush()
    flush(): boolean
    {
        return true;
    }

    /**
     * The hash is optional on the wire - AS3 guards on `bytesAvailable` before reading it, so an
     * older server that sends only the boolean stays readable.
     */
    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/CatalogPublishedMessageEventParser.as::parse()
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
