import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {NodeData} from '../../incoming/catalog/NodeData';

/**
 * Parser for the catalog category tree (root node + new-additions flag).
 *
 * @see sources/win63_version/habbo/communication/messages/parser/catalog/CatalogIndexMessageEventParser.as
 */
export class CatalogIndexMessageEventParser implements IMessageParser
{
    private _root: NodeData | null = null;

    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/CatalogIndexMessageEventParser.as::get root()
    get root(): NodeData | null
    {
        return this._root;
    }

    private _newAdditionsAvailable: boolean = false;

    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/CatalogIndexMessageEventParser.as::get newAdditionsAvailable()
    get newAdditionsAvailable(): boolean
    {
        return this._newAdditionsAvailable;
    }

    private _catalogType: string = '';

    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/CatalogIndexMessageEventParser.as::get catalogType()
    get catalogType(): string
    {
        return this._catalogType;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/CatalogIndexMessageEventParser.as::flush()
    flush(): boolean
    {
        this._root = null;

        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/CatalogIndexMessageEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._root = new NodeData(wrapper);
        this._newAdditionsAvailable = wrapper.readBoolean();
        this._catalogType = wrapper.readString();

        return true;
    }
}
