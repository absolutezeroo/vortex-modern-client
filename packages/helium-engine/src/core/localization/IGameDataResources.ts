/**
 * Interface for game data resources (hashes for external files)
 *
 * Based on AS3 com.sulake.core.localization.class_40
 */
export interface IGameDataResources
{
	readonly externalFlashTextsUrl: string;
	readonly externalFlashTextsHash: string;
	readonly externalTextsUrl: string;
	readonly externalTextsHash: string;
	readonly externalVariablesUrl: string;
	readonly externalVariablesHash: string;
	readonly figureDataUrl: string;
	readonly figureDataHash: string;
	readonly furnitureDataUrl: string;
	readonly furnitureDataHash: string;
	readonly productDataUrl: string;
	readonly productDataHash: string;

	/**
	 * Check if all required AS3 resources are present
	 */
	isValid(): boolean;
}