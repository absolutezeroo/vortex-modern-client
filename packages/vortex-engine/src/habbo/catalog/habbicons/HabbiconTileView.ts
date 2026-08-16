import type {IDisposable} from '@core/runtime';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';

import type {HabbiconController} from './HabbiconController';
import type {HabbiconEntryModel} from './HabbiconEntryModel';
import {HabbiconAssetManager} from '@habbo/habbicons/assets/HabbiconAssetManager';

/**
 * One habbicon in a grid: its artwork, the little favourite/claimable badges, and a locked overlay
 * for anything the player does not hold.
 *
 * **Tiles are pooled, not created per refresh.** `claim()`/`release()` share one static stack across
 * every grid in the hub — the set page and both trays hand tiles back rather than disposing them, so
 * switching tabs does not rebuild a hundred windows. `recycle()` is what makes that safe: it clears
 * the model, the callback and the bitmap, so a released tile holds nothing.
 *
 * **A pooled tile keeps the template it was first cloned from.** `claim()` only uses its template
 * argument when the pool is empty, so a tile built for the set grid can be reused in a tray. Both
 * templates are the same layout, which is why this works.
 *
 * **Unowned habbicons are greyed by transforming the pixels, not by an overlay.** The transform runs
 * on a copy — the manager's cached preview must not be modified.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/habbicons/HabbiconTileView.as
 */
export class HabbiconTileView implements IDisposable
{
    // AS3: HabbiconTileView.as::_SafeStr_11060 (name derived: owned, idle — the base colour)
    private static readonly OWNED_BASE_IDLE: number = 12833703;

    // AS3: HabbiconTileView.as::OWNED_BASE_HOVER
    private static readonly OWNED_BASE_HOVER: number = 13492146;

    // AS3: HabbiconTileView.as::OWNED_BASE_ACTIVE
    private static readonly OWNED_BASE_ACTIVE: number = 13952185;

    // AS3: HabbiconTileView.as::_SafeStr_11007 (name derived: owned, idle — the outline colour)
    private static readonly OWNED_OUTLINE_IDLE: number = 10076534;

    // AS3: HabbiconTileView.as::OWNED_OUTLINE_HOVER
    private static readonly OWNED_OUTLINE_HOVER: number = 12376223;

    // AS3: HabbiconTileView.as::OWNED_OUTLINE_ACTIVE
    private static readonly OWNED_OUTLINE_ACTIVE: number = 13887677;

    // AS3: HabbiconTileView.as::NOT_OWNED_BASE_IDLE
    private static readonly NOT_OWNED_BASE_IDLE: number = 14735042;

    // AS3: HabbiconTileView.as::NOT_OWNED_BASE_HOVER
    private static readonly NOT_OWNED_BASE_HOVER: number = 15261385;

    // AS3: HabbiconTileView.as::NOT_OWNED_BASE_ACTIVE
    private static readonly NOT_OWNED_BASE_ACTIVE: number = 15458251;

    // AS3: HabbiconTileView.as::NOT_OWNED_OUTLINE_IDLE
    private static readonly NOT_OWNED_OUTLINE_IDLE: number = 13944493;

    // AS3: HabbiconTileView.as::NOT_OWNED_OUTLINE_HOVER
    private static readonly NOT_OWNED_OUTLINE_HOVER: number = 15129800;

    // AS3: HabbiconTileView.as::NOT_OWNED_OUTLINE_ACTIVE
    private static readonly NOT_OWNED_OUTLINE_ACTIVE: number = 15392717;

    // AS3: HabbiconTileView.as::_SafeStr_8264 (name derived: the shared tile pool)
    private static readonly POOL: HabbiconTileView[] = [];

    /**
	 * `ColorTransform(0.35, 0.35, 0.35, 0.65, 90, 85, 80, 0)` — multipliers then offsets, with alpha
	 * multiplied but not offset. On a canvas the same result comes from a `feColorMatrix`-style
	 * per-pixel pass; the offsets are 0-255 here as AS3 writes them.
	 */
    // AS3: HabbiconTileView.as::_SafeStr_9646 (name derived: the locked-tile transform)
    private static readonly LOCKED_TRANSFORM: readonly number[] = [0.35, 0.35, 0.35, 0.65, 90, 85, 80, 0];

    // AS3: HabbiconTileView.as::_window
    private _window: IWindowContainer | null;

    // AS3: HabbiconTileView.as::_SafeStr_4593 (name derived: the owning controller)
    private _controller: HabbiconController | null = null;

    // AS3: HabbiconTileView.as::_SafeStr_4718 (name derived: the habbicon shown)
    private _item: HabbiconEntryModel | null = null;

    // AS3: HabbiconTileView.as::_SafeStr_6330 (name derived: the click callback)
    private _onClick: ((tile: HabbiconTileView) => void) | null = null;

    // AS3: HabbiconTileView.as::_SafeStr_5943 (name derived: the pointer is over the tile)
    private _hover: boolean = false;

    // AS3: HabbiconTileView.as::_active
    private _active: boolean = false;

    // AS3: HabbiconTileView.as::_disposed
    private _disposed: boolean = false;

    // AS3: HabbiconTileView.as::HabbiconTileView()
    constructor(template: IWindowContainer)
    {
        this._window = template.clone() as IWindowContainer;

        this._window.addEventListener('WME_CLICK', this.onClicked);
        this._window.addEventListener('WME_OVER', this.onOver);
        this._window.addEventListener('WME_OUT', this.onOut);
    }

    // AS3: HabbiconTileView.as::claim()
    static claim(template: IWindowContainer): HabbiconTileView
    {
        const pooled = HabbiconTileView.POOL.pop();

        return pooled ?? new HabbiconTileView(template);
    }

    // AS3: HabbiconTileView.as::release()
    static release(tile: HabbiconTileView): void
    {
        tile.recycle();
        HabbiconTileView.POOL.push(tile);
    }

    // AS3: HabbiconTileView.as::initialize()
    initialize(
        controller: HabbiconController | null,
        item: HabbiconEntryModel,
        onClick: ((tile: HabbiconTileView) => void) | null
    ): void
    {
        this._controller = controller;
        this._onClick = onClick;

        if(this._window !== null) (this._window as unknown as IWindow).visible = true;

        this.refresh(item);
    }

    // AS3: HabbiconTileView.as::recycle()
    recycle(): void
    {
        this.detachFromParent();
        this.clearBitmap();

        this._controller = null;
        this._item = null;
        this._onClick = null;
        this._hover = false;
        this._active = false;

        if(this._window !== null) (this._window as unknown as IWindow).visible = false;

        const favorite = this.favoriteIcon;
        const claimable = this.claimableIcon;
        const locked = this.lockedOverlay;

        if(favorite !== null) favorite.visible = false;
        if(claimable !== null) claimable.visible = false;
        if(locked !== null) locked.visible = false;

        this.updateLook();
    }

    /**
	 * A habbicon with no artwork still gets a bitmap — a transparent 40×40 — so the grid keeps its
	 * shape while the sheets are still loading.
	 */
    // AS3: HabbiconTileView.as::refresh()
    refresh(item: HabbiconEntryModel): void
    {
        this._item = item;

        const preview = HabbiconAssetManager.getPreviewBitmap(item.habbiconId, false);
        const locked = !item.owned && !item.claimable;

        this.clearBitmap();

        const target = this.bitmap;

        if(target !== null)
        {
            target.bitmap = HabbiconTileView.prepareBitmap(preview, locked);
            (target as unknown as IWindow).invalidate();
        }

        const favorite = this.favoriteIcon;
        const claimable = this.claimableIcon;
        const overlay = this.lockedOverlay;

        if(favorite !== null) favorite.visible = item.owned && item.favorite;
        if(claimable !== null) claimable.visible = item.claimable && !item.owned;
        if(overlay !== null) overlay.visible = locked;

        this.updateLook();
    }

    /**
	 * AS3 clones the cached preview and calls `colorTransform` in place. Here the copy and the
	 * transform are the same canvas pass, which is why the unlocked path still redraws rather than
	 * handing the cached bitmap straight over — the tile owns and disposes what it is given.
	 */
    // AS3: HabbiconTileView.as::refresh() — the BitmapData.clone()/colorTransform() half
    private static prepareBitmap(source: ImageBitmap | null, locked: boolean): ImageBitmap | null
    {
        const width = source?.width ?? 40;
        const height = source?.height ?? 40;
        const canvas = new OffscreenCanvas(width, height);
        const context = canvas.getContext('2d', {willReadFrequently: locked});

        if(context === null) return null;

        if(source !== null) context.drawImage(source, 0, 0);

        if(!locked) return canvas.transferToImageBitmap();

        const image = context.getImageData(0, 0, width, height);
        const pixels = image.data;
        const [redMul, greenMul, blueMul, alphaMul, redOff, greenOff, blueOff, alphaOff] =
            HabbiconTileView.LOCKED_TRANSFORM;

        for(let i = 0; i < pixels.length; i += 4)
        {
            pixels[i] = Math.max(0, Math.min(255, pixels[i] * redMul + redOff));
            pixels[i + 1] = Math.max(0, Math.min(255, pixels[i + 1] * greenMul + greenOff));
            pixels[i + 2] = Math.max(0, Math.min(255, pixels[i + 2] * blueMul + blueOff));
            pixels[i + 3] = Math.max(0, Math.min(255, pixels[i + 3] * alphaMul + alphaOff));
        }

        context.putImageData(image, 0, 0);

        return canvas.transferToImageBitmap();
    }

    // AS3: HabbiconTileView.as::setActive()
    setActive(active: boolean): void
    {
        this._active = active;
        this.updateLook();
    }

    // AS3: HabbiconTileView.as::get window()
    get window(): IWindowContainer | null
    {
        return this._window;
    }

    // AS3: HabbiconTileView.as::get item()
    get item(): HabbiconEntryModel | null
    {
        return this._item;
    }

    // AS3: HabbiconTileView.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: HabbiconTileView.as::clearBitmap()
    private clearBitmap(): void
    {
        const target = this.bitmap;

        if(target === null || target.bitmap === null) return;

        target.bitmap.close();
        target.bitmap = null;
    }

    // TS-only: AS3 removes the window from `parent as IWindowContainer`; extracted, it is used twice.
    private detachFromParent(): void
    {
        const parent = (this._window as unknown as IWindow | null)?.parent ?? null;

        if(parent === null || this._window === null) return;

        (parent as unknown as IWindowContainer).removeChild(this._window as unknown as IWindow);
    }

    // AS3: HabbiconTileView.as::updateLook()
    private updateLook(): void
    {
        const owned = this._item !== null && this._item.owned;

        const baseIdle = owned ? HabbiconTileView.OWNED_BASE_IDLE : HabbiconTileView.NOT_OWNED_BASE_IDLE;
        const baseHover = owned ? HabbiconTileView.OWNED_BASE_HOVER : HabbiconTileView.NOT_OWNED_BASE_HOVER;
        const baseActive = owned ? HabbiconTileView.OWNED_BASE_ACTIVE : HabbiconTileView.NOT_OWNED_BASE_ACTIVE;
        const outlineIdle = owned ? HabbiconTileView.OWNED_OUTLINE_IDLE : HabbiconTileView.NOT_OWNED_OUTLINE_IDLE;
        const outlineHover = owned ? HabbiconTileView.OWNED_OUTLINE_HOVER : HabbiconTileView.NOT_OWNED_OUTLINE_HOVER;
        const outlineActive = owned ? HabbiconTileView.OWNED_OUTLINE_ACTIVE : HabbiconTileView.NOT_OWNED_OUTLINE_ACTIVE;

        const background = this.tileBackground;
        const border = this.tileBorder;

        if(background !== null)
        {
            background.color = 0xFF000000 | (this._active ? baseActive : (this._hover ? baseHover : baseIdle));
        }

        if(border !== null)
        {
            border.color = 0xFF000000 | (this._active ? outlineActive : (this._hover ? outlineHover : outlineIdle));
        }
    }

    // AS3: HabbiconTileView.as::onClicked()
    private onClicked = (_event: WindowMouseEvent): void =>
    {
        this._onClick?.(this);
    };

    // AS3: HabbiconTileView.as::onOver()
    private onOver = (_event: WindowMouseEvent): void =>
    {
        this._hover = true;
        this.updateLook();
    };

    // AS3: HabbiconTileView.as::onOut()
    private onOut = (_event: WindowMouseEvent): void =>
    {
        this._hover = false;
        this.updateLook();
    };

    // AS3: HabbiconTileView.as::get bitmap()
    private get bitmap(): IBitmapWrapperWindow | null
    {
        return (this._window?.findChildByName('bitmap') as IBitmapWrapperWindow | null) ?? null;
    }

    // AS3: HabbiconTileView.as::get favoriteIcon()
    private get favoriteIcon(): IWindow | null
    {
        return this._window?.findChildByName('favorite_icon') ?? null;
    }

    // AS3: HabbiconTileView.as::get claimableIcon()
    private get claimableIcon(): IWindow | null
    {
        return this._window?.findChildByName('claimable_icon') ?? null;
    }

    // AS3: HabbiconTileView.as::get lockedOverlay()
    private get lockedOverlay(): IWindow | null
    {
        return this._window?.findChildByName('locked_overlay') ?? null;
    }

    // AS3: HabbiconTileView.as::get tileBackground()
    private get tileBackground(): IWindow | null
    {
        return this._window?.findChildByName('tile_background') ?? null;
    }

    // AS3: HabbiconTileView.as::get tileBorder()
    private get tileBorder(): IWindow | null
    {
        return this._window?.findChildByName('tile_border') ?? null;
    }

    // AS3: HabbiconTileView.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this.detachFromParent();

        this._window?.removeEventListener('WME_CLICK', this.onClicked);
        this._window?.removeEventListener('WME_OVER', this.onOver);
        this._window?.removeEventListener('WME_OUT', this.onOut);

        this.clearBitmap();

        (this._window as unknown as IWindow | null)?.dispose();
        this._window = null;
        this._controller = null;
        this._item = null;
        this._onClick = null;
        this._disposed = true;
    }
}
