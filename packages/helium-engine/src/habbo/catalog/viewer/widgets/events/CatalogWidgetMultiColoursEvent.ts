/**
 * Fired on the widget event bus to populate a colour-swatch selector where each swatch can show
 * up to 2 colours split diagonally (e.g. two-tone recolourable furniture).
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/events/CatalogWidgetMultiColoursEvent.as
 */
export class CatalogWidgetMultiColoursEvent
{
    static readonly MULTI_COLOUR_ARRAY: string = 'MULTI_COLOUR_ARRAY';

    private _colours: number[][];

    private _backgroundAssetName: string;

    private _colourAssetName: string;

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

    get colours(): number[][]
    {
        return this._colours;
    }

    get backgroundAssetName(): string
    {
        return this._backgroundAssetName;
    }

    get colourAssetName(): string
    {
        return this._colourAssetName;
    }

    get chosenColourAssetName(): string
    {
        return this._chosenColourAssetName;
    }
}
