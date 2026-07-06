import type {ExtraInfoItemData} from '../bundlepurchaseinfodisplay/ExtraInfoItemData';

/**
 * Drives BundlePurchaseExtraInfoWidget's promo/discount/bonus-badge display row.
 *
 * @see sources/win63_version/habbo/catalog/viewer/widgets/events/CatalogWidgetBundleDisplayExtraInfoEvent.as
 */
export class CatalogWidgetBundleDisplayExtraInfoEvent
{
    static readonly RESET: string = 'CWPPEIE_RESET';

    static readonly HIDE: string = 'CWPPEIE_HIDE';

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

    get data(): ExtraInfoItemData | null
    {
        return this._data;
    }

    get id(): number
    {
        return this._id;
    }
}
