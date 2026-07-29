/**
 * MysteryBoxOpenDialogView — the two modal dialogs of a mystery-box open flow.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/furniture/mysterybox/MysteryBoxOpenDialogView.as
 *
 * The flow is entirely server-driven, which is why this view listens on the connection rather than
 * showing anything itself when clicked:
 *
 *   click → UseFurniture → server → ShowMysteryBoxWait  → waiting dialog
 *                                 → GotMysteryBoxPrize  → reward dialog
 *                                 → CancelMysteryBoxWait → dialog closes
 *
 * Both participants see the waiting dialog; `isOwnerOfFurniture()` decides whose captions and
 * which icon (box vs key) each one gets. The reward image is fetched asynchronously — `_imageId`
 * is what matches a late `imageReady()` back to the dialog that asked for it.
 */
import {Logger} from '@core/utils/Logger';
import type {IConnection} from '@core/communication/connection/IConnection';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {IModalDialog} from '@habbo/window/utils/IModalDialog';
import type {IGetImageListener} from '@habbo/room/IGetImageListener';
import type {ImageResult} from '@habbo/room/ImageResult';
import type {IRoomObject} from '@room/object/IRoomObject';
import {Vector3d} from '@room/utils/Vector3d';
import {ShowMysteryBoxWaitMessageEvent} from '@habbo/communication/messages/incoming/mysterybox/ShowMysteryBoxWaitMessageEvent';
import {CancelMysteryBoxWaitMessageEvent} from '@habbo/communication/messages/incoming/mysterybox/CancelMysteryBoxWaitMessageEvent';
import {GotMysteryBoxPrizeMessageEvent} from '@habbo/communication/messages/incoming/mysterybox/GotMysteryBoxPrizeMessageEvent';
import type {GotMysteryBoxPrizeMessageParser} from '@habbo/communication/messages/parser/mysterybox/GotMysteryBoxPrizeMessageParser';
import {MysteryBoxWaitingCanceledMessageComposer} from '@habbo/communication/messages/outgoing/mysterybox/MysteryBoxWaitingCanceledMessageComposer';
import {UseFurnitureMessageComposer} from '@habbo/communication/messages/outgoing/room/furniture/UseFurnitureMessageComposer';
import type {FurnitureContextMenuWidget} from '@habbo/ui/widget/furniture/contextmenu/FurnitureContextMenuWidget';
import {KEY_COLORS} from './MysteryBoxToolbarExtension';

const log = Logger.getLogger('habbo.ui.widget.furniture.mysterybox.MysteryBoxOpenDialogView');

/**
 * AS3: MysteryBoxOpenDialogView.as::showRewardWindow() — the direction and scale it renders the
 * prize preview at.
 */
const PREVIEW_DIRECTION_X: number = 90;
const PREVIEW_SCALE: number = 64;

/**
 * AS3: MysteryBoxOpenDialogView.as::showRewardWindow() — the product-type codes the switch reads.
 * Same one-letter vocabulary the catalog uses.
 */
const CONTENT_TYPE_FLOOR_ITEM: string = 's';
const CONTENT_TYPE_WALL_ITEM: string = 'i';
const CONTENT_TYPE_EFFECT: string = 'e';
const CONTENT_TYPE_SUBSCRIPTION: string = 'h';

export class MysteryBoxOpenDialogView implements IGetImageListener
{
    private _disposed: boolean = false;

    // AS3: MysteryBoxOpenDialogView.as::_SafeStr_4549 (the widget)
    private _widget: FurnitureContextMenuWidget | null;

    // AS3: MysteryBoxOpenDialogView.as::_SafeStr_4929 (the modal dialog)
    private _modalDialog: IModalDialog | null = null;

    // AS3: MysteryBoxOpenDialogView.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: MysteryBoxOpenDialogView.as::_SafeStr_5216 (the box being opened)
    private _roomObject: IRoomObject | null = null;

    // AS3: MysteryBoxOpenDialogView.as::_SafeStr_7354
    private _showWaitEvent: IMessageEvent | null;

    // AS3: MysteryBoxOpenDialogView.as::_SafeStr_7372
    private _cancelWaitEvent: IMessageEvent | null;

    // AS3: MysteryBoxOpenDialogView.as::_SafeStr_7019
    private _gotPrizeEvent: IMessageEvent | null;

    // AS3: MysteryBoxOpenDialogView.as::_SafeStr_6872 (pending async image id, -1 = none)
    private _imageId: number = -1;

    // AS3: MysteryBoxOpenDialogView.as::MysteryBoxOpenDialogView()
    constructor(widget: FurnitureContextMenuWidget)
    {
        this._widget = widget;

        this._showWaitEvent = new ShowMysteryBoxWaitMessageEvent(this.onShowMysteryBoxWait);
        this._cancelWaitEvent = new CancelMysteryBoxWaitMessageEvent(this.onCancelMysteryBoxWait);
        this._gotPrizeEvent = new GotMysteryBoxPrizeMessageEvent(this.onGotMysteryBoxPrize);

        const connection = this.connection;

        if(connection !== null)
        {
            connection.addMessageEvent(this._showWaitEvent);
            connection.addMessageEvent(this._cancelWaitEvent);
            connection.addMessageEvent(this._gotPrizeEvent);
        }
    }

    // AS3: MysteryBoxOpenDialogView.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    /**
     * The click only sends UseFurniture — everything visible happens when the server answers.
     */
    // AS3: MysteryBoxOpenDialogView.as::startOpenFlow()
    public startOpenFlow(object: IRoomObject): void
    {
        this._roomObject = object;

        this.connection?.send(new UseFurnitureMessageComposer(object.getId()));
    }

    // AS3: MysteryBoxOpenDialogView.as::onShowMysteryBoxWait()
    private onShowMysteryBoxWait = (): void =>
    {
        this.showWaitWindow();
    };

    // AS3: MysteryBoxOpenDialogView.as::onCancelMysteryBoxWait()
    private onCancelMysteryBoxWait = (): void =>
    {
        this.closeWindow();
    };

    // AS3: MysteryBoxOpenDialogView.as::onGotMysteryBoxPrize()
    private onGotMysteryBoxPrize = (event: IMessageEvent): void =>
    {
        const parser = event.parser as GotMysteryBoxPrizeMessageParser | null;

        if(!parser) return;

        this.showRewardWindow(parser.contentType, parser.classId);
    };

    /**
     * Owner and key holder see mirrored artwork: the owner's "reward" slot is the box and the
     * "needed" slot the key, and the other way round for the key holder. Only the *own* item is
     * tinted — the colour of the thing you still need is deliberately not revealed here.
     */
    // AS3: MysteryBoxOpenDialogView.as::showWaitWindow()
    private showWaitWindow(): void
    {
        this.closeWindow();

        const widget = this._widget;
        const container = widget?.handler?.container;
        const windowManager = container?.windowManager;

        if(!widget || !container || !windowManager) return;

        const layout = windowManager.requireWidgetLayout('mystery_box_open_dialog', 'mystery box wait dialog');

        this._modalDialog = windowManager.buildModalDialogFromXML(layout);
        this._window = (this._modalDialog?.rootWindow ?? null) as IWindowContainer | null;

        if(this._window === null) return;

        this._window.procedure = this.waitWindowProcedure;

        const isOwner = this._roomObject !== null && container.isOwnerOfFurniture(this._roomObject);
        const prefix = isOwner ? 'mysterybox.dialog.owner.' : 'mysterybox.dialog.other.';

        this._window.caption = `\${${prefix}title}`;

        this.setCaption('subtitle_text', `\${${prefix}subtitle}`);
        this.setCaption('waiting_text', `\${${prefix}waiting}`);
        this.setCaption('cancel_button', `\${${prefix}cancel}`);

        this.setAssetUri('reward_base', isOwner ? 'mysterybox_box_base' : 'mysterybox_key_base');
        this.setAssetUri('reward_overlay', isOwner ? 'mysterybox_box_overlay' : 'mysterybox_key_overlay');
        this.setAssetUri('needed_base', isOwner ? 'mysterybox_key_base' : 'mysterybox_box_base');
        this.setAssetUri('needed_overlay', isOwner ? 'mysterybox_key_overlay' : 'mysterybox_box_overlay');

        const sessionDataManager = container.sessionDataManager;
        const colorName = isOwner ? sessionDataManager?.mysteryBoxColor : sessionDataManager?.mysteryKeyColor;

        if(!colorName) return;

        const color = KEY_COLORS[colorName.toLowerCase()];

        if(color === undefined)
        {
            log.warn(`Unknown mystery box colour: ${colorName}`);

            return;
        }

        const rewardBase = this._window.findChildByName('reward_base');
        const neededBase = this._window.findChildByName('needed_base');

        if(rewardBase) rewardBase.color = color;
        if(neededBase) neededBase.color = color;
    }

    /**
     * Cancelling tells the *owner's* id to the server, not the object's — the server keys the
     * pending open on whose box it is.
     */
    // AS3: MysteryBoxOpenDialogView.as::waitWindowProcedure()
    private waitWindowProcedure = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        switch(window.name)
        {
            case 'header_button_close':
            case 'cancel_button': {
                this.closeWindow();

                const connection = this.connection;
                const container = this._widget?.handler?.container;

                if(connection !== null && container && this._roomObject !== null)
                {
                    connection.send(new MysteryBoxWaitingCanceledMessageComposer(
                        container.getFurnitureOwnerId(this._roomObject)
                    ));
                }

                break;
            }
        }
    };

    // AS3: MysteryBoxOpenDialogView.as::showRewardWindow()
    private showRewardWindow(contentType: string, classId: number): void
    {
        this.closeWindow();

        const widget = this._widget;
        const container = widget?.handler?.container;
        const windowManager = container?.windowManager;

        if(!widget || !container || !windowManager) return;

        const layout = windowManager.requireWidgetLayout('mystery_box_reward', 'mystery box reward dialog');

        this._modalDialog = windowManager.buildModalDialogFromXML(layout);
        this._window = (this._modalDialog?.rootWindow ?? null) as IWindowContainer | null;

        if(this._window === null) return;

        this._window.procedure = this.rewardWindowProcedure;

        this._imageId = -1;

        const roomEngine = container.roomEngine;
        const direction = new Vector3d(PREVIEW_DIRECTION_X, 0, 0);

        let image: ImageResult | null;

        switch(contentType)
        {
            case CONTENT_TYPE_FLOOR_ITEM:
                image = roomEngine?.getFurnitureImage(classId, direction, PREVIEW_SCALE, this, 0) ?? null;
                break;
            case CONTENT_TYPE_WALL_ITEM:
                image = roomEngine?.getWallItemImage(classId, direction, PREVIEW_SCALE, this, 0) ?? null;
                break;
            case CONTENT_TYPE_EFFECT:
                this.setRewardBitmap(container.catalog?.getPixelEffectIcon(classId) ?? null);

                return;
            case CONTENT_TYPE_SUBSCRIPTION:
                this.setRewardBitmap(container.catalog?.getSubscriptionProductIcon(classId) ?? null);

                return;
            default:
                log.warn(`Unknown mystery box prize content type: ${contentType}`);

                return;
        }

        if(image !== null)
        {
            if(image.data !== null) this.setRewardBitmap(image.data);

            this._imageId = image.id;
        }
    }

    /**
     * AS3 nudges the container's width by one after sizing it to the bitmap — a Flash relayout
     * kick. Kept: the port's item list resizes on the same signal.
     */
    // AS3: MysteryBoxOpenDialogView.as::set rewardBitmap()
    private setRewardBitmap(bitmap: ImageBitmap | null): void
    {
        if(this._window === null || this._window.disposed || bitmap === null) return;

        const image = this._window.findChildByName('reward_image') as IBitmapWrapperWindow | null;
        const container = this._window.findChildByName('bitmap_container');

        if(image) image.bitmap = bitmap;

        if(container)
        {
            container.width = bitmap.width;
            container.height = bitmap.height;
            container.width = container.width + 1;
        }
    }

    // AS3: MysteryBoxOpenDialogView.as::rewardWindowProcedure()
    private rewardWindowProcedure = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        switch(window.name)
        {
            case 'header_button_close':
            case 'close_button':
                this.closeWindow();
                break;
        }
    };

    // AS3: MysteryBoxOpenDialogView.as::imageReady() (IGetImageListener)
    public imageReady(id: number, bitmap: ImageBitmap | null): void
    {
        if(id !== this._imageId) return;

        this._imageId = -1;

        this.setRewardBitmap(bitmap);
    }

    // AS3: MysteryBoxOpenDialogView.as::imageFailed() (IGetImageListener)
    public imageFailed(_id: number): void
    {
    }

    // AS3: MysteryBoxOpenDialogView.as::closeWindow()
    private closeWindow(): void
    {
        if(this._modalDialog !== null && !this._modalDialog.disposed)
        {
            this._window = null;
            this._modalDialog.dispose();
            this._modalDialog = null;
        }
    }

    // AS3: MysteryBoxOpenDialogView.as::get connection()
    private get connection(): IConnection | null
    {
        return this._widget?.handler?.container?.connection ?? null;
    }

    private setCaption(name: string, caption: string): void
    {
        const child = this._window?.findChildByName(name);

        if(child) child.caption = caption;
    }

    private setAssetUri(name: string, assetUri: string): void
    {
        const child = this._window?.findChildByName(name) as IStaticBitmapWrapperWindow | null;

        if(child) child.assetUri = assetUri;
    }

    // AS3: MysteryBoxOpenDialogView.as::dispose()
    public dispose(): void
    {
        if(this._disposed) return;

        this.closeWindow();

        const connection = this.connection;

        if(connection !== null)
        {
            if(this._showWaitEvent) connection.removeMessageEvent(this._showWaitEvent);
            if(this._cancelWaitEvent) connection.removeMessageEvent(this._cancelWaitEvent);
            if(this._gotPrizeEvent) connection.removeMessageEvent(this._gotPrizeEvent);
        }

        this._showWaitEvent = null;
        this._cancelWaitEvent = null;
        this._gotPrizeEvent = null;
        this._roomObject = null;
        this._widget = null;
        this._disposed = true;
    }
}
