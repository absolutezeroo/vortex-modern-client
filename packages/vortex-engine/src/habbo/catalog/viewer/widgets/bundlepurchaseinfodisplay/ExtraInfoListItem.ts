import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {BundlePurchaseExtraInfoWidget} from '../BundlePurchaseExtraInfoWidget';
import type {ExtraInfoItemData} from './ExtraInfoItemData';

/**
 * Base class for a single row rendered inside BundlePurchaseExtraInfoWidget's overlay stack.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoListItem.as
 */
export class ExtraInfoListItem implements IDisposable
{
    static readonly ALIGN_TOP: number = 0;

    static readonly ALIGN_BOTTOM: number = 1;

    static readonly ALIGN_OVERLAY: number = 2;

    private _id: number;

    private _data: ExtraInfoItemData;

    private _alignment: number;

    private _alwaysOnTop: boolean;

    private _disposed: boolean = false;

    private _creationSeconds: number = 0;

    private _removalSeconds: number = 0;

    private _isItemRemoved: boolean = false;

    // AS3 accepts the owning widget as its first constructor param but never stores it at this
    // level - only subclasses that actually need it (e.g. ExtraInfoPromoItem) keep a reference.
    constructor(
        _widget: BundlePurchaseExtraInfoWidget | null,
        id: number,
        data: ExtraInfoItemData,
        alignment: number = 0,
        alwaysOnTop: boolean = false
    )
    {
        this._id = id;
        this._data = data;
        this._alignment = alignment;
        this._alwaysOnTop = alwaysOnTop;
    }

    get disposed(): boolean
    {
        return this._disposed;
    }

    dispose(): void
    {
        this._disposed = true;
    }

    get id(): number
    {
        return this._id;
    }

    set id(value: number)
    {
        this._id = value;
    }

    get data(): ExtraInfoItemData
    {
        return this._data;
    }

    set data(value: ExtraInfoItemData)
    {
        this._data = value;
    }

    get alignment(): number
    {
        return this._alignment;
    }

    get alwaysOnTop(): boolean
    {
        return this._alwaysOnTop;
    }

    get creationSeconds(): number
    {
        return this._creationSeconds;
    }

    set creationSeconds(value: number)
    {
        this._creationSeconds = value;
    }

    get isItemRemoved(): boolean
    {
        return this._isItemRemoved;
    }

    get removalSeconds(): number
    {
        return this._removalSeconds;
    }

    set removalSeconds(value: number)
    {
        this._removalSeconds = value;
        this._isItemRemoved = true;
    }

    getRenderedWindow(): IWindowContainer | null
    {
        return null;
    }
}
