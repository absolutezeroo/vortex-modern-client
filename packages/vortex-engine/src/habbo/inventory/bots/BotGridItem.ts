import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';

import type {Bot} from './Bot';
import type {BotsView} from './BotsView';

/**
 * BotGridItem — one bot thumbnail in the bots-inventory grid.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/bots/BotGridItem.as
 *
 * Two documented port deviations, both shared with PetsGridItem:
 * - the thumbnail window is built via `windowManager.buildWidgetLayout('inventory_thumb_xml')`
 *   (the port's asset path) rather than AS3's raw `getAssetByName`/`buildFromXML`;
 * - the head render is assigned straight into the "bitmap" child instead of AS3's manual
 *   BitmapData copyPixels centering — the window's bitmap wrapper centers it — and it arrives
 *   through a promise, because turning the renderer's texture into an ImageBitmap has no
 *   synchronous browser equivalent (see BotsView.getItemImage()).
 */
export class BotGridItem
{
    // AS3: .../src/com/sulake/habbo/inventory/bots/BotGridItem.as::THUMB_COLOR_NORMAL
    private static readonly THUMB_COLOR_NORMAL: number = 13421772;
    // AS3: .../src/com/sulake/habbo/inventory/bots/BotGridItem.as::THUMB_COLOR_UNSEEN
    private static readonly THUMB_COLOR_UNSEEN: number = 10275685;

    // AS3: .../src/com/sulake/habbo/inventory/bots/BotGridItem.as::_SafeStr_4550
    private _view: BotsView;
    // AS3: .../src/com/sulake/habbo/inventory/bots/BotGridItem.as::_SafeStr_4556
    private _data: Bot;
    // AS3: .../src/com/sulake/habbo/inventory/bots/BotGridItem.as::_window
    private _window: IWindowContainer | null = null;
    // AS3: .../src/com/sulake/habbo/inventory/bots/BotGridItem.as::_SafeStr_5584
    private _bgColorWindow: IWindow | null = null;
    // AS3: .../src/com/sulake/habbo/inventory/bots/BotGridItem.as::_SafeStr_7496
    private _isSelected: boolean = false;
    // AS3: .../src/com/sulake/habbo/inventory/bots/BotGridItem.as::_isUnseen
    private _isUnseen: boolean;
    // AS3: .../src/com/sulake/habbo/inventory/bots/BotGridItem.as::_SafeStr_6556
    private _pressed: boolean = false;
    // TS-only: whether a real render has landed yet. AS3 needs no such flag — its render is
    // synchronous and complete on the first call. See BotsView.avatarImageReady() for why the
    // second pass cannot be selected by figure string alone.
    private _hasImage: boolean = false;

    constructor(view: BotsView, data: Bot, windowManager: IHabboWindowManager, isUnseen: boolean)
    {
        this._view = view;
        this._data = data;
        this._isUnseen = isUnseen;

        this._window = windowManager.buildWidgetLayout('inventory_thumb_xml') as IWindowContainer | null;

        if(this._window === null) return;

        this._window.procedure = this.eventHandler;

        // AS3 renders the head synchronously and hands the BitmapData to setImage(); here the render
        // resolves a promise instead.
        void this._view.getGridItemImage(data).then((image) => this.setImage(image));

        this.updateStatusGraphics();
    }

    // AS3: .../src/com/sulake/habbo/inventory/bots/BotGridItem.as::get window()
    get window(): IWindowContainer | null
    {
        return this._window;
    }

    // AS3: .../src/com/sulake/habbo/inventory/bots/BotGridItem.as::get data()
    get data(): Bot
    {
        return this._data;
    }

    // AS3: .../src/com/sulake/habbo/inventory/bots/BotGridItem.as::eventHandler()
    private eventHandler = (event: {type: string}): void =>
    {
        switch(event.type)
        {
            case 'WME_DOWN':
                this._view.setSelectedGridItem(this);
                this._pressed = true;
                break;
            case 'WME_UP':
                this._pressed = false;
                break;
            case 'WME_OUT':
                if(this._pressed)
                {
                    this._pressed = false;
                    // Dragging a bot out of the grid starts placing it (skipServer=true).
                    this._view.placeItemToRoom(this._data.id, true);
                }
                break;
        }
    };

    // TS-only: see `_hasImage`.
    get hasImage(): boolean
    {
        return this._hasImage;
    }

    // AS3: .../src/com/sulake/habbo/inventory/bots/BotGridItem.as::setImage()
    setImage(data: ImageBitmap | null): void
    {
        if(this._window === null) return;

        const bitmap = this._window.findChildByName('bitmap') as IBitmapWrapperWindow | null;

        if(bitmap !== null)
        {
            bitmap.bitmap = data;
        }

        if(data !== null) this._hasImage = true;
    }

    // AS3: .../src/com/sulake/habbo/inventory/bots/BotGridItem.as::setUnseen()
    setUnseen(value: boolean): void
    {
        if(this._isUnseen !== value)
        {
            this._isUnseen = value;
            this.updateStatusGraphics();
        }
    }

    // AS3: .../src/com/sulake/habbo/inventory/bots/BotGridItem.as::setSelected()
    setSelected(value: boolean): void
    {
        if(this._isSelected !== value)
        {
            this._isSelected = value;

            // AS3 also bails when the BG_COLOR window has not been resolved yet; the constructor's
            // updateStatusGraphics() call is what resolves it, so this only ever guards a window
            // whose layout has no BG_COLOR tag.
            if(this._window === null || this._bgColorWindow === null) return;

            this.updateStatusGraphics();
        }
    }

    // AS3: .../src/com/sulake/habbo/inventory/bots/BotGridItem.as::updateStatusGraphics()
    private updateStatusGraphics(): void
    {
        if(this._window === null) return;

        const outline = this._window.findChildByName('outline');

        if(outline !== null)
        {
            outline.visible = this._isSelected;
        }

        if(this._bgColorWindow === null)
        {
            this._bgColorWindow = this._window.findChildByTag('BG_COLOR');
        }

        if(this._bgColorWindow !== null)
        {
            this._bgColorWindow.color = this._isUnseen
                ? BotGridItem.THUMB_COLOR_UNSEEN
                : BotGridItem.THUMB_COLOR_NORMAL;
        }
    }

    // AS3: .../src/com/sulake/habbo/inventory/bots/BotGridItem.as::dispose()
    dispose(): void
    {
        this._bgColorWindow = null;

        if(this._window !== null)
        {
            this._window.dispose();
            this._window = null;
        }
    }
}
