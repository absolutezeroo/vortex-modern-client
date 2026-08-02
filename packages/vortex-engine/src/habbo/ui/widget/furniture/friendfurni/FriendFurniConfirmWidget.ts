import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {XmlAsset} from '@core/assets/XmlAsset';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {Logger} from '@core/utils/Logger';

import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IRoomWidgetHandler} from '@habbo/ui/IRoomWidgetHandler';
import type {FriendFurniConfirmWidgetHandler} from '@habbo/ui/handler/FriendFurniConfirmWidgetHandler';
import {RoomWidgetBase} from '@habbo/ui/widget/RoomWidgetBase';

const log = Logger.getLogger('habbo.ui.widget.furniture.friendfurni.FriendFurniConfirmWidget');

/**
 * FriendFurniConfirmWidget
 *
 * The "do you want to lock this?" panel both players see before a friendship furni is
 * engraved. Purely server-driven: it opens on `FriendFurniStartConfirmation`, updates on the
 * other player's confirmation, and closes on either side's cancel.
 *
 * Opening a second panel while one is up answers *false* to the first — declining rather
 * than leaving the other player waiting on a dialog that is gone.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/furniture/friendfurni/FriendFurniConfirmWidget.as
 */
export class FriendFurniConfirmWidget extends RoomWidgetBase
{
    // AS3: .../friendfurni/FriendFurniConfirmWidget.as::FriendFurniConfirmWidget()
    constructor(
        handler: IRoomWidgetHandler,
        windowManager: IHabboWindowManager,
        assets: IAssetLibrary | null,
        localizations: IHabboLocalizationManager | null
    )
    {
        super(handler, windowManager, assets, localizations);

        if(this.confirmWidgetHandler !== null)
        {
            this.confirmWidgetHandler.widget = this;
        }
    }

    // AS3: .../friendfurni/FriendFurniConfirmWidget.as::_stuffId
    private _stuffId: number = -1;

    // AS3: .../friendfurni/FriendFurniConfirmWidget.as::_window
    private _window: IWindowContainer | null = null;

    /** The layout's own height for the other-player block, measured once and restored later. */
    // AS3: .../friendfurni/FriendFurniConfirmWidget.as::_SafeStr_10171
    private _otherLockedContainerHeight: number = -1;

    // AS3: .../friendfurni/FriendFurniConfirmWidget.as::get mainWindow()
    public override get mainWindow(): IWindow | null
    {
        return this._window;
    }

    // AS3: .../friendfurni/FriendFurniConfirmWidget.as::get confirmWidgetHandler()
    private get confirmWidgetHandler(): FriendFurniConfirmWidgetHandler | null
    {
        return this.widgetHandler as FriendFurniConfirmWidgetHandler | null;
    }

    /**
     * `isOwner` decides the layout: the owner sees the other player's block (and no message
     * yet), the other side sees it collapsed to nothing.
     */
    // AS3: .../friendfurni/FriendFurniConfirmWidget.as::open()
    public open(stuffId: number, isOwner: boolean): void
    {
        if(this._window !== null && this._window.visible && this._stuffId !== -1)
        {
            this.confirmWidgetHandler?.sendLockConfirm(this._stuffId, false);
            this.destroyWindow();
        }

        this._stuffId = stuffId;

        this.createWindow();

        if(this._window === null) return;

        const otherLocked = this._window.findChildByName('other_locked_container');
        const message = this._window.findChildByName('message');

        if(otherLocked !== null)
        {
            otherLocked.height = isOwner ? this._otherLockedContainerHeight : 0;
        }

        if(isOwner && message !== null)
        {
            message.visible = false;
        }

        this._window.visible = true;
    }

    // AS3: .../friendfurni/FriendFurniConfirmWidget.as::close()
    public close(stuffId: number): void
    {
        if(stuffId === this._stuffId)
        {
            this.destroyWindow();
        }
    }

    // AS3: .../friendfurni/FriendFurniConfirmWidget.as::otherConfirmed()
    public otherConfirmed(stuffId: number): void
    {
        if(this._window === null || stuffId !== this._stuffId) return;

        const lock = this._window.findChildByName('lock') as IStaticBitmapWrapperWindow | null;

        if(lock !== null)
        {
            lock.assetUri = '${image.library.url}furniextras/locked_image.png';
        }

        const message = this._window.findChildByName('message');

        if(message !== null)
        {
            message.visible = true;
        }
    }

    // AS3: .../friendfurni/FriendFurniConfirmWidget.as::createWindow()
    private createWindow(): void
    {
        if(this._window !== null) return;

        const asset = this.assets?.getAssetByName('lock_confirm_xml') as XmlAsset | null;

        if(asset === null || asset === undefined)
        {
            log.warn('Missing layout "lock_confirm_xml" - the lock confirmation cannot open');

            return;
        }

        this._window = this.windowManager.buildFromXML(asset.content as unknown as string) as IWindowContainer | null;

        if(this._window === null) return;

        this._window.procedure = this.windowProcedure;
        this._otherLockedContainerHeight = this._window.findChildByName('other_locked_container')?.height ?? 0;
        this._window.center();
    }

    // AS3: .../friendfurni/FriendFurniConfirmWidget.as::destroyWindow()
    private destroyWindow(): void
    {
        if(this._window !== null)
        {
            this._window.dispose();
            this._window = null;
        }
    }

    /** Closing by the X is a decline, not a dismissal — the server is told either way. */
    // AS3: .../friendfurni/FriendFurniConfirmWidget.as::windowProcedure()
    private windowProcedure = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        switch(window?.name)
        {
            case 'header_button_close':
            case 'cancel_button':
                this.confirmWidgetHandler?.sendLockConfirm(this._stuffId, false);
                this.destroyWindow();
                break;
            case 'confirm_button':
                this.confirmWidgetHandler?.sendLockConfirm(this._stuffId, true);
                this.destroyWindow();
                break;
        }
    };

    // AS3: .../friendfurni/FriendFurniConfirmWidget.as::dispose()
    public override dispose(): void
    {
        this._stuffId = -1;

        this.destroyWindow();

        super.dispose();
    }
}
