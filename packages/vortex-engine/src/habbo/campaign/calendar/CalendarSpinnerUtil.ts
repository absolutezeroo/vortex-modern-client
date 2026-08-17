/**
 * CalendarSpinnerUtil — the two fade panels that dim the day strip either side of the selection.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/campaign/calendar/CalendarSpinnerUtil.as
 *
 * `gradient1` covers everything left of the selected cell and fades from 0.6 to 0.2 alpha; the
 * gradient2 panel covers everything right of it and runs the other way, so the selected day sits in
 * the one clear gap between them. Both are recomputed on every selection change because their
 * widths depend on the item list's scroll position.
 *
 * TS deviation, same one `MarketplaceChart` documents: AS3 fills a `flash.display.Sprite` and
 * snapshots it into a synchronously-returned `BitmapData`, and the browser has no synchronous
 * canvas → `ImageBitmap` path. `createGradients()` is therefore `async`, and its caller guards
 * against a selection that moved while the two bitmaps were being decoded.
 */
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {CalendarView} from './CalendarView';

export class CalendarSpinnerUtil
{
    /**
     * AS3's `0xF1020` — the same near-black navy the layout paints the window background with
     * (`0xff0e0f1f`). Written as components because a canvas gradient needs per-stop alpha.
     */
    // AS3: .../src/com/sulake/habbo/campaign/calendar/CalendarSpinnerUtil.as::createGradients()
    private static readonly FADE_RGB: string = '15, 16, 32';

    /**
     * `isStale` is TS-only and has no AS3 counterpart: both panels are measured and drawn before
     * either is applied, so a selection that moved while `createImageBitmap()` was decoding can
     * drop this pair whole rather than leave one stale panel next to one fresh one.
     */
    // AS3: .../src/com/sulake/habbo/campaign/calendar/CalendarSpinnerUtil.as::createGradients()
    public static async createGradients(
        view: CalendarView,
        selectedIndex: number,
        isStale: () => boolean = () => false
    ): Promise<void>
    {
        const window = view.window;
        const itemList = view.itemList;

        if(!window || !itemList) return;

        const height = itemList.height;

        const leftWidth = Math.max(
            1,
            view.calculateItemListWidth(selectedIndex) - itemList.scrollH * itemList.maxScrollH
        );
        const rightWidth = Math.max(1, view.scrollerWidth - (leftWidth + view.itemWidth + view.itemGap));

        const [leftBitmap, rightBitmap] = await Promise.all([
            CalendarSpinnerUtil.drawGradient(leftWidth, height, 0.6, 0.2),
            CalendarSpinnerUtil.drawGradient(rightWidth, height, 0.2, 0.6)
        ]);

        if(isStale())
        {
            leftBitmap.close();
            rightBitmap.close();

            return;
        }

        const left = window.findChildByName('gradient1') as IBitmapWrapperWindow | null;

        if(left) left.bitmap = leftBitmap;
        else leftBitmap.close();

        const right = window.findChildByName('gradient2') as IBitmapWrapperWindow | null;

        if(right)
        {
            right.x = view.scrollerWidth - rightWidth;
            right.bitmap = rightBitmap;
        }
        else
        {
            rightBitmap.close();
        }
    }

    /**
     * AS3's `createGradientBox(w, h)` with no rotation is a left-to-right box, and its two ratios
     * (0 and 255) are the full span — so this is a plain horizontal two-stop fill.
     */
    // TS-only: the canvas half of `createGradients()`, which AS3 does inline with Sprite.graphics.
    private static drawGradient(
        width: number,
        height: number,
        alphaFrom: number,
        alphaTo: number
    ): Promise<ImageBitmap>
    {
        const canvas = new OffscreenCanvas(Math.max(1, Math.round(width)), Math.max(1, Math.round(height)));
        const ctx = canvas.getContext('2d')!;

        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);

        gradient.addColorStop(0, `rgba(${CalendarSpinnerUtil.FADE_RGB}, ${alphaFrom})`);
        gradient.addColorStop(1, `rgba(${CalendarSpinnerUtil.FADE_RGB}, ${alphaTo})`);

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        return createImageBitmap(canvas);
    }
}
