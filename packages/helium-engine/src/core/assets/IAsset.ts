import type {IDisposable} from '@core/runtime';
import type {AssetTypeDeclaration} from './AssetTypeDeclaration';

/**
 * IAsset Interface
 *
 * Based on AS3: com.sulake.core.assets.IAsset
 *
 * Base interface for all asset types.
 */
export interface IAsset extends IDisposable
{
	readonly url: string;
	readonly content: unknown;
	readonly declaration: AssetTypeDeclaration;

	setUnknownContent(content: unknown): void;

	setFromOtherAsset(asset: IAsset): void;

	setParamsDesc(params: Map<string, string>): void;
}
