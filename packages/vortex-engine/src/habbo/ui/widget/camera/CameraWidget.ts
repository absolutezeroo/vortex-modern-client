import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IWindow} from '@core/window/IWindow';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IHabboCatalog} from '@habbo/catalog/IHabboCatalog';
import type {IRoomEngine} from '@habbo/room/IRoomEngine';
import type {IRoomEngineRectangle} from '@habbo/room/RoomEngine';
import type {IRoomDesktop} from '@habbo/ui/IRoomDesktop';
import type {IRoomWidgetHandler} from '@habbo/ui/IRoomWidgetHandler';
import type {IRoomWidgetHandlerContainer} from '@habbo/ui/IRoomWidgetHandlerContainer';
import type {RoomUI} from '@habbo/ui/RoomUI';
import {RoomWidgetBase} from '@habbo/ui/widget/RoomWidgetBase';
import type {CameraWidgetHandler} from '@habbo/ui/handler/CameraWidgetHandler';
import type {CameraPublishStatusMessageEvent} from '@habbo/communication/messages/incoming/camera/CameraPublishStatusMessageEvent';
import type {CompetitionStatusMessageEvent} from '@habbo/communication/messages/incoming/camera/CompetitionStatusMessageEvent';
import {Logger} from '@core/utils/Logger';
import {CameraPhotoLab} from './CameraPhotoLab';
import {CameraViewFinder} from './CameraViewFinder';

const log = Logger.getLogger('habbo.ui.widget.camera.CameraWidget');

/**
 * The in-room camera: owns the viewfinder, and the photo lab once a shot has been taken.
 *
 * The widget asks for the camera's prices as soon as it is constructed, and makes sure the
 * achievement data is loaded, because the photo lab gates its filters on
 * `ACH_CameraPhotoCount`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/camera/CameraWidget.as
 */
export class CameraWidget extends RoomWidgetBase
{
    // AS3: .../ui/widget/camera/CameraWidget.as::_SafeStr_4617
    private _component: RoomUI;

    // AS3: .../ui/widget/camera/CameraWidget.as::_SafeStr_5408
    private _viewFinder: CameraViewFinder | null = null;

    // AS3: .../ui/widget/camera/CameraWidget.as::_SafeStr_4687
    private _photoLab: CameraPhotoLab | null = null;

    // AS3: .../ui/widget/camera/CameraWidget.as::url
    url: string = '';

    // AS3: .../ui/widget/camera/CameraWidget.as::CameraWidget()
    constructor(
        handler: IRoomWidgetHandler,
        windowManager: IHabboWindowManager,
        assets: IAssetLibrary | null,
        localizations: IHabboLocalizationManager | null,
        component: RoomUI
    )
    {
        super(handler, windowManager, assets, localizations);

        this._component = component;

        const cameraHandler = this.handler;

        if(cameraHandler) cameraHandler.widget = this;

        if(this.roomEngine)
        {
            this.roomEngine.events?.on('REE_DISPOSED', this.onRoomDisposed);
            this.roomEngine.events?.on('REE_ROOM_ZOOMED', this.onRoomZoomed);
        }

        cameraHandler?.sendInitCameraMessage();

        this._viewFinder = new CameraViewFinder(this);

        cameraHandler?.roomDesktop?.questEngine?.ensureAchievementsInitialized();
    }

    // AS3: .../ui/widget/camera/CameraWidget.as::get catalog()
    get catalog(): IHabboCatalog | null
    {
        return this._component.catalog ?? null;
    }

    // AS3: .../ui/widget/camera/CameraWidget.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        if(this._viewFinder)
        {
            this._viewFinder.dispose();
            this._viewFinder = null;
        }

        if(this._photoLab)
        {
            this._photoLab.dispose();
            this._photoLab = null;
        }

        super.dispose();
    }

    // AS3: .../ui/widget/camera/CameraWidget.as::get container()
    get container(): IRoomWidgetHandlerContainer | null
    {
        return this.handler ? this.handler.container : null;
    }

    // AS3: .../ui/widget/camera/CameraWidget.as::get handler()
    get handler(): CameraWidgetHandler | null
    {
        return this._handler as CameraWidgetHandler | null;
    }

    // AS3: .../ui/widget/camera/CameraWidget.as::get roomEngine()
    get roomEngine(): IRoomEngine | null
    {
        return this.container ? this.container.roomEngine : null;
    }

    /**
	 * The camera only works at 1:1 zoom — the render the server produces is built from the room's
	 * unscaled geometry, so a zoomed client would send a viewport that does not match.
	 */
    // AS3: .../ui/widget/camera/CameraWidget.as::startTakingPhoto()
    startTakingPhoto(source: string): void
    {
        if(this.roomEngine && this.roomEngine.getRoomCanvasScale(this.container?.roomSession?.roomId ?? 0) !== 1)
        {
            this.windowManager.alert(
                this.localizations?.getLocalization('camera.zoom.missing.header') ?? '',
                this.localizations?.getLocalization('camera.zoom.missing.body') ?? '',
                0,
                null
            );

            return;
        }

        if(this._component.getProperty('camera.effects.enabled') === 'true')
        {
            CameraPhotoLab.preloadEffects(
                this._component.context?.configuration?.getProperty('image.library.url') ?? '',
                this._component.getProperty('camera.available.effects') ?? '',
                this.localizations as IHabboLocalizationManager
            );
        }

        if(this._photoLab)
        {
            this._photoLab.dispose();
        }

        this._viewFinder?.toggleVisible(source);
    }

    // AS3: .../ui/widget/camera/CameraWidget.as::get component()
    get component(): RoomUI
    {
        return this._component;
    }

    // AS3: .../ui/widget/camera/CameraWidget.as::getXmlWindow()
    getXmlWindow(name: string, scale: number = 1): IWindow | null
    {
        try
        {
            const asset = this.assets?.getAssetByName(name + '_xml') ?? null;

            if(asset === null) throw new Error(`asset ${name}_xml not found`);

            return this.windowManager.buildFromXML(asset.content as string, scale);
        }
        catch (error)
        {
            log.error(`Failed to build window ${name}_xml, ${this.windowManager}!`, error);

            throw error;
        }
    }

    // AS3: .../ui/widget/camera/CameraWidget.as::onRoomDisposed()
    private onRoomDisposed = (): void =>
    {
        this.hide();
    };

    // AS3: .../ui/widget/camera/CameraWidget.as::onRoomZoomed()
    private onRoomZoomed = (): void =>
    {
        if(this.roomEngine && this.roomEngine.getRoomCanvasScale(this.container?.roomSession?.roomId ?? 0) !== 1)
        {
            this.hide();
        }
    };

    // AS3: .../ui/widget/camera/CameraWidget.as::hide()
    private hide(): void
    {
        this._viewFinder?.hide();
        this._photoLab?.dispose();
    }

    /**
	 * AS3 passes a BitmapData and a translation Matrix and gets a boolean back; the port's engine
	 * takes the region and returns the pixels, because its bitmaps are immutable. Same capture.
	 */
    // AS3: .../ui/widget/camera/CameraWidget.as::snapShotRoomCanvas()
    async snapShotRoomCanvas(region: IRoomEngineRectangle): Promise<ImageBitmap | null>
    {
        const roomSession = this.container?.roomSession ?? null;

        if(this.roomEngine === null || roomSession === null) return null;

        return this.roomEngine.snapshotRoomCanvasToBitmap(
            roomSession.roomId,
            this.container?.getFirstCanvasId() ?? 1,
            region,
            this.handler?.roomDesktop?.roomBackgroundColor ?? 0
        );
    }

    // AS3: .../ui/widget/camera/CameraWidget.as::triggetCameraShutterSound()
    triggetCameraShutterSound(): void
    {
        this.container?.soundManager?.playSound('CAMERA_shutter');
    }

    // AS3: .../ui/widget/camera/CameraWidget.as::editPhoto()
    editPhoto(image: ImageBitmap | null): void
    {
        this._photoLab = new CameraPhotoLab(this);
        this._photoLab.openPhotoLab(image);
    }

    // AS3: .../ui/widget/camera/CameraWidget.as::changeCaptionFieldText()
    changeCaptionFieldText(text: string, reopen: boolean = false): void
    {
        if(this._photoLab)
        {
            this._photoLab.setCaptionText(text);

            if(reopen)
            {
                this._photoLab.show();
                this._photoLab.closePurchaseConfirmation();
            }
        }
    }

    // AS3: .../ui/widget/camera/CameraWidget.as::getViewPort()
    getViewPort(): IRoomEngineRectangle
    {
        if(this._viewFinder)
        {
            return this._viewFinder.getViewPort();
        }

        return {left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0};
    }

    // AS3: .../ui/widget/camera/CameraWidget.as::purchaseSuccessful()
    purchaseSuccessful(): void
    {
        this._photoLab?.animateSuccessfulPurchase();
    }

    // AS3: .../ui/widget/camera/CameraWidget.as::setRenderedPhotoUrl()
    setRenderedPhotoUrl(url: string): void
    {
        this._photoLab?.setRenderedPhotoUrl(url);
    }

    // AS3: .../ui/widget/camera/CameraWidget.as::publishingStatus()
    publishingStatus(event: CameraPublishStatusMessageEvent): void
    {
        this._photoLab?.publishingStatus(event);
    }

    // AS3: .../ui/widget/camera/CameraWidget.as::competitionStatus()
    competitionStatus(event: CompetitionStatusMessageEvent): void
    {
        this._photoLab?.competitionStatus(event);
    }

    /**
	 * Sends the render request stored when the shot was taken, decorated with whatever the photo lab
	 * has since applied. Returns false when the slot holds no message, which is how the purchase
	 * dialog learns to show its "too much stuff" failure.
	 */
    // AS3: .../ui/widget/camera/CameraWidget.as::sendPhotoData()
    sendPhotoData(): boolean
    {
        const message = this._viewFinder?.getRenderRoomMessage() ?? null;

        if(message === null) return false;

        if(this._photoLab)
        {
            message.addEffectData(this._photoLab.getEffectDataJson());
            message.setZoom(this._photoLab.getZoom());
        }

        message.compressData();

        if(message.isSendable())
        {
            this.handler?.sendPhotoData(message);

            return true;
        }

        return false;
    }

    // AS3: .../ui/widget/camera/CameraWidget.as::release()
    override release(): void
    {
        super.release();

        const handler = this.handler;

        if(handler) handler.roomDesktop = null;
    }

    // AS3: .../ui/widget/camera/CameraWidget.as::reuse()
    override reuse(desktop: IRoomDesktop): void
    {
        super.reuse(desktop);

        const handler = this.handler;

        if(handler) handler.roomDesktop = desktop as never;
    }
}
