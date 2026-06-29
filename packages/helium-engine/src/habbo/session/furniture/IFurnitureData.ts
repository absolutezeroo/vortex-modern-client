/**
 * Interface for furniture data
 *
 * Provides access to all metadata about a furniture item (floor or wall).
 *
 * @see source_as_win63/habbo/session/furniture/class_3365.as
 * @see source_as_flash/com/sulake/habbo/session/furniture/IFurnitureData.as
 */
export interface IFurnitureData
{
	readonly type: string;
	readonly id: number;
	readonly className: string;
	readonly fullName: string;
	readonly hasIndexedColor: boolean;
	readonly colourIndex: number;
	readonly revision: number;
	readonly tileSizeX: number;
	readonly tileSizeY: number;
	readonly tileSizeZ: number;
	readonly colours: number[];
	readonly localizedName: string;
	readonly description: string;
	readonly adUrl: string;
	readonly purchaseOfferId: number;
	readonly rentOfferId: number;
	readonly customParams: string;
	readonly category: number;
	readonly purchaseCouldBeUsedForBuyout: boolean;
	readonly rentCouldBeUsedForBuyout: boolean;
	readonly availableForBuildersClub: boolean;
	readonly canStandOn: boolean;
	readonly canSitOn: boolean;
	readonly canLayOn: boolean;
	readonly isExternalImageType: boolean;
	readonly excludedFromDynamic: boolean;
	readonly furniLine: string;
}
