import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {BundlePurchaseExtraInfoWidget} from '../BundlePurchaseExtraInfoWidget';
import type {ExtraInfoItemData} from './ExtraInfoItemData';

/**
 * Base class for a single row rendered inside BundlePurchaseExtraInfoWidget's overlay stack.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoListItem.as
 */
export class ExtraInfoListItem implements IDisposable
{
    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoListItem.as::ALIGN_TOP
    static readonly ALIGN_TOP: number = 0;

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoListItem.as::ALIGN_BOTTOM
    static readonly ALIGN_BOTTOM: number = 1;

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoListItem.as::ALIGN_OVERLAY
    static readonly ALIGN_OVERLAY: number = 2;

    private _id: number;

    private _data: ExtraInfoItemData;

    private _alignment: number;

    private _alwaysOnTop: boolean;

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoListItem.as::_disposed
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

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoListItem.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoListItem.as::dispose()
    dispose(): void
    {
        this._disposed = true;
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoListItem.as::get id()
    get id(): number
    {
        return this._id;
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoListItem.as::set id()
    set id(value: number)
    {
        this._id = value;
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoListItem.as::get data()
    get data(): ExtraInfoItemData
    {
        return this._data;
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoListItem.as::set data()
    set data(value: ExtraInfoItemData)
    {
        this._data = value;
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoListItem.as::get alignment()
    get alignment(): number
    {
        return this._alignment;
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoListItem.as::get alwaysOnTop()
    get alwaysOnTop(): boolean
    {
        return this._alwaysOnTop;
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoListItem.as::get creationSeconds()
    get creationSeconds(): number
    {
        return this._creationSeconds;
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoListItem.as::set creationSeconds()
    set creationSeconds(value: number)
    {
        this._creationSeconds = value;
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoListItem.as::get isItemRemoved()
    get isItemRemoved(): boolean
    {
        return this._isItemRemoved;
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoListItem.as::get removalSeconds()
    get removalSeconds(): number
    {
        return this._removalSeconds;
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoListItem.as::set removalSeconds()
    set removalSeconds(value: number)
    {
        this._removalSeconds = value;
        this._isItemRemoved = true;
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoListItem.as::getRenderedWindow()
    getRenderedWindow(): IWindowContainer | null
    {
        return null;
    }
}
