import type {IDisposable} from '@core/runtime/IDisposable';
import type {IRegionWindow} from '@core/window/components/IRegionWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {SpecialItemsView} from '../SpecialItemsView';

/**
 * One dot in the carousel's page strip. Clicking it rotates to that item.
 *
 * Selected state is nothing but a swapped asset — `progress_disk_etched_on` / `_off` — so the strip
 * has no state of its own beyond which dot was told it is current.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/special_items_display/view/SpecialItemPageButtonView.as
 */
export class SpecialItemPageButtonView implements IDisposable
{
    /** Derived name — `_SafeStr_4550`: the carousel this dot navigates. */
    // AS3: SpecialItemPageButtonView.as::_SafeStr_4550
    private _view: SpecialItemsView | null;

    // AS3: SpecialItemPageButtonView.as::_window
    private _window: IRegionWindow | null;

    // AS3: SpecialItemPageButtonView.as::_index
    private _index: number;

    /** Derived name — `_SafeStr_7496`: whether this dot is the current one. */
    // AS3: SpecialItemPageButtonView.as::_SafeStr_7496
    private _selected: boolean = false;

    // AS3: SpecialItemPageButtonView.as::_disposed
    private _disposed: boolean = false;

    // AS3: SpecialItemPageButtonView.as::SpecialItemPageButtonView()
    constructor(view: SpecialItemsView, index: number)
    {
        this._index = index;
        this._view = view;
        this._window = view.pageTemplate?.clone() as unknown as IRegionWindow | null ?? null;

        this._window?.addEventListener('WME_CLICK', this.onClick);

        this.selected = false;
    }

    // AS3: SpecialItemPageButtonView.as::onClick()
    private onClick = (): void =>
    {
        this._view?.navigateTo(this._index);
    };

    // AS3: SpecialItemPageButtonView.as::set selected()
    set selected(value: boolean)
    {
        this._selected = value;

        const image = this.pageImage;

        if(image !== null) image.assetUri = `progress_disk_etched_${this._selected ? 'on' : 'off'}`;
    }

    // AS3: SpecialItemPageButtonView.as::get window()
    get window(): IRegionWindow | null
    {
        return this._window;
    }

    // AS3: SpecialItemPageButtonView.as::get pageImage()
    private get pageImage(): IStaticBitmapWrapperWindow | null
    {
        return this._window?.findChildByName('page_image') as unknown as IStaticBitmapWrapperWindow | null ?? null;
    }

    // AS3: SpecialItemPageButtonView.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: SpecialItemPageButtonView.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this._window?.dispose();
        this._window = null;
        this._view = null;
        this._disposed = true;
    }
}
