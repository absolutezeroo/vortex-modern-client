import {Sprite, Texture} from 'pixi.js';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {IGetImageListener} from '@habbo/room/IGetImageListener';
import type {IRoomEngine} from '@habbo/room/IRoomEngine';
import type {ISelectedRoomObjectData} from '@habbo/room/ISelectedRoomObjectData';
import type {ImageResult} from '@habbo/room/ImageResult';

/**
 * Drag-ghost-icon helper: while the user is placing a purchased/moved furni item and the mouse
 * strays outside the room canvas (e.g. over a catalog widget), shows a floating icon that
 * follows the cursor. Sends no network messages of its own.
 *
 * TS deviation: AS3 mounts its overlay Sprite onto `mainContainer.desktop.getDisplayObject()`
 * (the window system's own root display object). This port instead uses
 * `IRoomEngine.addStageChild()/removeStageChild()` - the same "mount directly on the PixiJS
 * stage, above everything" mechanism RoomEngine.ts already built for its own object-mover icon
 * sprite - so `mainContainer` is kept (AS3 has a public setter for it) but unused internally.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/CatalogObjectMover.as
 */
export class CatalogObjectMover implements IGetImageListener
{
    private _roomEngine: IRoomEngine | null = null;

    private _mainContainer: IWindowContainer | null = null;

    private _state: boolean = false;

    private _overlaySprite: Sprite | null = null;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/CatalogObjectMover.as::set roomEngine()
    set roomEngine(value: IRoomEngine | null)
    {
        this._roomEngine = value;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/CatalogObjectMover.as::set mainContainer()
    set mainContainer(value: IWindowContainer | null)
    {
        this._mainContainer = value;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/CatalogObjectMover.as::get state()
    get state(): boolean
    {
        return this._state;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/CatalogObjectMover.as::dispose()
    dispose(): void
    {
        this.releaseOverlaySprite();
        this._mainContainer = null;
        this._roomEngine = null;
        this._state = false;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/CatalogObjectMover.as::imageReady()
    imageReady(_id: number, _data: ImageBitmap | null): void
    {
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/CatalogObjectMover.as::imageFailed()
    imageFailed(_id: number): void
    {
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/CatalogObjectMover.as::onMainContainerEvent()
    onMainContainerEvent(event: WindowEvent, _target: unknown, objectData: ISelectedRoomObjectData | null): void
    {
        if(this._roomEngine == null) return;

        const mouseEvent = event as WindowMouseEvent;

        switch(event.type)
        {
            case 'WME_MOVE': {
                if(objectData == null || objectData.operation !== 'OBJECT_PLACE') return;

                const stageX = mouseEvent.stageX;
                const stageY = mouseEvent.stageY;

                if(this._overlaySprite == null)
                {
                    const result = this.getFurniImageResult(objectData);

                    if(result == null) return;

                    this.createOverlaySprite(result);
                }

                this._state = true;
                this.moveOverlaySprite(stageX, stageY);
                break;
            }

            case 'WME_OUT':
                if(this._state)
                {
                    const target = event.target;

                    if(target != null && mouseEvent.localX >= 0 && mouseEvent.localX < target.width
                        && mouseEvent.localY >= 0 && mouseEvent.localY < target.height)
                    {
                        return;
                    }

                    this.resetIcon();
                }
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/CatalogObjectMover.as::resetIcon()
    resetIcon(): void
    {
        if(this._state)
        {
            this.releaseOverlaySprite();
            this._state = false;
        }
    }

    private getFurniImageResult(objectData: ISelectedRoomObjectData): ImageResult | null
    {
        if(objectData == null || this._roomEngine == null) return null;

        if(objectData.category === 10) return this._roomEngine.getFurnitureIcon(objectData.typeId, this);
        if(objectData.category === 20) return this._roomEngine.getWallItemIcon(objectData.typeId, this, objectData.instanceData);

        return null;
    }

    private createOverlaySprite(result: ImageResult): void
    {
        if(result.data == null || this._roomEngine == null || this._overlaySprite != null) return;

        this._overlaySprite = new Sprite(Texture.from(result.data));
        this._overlaySprite.eventMode = 'none';
        this._roomEngine.addStageChild(this._overlaySprite);
    }

    private moveOverlaySprite(stageX: number, stageY: number): void
    {
        if(this._overlaySprite == null) return;

        this._overlaySprite.x = stageX - Math.round(this._overlaySprite.width / 2);
        this._overlaySprite.y = stageY - Math.round(this._overlaySprite.height / 2);
    }

    private releaseOverlaySprite(): void
    {
        if(this._overlaySprite == null || this._roomEngine == null) return;

        this._roomEngine.removeStageChild(this._overlaySprite);
        this._overlaySprite.destroy();
        this._overlaySprite = null;
    }
}
