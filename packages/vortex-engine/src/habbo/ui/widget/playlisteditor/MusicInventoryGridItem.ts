/**
 * MusicInventoryGridItem — one disk in the "my music" grid: cover art tinted from the song's own
 * data, title, and the play/pause/download + "move to playlist" buttons.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/playlisteditor/MusicInventoryGridItem.as
 */
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {PlayListEditorWidget} from './PlayListEditorWidget';
import {tintDiskBitmap, type IDiskColorTint} from './PlayListEditorWidget';

export class MusicInventoryGridItem
{
    /**
     * Obfuscated in every available tree; the member name is DERIVED from its role in
     * `set playButtonState()` (value 0 selects `icon_play`).
     */
    // AS3: .../MusicInventoryGridItem.as::_SafeStr_11566
    static readonly BUTTON_STATE_PLAY: number = 0;

    /**
     * Obfuscated in every available tree; the member name is DERIVED from its role in
     * `set playButtonState()` (value 1 selects `icon_pause`).
     */
    // AS3: .../MusicInventoryGridItem.as::_SafeStr_10552
    static readonly BUTTON_STATE_PAUSE: number = 1;

    // AS3: .../MusicInventoryGridItem.as::BUTTON_STATE_DOWNLOAD
    static readonly BUTTON_STATE_DOWNLOAD: number = 2;

    // AS3: .../MusicInventoryGridItem.as::BG_COLOR_SELECTED
    private static readonly BG_COLOR_SELECTED: number = 14612159;

    // AS3: .../MusicInventoryGridItem.as::BG_COLOR_UNSELECTED
    private static readonly BG_COLOR_UNSELECTED: number = 15856113;

    // AS3: .../MusicInventoryGridItem.as::_SafeStr_4549 (the widget)
    private _widget: PlayListEditorWidget | null;

    // AS3: .../MusicInventoryGridItem.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: .../MusicInventoryGridItem.as::_SafeStr_8999 (diskId)
    private _diskId: number;

    // AS3: .../MusicInventoryGridItem.as::_SafeStr_8191 (songId)
    private _songId: number;

    // AS3: .../MusicInventoryGridItem.as::_SafeStr_10029 (toPlayListButton)
    private _toPlayListButton: IWindow | null = null;

    // AS3: .../MusicInventoryGridItem.as::_SafeStr_10086 (playButtonState)
    private _playButtonState: number = MusicInventoryGridItem.BUTTON_STATE_PLAY;

    // AS3: .../MusicInventoryGridItem.as::MusicInventoryGridItem()
    constructor(widget: PlayListEditorWidget, diskId: number, songId: number, trackName: string | null, tint: IDiskColorTint | null)
    {
        this._widget = widget;
        this._diskId = diskId;
        this._songId = songId;

        this.createWindow();
        this.deselect();

        if(trackName !== null && tint !== null)
        {
            this.trackName = trackName;
            this.diskColor = tint;
        }
    }

    // AS3: .../MusicInventoryGridItem.as::get window()
    get window(): IWindow
    {
        return this._window as unknown as IWindow;
    }

    // AS3: .../MusicInventoryGridItem.as::get diskId()
    get diskId(): number
    {
        return this._diskId;
    }

    // AS3: .../MusicInventoryGridItem.as::get songId()
    get songId(): number
    {
        return this._songId;
    }

    // AS3: .../MusicInventoryGridItem.as::get toPlayListButton()
    get toPlayListButton(): IWindow | null
    {
        return this._toPlayListButton;
    }

    // AS3: .../MusicInventoryGridItem.as::get playButtonState()
    get playButtonState(): number
    {
        return this._playButtonState;
    }

    // AS3: .../MusicInventoryGridItem.as::update()
    update(songId: number, trackName: string, tint: IDiskColorTint): void
    {
        if(songId === this._songId)
        {
            this.trackName = trackName;
            this.diskColor = tint;
        }
    }

    // AS3: .../MusicInventoryGridItem.as::destroy()
    destroy(): void
    {
        this._window?.destroy();
    }

    // AS3: .../MusicInventoryGridItem.as::createWindow()
    private createWindow(): void
    {
        if(!this._widget) return;

        const asset = this._widget.assets?.getAssetByName('playlisteditor_music_inventory_item') ?? null;
        const built = this._widget.windowManager.buildFromXML(asset?.content as unknown as string) as IWindowContainer | null;

        if(built === null) throw new Error('Failed to construct window from XML!');

        this._window = built;

        const actionButtons = this._window.getChildByName('action_buttons') as IWindowContainer | null;

        if(actionButtons !== null)
        {
            this._toPlayListButton = actionButtons.getChildByName('button_to_playlist');
        }

        this.assignAssetByNameToElement('title_fader', this._window.getChildByName('title_fader_bitmap') as IBitmapWrapperWindow | null);

        const arrow = (this._widget.assets?.getAssetByName('icon_arrow')?.content as ImageBitmap | null) ?? null;

        if(arrow !== null) this.buttonToPlaylistBitmap = arrow;

        this.playButtonState = MusicInventoryGridItem.BUTTON_STATE_PLAY;
    }

    // AS3: .../MusicInventoryGridItem.as::select()
    select(): void
    {
        const background = this._window?.getChildByName('background') ?? null;

        if(background !== null) background.color = MusicInventoryGridItem.BG_COLOR_SELECTED;

        const actionButtons = this._window?.getChildByName('action_buttons') ?? null;

        if(actionButtons !== null) actionButtons.visible = true;

        const selected = this._window?.getChildByName('selected') ?? null;

        if(selected !== null) selected.visible = true;
    }

    // AS3: .../MusicInventoryGridItem.as::deselect()
    deselect(): void
    {
        const background = this._window?.getChildByName('background') ?? null;

        if(background !== null) background.color = MusicInventoryGridItem.BG_COLOR_UNSELECTED;

        const actionButtons = this._window?.getChildByName('action_buttons') ?? null;

        if(actionButtons !== null) actionButtons.visible = false;

        const selected = this._window?.getChildByName('selected') ?? null;

        if(selected !== null) selected.visible = false;
    }

    // AS3: .../MusicInventoryGridItem.as::set diskColor()
    set diskColor(tint: IDiskColorTint)
    {
        const source = (this._widget?.assets?.getAssetByName('icon_cd_big')?.content as ImageBitmap | null) ?? null;

        if(source === null) return;

        const tinted = tintDiskBitmap(source, tint);

        if(tinted !== null) this.diskIconBitmap = tinted;
    }

    // AS3: .../MusicInventoryGridItem.as::set playButtonState()
    set playButtonState(state: number)
    {
        let assetName: string | null = null;

        if(state === MusicInventoryGridItem.BUTTON_STATE_PLAY) assetName = 'icon_play';
        else if(state === MusicInventoryGridItem.BUTTON_STATE_PAUSE) assetName = 'icon_pause';
        else if(state === MusicInventoryGridItem.BUTTON_STATE_DOWNLOAD) assetName = 'icon_download';

        if(assetName !== null)
        {
            const bitmap = (this._widget?.assets?.getAssetByName(assetName)?.content as ImageBitmap | null) ?? null;

            if(bitmap !== null) this.buttonPlayPauseBitmap = bitmap;
        }

        this._playButtonState = state;
    }

    // AS3: .../MusicInventoryGridItem.as::set trackName()
    set trackName(value: string)
    {
        const target = this._window?.getChildByName('song_title_text') as ITextWindow | null;

        if(target !== null) target.text = value;
    }

    // AS3: .../MusicInventoryGridItem.as::set diskIconBitmap()
    private set diskIconBitmap(value: ImageBitmap)
    {
        const target = this._window?.getChildByName('disk_image') as IBitmapWrapperWindow | null;

        if(target !== null) target.bitmap = value;
    }

    // AS3: .../MusicInventoryGridItem.as::set buttonToPlaylistBitmap()
    private set buttonToPlaylistBitmap(value: ImageBitmap)
    {
        this.assignBitmapDataToButton('button_to_playlist', 'image_button_to_playlist', value);
    }

    // AS3: .../MusicInventoryGridItem.as::set buttonPlayPauseBitmap()
    private set buttonPlayPauseBitmap(value: ImageBitmap)
    {
        this.assignBitmapDataToButton('button_play_pause', 'image_button_play_pause', value);
    }

    // AS3: .../MusicInventoryGridItem.as::assignBitmapDataToButton()
    // TS deviation: AS3 assigns `param3.clone()` here. This port's bitmap assets are shared,
    // immutable textures — nothing downstream mutates them in place — so the clone is dropped,
    // matching every other ported bitmap assignment in this codebase.
    private assignBitmapDataToButton(buttonName: string, imageName: string, bitmap: ImageBitmap | null): void
    {
        if(bitmap === null) return;

        const actionButtons = this._window?.getChildByName('action_buttons') as IWindowContainer | null;

        if(!actionButtons) return;

        const button = actionButtons.getChildByName(buttonName) as IWindowContainer | null;

        if(!button) return;

        const image = button.getChildByName(imageName) as IBitmapWrapperWindow | null;

        if(image !== null)
        {
            image.bitmap = bitmap;
            image.width = bitmap.width;
            image.height = bitmap.height;
        }
    }

    // AS3: .../MusicInventoryGridItem.as::assignAssetByNameToElement()
    private assignAssetByNameToElement(assetName: string, target: IBitmapWrapperWindow | null): void
    {
        const bitmap = (this._widget?.assets?.getAssetByName(assetName)?.content as ImageBitmap | null) ?? null;

        if(target !== null && bitmap !== null) target.bitmap = bitmap;
    }
}
