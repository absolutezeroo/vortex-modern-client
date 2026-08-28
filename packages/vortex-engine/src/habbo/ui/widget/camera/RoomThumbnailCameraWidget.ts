import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {Component} from '@core/runtime/Component';
import type {ILinkEventTracker} from '@core/runtime/events/ILinkEventTracker';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IRoomEngine} from '@habbo/room/IRoomEngine';
import type {IRoomEngineRectangle} from '@habbo/room/RoomEngine';
import type {IRoomWidgetHandler} from '@habbo/ui/IRoomWidgetHandler';
import type {IRoomWidgetHandlerContainer} from '@habbo/ui/IRoomWidgetHandlerContainer';
import type {RoomUI} from '@habbo/ui/RoomUI';
import {RoomWidgetBase} from '@habbo/ui/widget/RoomWidgetBase';
import type {RoomThumbnailCameraWidgetHandler} from '@habbo/ui/handler/RoomThumbnailCameraWidgetHandler';

/**
 * The room-owner's "set this as the room thumbnail" camera — a much smaller affair than the photo
 * camera: one viewfinder, capture and cancel, no slots, no effects and no purchase.
 *
 * Unlike {@link CameraWidget} this one registers its own link tracker (`roomThumbnailCamera`) and
 * builds its window lazily, on the first `startTakingPhoto()`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/camera/RoomThumbnailCameraWidget.as
 */
export class RoomThumbnailCameraWidget extends RoomWidgetBase implements ILinkEventTracker
{
    // AS3: .../ui/widget/camera/RoomThumbnailCameraWidget.as::_SafeStr_4617
    private _component: RoomUI;

    // AS3: .../ui/widget/camera/RoomThumbnailCameraWidget.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: .../ui/widget/camera/RoomThumbnailCameraWidget.as::_SafeStr_4794
    private _viewfinder: (IWindow & { bitmap?: ImageBitmap | null }) | null = null;

    // TS-only: no AS3 counterpart. Latches the async capture in update(); AS3's snapshot is
    // synchronous and needs no such guard.
    private _captureInFlight: boolean = false;

    // AS3: .../ui/widget/camera/RoomThumbnailCameraWidget.as::RoomThumbnailCameraWidget()
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

        const thumbnailHandler = this.handler;

        if(thumbnailHandler) thumbnailHandler.widget = this;

        if(this.roomEngine)
        {
            this.roomEngine.events?.on('REE_DISPOSED', this.onRoomDisposed);
            this.roomEngine.events?.on('REE_ROOM_ZOOMED', this.onRoomZoomed);
        }

        (windowManager as unknown as Component).context?.addLinkEventTracker(this);
    }

    // AS3: .../ui/widget/camera/RoomThumbnailCameraWidget.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        (this.windowManager as unknown as Component).context?.removeLinkEventTracker(this);

        super.dispose();
    }

    // AS3: .../ui/widget/camera/RoomThumbnailCameraWidget.as::get container()
    get container(): IRoomWidgetHandlerContainer | null
    {
        return this.handler ? this.handler.container : null;
    }

    // AS3: .../ui/widget/camera/RoomThumbnailCameraWidget.as::get handler()
    get handler(): RoomThumbnailCameraWidgetHandler | null
    {
        return this._handler as RoomThumbnailCameraWidgetHandler | null;
    }

    // AS3: .../ui/widget/camera/RoomThumbnailCameraWidget.as::get roomEngine()
    get roomEngine(): IRoomEngine | null
    {
        return this.container ? this.container.roomEngine : null;
    }

    // AS3: .../ui/widget/camera/RoomThumbnailCameraWidget.as::update()
    update(_time: number): void
    {
        // Same async-capture latch as CameraViewFinder.update() — see the note there.
        if(this._window && this._viewfinder && !this._captureInFlight)
        {
            const roomSession = this.container?.roomSession ?? null;

            if(this.roomEngine === null || roomSession === null) return;

            this._captureInFlight = true;

            void this.roomEngine.snapshotRoomCanvasToBitmap(
                roomSession.roomId,
                this.container?.getFirstCanvasId() ?? 1,
                this.viewPort,
                this.handler?.roomDesktop?.roomBackgroundColor ?? 0
            )
                .then((bitmap) =>
                {
                    if(bitmap !== null && this._viewfinder)
                    {
                        this._viewfinder.bitmap = bitmap;
                    }
                })
                .finally(() =>
                {
                    this._captureInFlight = false;
                });
        }
    }

    // AS3: .../ui/widget/camera/RoomThumbnailCameraWidget.as::startTakingPhoto()
    startTakingPhoto(): void
    {
        if(this.roomEngine && this.roomEngine.getRoomCanvasScale(this.container?.roomSession?.roomId ?? 0) !== 1)
        {
            // The two captions here are hard-coded English in AS3, not localization keys. Kept.
            this.windowManager.alert(
                'Camera only works on normal zoom!',
                'Return to normal zoom level and try again!',
                0,
                null
            );

            return;
        }

        if(!this._window)
        {
            this.createWindow();
        }
    }

    // AS3: .../ui/widget/camera/RoomThumbnailCameraWidget.as::createWindow()
    private createWindow(): void
    {
        if(this._window)
        {
            this.destroy();
        }

        const asset = this._component.assets?.getAssetByName('iro_room_thumbnail_camera_xml') ?? null;

        if(asset === null) return;

        this._window = this.windowManager.buildFromXML(asset.content as string) as IWindowContainer | null;

        if(this._window === null) return;

        this._viewfinder = this._window.findChildByName('viewfinder') as (IWindow & { bitmap?: ImageBitmap | null }) | null;
        this._window.procedure = this.windowProcedure;
        this._window.center();

        this._component.registerUpdateReceiver(this, 10);
    }

    // AS3: .../ui/widget/camera/RoomThumbnailCameraWidget.as::destroy()
    destroy(): void
    {
        if(this._window)
        {
            this._window.destroy();
            this._window = null;
            this._component.removeUpdateReceiver(this);
        }
    }

    /**
     * AS3: RoomThumbnailCameraWidget.as::get viewPort()
     *
     * The rectangle the capture is cropped to, in **screen** coordinates — which is what
     * `snapshotRoomCanvasToBitmap()` offsets by, so it has to be global.
     *
     * This used to read `_viewfinder.x`/`.y` directly, under a comment claiming those were "already
     * screen-relative for a centred top-level window". They are not: the viewfinder is a *child* of
     * the widget's window, so its own coordinates are a small offset inside it — the crop landed
     * near the canvas origin instead of on the viewfinder, and the thumbnail came out black.
     * AS3 calls `getGlobalPosition()` here for exactly this reason; `getGlobalRectangle()` is this
     * port's spelling of it, and it also stays correct if the window is ever nested deeper.
     */
    // AS3: .../ui/widget/camera/RoomThumbnailCameraWidget.as::get viewPort()
    get viewPort(): IRoomEngineRectangle
    {
        if(this._viewfinder === null)
        {
            return {left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0};
        }

        const global = {x: 0, y: 0, width: 0, height: 0};

        this._viewfinder.getGlobalRectangle(global);

        return {
            left: global.x,
            top: global.y,
            right: global.x + global.width,
            bottom: global.y + global.height,
            width: global.width,
            height: global.height
        };
    }

    // AS3: .../ui/widget/camera/RoomThumbnailCameraWidget.as::onRoomDisposed()
    private onRoomDisposed = (): void =>
    {
        this.destroy();
    };

    // AS3: .../ui/widget/camera/RoomThumbnailCameraWidget.as::onRoomZoomed()
    private onRoomZoomed = (): void =>
    {
        if(this.roomEngine && this.roomEngine.getRoomCanvasScale(this.container?.roomSession?.roomId ?? 0) !== 1)
        {
            this.destroy();
        }
    };

    // AS3: .../ui/widget/camera/RoomThumbnailCameraWidget.as::triggerCameraShutterSound()
    triggerCameraShutterSound(): void
    {
        this.container?.soundManager?.playSound('CAMERA_shutter');
    }

    // AS3: .../ui/widget/camera/RoomThumbnailCameraWidget.as::windowProcedure()
    private windowProcedure = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK')
        {
            return;
        }

        switch(window.name)
        {
            case 'button_capture':
            {
                this.triggerCameraShutterSound();

                const message = this.handler?.collectPhotoData() ?? null;

                if(message !== null && message.isSendable())
                {
                    this.handler?.sendPhotoData(message);

                    // Both buttons go dead while the render is in flight; the window itself stays
                    // up until ThumbnailStatus arrives and the handler destroys it.
                    this._window?.findChildByName('button_capture')?.disable();
                    this._window?.findChildByName('button_cancel')?.disable();
                    this._component.removeUpdateReceiver(this);
                }
                else
                {
                    this.windowManager.alert('${generic.alert.title}', '${camera.alert.too_much_stuff}', 0, null);
                }

                return;
            }

            case 'header_button_close':
            case 'button_cancel':
                this.destroy();
        }
    };

    // AS3: .../ui/widget/camera/RoomThumbnailCameraWidget.as::get linkPattern()
    get linkPattern(): string
    {
        return 'roomThumbnailCamera';
    }

    // AS3: .../ui/widget/camera/RoomThumbnailCameraWidget.as::linkReceived()
    linkReceived(link: string): void
    {
        const parts = link.split('/');

        if(parts.length < 2)
        {
            return;
        }

        if(parts[1] === 'open')
        {
            this.startTakingPhoto();
        }
    }
}
