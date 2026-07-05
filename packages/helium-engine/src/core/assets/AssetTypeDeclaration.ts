import type {IAsset} from './IAsset';
import type {IAssetLoader} from './loaders/IAssetLoader';

/**
 * Asset class constructor type
 */
export type AssetClass = new (declaration: AssetTypeDeclaration, url?: string) => IAsset;

/**
 * Asset loader class constructor type
 */
export type AssetLoaderClass = new (mimeType: string, url?: string, id?: number) => IAssetLoader;

/**
 * AssetTypeDeclaration
 *
 * Based on AS3: com.sulake.core.assets.AssetTypeDeclaration
 *
 * Declares a mapping between:
 * - MIME type (e.g., "image/png")
 * - Asset class (e.g., BitmapDataAsset)
 * - Loader class (e.g., BitmapFileLoader)
 * - File extensions (e.g., ["png"])
 *
 * Used by AssetLibrary to automatically create the correct asset type
 * and loader for a given file.
 */
export class AssetTypeDeclaration
{
    private readonly _mimeType: string;
    private readonly _assetClass: AssetClass;
    private readonly _loaderClass: AssetLoaderClass | null;
    private readonly _fileTypes: string[];

    /**
	 * Create a new asset type declaration
	 * @param mimeType The MIME type (e.g., "image/png")
	 * @param assetClass The asset class constructor
	 * @param loaderClass The loader class constructor (optional)
	 * @param fileTypes File extensions that map to this type
	 */
    constructor(
        mimeType: string,
        assetClass: AssetClass,
        loaderClass: AssetLoaderClass | null = null,
        ...fileTypes: string[]
    )
    {
        this._mimeType = mimeType;
        this._assetClass = assetClass;
        this._loaderClass = loaderClass;
        this._fileTypes = fileTypes.length > 0 ? fileTypes : [];
    }

    /**
	 * The MIME type for this declaration
	 */
    get mimeType(): string
    {
        return this._mimeType;
    }

    /**
	 * The asset class constructor
	 */
    get assetClass(): AssetClass
    {
        return this._assetClass;
    }

    /**
	 * The loader class constructor
	 */
    get loaderClass(): AssetLoaderClass | null
    {
        return this._loaderClass;
    }

    /**
	 * File extensions that map to this type
	 */
    get fileTypes(): string[]
    {
        return this._fileTypes;
    }

    /**
	 * Check if a file extension matches this type
	 * @param extension The extension to check (without dot)
	 */
    matchesExtension(extension: string): boolean
    {
        return this._fileTypes.includes(extension.toLowerCase());
    }
}
