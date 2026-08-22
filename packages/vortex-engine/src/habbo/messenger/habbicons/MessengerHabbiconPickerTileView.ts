/**
 * MessengerHabbiconPickerTileView — one 45px slot in a picker section's grid.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPickerTileView.as
 *
 * A tile with no entry is a filler: the grid is always padded to a whole number of rows, so the
 * last row keeps its shape. Filler tiles get the dimmer background, no tooltip, no listeners, and a
 * mouse threshold of 10 so a drag across them does not read as a click.
 *
 * Shift-clicking keeps the picker open (the callback's second argument), which is how several
 * habbicons are inserted in a row.
 *
 * Field names are DERIVED: habbicons postdate the 2016 PRODUCTION tree entirely, so there is no
 * unobfuscated build to recover `_SafeStr_7074`/`_SafeStr_5662`/`_SafeStr_5196`/`_SafeStr_6410`
 * from. Each is named for what its only uses do with it.
 */
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {IInteractiveWindow} from '@core/window/components/IInteractiveWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import {HabbiconAssetManager} from '@habbo/habbicons/assets/HabbiconAssetManager';
import type {MessengerHabbiconPickerEntry} from './MessengerHabbiconPickerEntry';

/**
 * AS3 fills a transparent 40x40 `BitmapData` while the habbicon spritesheet is still loading, so
 * the slot holds its size. `createImageBitmap` is async, so this port builds that placeholder once
 * and shares it rather than allocating one per tile.
 */
// TS-only: the async equivalent of AS3's `new BitmapData(40, 40, true, 0)`.
let blankPreview: Promise<ImageBitmap> | null = null;

// TS-only: see `blankPreview`.
function getBlankPreview(): Promise<ImageBitmap>
{
    if(blankPreview === null)
    {
        const canvas = new OffscreenCanvas(40, 40);

        // The context has to be taken before `createImageBitmap`: an OffscreenCanvas that has never
        // had one is unallocated, and the call fails with "The ImageBitmap could not be allocated"
        // for every tile.
        canvas.getContext('2d');

        blankPreview = createImageBitmap(canvas);
    }

    return blankPreview;
}

export class MessengerHabbiconPickerTileView
{
    /**
    * AS3's `uint` literals: 0xFFFFFFFF, 0xFFDDDDDD and 0xFFEEEEEE.
    */
    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPickerTileView.as::SLOT_FILLED_COLOR
    private static readonly SLOT_FILLED_COLOR: number = 0xFFFFFFFF;

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPickerTileView.as::SLOT_EMPTY_COLOR
    private static readonly SLOT_EMPTY_COLOR: number = 0xFFDDDDDD;

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPickerTileView.as::SLOT_FILLED_HOVER_COLOR
    private static readonly SLOT_FILLED_HOVER_COLOR: number = 0xFFEEEEEE;

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPickerTileView.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPickerTileView.as::_entry
    private _entry: MessengerHabbiconPickerEntry | null = null;

    /** Derived name — `_SafeStr_7074`: the picker's `onHabbiconSelected(id, keepOpen)`. */
    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPickerTileView.as::_SafeStr_7074
    private _onSelected: ((habbiconId: number, keepOpen: boolean) => void) | null = null;

    /** Derived name — `_SafeStr_5662`: the picker's wheel forwarder. */
    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPickerTileView.as::_SafeStr_5662
    private _onWheel: ((event: WindowMouseEvent) => void) | null = null;

    /** Derived name — `_SafeStr_5196`: the "1" badge on a habbicon the user has not seen yet. */
    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPickerTileView.as::_SafeStr_5196
    private _unseenCounter: IWindowContainer | null = null;

    /** Derived name — `_SafeStr_6410`: whether this tile is subscribed to the asset-load event. */
    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPickerTileView.as::_SafeStr_6410
    private _waitingForAssets: boolean = false;

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPickerTileView.as::_disposed
    private _disposed: boolean = false;

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPickerTileView.as::MessengerHabbiconPickerTileView()
    constructor(
        template: IWindowContainer,
        entry: MessengerHabbiconPickerEntry | null,
        onSelected: ((habbiconId: number, keepOpen: boolean) => void) | null,
        windowManager: IHabboWindowManager | null,
        isUnseen: ((habbiconId: number) => boolean) | null,
        onWheel: ((event: WindowMouseEvent) => void) | null
    )
    {
        this._window = template.clone() as IWindowContainer;
        this._entry = entry;
        this._onSelected = onSelected;
        this._onWheel = onWheel;

        this.addWheelListener(this._window);
        this.addWheelListener(this.background);
        this.addWheelListener(this.bitmap);

        const filled = entry !== null;
        const background = this.background;

        if(background)
        {
            background.color = filled ? MessengerHabbiconPickerTileView.SLOT_FILLED_COLOR : MessengerHabbiconPickerTileView.SLOT_EMPTY_COLOR;
            background.blend = filled ? 0.85 : 0.4;
        }

        this._window.mouseThreshold = filled ? 0 : 10;
        (this._window as unknown as IInteractiveWindow).toolTipCaption = filled ? entry!.name : '';

        if(entry === null)
        {
            const bitmap = this.bitmap;

            if(bitmap) (bitmap as unknown as IWindow).visible = false;

            return;
        }

        this._window.addEventListener('WME_CLICK', this.onClicked);
        this._window.addEventListener('WME_OVER', this.onHovered);
        this._window.addEventListener('WME_OUT', this.onOut);

        this.refreshBitmap();
        this.addUnseenCounter(windowManager, isUnseen);
    }

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPickerTileView.as::get window()
    public get window(): IWindowContainer | null
    {
        return this._window;
    }

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPickerTileView.as::clearUnseenCounterForHabbicon()
    public clearUnseenCounterForHabbicon(habbiconId: number): void
    {
        if(this._entry !== null && this._entry.habbiconId === habbiconId)
        {
            this.removeUnseenCounter();
        }
    }

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPickerTileView.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    /**
     * The preview comes straight out of the asset manager's cache. If the spritesheet has not
     * landed yet the tile shows the blank placeholder and subscribes once — the event fires for
     * every waiting tile at the same time.
     */
    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPickerTileView.as::refreshBitmap()
    private refreshBitmap(): void
    {
        this.clearBitmap();

        const bitmap = this.bitmap;

        if(!bitmap || this._entry === null) return;

        const preview = HabbiconAssetManager.getPreviewBitmap(this._entry.habbiconId, false);

        if(preview === null)
        {
            void getBlankPreview().then((blank) =>
            {
                if(this._disposed) return;

                const target = this.bitmap;

                if(!target) return;

                target.bitmap = blank;
                (target as unknown as IWindow).visible = true;
                (target as unknown as IWindow).invalidate();
            });

            if(!this._waitingForAssets)
            {
                HabbiconAssetManager.addEventListener(HabbiconAssetManager.ASSETS_LOADED, this.onAssetsLoaded);
                this._waitingForAssets = true;
            }

            return;
        }

        // AS3 hands over `preview.clone()`. `createImageBitmap` is async and cannot reproduce that
        // synchronously, so this port shares the manager's cached bitmap — the deviation
        // `HabbiconSetRailRowView` already documents, and the reason `clearBitmap()` below must
        // never close it.
        bitmap.bitmap = preview;
        (bitmap as unknown as IWindow).visible = true;
        (bitmap as unknown as IWindow).invalidate();
    }

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPickerTileView.as::addUnseenCounter()
    private addUnseenCounter(
        windowManager: IHabboWindowManager | null,
        isUnseen: ((habbiconId: number) => boolean) | null
    ): void
    {
        if(windowManager === null || isUnseen === null || this._entry === null) return;

        if(!isUnseen(this._entry.habbiconId)) return;

        this._unseenCounter = windowManager.createUnseenItemCounter();

        if(this._unseenCounter === null || this._window === null) return;

        const count = this._unseenCounter.findChildByName('count') as ITextWindow | null;

        if(count !== null)
        {
            count.caption = '1';
        }

        this._unseenCounter.x = this._window.width - this._unseenCounter.width - 1;
        this._unseenCounter.y = 1;

        this._window.addChild(this._unseenCounter);
    }

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPickerTileView.as::removeUnseenCounter()
    private removeUnseenCounter(): void
    {
        if(this._unseenCounter === null) return;

        if(this._unseenCounter.parent !== null)
        {
            (this._unseenCounter.parent as IWindowContainer).removeChild(this._unseenCounter);
        }

        this._unseenCounter.dispose();
        this._unseenCounter = null;
    }

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPickerTileView.as::onAssetsLoaded()
    private onAssetsLoaded = (): void =>
    {
        HabbiconAssetManager.removeEventListener(HabbiconAssetManager.ASSETS_LOADED, this.onAssetsLoaded);
        this._waitingForAssets = false;

        if(!this._disposed)
        {
            this.refreshBitmap();
        }
    };

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPickerTileView.as::onClicked()
    private onClicked = (event: WindowMouseEvent): void =>
    {
        if(this._onSelected !== null && this._entry !== null)
        {
            this._onSelected(this._entry.habbiconId, event.shiftKey);
        }
    };

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPickerTileView.as::onHovered()
    private onHovered = (): void =>
    {
        const background = this.background;

        if(background) background.color = MessengerHabbiconPickerTileView.SLOT_FILLED_HOVER_COLOR;
    };

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPickerTileView.as::onOut()
    private onOut = (): void =>
    {
        const background = this.background;

        if(background) background.color = MessengerHabbiconPickerTileView.SLOT_FILLED_COLOR;
    };

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPickerTileView.as::addWheelListener()
    private addWheelListener(window: IWindow | null): void
    {
        if(window === null || this._onWheel === null) return;

        window.addEventListener('WME_WHEEL', this._onWheel);
        window.addEventListener('WME_WHEEL_HORIZONTAL', this._onWheel);
    }

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPickerTileView.as::removeWheelListener()
    private removeWheelListener(window: IWindow | null): void
    {
        if(window === null || this._onWheel === null) return;

        window.removeEventListener('WME_WHEEL', this._onWheel);
        window.removeEventListener('WME_WHEEL_HORIZONTAL', this._onWheel);
    }

    /**
     * AS3 calls `bitmap.dispose()` here, which it can because it handed the window a *clone*. This
     * port hands over the asset manager's cached preview (see `refreshBitmap()`), so closing it
     * would destroy the copy every other tile is drawing from. Dropping the reference is what the
     * rest of the habbicon views do.
     */
    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPickerTileView.as::clearBitmap()
    private clearBitmap(): void
    {
        const bitmap = this.bitmap;

        if(bitmap !== null && bitmap.bitmap !== null)
        {
            bitmap.bitmap = null;
        }
    }

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPickerTileView.as::get bitmap()
    private get bitmap(): IBitmapWrapperWindow | null
    {
        return (this._window?.findChildByName('habbicon_icon') ?? null) as IBitmapWrapperWindow | null;
    }

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPickerTileView.as::get background()
    private get background(): IWindowContainer | null
    {
        return (this._window?.findChildByName('habbicon_item_bg') ?? null) as IWindowContainer | null;
    }

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPickerTileView.as::dispose()
    public dispose(): void
    {
        if(this._disposed) return;

        if(this._waitingForAssets)
        {
            HabbiconAssetManager.removeEventListener(HabbiconAssetManager.ASSETS_LOADED, this.onAssetsLoaded);
            this._waitingForAssets = false;
        }

        if(this._window !== null)
        {
            if(this._window.parent !== null)
            {
                (this._window.parent as IWindowContainer).removeChild(this._window);
            }

            this.removeWheelListener(this._window);
            this.removeWheelListener(this.background);
            this.removeWheelListener(this.bitmap);

            this._window.removeEventListener('WME_CLICK', this.onClicked);
            this._window.removeEventListener('WME_OVER', this.onHovered);
            this._window.removeEventListener('WME_OUT', this.onOut);

            this.removeUnseenCounter();
            this.clearBitmap();

            this._window.dispose();
            this._window = null;
        }

        this._entry = null;
        this._onSelected = null;
        this._onWheel = null;
        this._disposed = true;
    }
}
