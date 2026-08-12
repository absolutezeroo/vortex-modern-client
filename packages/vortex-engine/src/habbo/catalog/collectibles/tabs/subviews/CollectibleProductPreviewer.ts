import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {IAvatarRenderManager} from '@habbo/avatar/IAvatarRenderManager';
import type {ImageResult} from '@habbo/room/ImageResult';
import type {AvatarImageWidget} from '@habbo/window/widgets/AvatarImageWidget';
import type {BadgeImageWidget} from '@habbo/window/widgets/BadgeImageWidget';
import type {PetImageWidget} from '@habbo/window/widgets/PetImageWidget';

import type {ICollectibleProductPreviewer} from '../../ICollectibleProductPreviewer';
import {EffectPreviewer} from './EffectPreviewer';

/**
 * The preview surface of the collectibles hub: seven windows stacked in the same slot, of which
 * exactly one is ever visible.
 *
 * Every setter calls `clearPreviewer()` first and then reveals its own window, which is why the
 * class needs no state beyond the pending image id. Six of the seven windows are optional — AS3
 * gives five constructor parameters defaults of `null` — so a caller can build a previewer that
 * only ever shows furni, and the setters it does not support become no-ops rather than errors.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/collectibles/tabs/subviews/CollectibleProductPreviewer.as
 */
export class CollectibleProductPreviewer implements ICollectibleProductPreviewer
{
    /**
     * The id of the furni render we are waiting on, or -1.
     *
     * `imageReady()` fires for every listener the room engine knows about, so this is what tells
     * ours apart from somebody else's.
     */
    // AS3: CollectibleProductPreviewer.as::_SafeStr_6491
    private _pendingImageId: number = -1;

    // AS3: CollectibleProductPreviewer.as::_SafeStr_6520 (the avatar widget window)
    private _avatarWindow: IWidgetWindow | null;
    // AS3: CollectibleProductPreviewer.as::_SafeStr_6841 (the badge widget window)
    private _badgeWindow: IWidgetWindow | null;
    // AS3: CollectibleProductPreviewer.as::_SafeStr_6509 (the pet widget window)
    private _petWindow: IWidgetWindow | null;
    // AS3: CollectibleProductPreviewer.as::_SafeStr_5792 (the furni bitmap)
    private _imageWindow: IBitmapWrapperWindow | null;
    // AS3: CollectibleProductPreviewer.as::_SafeStr_7034 (the placeholder bitmap)
    private _placeholderWindow: IStaticBitmapWrapperWindow | null;
    // AS3: CollectibleProductPreviewer.as::_SafeStr_7344 (the unknown-product bitmap)
    private _unknownWindow: IStaticBitmapWrapperWindow | null;
    // AS3: CollectibleProductPreviewer.as::_SafeStr_5597
    private _effectPreviewer: EffectPreviewer | null = null;
    // AS3: CollectibleProductPreviewer.as::_disposed
    private _disposed: boolean = false;

    /**
     * The effect previewer is built only when *both* its window and an avatar renderer are given —
     * AS3's condition, and the reason `setEffectResult()` can be a no-op on a surface that was
     * constructed without them.
     */
    // AS3: CollectibleProductPreviewer.as::CollectibleProductPreviewer()
    constructor(
        imageWindow: IBitmapWrapperWindow | null,
        badgeWindow: IWidgetWindow | null,
        petWindow: IWidgetWindow | null,
        unknownWindow: IStaticBitmapWrapperWindow | null,
        avatarWindow: IWidgetWindow | null = null,
        placeholderWindow: IStaticBitmapWrapperWindow | null = null,
        effectWindow: IWidgetWindow | null = null,
        avatarRenderManager: IAvatarRenderManager | null = null
    )
    {
        this._avatarWindow = avatarWindow;
        this._badgeWindow = badgeWindow;
        this._petWindow = petWindow;
        this._imageWindow = imageWindow;
        this._placeholderWindow = placeholderWindow;

        if(effectWindow !== null && avatarRenderManager !== null)
        {
            this._effectPreviewer = new EffectPreviewer(effectWindow, avatarRenderManager);
        }

        this._unknownWindow = unknownWindow;

        this.clearPreviewer();
    }

    // AS3: CollectibleProductPreviewer.as::clearPreviewer()
    clearPreviewer(): void
    {
        this._pendingImageId = -1;

        if(this._avatarWindow !== null) this._avatarWindow.visible = false;
        if(this._imageWindow !== null) this._imageWindow.visible = false;
        if(this._badgeWindow !== null) this._badgeWindow.visible = false;
        if(this._placeholderWindow !== null) this._placeholderWindow.visible = false;
        if(this._petWindow !== null) this._petWindow.visible = false;
        if(this._effectPreviewer !== null) this._effectPreviewer.visible = false;
        if(this._unknownWindow !== null) this._unknownWindow.visible = false;
    }

    /**
     * AS3 declares this set-only. The getter exists because TypeScript will not accept a setter
     * without one on an interface member; it returns null rather than remembering the result, which
     * AS3 does not keep either.
     */
    // TS-only: paired with the AS3 setter below, which TypeScript cannot declare alone.
    get imageResult(): ImageResult | null
    {
        return null;
    }

    // AS3: CollectibleProductPreviewer.as::set imageResult()
    set imageResult(value: ImageResult | null)
    {
        this.clearPreviewer();

        if(this._imageWindow === null) return;

        if(value !== null)
        {
            this._pendingImageId = value.id;
            this.setPreviewImage(value.data);
        }
    }

    // TS-only: see `get imageResult()`.
    get avatarResult(): string
    {
        return '';
    }

    // AS3: CollectibleProductPreviewer.as::set avatarResult()
    set avatarResult(value: string)
    {
        this.clearPreviewer();

        if(this._avatarWindow === null) return;

        this._avatarWindow.visible = true;

        const widget = (this._avatarWindow.widget ?? null) as AvatarImageWidget | null;

        if(widget !== null) widget.figure = value;
    }

    // TS-only: see `get imageResult()`.
    get badgeResult(): string
    {
        return '';
    }

    // AS3: CollectibleProductPreviewer.as::set badgeResult()
    set badgeResult(value: string)
    {
        this.clearPreviewer();

        if(this._badgeWindow === null) return;

        this._badgeWindow.visible = true;

        const widget = (this._badgeWindow.widget ?? null) as BadgeImageWidget | null;

        if(widget !== null) widget.badgeId = value;
    }

    // TS-only: see `get imageResult()`.
    get petResult(): string
    {
        return '';
    }

    // AS3: CollectibleProductPreviewer.as::set petResult()
    set petResult(value: string)
    {
        this.clearPreviewer();

        if(this._petWindow === null) return;

        this._petWindow.visible = true;

        const widget = (this._petWindow.widget ?? null) as PetImageWidget | null;

        if(widget !== null) widget.figure = value;
    }

    // AS3: CollectibleProductPreviewer.as::setEffectResult()
    setEffectResult(figure: string, effectId: number): void
    {
        this.clearPreviewer();

        if(this._effectPreviewer === null) return;

        this._effectPreviewer.visible = true;
        this._effectPreviewer.update(figure, effectId);
    }

    // AS3: CollectibleProductPreviewer.as::setUnknownImage()
    setUnknownImage(): void
    {
        this.clearPreviewer();

        if(this._unknownWindow === null) return;

        this._unknownWindow.visible = true;
    }

    // AS3: CollectibleProductPreviewer.as::setPlaceholder()
    setPlaceholder(): void
    {
        this.clearPreviewer();

        if(this._placeholderWindow === null) return;

        this._placeholderWindow.visible = true;
    }

    /**
     * AS3 assigns `param1.clone()` — a defensive copy, because the room engine reuses its
     * BitmapData. This port's `ImageBitmap` is handed over by the engine per request and not
     * mutated afterwards, and there is no synchronous clone for one, so it is assigned directly.
     */
    // AS3: CollectibleProductPreviewer.as::setPreviewImage()
    private setPreviewImage(image: ImageBitmap | null): void
    {
        if(this._imageWindow === null) return;

        if(image === null)
        {
            this._imageWindow.visible = false;

            return;
        }

        this._imageWindow.bitmap = image;
        this._imageWindow.visible = true;
    }

    // AS3: CollectibleProductPreviewer.as::imageReady()
    imageReady(id: number, data: ImageBitmap | null): void
    {
        if(this._pendingImageId === id && this._imageWindow !== null)
        {
            this.setPreviewImage(data);
        }
    }

    /** Empty in AS3: a failed render leaves whatever `clearPreviewer()` left, i.e. nothing. */
    // AS3: CollectibleProductPreviewer.as::imageFailed()
    imageFailed(_id: number): void
    {
    }

    // AS3: CollectibleProductPreviewer.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: CollectibleProductPreviewer.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;

        if(this._effectPreviewer !== null)
        {
            this._effectPreviewer.dispose();
            this._effectPreviewer = null;
        }

        this._pendingImageId = -1;
    }
}
