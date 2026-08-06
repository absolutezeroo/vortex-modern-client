/**
 * Fired on the widget event bus to populate a colour-swatch selector where each swatch can show
 * up to 2 colours split diagonally (e.g. two-tone recolourable furniture).
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/events/CatalogWidgetMultiColoursEvent.as
 */
export class CatalogWidgetMultiColoursEvent
{
    static readonly MULTI_COLOUR_ARRAY: string = 'MULTI_COLOUR_ARRAY';

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/events/CatalogWidgetMultiColoursEvent.as::_colours
    private _colours: number[][];

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/events/CatalogWidgetMultiColoursEvent.as::_backgroundAssetName
    private _backgroundAssetName: string;

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/events/CatalogWidgetMultiColoursEvent.as::_colourAssetName
    private _colourAssetName: string;

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/events/CatalogWidgetMultiColoursEvent.as::_chosenColourAssetName
    private _chosenColourAssetName: string;

    constructor(
        colours: number[][],
        backgroundAssetName: string,
        colourAssetName: string,
        chosenColourAssetName: string
    )
    {
        this._colours = colours;
        this._backgroundAssetName = backgroundAssetName;
        this._colourAssetName = colourAssetName;
        this._chosenColourAssetName = chosenColourAssetName;
    }

    get type(): string
    {
        return CatalogWidgetMultiColoursEvent.MULTI_COLOUR_ARRAY;
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/events/CatalogWidgetMultiColoursEvent.as::get colours()
    get colours(): number[][]
    {
        return this._colours;
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/events/CatalogWidgetMultiColoursEvent.as::get backgroundAssetName()
    get backgroundAssetName(): string
    {
        return this._backgroundAssetName;
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/events/CatalogWidgetMultiColoursEvent.as::get colourAssetName()
    get colourAssetName(): string
    {
        return this._colourAssetName;
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/events/CatalogWidgetMultiColoursEvent.as::get chosenColourAssetName()
    get chosenColourAssetName(): string
    {
        return this._chosenColourAssetName;
    }
}
