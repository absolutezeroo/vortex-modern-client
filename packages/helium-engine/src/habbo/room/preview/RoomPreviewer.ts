import {Rectangle, Graphics} from 'pixi.js';
import type {Container} from 'pixi.js';
import type {IVector3d} from '@room/utils/IVector3d';
import {Vector3d} from '@room/utils/Vector3d';
import type {IRoomEngine} from '@habbo/room/IRoomEngine';
import {RoomPlaneParser} from '@habbo/room/object/RoomPlaneParser';
import {RoomId} from '@room/utils/RoomId';
import {RoomEngineEvent} from '@habbo/room/events/RoomEngineEvent';
import {RoomEngineObjectEvent} from '@habbo/room/events/RoomEngineObjectEvent';
import type {IGetImageListener} from '@habbo/room/IGetImageListener';
import type {ImageResult} from '@habbo/room/ImageResult';
import type {IStuffData} from '@habbo/room/object/data/IStuffData';
import {LegacyStuffData} from '@habbo/room/object/data/LegacyStuffData';
import type {IRoomObjectModelController} from '@room/object/IRoomObjectModelController';

interface IPoint
{
    x: number;
    y: number;
}

/**
 * Renders a small, isolated room used to preview a single furniture item,
 * wall item, pet or avatar outside of any real room the user is in.
 *
 * AS3: sources/win63_version/habbo/room/preview/RoomPreviewer.as
 *
 * TS notes:
 * - Several IRoomEngine capabilities the AS3 previewer calls do not exist in
 *   the ported engine yet (changeObjectState, updateObjectUserAction,
 *   updateObjectRoomVisibilities, get*Image, runUpdate, isInitialized,
 *   disableUpdate). Those members are still ported with an AS3-compatible
 *   signature and flagged with an explicit TODO(AS3) so the behaviour is
 *   visible rather than silently missing.
 * - AS3 drives updatePreviewRoomView() from the engine's REOE_ADDED /
 *   REOE_CONTENT_UPDATED / REE_INITIALIZED events. The equivalent
 *   content-loaded event isn't fully available here, so the previewer also
 *   registers a per-frame canvas-sync callback (registerCanvasSyncCallback)
 *   to re-run the framing math, in addition to wiring the available engine
 *   events.
 */
export class RoomPreviewer
{
    private static readonly PREVIEW_CANVAS_ID: number = 1;
    private static readonly PREVIEW_OBJECT_ID: number = 1;
    private static readonly PREVIEW_OBJECT_LOCATION_X: number = 2;
    private static readonly PREVIEW_OBJECT_LOCATION_Y: number = 2;
    private static readonly ALLOWED_IMAGE_CUT: number = 0.25;

    public static readonly SCALE_NORMAL: number = 64;
    public static readonly SCALE_SMALL: number = 32;

    private static readonly AUTOMATIC_STATE_CHANGE_INTERVAL: number = 2500;

    // AS3: sources/win63_version/habbo/room/preview/RoomPreviewer.as::_roomEngine
    private _roomEngine: IRoomEngine | null;
    // AS3: sources/win63_version/habbo/room/preview/RoomPreviewer.as::var_68
    private _previewRoomId: number = 1;
    // AS3: sources/win63_version/habbo/room/preview/RoomPreviewer.as::var_1699
    private _currentPreviewObjectType: number = 0;
    // AS3: sources/win63_version/habbo/room/preview/RoomPreviewer.as::var_399
    private _currentPreviewObjectCategory: number = 0;
    // AS3: sources/win63_version/habbo/room/preview/RoomPreviewer.as::var_1908
    private _currentPreviewObjectData: string = '';
    // AS3: sources/win63_version/habbo/room/preview/RoomPreviewer.as::_currentPreviewRectangle
    private _currentPreviewRectangle: Rectangle | null = null;
    // AS3: sources/win63_version/habbo/room/preview/RoomPreviewer.as::_currentPreviewCanvasWidth
    private _currentPreviewCanvasWidth: number = 0;
    // AS3: sources/win63_version/habbo/room/preview/RoomPreviewer.as::var_1478
    private _currentPreviewCanvasHeight: number = 0;
    // AS3: sources/win63_version/habbo/room/preview/RoomPreviewer.as::var_510
    private _currentPreviewScale: number = 64;
    // AS3: sources/win63_version/habbo/room/preview/RoomPreviewer.as::var_1596
    private _zoomChanged: boolean = false;
    // AS3: sources/win63_version/habbo/room/preview/RoomPreviewer.as::var_1259
    private _automaticStateChange: boolean = false;
    // AS3: sources/win63_version/habbo/room/preview/RoomPreviewer.as::_previousAutomaticStateChangeTime
    private _previousAutomaticStateChangeTime: number = 0;
    // AS3: sources/win63_version/habbo/room/preview/RoomPreviewer.as::_addViewOffset
    private _addViewOffset: IPoint = {x: 0, y: 0};
    // AS3: sources/win63_version/habbo/room/preview/RoomPreviewer.as::_disableUpdate
    private _disableUpdate: boolean = false;

    // TS-only: AS3 renders this preview onto the same unified Flash display
    // list as the surrounding window chrome, so wherever the room scene has
    // no geometry, the inventory window's own background naturally shows
    // through underneath. Here the room preview is a separate PixiJS canvas
    // layered as a DisplayObject behind a "hole" punched in the UI canvas
    // (see WindowComposite.ts's clearRect for WindowType.DISPLAY_OBJECT_WRAPPER)
    // — so an area with no room geometry has nothing to fall back to and
    // shows through to whatever is behind the browser page entirely. Paint a
    // flat fill matching the classic inventory body colour behind the scene
    // so growth of the preview area (a legitimate stretch — see
    // RoomPreviewerWidget.ts) reveals this colour instead of see-through.
    private static readonly PREVIEW_BACKGROUND_COLOR = 0xeceae0;
    private _backgroundFill: Graphics | null = null;

    // Re-entrancy guard: the ported engine re-emits REE_INITIALIZED from
    // initializeRoomVisuals() (which updateObjectRoom() maps onto), so without
    // this flag onRoomInitialized() → updateObjectRoom() would recurse forever.
    private _updatingObjectRoom: boolean = false;

    private readonly updatePreviewRoomViewBound = (): void => this.updatePreviewRoomView();
    private readonly onRoomObjectAddedBound = (event: RoomEngineObjectEvent): void =>
        this.onRoomObjectAdded(event.roomId, event.objectId, event.category);

    private readonly onRoomInitializedBound = (event: RoomEngineEvent): void => this.onRoomInitialized(event);

    // AS3: sources/win63_version/habbo/room/preview/RoomPreviewer.as::RoomPreviewer()
    constructor(roomEngine: IRoomEngine, previewRoomId: number = 1)
    {
        this._roomEngine = roomEngine;
        this._previewRoomId = RoomId.makeRoomPreviewerId(previewRoomId);

        if(this._roomEngine)
        {
            // AS3 listens to "REOE_ADDED"/"REOE_CONTENT_UPDATED"; the ported engine
            // surfaces object placement through REOE_OBJECT_ADDED.
            this._roomEngine.events.on(RoomEngineObjectEvent.REOE_OBJECT_ADDED, this.onRoomObjectAddedBound);
            this._roomEngine.events.on(RoomEngineEvent.REE_INITIALIZED, this.onRoomInitializedBound);

            // TS deviation (see class doc comment): re-run the framing math every
            // frame because the AS3 content-loaded event isn't fully available.
            this._roomEngine.registerCanvasSyncCallback(this.updatePreviewRoomViewBound);
        }
    }

    // AS3: sources/win63_version/habbo/room/preview/RoomPreviewer.as::get previewRoomId()
    get previewRoomId(): number
    {
        return this._previewRoomId;
    }

    // AS3: sources/win63_version/habbo/room/preview/RoomPreviewer.as::get isRoomEngineReady()
    // TODO(AS3): sources/win63_version/habbo/room/preview/RoomPreviewer.as::get isRoomEngineReady()
    // AS3 also requires _roomEngine.isInitialized; IRoomEngine has no isInitialized
    // accessor yet, so only the null check is enforced.
    get isRoomEngineReady(): boolean
    {
        return this._roomEngine !== null;
    }

    // AS3: sources/win63_version/habbo/room/preview/RoomPreviewer.as::createRoomForPreviews()
    createRoomForPreviews(): void
    {
        if(!this._roomEngine) return;

        const size = 7;
        const parser = new RoomPlaneParser();

        parser.initializeTileMap(size + 2, size + 2);

        for(let y = 1; y < 1 + size; y++)
        {
            for(let x = 1; x < 1 + size; x++)
            {
                parser.setTileHeight(x, y, 0);
            }
        }

        parser.initializeFromTileData();
        this._roomEngine.initializeRoom(this._previewRoomId, parser);
    }

    // AS3: sources/win63_version/habbo/room/preview/RoomPreviewer.as::reset()
    reset(disposing: boolean): void
    {
        if(this._roomEngine)
        {
            this._roomEngine.disposeObjectFurniture(this._previewRoomId, RoomPreviewer.PREVIEW_OBJECT_ID);
            this._roomEngine.disposeObjectWallItem(this._previewRoomId, RoomPreviewer.PREVIEW_OBJECT_ID);
            this._roomEngine.disposeObjectUser(this._previewRoomId, RoomPreviewer.PREVIEW_OBJECT_ID);

            if(!disposing)
            {
                this.updatePreviewRoomView();
            }
        }

        this._currentPreviewObjectCategory = -2;
    }

    // AS3: sources/win63_version/habbo/room/preview/RoomPreviewer.as::addFurnitureIntoRoom()
    addFurnitureIntoRoom(type: number, direction: IVector3d, stuffData: IStuffData | null = null, extra: string | null = null): number
    {
        const data: IStuffData = stuffData ?? new LegacyStuffData();

        if(this.isRoomEngineReady)
        {
            if(this._currentPreviewObjectCategory === 10 && this._currentPreviewObjectType === type)
            {
                return 1;
            }

            this.reset(false);
            this._currentPreviewObjectType = type;
            this._currentPreviewObjectCategory = 10;
            this._currentPreviewObjectData = '';

            // AS3 passes the full IStuffData (param7) straight through to addObjectFurniture()
            // and an empty string ("") for the separate `extra` field (param12) - this port was
            // previously collapsing the real stuff data down to `getLegacyString()` and stuffing
            // it into the `extra` slot instead, which loses everything but format-0's single
            // string (e.g. a guild's groupId/badgeCode/colors array never survived past index 0).
            if(this._roomEngine!.addRoomObjectFurniture(
                this._previewRoomId,
                RoomPreviewer.PREVIEW_OBJECT_ID,
                type,
                new Vector3d(RoomPreviewer.PREVIEW_OBJECT_LOCATION_X, RoomPreviewer.PREVIEW_OBJECT_LOCATION_Y, 0),
                direction,
                0,
                '',
                Number.NaN,
                -1,
                0,
                '',
                true,
                data
            ))
            {
                this._previousAutomaticStateChangeTime = RoomPreviewer.getTimer();
                this._automaticStateChange = true;

                const object = this._roomEngine!.getRoomObject(this._previewRoomId, RoomPreviewer.PREVIEW_OBJECT_ID, this._currentPreviewObjectCategory);

                if(object)
                {
                    if(extra !== null)
                    {
                        (object.getModel() as IRoomObjectModelController).setString('furniture_extras', extra);
                    }
                }

                this.updatePreviewRoomView();
            }
        }

        return -1;
    }

    // AS3: sources/win63_version/habbo/room/preview/RoomPreviewer.as::addWallItemIntoRoom()
    addWallItemIntoRoom(type: number, direction: IVector3d, legacyString: string): number
    {
        if(this.isRoomEngineReady)
        {
            if(this._currentPreviewObjectCategory === 20 && this._currentPreviewObjectType === type && this._currentPreviewObjectData === legacyString)
            {
                return 1;
            }

            this.reset(false);
            this._currentPreviewObjectType = type;
            this._currentPreviewObjectCategory = 20;
            this._currentPreviewObjectData = legacyString;

            if(this._roomEngine!.addRoomObjectWallItem(
                this._previewRoomId,
                RoomPreviewer.PREVIEW_OBJECT_ID,
                type,
                new Vector3d(0.5, 2.3, 1.8),
                direction,
                0,
                legacyString,
                Number.NaN,
                -1,
                0,
                ''
            ))
            {
                this._previousAutomaticStateChangeTime = RoomPreviewer.getTimer();
                this._automaticStateChange = true;

                return 1;
            }
        }

        return -1;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/room/preview/RoomPreviewer.as::canRotatePreviewFurniture()
    // TODO(AS3): AS3 checks getPreviewFurnitureAllowedDirections().length > 1, based on the
    // furniture data's own valid-direction set - that data isn't exposed by the ported room
    // engine yet. Always false until it is, so the rotate buttons show correctly disabled
    // rather than pretending furniture rotation works.
    canRotatePreviewFurniture(): boolean
    {
        return false;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/room/preview/RoomPreviewer.as::rotatePreviewFurniture()
    // TODO(AS3): see canRotatePreviewFurniture() - needs the furniture object's allowed
    // direction set, which the ported room engine doesn't expose yet.
    rotatePreviewFurniture(_clockwise: boolean): boolean
    {
        return false;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/room/preview/RoomPreviewer.as::canRotatePreviewWallItem()
    // TODO(AS3): AS3 checks getPreviewWallItemObject() != null - needs the preview wall item's
    // room object lookup, not wired up here yet.
    canRotatePreviewWallItem(): boolean
    {
        return false;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/room/preview/RoomPreviewer.as::rotatePreviewWallItem()
    // TODO(AS3): see canRotatePreviewWallItem().
    rotatePreviewWallItem(): boolean
    {
        return false;
    }

    // AS3: sources/win63_version/habbo/room/preview/RoomPreviewer.as::addAvatarIntoRoom()
    addAvatarIntoRoom(figure: string, effect: number = 0): number
    {
        if(this.isRoomEngineReady)
        {
            this.reset(false);
            this._currentPreviewObjectType = 1;
            this._currentPreviewObjectCategory = 100;
            this._currentPreviewObjectData = figure;

            // AS3 passes headDirection 135 and ownerId 1; IRoomEngine.addRoomObjectUser
            // only accepts location/direction/type, so those extra arguments are
            // applied afterwards via updateUser* below.
            if(this._roomEngine!.addRoomObjectUser(
                this._previewRoomId,
                RoomPreviewer.PREVIEW_OBJECT_ID,
                new Vector3d(RoomPreviewer.PREVIEW_OBJECT_LOCATION_X, RoomPreviewer.PREVIEW_OBJECT_LOCATION_Y, 0),
                new Vector3d(90, 0, 0),
                figure
            ))
            {
                this._previousAutomaticStateChangeTime = RoomPreviewer.getTimer();
                this._automaticStateChange = true;
                this.updateUserGesture(1);
                this.updateUserEffect(effect);
                this.updateUserPosture('std');
            }

            this.updatePreviewRoomView();

            return 1;
        }

        return -1;
    }

    // AS3: sources/win63_version/habbo/room/preview/RoomPreviewer.as::updateUserPosture()
    updateUserPosture(posture: string, parameter: string = ''): void
    {
        if(this.isRoomEngineReady)
        {
            this._roomEngine!.updateRoomObjectUserPosture(this._previewRoomId, RoomPreviewer.PREVIEW_OBJECT_ID, posture, parameter);
        }
    }

    // AS3: sources/win63_version/habbo/room/preview/RoomPreviewer.as::updateUserGesture()
    updateUserGesture(gesture: number): void
    {
        if(this.isRoomEngineReady)
        {
            this._roomEngine!.updateRoomObjectUserGesture(this._previewRoomId, RoomPreviewer.PREVIEW_OBJECT_ID, gesture);
        }
    }

    // AS3: sources/win63_version/habbo/room/preview/RoomPreviewer.as::updateUserEffect()
    updateUserEffect(effect: number): void
    {
        if(this.isRoomEngineReady)
        {
            this._roomEngine!.updateRoomObjectUserEffect(this._previewRoomId, RoomPreviewer.PREVIEW_OBJECT_ID, effect);
        }
    }

    // AS3: sources/win63_version/habbo/room/preview/RoomPreviewer.as::updateObjectUserFigure()
    updateObjectUserFigure(figure: string, gender: string | null = null, clubLevel: string | null = null, isRiding: boolean = false): boolean
    {
        if(this.isRoomEngineReady)
        {
            return this._roomEngine!.updateRoomObjectUserFigure(this._previewRoomId, RoomPreviewer.PREVIEW_OBJECT_ID, figure, gender, clubLevel, isRiding);
        }

        return false;
    }

    // AS3: sources/win63_version/habbo/room/preview/RoomPreviewer.as::updateObjectUserAction()
    // TODO(AS3): sources/win63_version/habbo/room/preview/RoomPreviewer.as::updateObjectUserAction()
    // Should call _roomEngine.updateObjectUserAction(previewRoomId, 1, action, value, parameter);
    // IRoomEngine has no updateObjectUserAction equivalent yet.
    updateObjectUserAction(_action: string, _value: number, _parameter: string | null = null): void
    {
        if(this.isRoomEngineReady)
        {
            // Not wired yet.
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/room/preview/RoomPreviewer.as::updateAvatarDirectionAndLocation()
    updateAvatarDirectionAndLocation(bodyDirection: number, headDirection: number, location: IVector3d | null = null): void
    {
        if(this.isRoomEngineReady)
        {
            const target = location ?? new Vector3d(RoomPreviewer.PREVIEW_OBJECT_LOCATION_X, RoomPreviewer.PREVIEW_OBJECT_LOCATION_Y, 0);

            this._roomEngine!.updateRoomObjectUser(
                this._previewRoomId,
                RoomPreviewer.PREVIEW_OBJECT_ID,
                target,
                target,
                new Vector3d(bodyDirection * 45, 0, 0),
                headDirection * 45,
                false,
                0
            );
        }
    }

    // AS3: sources/win63_version/habbo/room/preview/RoomPreviewer.as::changeRoomObjectState()
    // TODO(AS3): sources/win63_version/habbo/room/preview/RoomPreviewer.as::changeRoomObjectState()
    // Should call _roomEngine.changeObjectState(previewRoomId, 1, category) for non-avatar
    // previews; IRoomEngine has no changeObjectState equivalent yet.
    changeRoomObjectState(): void
    {
        if(this.isRoomEngineReady)
        {
            this._automaticStateChange = false;
            if(this._currentPreviewObjectCategory !== 100)
            {
                // Not wired yet.
            }
        }
    }

    // AS3: sources/win63_version/habbo/room/preview/RoomPreviewer.as::checkAutomaticRoomObjectStateChange()
    private checkAutomaticRoomObjectStateChange(): void
    {
        if(this._automaticStateChange)
        {
            const now = RoomPreviewer.getTimer();
            if(now > this._previousAutomaticStateChangeTime + RoomPreviewer.AUTOMATIC_STATE_CHANGE_INTERVAL)
            {
                this._previousAutomaticStateChangeTime = now;
                if(this.isRoomEngineReady)
                {
                    // TODO(AS3): _roomEngine.changeObjectState(previewRoomId, 1, category) — not wired yet.
                }
            }
        }
    }

    // AS3: sources/win63_version/habbo/room/preview/RoomPreviewer.as::getRoomCanvas()
    getRoomCanvas(width: number, height: number): Container | null
    {
        if(this._roomEngine)
        {
            const canvas = this._roomEngine.createRoomCanvas(this._previewRoomId, RoomPreviewer.PREVIEW_CANVAS_ID, width, height, this._currentPreviewScale);

            this._roomEngine.setRoomCanvasMask(this._previewRoomId, RoomPreviewer.PREVIEW_CANVAS_ID, true);

            const geometry = this._roomEngine.getRoomCanvasGeometry(this._previewRoomId, RoomPreviewer.PREVIEW_CANVAS_ID);
            if(geometry !== null)
            {
                geometry.adjustLocation(new Vector3d(2, 2, 0), 30);
            }

            this._currentPreviewCanvasWidth = width;
            this._currentPreviewCanvasHeight = height;

            if(canvas)
            {
                this._backgroundFill = new Graphics();
                this.redrawBackgroundFill(width, height);
                canvas.addChildAt(this._backgroundFill, 0);
            }

            return canvas;
        }

        return null;
    }

    private redrawBackgroundFill(width: number, height: number): void
    {
        if(!this._backgroundFill) return;

        this._backgroundFill
            .clear()
            .rect(0, 0, Math.max(1, width), Math.max(1, height))
            .fill(RoomPreviewer.PREVIEW_BACKGROUND_COLOR);
    }

    // AS3: sources/win63_version/habbo/room/preview/RoomPreviewer.as::modifyRoomCanvas()
    modifyRoomCanvas(width: number, height: number): void
    {
        if(this._roomEngine)
        {
            this._currentPreviewCanvasWidth = width;
            this._currentPreviewCanvasHeight = height;
            this._roomEngine.modifyRoomCanvas(this._previewRoomId, RoomPreviewer.PREVIEW_CANVAS_ID, width, height);
            this.redrawBackgroundFill(width, height);
        }
    }

    // AS3: sources/win63_version/habbo/room/preview/RoomPreviewer.as::set addViewOffset()
    set addViewOffset(value: IPoint)
    {
        this._addViewOffset = value;
    }

    // AS3: sources/win63_version/habbo/room/preview/RoomPreviewer.as::get addViewOffset()
    get addViewOffset(): IPoint
    {
        return this._addViewOffset;
    }

    // AS3: sources/win63_version/habbo/room/preview/RoomPreviewer.as::updatePreviewObjectBoundingRectangle()
    private updatePreviewObjectBoundingRectangle(offset: IPoint | null): void
    {
        const source = this._roomEngine!.getRoomObjectBoundingRectangle(this._previewRoomId, RoomPreviewer.PREVIEW_OBJECT_ID, this._currentPreviewObjectCategory, RoomPreviewer.PREVIEW_CANVAS_ID);

        if(source !== null && offset !== null)
        {
            const rectangle = new Rectangle(source.left, source.top, source.width, source.height);

            rectangle.x += -(this._currentPreviewCanvasWidth >> 1) - offset.x;
            rectangle.y += -(this._currentPreviewCanvasHeight >> 1) - offset.y;

            if(this._currentPreviewRectangle === null)
            {
                this._currentPreviewRectangle = rectangle;
            }
            else
            {
                const current = this._currentPreviewRectangle;
                const union = current.clone();
                union.enlarge(rectangle);

                if(union.width - current.width > (this._currentPreviewCanvasWidth - current.width) >> 1
					|| union.height - current.height > (this._currentPreviewCanvasHeight - current.height) >> 1
					|| current.width < 1
					|| current.height < 1)
                {
                    this._currentPreviewRectangle = union;
                }
            }
        }
    }

    // AS3: sources/win63_version/habbo/room/preview/RoomPreviewer.as::validatePreviewSize()
    private validatePreviewSize(point: IPoint): IPoint
    {
        const rectangle = this._currentPreviewRectangle;

        if(rectangle === null || rectangle.width < 1 || rectangle.height < 1)
        {
            return point;
        }

        if(this.isRoomEngineReady)
        {
            const geometry = this._roomEngine!.getRoomCanvasGeometry(this._previewRoomId, RoomPreviewer.PREVIEW_CANVAS_ID);
            const maxWidth = this._currentPreviewCanvasWidth * (1 + RoomPreviewer.ALLOWED_IMAGE_CUT);
            const maxHeight = this._currentPreviewCanvasHeight * (1 + RoomPreviewer.ALLOWED_IMAGE_CUT);

            if(rectangle.width > maxWidth || rectangle.height > maxHeight)
            {
                if(this.isZoomEnabled())
                {
                    if(this._roomEngine!.getRoomCanvasScale(this._previewRoomId, RoomPreviewer.PREVIEW_CANVAS_ID) !== 0.5)
                    {
                        this._roomEngine!.setRoomCanvasScale(this._previewRoomId, RoomPreviewer.PREVIEW_CANVAS_ID, 0.5);
                        this._currentPreviewScale = 32;
                        this._zoomChanged = true;
                        point.x >>= 1;
                        point.y >>= 1;
                        RoomPreviewer.dividePreviewRectangleByFour(rectangle);
                    }
                }
                else if(geometry !== null && geometry.isZoomedIn())
                {
                    geometry.performZoomOut();
                    this._currentPreviewScale = 32;
                    this._zoomChanged = true;
                    point.x >>= 1;
                    point.y >>= 1;
                    RoomPreviewer.dividePreviewRectangleByFour(rectangle);
                }
            }
            else if((rectangle.width << 1) < maxWidth - 5 && (rectangle.height << 1) < maxHeight - 5)
            {
                if(this.isZoomEnabled())
                {
                    if(this._roomEngine!.getRoomCanvasScale(this._previewRoomId, RoomPreviewer.PREVIEW_CANVAS_ID) !== 1 && !this._zoomChanged)
                    {
                        this._roomEngine!.setRoomCanvasScale(this._previewRoomId, RoomPreviewer.PREVIEW_CANVAS_ID, 1);
                        this._currentPreviewScale = 64;
                        point.x <<= 1;
                        point.y <<= 1;
                    }
                }
                else if(geometry !== null && !geometry.isZoomedIn() && !this._zoomChanged)
                {
                    geometry.performZoomIn();
                    this._currentPreviewScale = 64;
                    point.x <<= 1;
                    point.y <<= 1;
                }
            }
        }

        return point;
    }

    // AS3 counterpart: the ">>= 2" applied to every edge of _currentPreviewRectangle
    // in validatePreviewSize() (divides each edge by four).
    private static dividePreviewRectangleByFour(rectangle: Rectangle): void
    {
        const left = rectangle.left >> 2;
        const right = rectangle.right >> 2;
        const top = rectangle.top >> 2;
        const bottom = rectangle.bottom >> 2;

        rectangle.x = left;
        rectangle.y = top;
        rectangle.width = right - left;
        rectangle.height = bottom - top;
    }

    // AS3: sources/win63_version/habbo/room/preview/RoomPreviewer.as::zoomIn()
    zoomIn(): void
    {
        if(this.isRoomEngineReady)
        {
            if(this.isZoomEnabled())
            {
                this._roomEngine!.setRoomCanvasScale(this._previewRoomId, RoomPreviewer.PREVIEW_CANVAS_ID, 1);
            }

            const geometry = this._roomEngine!.getRoomCanvasGeometry(this._previewRoomId, RoomPreviewer.PREVIEW_CANVAS_ID);
            if(!geometry)
            {
                return;
            }

            geometry.performZoomIn();
        }

        this._currentPreviewScale = 64;
    }

    // AS3: sources/win63_version/habbo/room/preview/RoomPreviewer.as::zoomOut()
    zoomOut(): void
    {
        if(this.isRoomEngineReady)
        {
            if(this.isZoomEnabled())
            {
                this._roomEngine!.setRoomCanvasScale(this._previewRoomId, RoomPreviewer.PREVIEW_CANVAS_ID, 0.5);
            }
            else
            {
                const geometry = this._roomEngine!.getRoomCanvasGeometry(this._previewRoomId, RoomPreviewer.PREVIEW_CANVAS_ID);
                if(!geometry)
                {
                    return;
                }

                geometry.performZoomOut();
            }
        }

        this._currentPreviewScale = 32;
    }

    // AS3: sources/win63_version/habbo/room/preview/RoomPreviewer.as::updateAvatarDirection()
    updateAvatarDirection(direction: number, headDirection: number): void
    {
        if(this.isRoomEngineReady)
        {
            this._roomEngine!.updateRoomObjectUser(
                this._previewRoomId,
                RoomPreviewer.PREVIEW_OBJECT_ID,
                new Vector3d(2, 2, 0),
                new Vector3d(2, 2, 0),
                new Vector3d(direction * 45, 0, 0),
                headDirection * 45,
                false,
                0
            );
        }
    }

    // AS3: sources/win63_version/habbo/room/preview/RoomPreviewer.as::updateObjectRoom()
    // TODO(AS3): sources/win63_version/habbo/room/preview/RoomPreviewer.as::updateObjectRoom()
    // AS3 calls _roomEngine.updateObjectRoom(previewRoomId, floor, wall, landscape, false),
    // which only updates the room object's plane types. IRoomEngine has no
    // updateObjectRoom, so this maps to initializeRoomVisuals with the AS3 default
    // plane types. initializeRoomVisuals re-emits REE_INITIALIZED, hence the
    // _updatingObjectRoom re-entrancy guard read by onRoomInitialized().
    updateObjectRoom(floorType: string | null = null, wallType: string | null = null, landscapeType: string | null = null, _param: boolean = false): boolean
    {
        if(this.isRoomEngineReady)
        {
            this._updatingObjectRoom = true;
            try
            {
                this._roomEngine!.initializeRoomVisuals(this._previewRoomId, floorType ?? '101', wallType ?? '101', landscapeType ?? '1.1', 0);
            }
            finally
            {
                this._updatingObjectRoom = false;
            }

            return true;
        }

        return false;
    }

    // AS3: sources/win63_version/habbo/room/preview/RoomPreviewer.as::updateRoomWallsAndFloorVisibility()
    // TODO(AS3): sources/win63_version/habbo/room/preview/RoomPreviewer.as::updateRoomWallsAndFloorVisibility()
    // Should call _roomEngine.updateObjectRoomVisibilities(previewRoomId, hideWalls, hideFloor);
    // IRoomEngine has no updateObjectRoomVisibilities equivalent yet.
    updateRoomWallsAndFloorVisibility(_hideWalls: boolean, _hideFloor: boolean = true): void
    {
        if(this.isRoomEngineReady)
        {
            // Not wired yet.
        }
    }

    // AS3: sources/win63_version/habbo/room/preview/RoomPreviewer.as::getCanvasOffset()
    private getCanvasOffset(point: IPoint): IPoint | null
    {
        const rectangle = this._currentPreviewRectangle;

        if(rectangle === null || rectangle.width < 1 || rectangle.height < 1)
        {
            return point;
        }

        let x = -(rectangle.left + rectangle.right) >> 1;
        let y = -(rectangle.top + rectangle.bottom) >> 1;
        const verticalMargin = this._currentPreviewCanvasHeight - rectangle.height >> 1;

        if(verticalMargin > 10)
        {
            y += Math.min(15, verticalMargin - 10);
        }
        else if(this._currentPreviewObjectCategory !== 100)
        {
            y += 5 - Math.max(0, verticalMargin / 2);
        }
        else
        {
            y -= 5 - Math.min(0, verticalMargin / 2);
        }

        y += this._addViewOffset.y;
        x += this._addViewOffset.x;

        const deltaX = (x - point.x) | 0;
        const deltaY = (y - point.y) | 0;

        if(deltaX !== 0 || deltaY !== 0)
        {
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            if(distance > 10)
            {
                x = point.x + deltaX * 10 / distance;
                y = point.y + deltaY * 10 / distance;
            }

            return {x, y};
        }

        return null;
    }

    // AS3: sources/win63_version/habbo/room/preview/RoomPreviewer.as::updatePreviewRoomView()
    updatePreviewRoomView(force: boolean = false): void
    {
        if(this._disableUpdate && !force)
        {
            return;
        }

        this.checkAutomaticRoomObjectStateChange();

        if(this.isRoomEngineReady)
        {
            const screenOffset = this._roomEngine!.getRoomCanvasScreenOffset(this._previewRoomId, RoomPreviewer.PREVIEW_CANVAS_ID);

            if(screenOffset !== null)
            {
                let offset: IPoint = {x: screenOffset.x, y: screenOffset.y};

                this.updatePreviewObjectBoundingRectangle(offset);

                if(this._currentPreviewRectangle !== null)
                {
                    const previousScale = this._currentPreviewScale;

                    offset = this.validatePreviewSize(offset);

                    const canvasOffset = this.getCanvasOffset(offset);
                    if(canvasOffset !== null)
                    {
                        this._roomEngine!.setRoomCanvasScreenOffset(this._previewRoomId, RoomPreviewer.PREVIEW_CANVAS_ID, canvasOffset);
                    }

                    if(this._currentPreviewScale !== previousScale)
                    {
                        this._currentPreviewRectangle = null;
                    }
                }
            }
        }
    }

    // AS3: sources/win63_version/habbo/room/preview/RoomPreviewer.as::set disableUpdate()
    set disableUpdate(value: boolean)
    {
        this._disableUpdate = value;
    }

    // AS3: sources/win63_version/habbo/room/preview/RoomPreviewer.as::set disableRoomEngineUpdate()
    // TODO(AS3): sources/win63_version/habbo/room/preview/RoomPreviewer.as::set disableRoomEngineUpdate()
    // Should assign _roomEngine.disableUpdate = value; IRoomEngine exposes no
    // disableUpdate accessor yet.
    set disableRoomEngineUpdate(_value: boolean)
    {
        if(this.isRoomEngineReady)
        {
            // Not wired yet.
        }
    }

    // AS3: sources/win63_version/habbo/room/preview/RoomPreviewer.as::onRoomInitialized()
    private onRoomInitialized(event: RoomEngineEvent): void
    {
        if(event === null)
        {
            return;
        }

        // Guard against the initializeRoomVisuals() re-emit of REE_INITIALIZED
        // triggered by updateObjectRoom() below (see updateObjectRoom's comment).
        if(this._updatingObjectRoom)
        {
            return;
        }

        if(event.type === RoomEngineEvent.REE_INITIALIZED)
        {
            if(event.roomId === this._previewRoomId)
            {
                if(this._roomEngine)
                {
                    this.updateObjectRoom('110', '99999', null);
                }
            }
        }
    }

    // AS3: sources/win63_version/habbo/room/preview/RoomPreviewer.as::onRoomObjectAdded()
    private onRoomObjectAdded(roomId: number, objectId: number, category: number): void
    {
        if(roomId === this._previewRoomId && objectId === RoomPreviewer.PREVIEW_OBJECT_ID && category === this._currentPreviewObjectCategory)
        {
            this._currentPreviewRectangle = null;
            this._zoomChanged = false;
            this._roomEngine!.getRoomObject(roomId, objectId, category);
        }
    }

    // AS3: sources/win63_version/habbo/room/preview/RoomPreviewer.as::updateRoomEngine()
    // TODO(AS3): sources/win63_version/habbo/room/preview/RoomPreviewer.as::updateRoomEngine()
    // AS3 calls _roomEngine.runUpdate(); IRoomEngine exposes update(time) instead.
    updateRoomEngine(): void
    {
        if(this.isRoomEngineReady)
        {
            this._roomEngine!.update(RoomPreviewer.getTimer());
        }
    }

    // AS3: sources/win63_version/habbo/room/preview/RoomPreviewer.as::getGenericRoomObjectImage()
    getGenericRoomObjectImage(
        classType: string,
        imageType: string,
        direction: IVector3d,
        scale: number,
        listener: IGetImageListener | null,
        backgroundColor: number = 0,
        extras: string | null = null,
        stuffData: IStuffData | null = null,
        state: number = -1,
        frameCount: number = -1,
        objectData: string | null = null
    ): ImageResult | null
    {
        if(this.isRoomEngineReady)
        {
            return this._roomEngine!.getGenericRoomObjectImage(
                classType, imageType, direction, scale, listener, backgroundColor, extras, stuffData, state, frameCount, objectData);
        }

        return null;
    }

    // AS3: sources/win63_version/habbo/room/preview/RoomPreviewer.as::getRoomObjectImage()
    getRoomObjectImage(category: number, direction: IVector3d, scale: number, listener: IGetImageListener | null, backgroundColor: number = 0): ImageResult | null
    {
        if(this.isRoomEngineReady && listener !== null)
        {
            return this._roomEngine!.getRoomObjectImage(
                this._previewRoomId, RoomPreviewer.PREVIEW_OBJECT_ID, category, direction, scale, listener, backgroundColor);
        }

        return null;
    }

    // AS3: sources/win63_version/habbo/room/preview/RoomPreviewer.as::getRoomObjectCurrentImage()
    // TS deviation: returns HTMLCanvasElement instead of AS3's BitmapData - both are synchronous,
    // in-memory rasterizations (see IRoomObjectVisualization.getImage()'s own doc comment);
    // converting to ImageBitmap would need this to become async, which would change the
    // "give me the currently-rendered frame right now" pull semantics this method exists for.
    getRoomObjectCurrentImage(): HTMLCanvasElement | null
    {
        if(this.isRoomEngineReady)
        {
            const object = this._roomEngine!.getRoomObject(this._previewRoomId, RoomPreviewer.PREVIEW_OBJECT_ID, 100);

            if(object)
            {
                const visualization = object.getVisualization();

                if(visualization) return visualization.getImage(0xFFFFFF, -1);
            }
        }

        return null;
    }

    // AS3 counterpart: flash.utils.getTimer()
    private static getTimer(): number
    {
        return Math.floor(performance.now());
    }

    // TODO(AS3): AS3 reads (_roomEngine as class_17).getBoolean("zoom.enabled");
    // IRoomEngine exposes no config accessor yet, so canvas-scale zooming (the
    // path AS3 uses when the flag is on) is always selected.
    private isZoomEnabled(): boolean
    {
        return true;
    }

    // AS3: sources/win63_version/habbo/room/preview/RoomPreviewer.as::dispose()
    dispose(): void
    {
        this.reset(true);

        if(this._roomEngine)
        {
            this._roomEngine.events.off(RoomEngineObjectEvent.REOE_OBJECT_ADDED, this.onRoomObjectAddedBound);
            this._roomEngine.events.off(RoomEngineEvent.REE_INITIALIZED, this.onRoomInitializedBound);
            this._roomEngine.unregisterCanvasSyncCallback(this.updatePreviewRoomViewBound);
        }

        this._backgroundFill?.destroy();
        this._backgroundFill = null;
        this._roomEngine = null;
    }
}
