import type {IDisposable} from '@core/runtime';
import type {IAsset} from './IAsset';
import type {AssetTypeDeclaration} from './AssetTypeDeclaration';
import type {AssetLoaderStruct} from './AssetLoaderStruct';

/**
 * IAssetLibrary Interface
 *
 * Based on AS3: com.sulake.core.assets.IAssetLibrary
 *
 * A library that manages a collection of assets.
 */
export interface IAssetLibrary extends IDisposable
{
    readonly url: string;
    readonly name: string;
    readonly isReady: boolean;
    readonly numAssets: number;
    readonly manifest: object | null;
    readonly nameArray: string[];

    loadFromUrl(url: string, isReady?: boolean): Promise<void>;

    loadFromResource(manifest: object, resourceData: unknown): boolean;

    unload(): void;

    loadAssetFromFile(name: string, url: string, mimeType?: string, id?: number): AssetLoaderStruct;

    getAssetByName(name: string): IAsset | null;

    getAssetByContent(content: unknown): IAsset | null;

    getAssetByIndex(index: number): IAsset | null;

    getAssetIndex(asset: IAsset): number;

    hasAsset(name: string): boolean;

    setAsset(name: string, asset: IAsset, overwrite?: boolean): boolean;

    createAsset(name: string, declaration: AssetTypeDeclaration): IAsset | null;

    removeAsset(asset: IAsset): IAsset | null;

    registerAssetTypeDeclaration(declaration: AssetTypeDeclaration, isShared?: boolean): boolean;

    getAssetTypeDeclarationByMimeType(mimeType: string, checkShared?: boolean): AssetTypeDeclaration | null;

    getAssetTypeDeclarationByClass(assetClass: new (...args: unknown[]) => IAsset, checkShared?: boolean): AssetTypeDeclaration | null;

    getAssetTypeDeclarationByFileName(fileName: string, checkShared?: boolean): AssetTypeDeclaration | null;
}
