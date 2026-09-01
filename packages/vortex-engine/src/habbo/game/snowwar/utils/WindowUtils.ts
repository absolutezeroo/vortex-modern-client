import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IItemGridWindow} from '@core/window/components/IItemGridWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {IDisplayObjectWrapper} from '@core/window/components/IDisplayObjectWrapper';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {PropertyStruct} from '@core/window/utils/PropertyStruct';
import {drawIntoBitmapSlot} from '@core/utils/BitmapSlot';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('habbo.game.snowwar.utils.WindowUtils');

/**
 * The window helpers every Snow War view shares, and the reason the snow-war layouts look the way
 * they do.
 *
 * Two conventions of those layouts live here and nowhere else:
 *
 * - **`<name>_stroke`** — a caption is drawn twice, once as an outline sibling named after the
 *   original with `_stroke` appended. `setCaption()`, `showElement()` and `hideElement()` all keep
 *   the pair in step, which is why nothing in the views ever touches a stroke by name.
 * - **the `bitmap` and `stroke` tags** — `createWindow()` walks every child tagged `bitmap` and
 *   fills it from the `bitmap_asset_name` property the layout carries, so a view never loads its
 *   own icons; `colorStrokes()` recolours everything tagged `stroke` at depth 10.
 *
 * `HabboGameManager` calls `init()` the moment the window manager resolves, and nothing here works
 * before that — `createWindow()` returns null rather than throwing, exactly as AS3 does.
 *
 * Not to be confused with `core/window/utils/WindowUtils.as`, a different class of the same name.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/utils/WindowUtils.as
 */
export class WindowUtils
{
    // AS3: WindowUtils.as::_assets
    private static _assets: IAssetLibrary | null = null;

    // AS3: WindowUtils.as::_windowManager
    private static _windowManager: IHabboWindowManager | null = null;

    // AS3: WindowUtils.as::init()
    public static init(assets: IAssetLibrary | null, windowManager: IHabboWindowManager | null): void
    {
        WindowUtils._assets = assets;
        WindowUtils._windowManager = windowManager;
    }

    /**
     * Sets a caption and mirrors it onto the `_stroke` twin, wherever the twin lives — a plain
     * container child, a list item or a grid item.
     */
    // AS3: WindowUtils.as::setCaption()
    public static setCaption(window: IWindow | null, caption: string): void
    {
        if(!window) return;

        window.caption = caption;

        const parent = window.parent;
        let stroke: IWindow | null = null;

        if(WindowUtils.isWindowContainer(parent))
        {
            stroke = parent.findChildByName(window.name + '_stroke');
        }

        if(WindowUtils.isItemListWindow(parent))
        {
            stroke = parent.getListItemByName(window.name + '_stroke');
        }

        if(WindowUtils.isItemGridWindow(parent))
        {
            stroke = parent.getGridItemByName(window.name + '_stroke');
        }

        if(stroke)
        {
            if(stroke.caption !== caption)
            {
                stroke.caption = caption;
            }
        }
    }

    /**
     * Centres an image in a window, with an optional height override and offset.
     *
     * AS3 keeps a mutable `BitmapData` on the wrapper and only reallocates it when there is none or
     * when the height is overridden; `ImageBitmap` is immutable here, so every call composes a
     * fresh slot. The result is the same surface — slot-sized, transparent, source drawn at the
     * centring term plus the offset — and the source is left open for the caller, since it is
     * usually an asset-library bitmap that outlives this call.
     */
    // AS3: WindowUtils.as::setElementImage()
    public static setElementImage(
        window: IWindow | null,
        bitmap: ImageBitmap | null,
        height: number = 0,
        offsetX: number = 0,
        offsetY: number = 0
    ): void
    {
        if(bitmap === null) return;
        if(window === null) return;
        if(window.disposed) return;

        const slotHeight = height > 0 ? height : window.height;

        if(WindowUtils.isBitmapWrapperWindow(window))
        {
            window.bitmap = drawIntoBitmapSlot(bitmap, window.width, slotHeight, false, offsetX, offsetY);
            window.invalidate();
        }
        else if(WindowUtils.isDisplayObjectWrapper(window))
        {
            window.setDisplayObject(bitmap);
        }
    }

    /**
     * Builds a snow-war layout by asset name and pre-fills every child tagged `bitmap`.
     *
     * The `IItemGridWindow` branch is empty in AS3 too — a grid-rooted layout gets built and its
     * bitmaps stay unfilled.
     */
    // AS3: WindowUtils.as::createWindow()
    public static createWindow(assetName: string, layer: number = 2): IWindow | null
    {
        log.debug(`CreateWindow: ${assetName}`);

        if(!WindowUtils._assets || !WindowUtils._windowManager)
        {
            return null;
        }

        const xml = WindowUtils._assets.getAssetByName(assetName)?.content ?? null;

        if(xml === null)
        {
            log.warn(`CreateWindow() could not find the asset for window: ${assetName}`);

            return null;
        }

        const window = WindowUtils._windowManager.buildFromXML(xml as Document, layer);
        const bitmaps: IWindow[] = [];

        if(WindowUtils.isWindowContainer(window))
        {
            window.groupChildrenWithTag('bitmap', bitmaps, -1);
        }
        else if(WindowUtils.isItemListWindow(window))
        {
            window.groupListItemsWithTag('bitmap', bitmaps, -1);
        }

        for(const bitmap of bitmaps)
        {
            if(bitmap !== null && WindowUtils.isBitmapWrapperWindow(bitmap))
            {
                WindowUtils.setDefaultElementImage(bitmap, false);
            }
        }

        return window;
    }

    /**
     * Fills one bitmap window from the `bitmap_asset_name` its layout carries.
     *
     * `active` strips the `_on` suffix off that name, so a layout can declare the lit variant and
     * ask for the unlit one — note that this is the way round AS3 wrote it, and it means the
     * *active* call site gets the plain asset.
     */
    // AS3: WindowUtils.as::setDefaultElementImage()
    private static setDefaultElementImage(window: IBitmapWrapperWindow | null, active: boolean): void
    {
        if(!WindowUtils._assets) return;
        if(window === null) return;

        const named = window.properties.filter((property) => (property as PropertyStruct).key === 'bitmap_asset_name');

        if(!named.length) return;

        let assetName = (named[0] as PropertyStruct).value as string;

        log.debug(`Found Image: ${window.name} : ${assetName}`);

        if(active)
        {
            assetName = assetName.replace('_on', '');
        }

        const source = (WindowUtils._assets.getAssetByName(assetName)?.content ?? null) as ImageBitmap | null;

        if(source === null) return;

        window.bitmap = drawIntoBitmapSlot(source, window.width, window.height, false);
    }

    // AS3: WindowUtils.as::hideElement()
    public static hideElement(container: IWindowContainer | null, name: string): void
    {
        if(!container) return;

        const window = container.findChildByName(name);

        if(window)
        {
            window.visible = false;
        }

        const stroke = container.findChildByName(name + '_stroke');

        if(stroke)
        {
            stroke.visible = false;
        }
    }

    // AS3: WindowUtils.as::showElement()
    public static showElement(container: IWindowContainer | null, name: string): void
    {
        if(!container) return;

        const window = container.findChildByName(name);

        if(window)
        {
            window.visible = true;
        }

        const stroke = container.findChildByName(name + '_stroke');

        if(stroke)
        {
            stroke.visible = true;
        }
    }

    /** Recolours every text window tagged `stroke`, down ten levels. */
    // AS3: WindowUtils.as::colorStrokes()
    public static colorStrokes(window: IWindow | null, color: number): void
    {
        const strokes: IWindow[] = [];

        if(WindowUtils.isWindowContainer(window))
        {
            window.groupChildrenWithTag('stroke', strokes, 10);
        }
        else if(WindowUtils.isItemListWindow(window))
        {
            window.groupListItemsWithTag('stroke', strokes, 10);
        }

        for(const stroke of strokes)
        {
            if(stroke !== null && WindowUtils.isTextWindow(stroke))
            {
                stroke.textColor = color;
            }
        }
    }

    // TS-only: AS3's `is` operator. The port has interfaces only, so each check is by member.
    private static isWindowContainer(target: unknown): target is IWindowContainer
    {
        return !!target && typeof (target as IWindowContainer).findChildByName === 'function';
    }

    // TS-only: AS3's `is` operator.
    private static isItemListWindow(target: unknown): target is IItemListWindow
    {
        return !!target && typeof (target as IItemListWindow).getListItemByName === 'function';
    }

    // TS-only: AS3's `is` operator.
    private static isItemGridWindow(target: unknown): target is IItemGridWindow
    {
        return !!target && typeof (target as IItemGridWindow).getGridItemByName === 'function';
    }

    // TS-only: AS3's `is` operator.
    private static isBitmapWrapperWindow(target: unknown): target is IBitmapWrapperWindow
    {
        return !!target && 'bitmap' in (target as IBitmapWrapperWindow);
    }

    // TS-only: AS3's `is` operator.
    private static isDisplayObjectWrapper(target: unknown): target is IDisplayObjectWrapper
    {
        return !!target && typeof (target as IDisplayObjectWrapper).setDisplayObject === 'function';
    }

    // TS-only: AS3 assigns `textColor` on an untyped `*`; the port needs the member to exist.
    private static isTextWindow(target: unknown): target is ITextWindow
    {
        return !!target && 'textColor' in (target as ITextWindow);
    }
}
