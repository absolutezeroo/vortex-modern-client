import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {XmlAsset} from '@core/assets/XmlAsset';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {Logger} from '@core/utils/Logger';

import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import {
    UseFurnitureMessageComposer
} from '@habbo/communication/messages/outgoing/room/furniture/UseFurnitureMessageComposer';
import type {FurnitureContextMenuWidget} from '@habbo/ui/widget/furniture/contextmenu/FurnitureContextMenuWidget';

const log = Logger.getLogger('habbo.ui.widget.furniture.effectbox.EffectBoxOpenDialogView');

/**
 * EffectBoxOpenDialogView
 *
 * "Open this effect box?" — one layout, three buttons, and a use-furniture message on OK.
 * The simplest of the confirmation dialogs: no product data, no preview, no server round
 * trip before showing.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/furniture/effectbox/EffectBoxOpenDialogView.as
 */
export class EffectBoxOpenDialogView
{
    // AS3: .../effectbox/EffectBoxOpenDialogView.as::EffectBoxOpenDialogView()
    constructor(widget: FurnitureContextMenuWidget)
    {
        this._widget = widget;
        this._windowManager = widget.windowManager;
        this._assets = widget.assets;
    }

    // AS3: .../effectbox/EffectBoxOpenDialogView.as::_SafeStr_4549
    private _widget: FurnitureContextMenuWidget | null;

    // AS3: .../effectbox/EffectBoxOpenDialogView.as::_windowManager
    private _windowManager: IHabboWindowManager;

    // AS3: .../effectbox/EffectBoxOpenDialogView.as::_assets
    private _assets: IAssetLibrary | null;

    // AS3: .../effectbox/EffectBoxOpenDialogView.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: .../effectbox/EffectBoxOpenDialogView.as::_disposed
    private _disposed: boolean = false;

    // AS3: .../effectbox/EffectBoxOpenDialogView.as::_SafeStr_7499
    private _objectId: number = 0;

    // AS3: .../effectbox/EffectBoxOpenDialogView.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../effectbox/EffectBoxOpenDialogView.as::open()
    public open(objectId: number): void
    {
        this._objectId = objectId;

        this.setWindowContent();

        if(this._window !== null)
        {
            this._window.visible = true;
        }
    }

    /** Built once and reused — reopening the dialog only flips `visible`. */
    // AS3: .../effectbox/EffectBoxOpenDialogView.as::setWindowContent()
    private setWindowContent(): void
    {
        if(this._window !== null) return;

        const asset = this._assets?.getAssetByName('effectbox_xml') as XmlAsset | null;

        if(asset === null || asset === undefined)
        {
            log.warn('Missing layout "effectbox_xml" - the effect-box dialog cannot open');

            return;
        }

        this._window = this._windowManager.buildFromXML(asset.content as unknown as string) as IWindowContainer | null;

        if(this._window === null) return;

        this.addClickListener('ok');
        this.addClickListener('cancel');
        this.addClickListener('header_button_close');

        this._window.center();
    }

    // AS3: .../effectbox/EffectBoxOpenDialogView.as::close()
    public close(): void
    {
        if(this._window !== null)
        {
            this._window.visible = false;
        }
    }

    // AS3: .../effectbox/EffectBoxOpenDialogView.as::addClickListener()
    private addClickListener(name: string): void
    {
        this._window?.findChildByName(name)?.addEventListener('WME_CLICK', this.onMouseClick);
    }

    // AS3: .../effectbox/EffectBoxOpenDialogView.as::onMouseClick()
    private onMouseClick = (event: WindowMouseEvent): void =>
    {
        const name = (event.target as {name?: string} | null)?.name ?? '';

        switch(name)
        {
            case 'header_button_close':
            case 'cancel':
                this.close();
                break;
            case 'ok':
                this._widget?.handler?.container?.connection?.send(new UseFurnitureMessageComposer(this._objectId));

                this.close();
                break;
        }
    };

    // AS3: .../effectbox/EffectBoxOpenDialogView.as::dispose()
    public dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;

        if(this._window !== null)
        {
            this._window.dispose();
            this._window = null;
        }
    }
}
