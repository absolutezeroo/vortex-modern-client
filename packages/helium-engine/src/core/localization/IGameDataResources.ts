/**
 * Interface for game data resources (hashes for external files)
 *
 * Based on AS3 com.sulake.core.localization.class_40
 */
export interface IGameDataResources
{
	readonly effectMapUrl: string;
	readonly effectMapHash: string;
	readonly externalFlashTextsUrl: string;
	readonly externalFlashTextsHash: string;
	readonly externalUiVariablesUrl: string;
	readonly externalUiVariablesHash: string;
	readonly externalVariablesUrl: string;
	readonly externalVariablesHash: string;
	readonly externalTextsUrl: string;
	readonly externalTextsHash: string;
	readonly figureDataUrl: string;
	readonly figureDataHash: string;
	readonly figureMapUrl: string;
	readonly figureMapHash: string;
	readonly furnitureDataUrl: string;
	readonly furnitureDataHash: string;
	readonly habboAvatarActionsUrl: string;
	readonly habboAvatarActionsHash: string;
	readonly habboAvatarAnimationsUrl: string;
	readonly habboAvatarAnimationsHash: string;
	readonly habboAvatarGeometryUrl: string;
	readonly habboAvatarGeometryHash: string;
	readonly habboAvatarPartSetsUrl: string;
	readonly habboAvatarPartSetsHash: string;
	readonly productDataUrl: string;
	readonly productDataHash: string;

	/**
	 * Check if all required AS3 resources are present
	 */
	isValid(): boolean;
}