import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IRegionWindow} from '@core/window/components/IRegionWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {IWindow} from '@core/window/IWindow';
import type {IGetImageListener} from '@habbo/room/IGetImageListener';
import type {ImageResult} from '@habbo/room/ImageResult';
import type {IFurnitureData} from '@habbo/session/furniture/IFurnitureData';
import type {CraftingWidget} from '../CraftingWidget';
import type {CraftingFurnitureItem} from '../utils/CraftingFurnitureItem';

/**
 * Shared thumbnail behaviour for the three crafting grid items (inventory, recipe, mixer): fetches
 * the furniture icon, shows a tooltip and reacts to a click via `onTriggered()`.
 *
 * AS3's `dispose()` calls `_window.removeEventListener("mouseDown", onMouseDown)`, but the click is
 * wired through `window.procedure` (a different mechanism, set below), not `addEventListener` — the
 * removal call is dead code in the primary tree (nothing was ever registered under that name), so
 * it is not ported; `window.dispose()` already clears `procedure`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/crafting/renderer/FurniThumbnailRendererBase.as
 */
export class FurniThumbnailRendererBase implements IGetImageListener
{
    // AS3: .../renderer/FurniThumbnailRendererBase.as::THUMB_BLEND_ITEMS_AVAILABLE
    private static readonly THUMB_BLEND_ITEMS_AVAILABLE: number = 1;

    // AS3: .../renderer/FurniThumbnailRendererBase.as::THUMB_BLEND_ITEMS_NOT_AVAILABLE
    private static readonly THUMB_BLEND_ITEMS_NOT_AVAILABLE: number = 0.2;

    // AS3: .../renderer/FurniThumbnailRendererBase.as::_SafeStr_4549 (widget)
    protected _widget: CraftingWidget | null;

    // AS3: .../renderer/FurniThumbnailRendererBase.as::_SafeStr_4556 (content)
    protected _content: CraftingFurnitureItem | null;

    // AS3: .../renderer/FurniThumbnailRendererBase.as::_window
    protected _window: IWindowContainer | null;

    // AS3: .../renderer/FurniThumbnailRendererBase.as::FurniThumbnailRendererBase()
    constructor(content: CraftingFurnitureItem, window: IWindowContainer, widget: CraftingWidget)
    {
        this._widget = widget;
        this._window = window;
        this._content = content;

        if(this.furnitureData) this.requestIconFromRoomEngine(this.furnitureData);

        this.updateItemCount();

        this._window.procedure = this.onMouseDown;

        const tooltip = window.findChildByName('tooltip') as IRegionWindow | null;

        if(tooltip && content.furnitureData) tooltip.toolTipCaption = content.furnitureData.localizedName;
    }

    // AS3: .../renderer/FurniThumbnailRendererBase.as::dispose()
    dispose(): void
    {
        if(this._window)
        {
            this._window.dispose();
            this._window = null;
        }
    }

    // AS3: .../renderer/FurniThumbnailRendererBase.as::requestIconFromRoomEngine()
    private requestIconFromRoomEngine(furnitureData: IFurnitureData): void
    {
        const roomEngine = this._widget?.handler.container?.roomEngine;

        if(!roomEngine) return;

        let result: ImageResult | null = null;

        switch(furnitureData.type)
        {
            case 's':
                result = roomEngine.getFurnitureIcon(furnitureData.id, this);
                break;
            case 'i':
                result = roomEngine.getWallItemIcon(furnitureData.id, this);
                break;
        }

        if(result?.data) this.imageReady(0, result.data);
    }

    // AS3: .../renderer/FurniThumbnailRendererBase.as::imageReady() (IGetImageListener)
    imageReady(_id: number, bitmap: ImageBitmap | null): void
    {
        if(!this._window) return;

        const image = this._window.findChildByTag('BITMAP') as IBitmapWrapperWindow | null;

        if(image && bitmap) image.bitmap = bitmap;
    }

    // AS3: .../renderer/FurniThumbnailRendererBase.as::imageFailed() (IGetImageListener)
    imageFailed(_id: number): void
    {
    }

    // AS3: .../renderer/FurniThumbnailRendererBase.as::updateItemCount()
    updateItemCount(): void
    {
    }

    // AS3: .../renderer/FurniThumbnailRendererBase.as::hideItemCount()
    protected hideItemCount(): void
    {
        const numberContainer = this._window?.findChildByName('number_container');

        if(numberContainer) numberContainer.visible = false;
    }

    // AS3: .../renderer/FurniThumbnailRendererBase.as::updateGroupItemCount()
    protected updateGroupItemCount(count: number): void
    {
        if(!this._window || this._window.disposed) return;

        const numberContainer = this._window.findChildByName('number_container');

        if(!numberContainer) return;

        numberContainer.visible = count > 0;

        if(count > 0)
        {
            const number = this._window.findChildByName('number') as ITextWindow | null;

            if(number) number.text = String(count);
        }
    }

    // AS3: .../renderer/FurniThumbnailRendererBase.as::updateBitmapBlend()
    protected updateBitmapBlend(available: boolean): void
    {
        const bitmap = this._window?.findChildByName('bitmap');

        if(!bitmap) return;

        bitmap.blend = available
            ? FurniThumbnailRendererBase.THUMB_BLEND_ITEMS_AVAILABLE
            : FurniThumbnailRendererBase.THUMB_BLEND_ITEMS_NOT_AVAILABLE;
    }

    // AS3: .../renderer/FurniThumbnailRendererBase.as::onMouseDown()
    private onMouseDown = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type !== 'WME_DOWN') return;

        this.onTriggered();
    };

    // AS3: .../renderer/FurniThumbnailRendererBase.as::onTriggered()
    protected onTriggered(): void
    {
    }

    // AS3: .../renderer/FurniThumbnailRendererBase.as::get content()
    get content(): CraftingFurnitureItem | null
    {
        return this._content;
    }

    // AS3: .../renderer/FurniThumbnailRendererBase.as::get furnitureData()
    protected get furnitureData(): IFurnitureData | null
    {
        return this.content ? this.content.furnitureData : null;
    }

    // AS3: .../renderer/FurniThumbnailRendererBase.as::get window()
    get window(): IWindowContainer | null
    {
        return this._window;
    }
}
