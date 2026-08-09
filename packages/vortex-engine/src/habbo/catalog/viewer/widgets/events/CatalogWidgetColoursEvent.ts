/**
 * Fired on the widget event bus to populate a colour-swatch selector for the active grid item.
 *
 * @see sources/win63_version/habbo/catalog/viewer/widgets/events/CatalogWidgetColoursEvent.as
 */
export class CatalogWidgetColoursEvent
{
    static readonly COLOUR_ARRAY: string = 'COLOUR_ARRAY';

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/events/CatalogWidgetColoursEvent.as::_colours
    private _colours: number[];

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/events/CatalogWidgetColoursEvent.as::_backgroundAssetName
    private _backgroundAssetName: string;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/events/CatalogWidgetColoursEvent.as::_colourAssetName
    private _colourAssetName: string;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/events/CatalogWidgetColoursEvent.as::_chosenColourAssetName
    private _chosenColourAssetName: string;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/events/CatalogWidgetColoursEvent.as::_index
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

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/events/CatalogWidgetColoursEvent.as::get colours()
    get colours(): number[]
    {
        return this._colours;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/events/CatalogWidgetColoursEvent.as::get backgroundAssetName()
    get backgroundAssetName(): string
    {
        return this._backgroundAssetName;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/events/CatalogWidgetColoursEvent.as::get colourAssetName()
    get colourAssetName(): string
    {
        return this._colourAssetName;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/events/CatalogWidgetColoursEvent.as::get chosenColourAssetName()
    get chosenColourAssetName(): string
    {
        return this._chosenColourAssetName;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/events/CatalogWidgetColoursEvent.as::get index()
    get index(): number
    {
        return this._index;
    }
}
