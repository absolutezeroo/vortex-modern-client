/**
 * Fired on the widget event bus to populate a colour-swatch selector for the active grid item.
 *
 * @see sources/win63_version/habbo/catalog/viewer/widgets/events/CatalogWidgetColoursEvent.as
 */
export class CatalogWidgetColoursEvent
{
    static readonly COLOUR_ARRAY: string = 'COLOUR_ARRAY';

    private _colours: number[];

    private _backgroundAssetName: string;

    private _colourAssetName: string;

    private _chosenColourAssetName: string;

    private _index: number;

    constructor(
        colours: number[],
        backgroundAssetName: string,
        colourAssetName: string,
        chosenColourAssetName: string,
        index: number = 0
    )
    {
        this._colours = colours;
        this._backgroundAssetName = backgroundAssetName;
        this._colourAssetName = colourAssetName;
        this._chosenColourAssetName = chosenColourAssetName;
        this._index = index;
    }

    get type(): string
    {
        return CatalogWidgetColoursEvent.COLOUR_ARRAY;
    }

    get colours(): number[]
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

    get index(): number
    {
        return this._index;
    }
}
