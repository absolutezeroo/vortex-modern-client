import type {IAsset} from './IAsset';
import type {AssetTypeDeclaration} from './AssetTypeDeclaration';

/**
 * TextAsset
 *
 * Based on AS3: com.sulake.core.assets.TextAsset
 *
 * Asset that holds text content.
 */
export class TextAsset implements IAsset
{
    private readonly _declaration: AssetTypeDeclaration;
    private readonly _url: string;

    constructor(declaration: AssetTypeDeclaration, url: string = '')
    {
        this._declaration = declaration;
        this._url = url;
    }

    private _disposed: boolean = false;

    get disposed(): boolean
    {
        return this._disposed;
    }

    private _content: string = '';

    get content(): string
    {
        return this._content;
    }

    get url(): string
    {
        return this._url;
    }

    get declaration(): AssetTypeDeclaration
    {
        return this._declaration;
    }

    dispose(): void
    {
        if(!this._disposed)
        {
            this._disposed = true;
            this._content = '';
        }
    }

    setUnknownContent(content: unknown): void
    {
        if(typeof content === 'string')
        {
            this._content = content;
            return;
        }

        if(content instanceof ArrayBuffer)
        {
            const decoder = new TextDecoder('utf-8');
            this._content = decoder.decode(content);
            return;
        }

        if(content instanceof Uint8Array)
        {
            const decoder = new TextDecoder('utf-8');
            this._content = decoder.decode(content);
            return;
        }

        if(content instanceof TextAsset)
        {
            this._content = content._content;
            return;
        }

        this._content = content ? String(content) : '';
    }

    setFromOtherAsset(asset: IAsset): void
    {
        if(asset instanceof TextAsset)
        {
            this._content = asset._content;
            return;
        }

        throw new Error('Provided asset is not of type TextAsset');
    }

    setParamsDesc(_params: Map<string, string>): void
    {
    }
}
