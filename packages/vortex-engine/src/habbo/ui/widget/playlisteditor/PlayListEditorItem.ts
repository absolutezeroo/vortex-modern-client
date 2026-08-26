/**
 * PlayListEditorItem — one row in the playlist: cover art tint, title/author, "now playing" note
 * icon, and the remove button.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/playlisteditor/PlayListEditorItem.as
 */
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {PlayListEditorWidget} from './PlayListEditorWidget';
import {tintDiskBitmap, type IDiskColorTint} from './PlayListEditorWidget';

export class PlayListEditorItem
{
    // AS3: .../PlayListEditorItem.as::ICON_STATE_NORMAL
    static readonly ICON_STATE_NORMAL: string = 'PLEI_ICON_STATE_NORMAL';

    // AS3: .../PlayListEditorItem.as::ICON_STATE_PLAYING
    static readonly ICON_STATE_PLAYING: string = 'PLEI_ICON_STATE_PLAYING';

    // AS3: .../PlayListEditorItem.as::BG_COLOR_SELECTED
    private static readonly BG_COLOR_SELECTED: number = 14283002;

    // AS3: .../PlayListEditorItem.as::BG_COLOR_UNSELECTED
    private static readonly BG_COLOR_UNSELECTED: number = 15856113;

    // AS3: .../PlayListEditorItem.as::_SafeStr_4549 (the widget)
    private _widget: PlayListEditorWidget | null;

    // AS3: .../PlayListEditorItem.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: .../PlayListEditorItem.as::_SafeStr_9056 (removeButton)
    private _removeButton: IWindow | null = null;

    // AS3: .../PlayListEditorItem.as::_SafeStr_5114 (the base disk tint, restored by ICON_STATE_NORMAL)
    private _tint: IDiskColorTint;

    // AS3: .../PlayListEditorItem.as::PlayListEditorItem()
    constructor(widget: PlayListEditorWidget, trackName: string, trackAuthor: string, tint: IDiskColorTint)
    {
        this._widget = widget;
        this._tint = tint;

        this.createWindow();
        this.setIconState(PlayListEditorItem.ICON_STATE_NORMAL);
        this.deselect();
        this.trackName = trackName;
        this.trackAuthor = trackAuthor;
        this.diskColor = tint;
    }

    // AS3: .../PlayListEditorItem.as::get window()
    get window(): IWindow
    {
        return this._window as unknown as IWindow;
    }

    // AS3: .../PlayListEditorItem.as::get removeButton()
    get removeButton(): IWindow | null
    {
        return this._removeButton;
    }

    // AS3: .../PlayListEditorItem.as::createWindow()
    private createWindow(): void
    {
        if(!this._widget) return;

        const asset = this._widget.assets?.getAssetByName('playlisteditor_playlist_item') ?? null;
        const built = this._widget.windowManager.buildFromXML(asset?.content as unknown as string) as IWindowContainer | null;

        if(built === null) throw new Error('Failed to construct window from XML!');

        this._window = built;

        const arrow = (this._widget.assets?.getAssetByName('icon_arrow_left')?.content as ImageBitmap | null) ?? null;

        if(arrow !== null) this.buttonRemoveBitmap = arrow;

        this.assignAssetByNameToElement('jb_icon_disc', this._window.getChildByName('song_name_icon_bitmap') as IBitmapWrapperWindow | null);
        this.assignAssetByNameToElement('jb_icon_composer', this._window.getChildByName('author_name_icon_bitmap') as IBitmapWrapperWindow | null);

        const actionButtons = this._window.getChildByName('action_buttons') as IWindowContainer | null;
        const buttonBorder = actionButtons?.getChildByName('button_border') as IWindowContainer | null;

        if(buttonBorder) this._removeButton = buttonBorder.getChildByName('button_remove_from_playlist');
    }

    // AS3: .../PlayListEditorItem.as::select()
    select(): void
    {
        const background = this._window?.getChildByName('background') ?? null;

        if(background !== null) background.color = PlayListEditorItem.BG_COLOR_SELECTED;

        const actionButtons = this._window?.getChildByName('action_buttons') ?? null;

        if(actionButtons !== null) actionButtons.visible = true;

        const selected = this._window?.getChildByName('selected') ?? null;

        if(selected !== null) selected.visible = true;
    }

    // AS3: .../PlayListEditorItem.as::deselect()
    deselect(): void
    {
        const background = this._window?.getChildByName('background') ?? null;

        if(background !== null) background.color = PlayListEditorItem.BG_COLOR_UNSELECTED;

        const actionButtons = this._window?.getChildByName('action_buttons') ?? null;

        if(actionButtons !== null) actionButtons.visible = false;

        const selected = this._window?.getChildByName('selected') ?? null;

        if(selected !== null) selected.visible = false;
    }

    // AS3: .../PlayListEditorItem.as::setIconState()
    setIconState(state: string): void
    {
        if(state === PlayListEditorItem.ICON_STATE_NORMAL)
        {
            this.diskColor = this._tint;
        }
        else if(state === PlayListEditorItem.ICON_STATE_PLAYING)
        {
            const bitmap = (this._widget?.assets?.getAssetByName('icon_notes_small')?.content as ImageBitmap | null) ?? null;

            if(bitmap !== null) this.diskIconBitmap = bitmap;
        }
    }

    // AS3: .../PlayListEditorItem.as::set diskColor()
    set diskColor(tint: IDiskColorTint)
    {
        const source = (this._widget?.assets?.getAssetByName('icon_cd_small')?.content as ImageBitmap | null) ?? null;

        if(source === null) return;

        const tinted = tintDiskBitmap(source, tint);

        if(tinted !== null) this.diskIconBitmap = tinted;
    }

    // AS3: .../PlayListEditorItem.as::set trackName()
    set trackName(value: string)
    {
        const target = this._window?.getChildByName('song_title_text') as ITextWindow | null;

        if(target !== null) target.text = value;
    }

    // AS3: .../PlayListEditorItem.as::set trackAuthor()
    set trackAuthor(value: string)
    {
        const target = this._window?.getChildByName('song_author_text') as ITextWindow | null;

        if(target !== null) target.text = value;
    }

    // AS3: .../PlayListEditorItem.as::set diskIconBitmap()
    private set diskIconBitmap(value: ImageBitmap)
    {
        const target = this._window?.getChildByName('disk_image') as IBitmapWrapperWindow | null;

        if(target !== null) target.bitmap = value;
    }

    // AS3: .../PlayListEditorItem.as::set buttonRemoveBitmap()
    private set buttonRemoveBitmap(value: ImageBitmap | null)
    {
        if(value === null) return;

        const actionButtons = this._window?.getChildByName('action_buttons') as IWindowContainer | null;
        const buttonBorder = actionButtons?.getChildByName('button_border') as IWindowContainer | null;
        const button = buttonBorder?.getChildByName('button_remove_from_playlist') as IWindowContainer | null;
        const image = button?.getChildByName('button_remove_from_playlist_image') as IBitmapWrapperWindow | null;

        if(image)
        {
            image.bitmap = value;
            image.width = value.width;
            image.height = value.height;
        }
    }

    // AS3: .../PlayListEditorItem.as::assignAssetByNameToElement()
    private assignAssetByNameToElement(assetName: string, target: IBitmapWrapperWindow | null): void
    {
        const bitmap = (this._widget?.assets?.getAssetByName(assetName)?.content as ImageBitmap | null) ?? null;

        if(target !== null && bitmap !== null) target.bitmap = bitmap;
    }
}
