import type {PropertyStruct} from '@core/window/utils/PropertyStruct';

/**
 * Interface for the chest item grid overlay widget.
 *
 * Displays a colored plaque (silver/gold/brown) with a contents-count
 * number on a grid item, for "chest"-type catalog/inventory items.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/ChestItemGridOverlayWidget.as
 */
export interface IChestItemGridOverlayWidget
{
    // AS3: .../src/com/sulake/habbo/window/widgets/ChestItemGridOverlayWidget.as::get disposed()
    readonly disposed: boolean;

    // AS3: .../src/com/sulake/habbo/window/widgets/ChestItemGridOverlayWidget.as::get contentsCount()
    contentsCount: number;
    // AS3: .../src/com/sulake/habbo/window/widgets/ChestItemGridOverlayWidget.as::get color()
    color: string;

    // AS3: .../src/com/sulake/habbo/window/widgets/ChestItemGridOverlayWidget.as::get properties()
    properties: PropertyStruct[];

    // AS3: .../src/com/sulake/habbo/window/widgets/ChestItemGridOverlayWidget.as::dispose()
    dispose(): void;
}
