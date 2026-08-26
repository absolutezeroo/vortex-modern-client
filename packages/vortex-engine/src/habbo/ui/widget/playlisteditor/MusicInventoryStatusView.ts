/**
 * MusicInventoryStatusView — the small status pane under the "my music" grid: either "you're
 * previewing a song" or "buy more music", swapped by `selectView()`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/playlisteditor/MusicInventoryStatusView.as
 */
import {OrderedMap} from '@core/utils/OrderedMap';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {PlayListEditorWidget} from './PlayListEditorWidget';

export class MusicInventoryStatusView
{
    // AS3: .../MusicInventoryStatusView.as::BUY_MORE
    static readonly BUY_MORE: string = 'MISV_BUY_MORE';

    // AS3: .../MusicInventoryStatusView.as::PREVIEW_PLAYING
    static readonly PREVIEW_PLAYING: string = 'MISV_PREVIEW_PLAYING';

    // AS3: .../MusicInventoryStatusView.as::_container
    private _container: IWindowContainer | null;

    // AS3: .../MusicInventoryStatusView.as::_windows
    private _windows: OrderedMap<string, IWindowContainer> = new OrderedMap();

    // AS3: .../MusicInventoryStatusView.as::_SafeStr_4549 (the widget)
    private _widget: PlayListEditorWidget | null;

    // AS3: .../MusicInventoryStatusView.as::_SafeStr_4612 (the currently selected view name)
    private _selectedView: string | null = null;

    // AS3: .../MusicInventoryStatusView.as::_SafeStr_8621 (songName text)
    private _songNameText: ITextWindow | null = null;

    // AS3: .../MusicInventoryStatusView.as::_SafeStr_8686 (authorName text)
    private _authorNameText: ITextWindow | null = null;

    // AS3: .../MusicInventoryStatusView.as::MusicInventoryStatusView()
    constructor(widget: PlayListEditorWidget, container: IWindowContainer | null)
    {
        this._container = container;
        this._widget = widget;

        this.createWindows();
        this.hide();
    }

    // AS3: .../MusicInventoryStatusView.as::destroy()
    destroy(): void
    {
        for(const window of this._windows.getValues()) window.destroy();
    }

    // AS3: .../MusicInventoryStatusView.as::show()
    show(): void
    {
        if(this._container) this._container.visible = true;
    }

    // AS3: .../MusicInventoryStatusView.as::hide()
    hide(): void
    {
        if(this._container) this._container.visible = false;
    }

    // AS3: .../MusicInventoryStatusView.as::selectView()
    selectView(name: string): void
    {
        if(!this._container) return;

        this._container.removeChildAt(0);

        const view = this._windows.getValue(name);

        if(view !== null) this._container.addChildAt(view, 0);

        this._selectedView = name;
    }

    // AS3: .../MusicInventoryStatusView.as::set songName()
    set songName(value: string)
    {
        if(this._songNameText !== null) this._songNameText.text = value;
    }

    // AS3: .../MusicInventoryStatusView.as::set authorName()
    set authorName(value: string)
    {
        if(this._authorNameText !== null) this._authorNameText.text = value;
    }

    /**
     * `disposeSource` is kept for signature fidelity with AS3, which disposes its own — cloned —
     * source bitmap here once it has been blitted. This port's `getImageGalleryAssetBitmap()`
     * returns the shared, un-cloned asset content (every caller here passes its result straight
     * in), so disposing it would destroy the cached asset for everyone else; the parameter is a
     * deliberate no-op.
     */
    // AS3: .../MusicInventoryStatusView.as::setPreviewPlayingBackgroundImage()
    setPreviewPlayingBackgroundImage(bitmap: ImageBitmap | null, _disposeSource: boolean = true): void
    {
        this.blitBackgroundImage(MusicInventoryStatusView.PREVIEW_PLAYING, 'preview_play_background_image', bitmap);
    }

    // AS3: .../MusicInventoryStatusView.as::setGetMoreMusicBackgroundImage()
    setGetMoreMusicBackgroundImage(bitmap: ImageBitmap | null, _disposeSource: boolean = true): void
    {
        this.blitBackgroundImage(MusicInventoryStatusView.BUY_MORE, 'get_more_music_background_image', bitmap);
    }

    // AS3: .../MusicInventoryStatusView.as::createWindows()
    private createWindows(): void
    {
        if(!this._widget) return;

        const previewAsset = this._widget.assets?.getAssetByName('playlisteditor_inventory_subwindow_play_preview') ?? null;
        const previewWindow = this._widget.windowManager.buildFromXML(previewAsset?.content as unknown as string) as IWindowContainer | null;

        if(previewWindow !== null)
        {
            this._windows.add(MusicInventoryStatusView.PREVIEW_PLAYING, previewWindow);

            this._songNameText = previewWindow.getChildByName('preview_play_track_name') as ITextWindow | null;
            this._authorNameText = previewWindow.getChildByName('preview_play_author_name') as ITextWindow | null;

            previewWindow.getChildByName('stop_preview_button')?.addEventListener(
                WindowMouseEvent.CLICK, this.onStopPreviewClicked
            );

            this.setPreviewPlayingBackgroundImage(this._widget.getImageGalleryAssetBitmap('background_preview_playing'));
            this.assignAssetByNameToElement('jb_icon_disc', previewWindow.getChildByName('song_name_icon_bitmap') as IBitmapWrapperWindow | null);
            this.assignAssetByNameToElement('jb_icon_composer', previewWindow.getChildByName('author_name_icon_bitmap') as IBitmapWrapperWindow | null);
        }

        const buyMoreAsset = this._widget.assets?.getAssetByName('playlisteditor_inventory_subwindow_get_more_music') ?? null;
        const buyMoreWindow = this._widget.windowManager.buildFromXML(buyMoreAsset?.content as unknown as string) as IWindowContainer | null;

        if(buyMoreWindow !== null)
        {
            this._windows.add(MusicInventoryStatusView.BUY_MORE, buyMoreWindow);

            buyMoreWindow.getChildByName('open_catalog_button')?.addEventListener(
                WindowMouseEvent.CLICK, this.onOpenCatalogButtonClicked
            );

            this.setGetMoreMusicBackgroundImage(this._widget.getImageGalleryAssetBitmap('background_get_more_music'));
        }
    }

    /**
     * AS3 fills a new, same-size, opaque-white `BitmapData` and `copyPixels()`s the source onto it
     * at (0,0) — padding/clipping to the target element's *current* dimensions rather than the
     * source's. Reproduced here as a same-size canvas filled white, source drawn at the origin.
     */
    // AS3: .../MusicInventoryStatusView.as::blitBackgroundImage()
    private blitBackgroundImage(viewName: string, elementName: string, bitmap: ImageBitmap | null): void
    {
        const view = this._windows.getValue(viewName);
        const target = (view?.getChildByName(elementName) as IBitmapWrapperWindow | null) ?? null;

        if(target === null || bitmap === null) return;

        if(typeof OffscreenCanvas === 'undefined') return;

        const canvas = new OffscreenCanvas(target.width, target.height);
        const context = canvas.getContext('2d');

        if(!context) return;

        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, target.width, target.height);
        context.drawImage(bitmap, 0, 0);

        target.bitmap = canvas.transferToImageBitmap();
    }

    // AS3: .../MusicInventoryStatusView.as::assignAssetByNameToElement()
    private assignAssetByNameToElement(assetName: string, target: IBitmapWrapperWindow | null): void
    {
        const bitmap = (this._widget?.assets?.getAssetByName(assetName)?.content as ImageBitmap | null) ?? null;

        if(target !== null && bitmap !== null) target.bitmap = bitmap;
    }

    // AS3: .../MusicInventoryStatusView.as::onOpenCatalogButtonClicked()
    private onOpenCatalogButtonClicked = (_event: WindowEvent): void =>
    {
        this._widget?.openSongDiskShopCataloguePage();
    };

    // AS3: .../MusicInventoryStatusView.as::onStopPreviewClicked()
    private onStopPreviewClicked = (_event: WindowEvent): void =>
    {
        this._widget?.stopUserSong();
    };
}
