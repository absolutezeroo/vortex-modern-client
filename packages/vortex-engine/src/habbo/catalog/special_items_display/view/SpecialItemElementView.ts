import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {ProductImageWidget} from '@habbo/window/widgets/ProductImageWidget';
import type {ISpecialItem} from '../model/ISpecialItem';
import type {SpecialItemsView} from '../SpecialItemsView';

/**
 * One item on the carousel, positioned on an ellipse by its distance from the current rotation.
 *
 * The maths is a circle read as a horizon: the item's offset from the focused index becomes an
 * angle, and the sine and cosine of that angle become the x and y of a point in 0..1, which is then
 * scaled onto the display. **`y` doubles as depth** — it drives the blend, so an item at the back of
 * the ellipse fades out while one at the front is opaque.
 *
 * Two details that look arbitrary and are not: the offset is compared against ±one full set so the
 * carousel wraps by the *short* way round, and blend is only written when it moves by more than
 * 0.05 (or crosses fully on/off), because assigning it every frame on every item is what would make
 * this expensive.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/special_items_display/view/SpecialItemElementView.as
 */
export class SpecialItemElementView implements IDisposable
{
    /** Below this much change, the blend is left alone. */
    // AS3: SpecialItemElementView.as::BLEND_BUFFERING
    private static readonly BLEND_BUFFERING: number = 0.05;

    /** Derived name — `_SafeStr_4550`: the carousel this element belongs to. */
    // AS3: SpecialItemElementView.as::_SafeStr_4550
    private _view: SpecialItemsView | null;

    // AS3: SpecialItemElementView.as::_window
    private _window: IWidgetWindow | null;

    /** Derived name — `_SafeStr_4718`: the item being displayed. */
    // AS3: SpecialItemElementView.as::_SafeStr_4718
    private _item: ISpecialItem;

    /** Derived name — `_SafeStr_7902`: 1 when centred, falling to 0 half an index away. */
    // AS3: SpecialItemElementView.as::_SafeStr_7902
    private _focusValue: number = 0;

    // AS3: SpecialItemElementView.as::_point
    private _point: {x: number; y: number} = {x: 0, y: 0};

    // AS3: SpecialItemElementView.as::_disposed
    private _disposed: boolean = false;

    // AS3: SpecialItemElementView.as::SpecialItemElementView()
    constructor(view: SpecialItemsView, item: ISpecialItem)
    {
        this._item = item;
        this._view = view;
        this._window = view.productDisplayTemplate?.clone() as unknown as IWidgetWindow | null ?? null;

        const widget = this._window?.widget as unknown as ProductImageWidget | null ?? null;

        if(widget !== null)
        {
            widget.productInfo = item;

            // 7 is the pivot the carousel draws from; AS3 writes the number, not a named constant.
            widget.pivot = 7;
        }
    }

    // AS3: SpecialItemElementView.as::updateRotation()
    updateRotation(rotation: number): void
    {
        this.updatePointAndFocus(rotation);

        if(this._window === null) return;

        this._window.x = Math.trunc(this._point.x * 216 - 80 + 42);
        this._window.y = Math.trunc(this._point.y * 73 - 113);

        const widget = this._window.widget as unknown as ProductImageWidget | null ?? null;

        if(widget === null) return;

        let blend = this._point.y;

        // A short set never fades fully: with four items or fewer there is no "back" to hide in.
        if((this._view?.totalElements ?? 0) <= 4) blend = Math.max(0.25, blend);
        else if(blend < SpecialItemElementView.BLEND_BUFFERING) blend = 0;

        blend = Math.min(blend, 1);

        const changed = Math.abs(widget.blend - blend) > SpecialItemElementView.BLEND_BUFFERING
            || (blend === 0 && widget.blend !== 0)
            || (blend === 1 && widget.blend !== 1);

        if(changed) widget.blend = blend;
    }

    /**
     * AS3: SpecialItemElementView.as::updatePointAndFocus()
     *
     * Picks the shortest way round the carousel, turns the remaining offset into an angle clamped to
     * a half turn either side, and reads the ellipse off its sine and cosine.
     */
    // AS3: SpecialItemElementView.as::updatePointAndFocus()
    private updatePointAndFocus(rotation: number): void
    {
        const total = this._view?.totalElements ?? 0;

        let offset = this._item.index - rotation;
        const wrappedForward = offset + total;
        const wrappedBack = offset - total;

        if(Math.abs(wrappedForward) < Math.abs(offset)) offset = wrappedForward;
        else if(Math.abs(wrappedBack) < Math.abs(offset)) offset = wrappedBack;

        this._focusValue = 0;

        if(Math.abs(offset) < 0.5) this._focusValue = 1 - Math.abs(offset) * 2;

        const degrees = Math.min(Math.max(180 + 90 * offset, 0), 360);
        const radians = (degrees * Math.PI) / 180;

        this._point = {
            x: 0.5 - 0.5 * Math.sin(radians),
            y: 0.5 - 0.5 * Math.cos(radians),
        };
    }

    // AS3: SpecialItemElementView.as::get focusValue()
    get focusValue(): number
    {
        return this._focusValue;
    }

    // AS3: SpecialItemElementView.as::get item()
    get item(): ISpecialItem
    {
        return this._item;
    }

    // AS3: SpecialItemElementView.as::get window()
    get window(): IWidgetWindow | null
    {
        return this._window;
    }

    // AS3: SpecialItemElementView.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: SpecialItemElementView.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this._window?.dispose();
        this._window = null;
        this._view = null;
        this._disposed = true;
    }
}
