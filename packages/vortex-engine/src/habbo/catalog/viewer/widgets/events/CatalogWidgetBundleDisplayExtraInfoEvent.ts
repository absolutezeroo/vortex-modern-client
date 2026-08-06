import type {ExtraInfoItemData} from '../bundlepurchaseinfodisplay/ExtraInfoItemData';

/**
 * Drives BundlePurchaseExtraInfoWidget's promo/discount/bonus-badge display row.
 *
 * @see sources/win63_version/habbo/catalog/viewer/widgets/events/CatalogWidgetBundleDisplayExtraInfoEvent.as
 */
export class CatalogWidgetBundleDisplayExtraInfoEvent
{
    // AS3: sources/win63_version/habbo/catalog/viewer/widgets/events/CatalogWidgetBundleDisplayExtraInfoEvent.as::RESET
    static readonly RESET: string = 'CWPPEIE_RESET';

    // AS3: sources/win63_version/habbo/catalog/viewer/widgets/events/CatalogWidgetBundleDisplayExtraInfoEvent.as::HIDE
    static readonly HIDE: string = 'CWPPEIE_HIDE';

    // AS3: sources/win63_version/habbo/catalog/viewer/widgets/events/CatalogWidgetBundleDisplayExtraInfoEvent.as::ITEM_CLICKED
    static readonly ITEM_CLICKED: string = 'CWPPEIE_ITEM_CLICKED';

    private _type: string;

    private _data: ExtraInfoItemData | null;

    private _id: number;

    constructor(type: string, data: ExtraInfoItemData | null = null, id: number = -1)
    {
        this._type = type;
        this._data = data;
        this._id = id;
    }

    get type(): string
    {
        return this._type;
    }

    // AS3: sources/win63_version/habbo/catalog/viewer/widgets/events/CatalogWidgetBundleDisplayExtraInfoEvent.as::get data()
    get data(): ExtraInfoItemData | null
    {
        return this._data;
    }

    // AS3: sources/win63_version/habbo/catalog/viewer/widgets/events/CatalogWidgetBundleDisplayExtraInfoEvent.as::get id()
    get id(): number
    {
        return this._id;
    }
}
