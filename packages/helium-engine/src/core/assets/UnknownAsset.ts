import type {IAsset} from './IAsset';
import type {AssetTypeDeclaration} from './AssetTypeDeclaration';

/**
 * UnknownAsset
 *
 * Based on AS3: com.sulake.core.assets.UnknownAsset
 *
 * A fallback asset type for binary content.
 */
export class UnknownAsset implements IAsset
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

	private _content: unknown = null;

	get content(): unknown
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
		if (!this._disposed)
		{
			this._disposed = true;
			this._content = null;
		}
	}

	setUnknownContent(content: unknown): void
	{
		this._content = content;
	}

	setFromOtherAsset(asset: IAsset): void
	{
		this._content = asset.content;
	}

	setParamsDesc(_params: Map<string, string>): void
	{
	}

	toString(): string
	{
		return `[UnknownAsset: ${this._content}]`;
	}
}
