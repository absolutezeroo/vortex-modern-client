import type {PropertyStruct} from '@core/window/utils/PropertyStruct';

/**
 * Interface for the chest item grid overlay widget.
 *
 * Displays a colored plaque (silver/gold/brown) with a contents-count
 * number on a grid item, for "chest"-type catalog/inventory items.
 *
 * @see sources/win63_2026_crypted_version/com/sulake/habbo/window/widgets/ChestItemGridOverlayWidget.as
 */
export interface IChestItemGridOverlayWidget
{
    readonly disposed: boolean;

    contentsCount: number;
    color: string;

    properties: PropertyStruct[];

    dispose(): void;
}
