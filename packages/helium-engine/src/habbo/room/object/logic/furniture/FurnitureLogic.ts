/**
 * FurnitureLogic
 *
 * Based on AS3: com.sulake.habbo.room.object.logic.furniture.FurnitureLogic
 *
 * Base logic class for furniture objects.
 */
import type {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';
import type {IRoomObjectController} from '@room/object/IRoomObjectController';
import type {IRoomGeometry} from '@room/utils/IRoomGeometry';
import type {IVector3d} from '@room/utils/IVector3d';
import {Vector3d} from '@room/utils/Vector3d';
import type {RoomSpriteMouseEvent} from '@room/events/RoomSpriteMouseEvent';
import {RoomObjectMouseEvent} from '@room/events/RoomObjectMouseEvent';
import {MovingObjectLogic} from '../MovingObjectLogic';
import {RoomObjectStateChangeEvent} from '@habbo/room/events/RoomObjectStateChangeEvent';
import {RoomObjectWidgetRequestEvent} from '@habbo/room/events/RoomObjectWidgetRequestEvent';
import {RoomObjectRoomAdEvent} from '@habbo/room/events/RoomObjectRoomAdEvent';
import type {RoomObjectDataUpdateMessage} from '@habbo/room/messages/RoomObjectDataUpdateMessage';
import type {RoomObjectHeightUpdateMessage} from '@habbo/room/messages/RoomObjectHeightUpdateMessage';

export class FurnitureLogic extends MovingObjectLogic
{
    private static readonly BOUNCE_STEPS = 8;
    private static readonly BOUNCE_STEP_HEIGHT = 0.0625;

    private _mouseOver: boolean = false;
    private _sizeX: number = 0;
    private _sizeY: number = 0;
    private _sizeZ: number = 0;
    private _centerX: number = 0;
    private _centerY: number = 0;
    private _centerZ: number = 0;
    private _hasLocation: boolean = false;
    private _bounceStep: number = 0;
    private _storedRotateMessage: RoomObjectUpdateMessage | null = null;
    private _locationOffset: Vector3d = new Vector3d();
    private _directions: number[] = [];
    private _widget: string | null = null;

    override get widget(): string | null
    {
        return this._widget;
    }

    private _contextMenu: string | null = null;

    override get contextMenu(): string | null
    {
        return this._contextMenu;
    }

    override get object(): IRoomObjectController | null
    {
        return super.object;
    }

    override set object(value: IRoomObjectController | null)
    {
        super.object = value;

        if(value !== null && value.getLocation().length > 0)
        {
            this._hasLocation = true;
        }
    }

    protected set widgetType(value: string | null)
    {
        this._widget = value;
    }

    protected set contextMenuType(value: string | null)
    {
        this._contextMenu = value;
    }

    override getEventTypes(): string[]
    {
        const types = [
            RoomObjectRoomAdEvent.RORAE_ROOM_AD_TOOLTIP_SHOW,
            RoomObjectRoomAdEvent.RORAE_ROOM_AD_TOOLTIP_HIDE,
            RoomObjectRoomAdEvent.RORAE_ROOM_AD_FURNI_DOUBLE_CLICK,
            RoomObjectStateChangeEvent.ROSCE_STATE_CHANGE,
            RoomObjectMouseEvent.ROE_MOUSE_CLICK,
            RoomObjectRoomAdEvent.RORAE_ROOM_AD_FURNI_CLICK,
            RoomObjectMouseEvent.ROE_MOUSE_DOWN
        ];

        if(this._widget !== null)
        {
            types.push(RoomObjectWidgetRequestEvent.ROWRE_OPEN_WIDGET);
            types.push(RoomObjectWidgetRequestEvent.ROWRE_CLOSE_WIDGET);
        }

        if(this._contextMenu !== null)
        {
            types.push(RoomObjectWidgetRequestEvent.ROWRE_OPEN_FURNI_CONTEXT_MENU);
            types.push(RoomObjectWidgetRequestEvent.ROWRE_CLOSE_FURNI_CONTEXT_MENU);
        }

        return this.getAllEventTypes(super.getEventTypes(), types);
    }

    override dispose(): void
    {
        super.dispose();
        this._storedRotateMessage = null;
        this._directions = [];
    }

    override initialize(data: unknown): void
    {
        if(data === null)
        {
            return;
        }

        this._sizeX = 0;
        this._sizeY = 0;
        this._sizeZ = 0;
        this._directions = [];

        // Parse dimensions from XML/JSON data
        const config = data as {
            model?: {
                dimensions?: { x?: number; y?: number; z?: number; centerZ?: number };
                directions?: { direction?: Array<{ id: number }> };
            };
            customvars?: { variable?: Array<{ name: string }> };
        };

        if(config.model?.dimensions)
        {
            const dims = config.model.dimensions;
            this._sizeX = dims.x ?? 0;
            this._sizeY = dims.y ?? 0;
            this._sizeZ = dims.z ?? 0;
            this._centerX = this._sizeX / 2;
            this._centerY = this._sizeY / 2;
            this._centerZ = dims.centerZ ?? (this._sizeZ / 2);
        }

        if(config.model?.directions?.direction)
        {
            for(const dir of config.model.directions.direction)
            {
                this._directions.push(dir.id);
            }
            this._directions.sort((a, b) => a - b);
        }

        const model = this.object?.getModelController();
        if(model === null || model === undefined)
        {
            return;
        }

        // Set custom variables
        if(config.customvars?.variable)
        {
            const customVars: string[] = [];
            for(const v of config.customvars.variable)
            {
                customVars.push(v.name);
            }
            model.setStringArray('furniture_custom_variables', customVars, true);
        }

        model.setNumber('furniture_size_x', this._sizeX, true);
        model.setNumber('furniture_size_y', this._sizeY, true);

        if(!model.hasNumber('furniture_size_z'))
        {
            model.setNumber('furniture_size_z', this._sizeZ);
        }

        model.setNumber('furniture_center_x', this._centerX, true);
        model.setNumber('furniture_center_y', this._centerY, true);
        model.setNumber('furniture_center_z', this._centerZ, true);
        model.setNumberArray('furniture_allowed_directions', this._directions, true);
        model.setNumber('furniture_alpha_multiplier', 1);
    }

    override mouseEvent(event: RoomSpriteMouseEvent, geometry: IRoomGeometry): void
    {
        if(event === null || geometry === null)
        {
            return;
        }

        if(this.object === null)
        {
            return;
        }

        const model = this.object.getModelController();
        if(model === null)
        {
            return;
        }

        const adUrl = this.getAdClickUrl(model);

        switch(event.type)
        {
            case 'mouseMove':
                if(this.eventDispatcher !== null)
                {
                    const moveEvent = new RoomObjectMouseEvent(
                        RoomObjectMouseEvent.ROE_MOUSE_MOVE,
                        this.object,
                        event.eventId,
                        event.altKey,
                        event.ctrlKey,
                        event.shiftKey,
                        event.buttonDown
                    );
                    moveEvent.localX = event.localX;
                    moveEvent.localY = event.localY;
                    moveEvent.spriteOffsetX = event.spriteOffsetX;
                    moveEvent.spriteOffsetY = event.spriteOffsetY;
                    this.eventDispatcher.emit(moveEvent.type, moveEvent);
                }
                break;

            case 'rollOver':
                if(!this._mouseOver)
                {
                    if(this.eventDispatcher !== null && adUrl !== null && adUrl.indexOf('http') === 0)
                    {
                        this.eventDispatcher.emit(
                            RoomObjectRoomAdEvent.RORAE_ROOM_AD_TOOLTIP_SHOW,
                            new RoomObjectRoomAdEvent(RoomObjectRoomAdEvent.RORAE_ROOM_AD_TOOLTIP_SHOW, this.object)
                        );
                    }

                    if(this.eventDispatcher !== null)
                    {
                        const enterEvent = new RoomObjectMouseEvent(
                            RoomObjectMouseEvent.ROE_MOUSE_ENTER,
                            this.object,
                            event.eventId,
                            event.altKey,
                            event.ctrlKey,
                            event.shiftKey,
                            event.buttonDown
                        );
                        enterEvent.localX = event.localX;
                        enterEvent.localY = event.localY;
                        enterEvent.spriteOffsetX = event.spriteOffsetX;
                        enterEvent.spriteOffsetY = event.spriteOffsetY;
                        this.eventDispatcher.emit(enterEvent.type, enterEvent);
                    }

                    this._mouseOver = true;
                }
                break;

            case 'rollOut':
                if(this._mouseOver)
                {
                    if(this.eventDispatcher !== null && adUrl !== null && adUrl.indexOf('http') === 0)
                    {
                        this.eventDispatcher.emit(
                            RoomObjectRoomAdEvent.RORAE_ROOM_AD_TOOLTIP_HIDE,
                            new RoomObjectRoomAdEvent(RoomObjectRoomAdEvent.RORAE_ROOM_AD_TOOLTIP_HIDE, this.object)
                        );
                    }

                    if(this.eventDispatcher !== null)
                    {
                        const leaveEvent = new RoomObjectMouseEvent(
                            RoomObjectMouseEvent.ROE_MOUSE_LEAVE,
                            this.object,
                            event.eventId,
                            event.altKey,
                            event.ctrlKey,
                            event.shiftKey,
                            event.buttonDown
                        );
                        leaveEvent.localX = event.localX;
                        leaveEvent.localY = event.localY;
                        leaveEvent.spriteOffsetX = event.spriteOffsetX;
                        leaveEvent.spriteOffsetY = event.spriteOffsetY;
                        this.eventDispatcher.emit(leaveEvent.type, leaveEvent);
                    }

                    this._mouseOver = false;
                }
                break;

            case 'doubleClick':
                this.useObject();
                break;

            case 'click':
                if(this.eventDispatcher !== null)
                {
                    const clickEvent = new RoomObjectMouseEvent(
                        RoomObjectMouseEvent.ROE_MOUSE_CLICK,
                        this.object,
                        event.eventId,
                        event.altKey,
                        event.ctrlKey,
                        event.shiftKey,
                        event.buttonDown
                    );
                    clickEvent.localX = event.localX;
                    clickEvent.localY = event.localY;
                    clickEvent.spriteOffsetX = event.spriteOffsetX;
                    clickEvent.spriteOffsetY = event.spriteOffsetY;
                    this.eventDispatcher.emit(clickEvent.type, clickEvent);
                }

                if(this.eventDispatcher !== null && adUrl !== null && adUrl.indexOf('http') === 0)
                {
                    this.eventDispatcher.emit(
                        RoomObjectRoomAdEvent.RORAE_ROOM_AD_TOOLTIP_HIDE,
                        new RoomObjectRoomAdEvent(RoomObjectRoomAdEvent.RORAE_ROOM_AD_TOOLTIP_HIDE, this.object)
                    );
                }

                if(this.eventDispatcher !== null && adUrl !== null)
                {
                    this.handleAdClick(this.object.getId(), this.object.getType(), adUrl);
                }

                if(this.eventDispatcher !== null && this.object !== null && this._contextMenu !== null)
                {
                    this.eventDispatcher.emit(
                        RoomObjectWidgetRequestEvent.ROWRE_OPEN_FURNI_CONTEXT_MENU,
                        new RoomObjectWidgetRequestEvent(RoomObjectWidgetRequestEvent.ROWRE_OPEN_FURNI_CONTEXT_MENU, this.object)
                    );
                }
                break;

            case 'mouseDown':
                if(this.eventDispatcher !== null)
                {
                    const downEvent = new RoomObjectMouseEvent(
                        RoomObjectMouseEvent.ROE_MOUSE_DOWN,
                        this.object,
                        event.eventId,
                        event.altKey,
                        event.ctrlKey,
                        event.shiftKey,
                        event.buttonDown
                    );
                    this.eventDispatcher.emit(downEvent.type, downEvent);
                }
                break;
        }
    }

    override useObject(): void
    {
        if(this.object === null)
        {
            return;
        }

        const model = this.object.getModelController();

        if(model !== null)
        {
            const adUrl = this.getAdClickUrl(model);

            if(this.eventDispatcher !== null && adUrl !== null && adUrl.length > 0)
            {
                this.eventDispatcher.emit(
                    RoomObjectRoomAdEvent.RORAE_ROOM_AD_FURNI_DOUBLE_CLICK,
                    new RoomObjectRoomAdEvent(RoomObjectRoomAdEvent.RORAE_ROOM_AD_FURNI_DOUBLE_CLICK, this.object, null, adUrl)
                );
            }
        }

        if(this.eventDispatcher !== null)
        {
            if(this._widget !== null)
            {
                this.eventDispatcher.emit(
                    RoomObjectWidgetRequestEvent.ROWRE_OPEN_WIDGET,
                    new RoomObjectWidgetRequestEvent(RoomObjectWidgetRequestEvent.ROWRE_OPEN_WIDGET, this.object)
                );
            }

            this.eventDispatcher.emit(
                RoomObjectStateChangeEvent.ROSCE_STATE_CHANGE,
                new RoomObjectStateChangeEvent(RoomObjectStateChangeEvent.ROSCE_STATE_CHANGE, this.object)
            );
        }
    }

    override processUpdateMessage(message: RoomObjectUpdateMessage): void
    {
        if(message === null)
        {
            return;
        }

        // Check for data update message
        const dataMessage = message as unknown as RoomObjectDataUpdateMessage;
        if('state' in message && 'data' in message && typeof (message as RoomObjectDataUpdateMessage).state === 'number')
        {
            this.handleDataUpdateMessage(dataMessage);
            return;
        }

        // Check for height update message
        const heightMessage = message as unknown as RoomObjectHeightUpdateMessage;
        if('height' in message && typeof (message as RoomObjectHeightUpdateMessage).height === 'number')
        {
            this.handleHeightUpdateMessage(heightMessage);
            return;
        }

        this._mouseOver = false;

        // Handle rotation bounce
        if(message.dir !== null && message.loc !== null)
        {
            const currentDir = this.object?.getDirection();
            const currentLoc = this.object?.getLocation();

            if(currentDir !== null && currentDir !== undefined &&
				currentDir.x !== message.dir.x &&
				this._hasLocation &&
				currentLoc !== null && currentLoc !== undefined &&
				currentLoc.x === message.loc.x &&
				currentLoc.y === message.loc.y &&
				currentLoc.z === message.loc.z)
            {
                this._bounceStep = 1;
                this._storedRotateMessage = message;
                return;
            }
            else if(message.dir !== null)
            {
                this.object?.setDirection(message.dir);
            }

            this._hasLocation = true;
        }

        super.processUpdateMessage(message);
    }

    override update(time: number): void
    {
        super.update(time);

        if(this._bounceStep > 0)
        {
            this._bounceStep++;

            if(this._bounceStep > FurnitureLogic.BOUNCE_STEPS)
            {
                this._bounceStep = 0;
            }
        }
    }

    override tearDown(): void
    {
        const model = this.object?.getModelController();

        if(this._widget !== null && model?.getNumber('furniture_real_room_object') === 1)
        {
            this.eventDispatcher?.emit(
                RoomObjectWidgetRequestEvent.ROWRE_CLOSE_WIDGET,
                new RoomObjectWidgetRequestEvent(RoomObjectWidgetRequestEvent.ROWRE_CLOSE_WIDGET, this.object)
            );
        }

        super.tearDown();
    }

    protected override getLocationOffset(): IVector3d | null
    {
        if(this._bounceStep > 0)
        {
            this._locationOffset.x = 0;
            this._locationOffset.y = 0;

            if(this._bounceStep <= FurnitureLogic.BOUNCE_STEPS / 2)
            {
                this._locationOffset.z = FurnitureLogic.BOUNCE_STEP_HEIGHT * this._bounceStep;
            }
            else if(this._bounceStep <= FurnitureLogic.BOUNCE_STEPS)
            {
                if(this._storedRotateMessage !== null)
                {
                    super.processUpdateMessage(this._storedRotateMessage);
                    this._storedRotateMessage = null;
                }
                this._locationOffset.z = FurnitureLogic.BOUNCE_STEP_HEIGHT * (FurnitureLogic.BOUNCE_STEPS - this._bounceStep);
            }

            return this._locationOffset;
        }

        return null;
    }

    protected getAdClickUrl(model: { getString(key: string): string | null }): string | null
    {
        return model.getString('furniture_ad_url');
    }

    protected handleAdClick(id: number, type: string, url: string): void
    {
        if(this.eventDispatcher !== null)
        {
            this.eventDispatcher.emit(
                RoomObjectRoomAdEvent.RORAE_ROOM_AD_FURNI_CLICK,
                new RoomObjectRoomAdEvent(RoomObjectRoomAdEvent.RORAE_ROOM_AD_FURNI_CLICK, this.object)
            );
        }
    }

    private handleDataUpdateMessage(message: RoomObjectDataUpdateMessage): void
    {
        const model = this.object?.getModelController();

        this.object?.setState(message.state, 0);

        if(model !== null && model !== undefined)
        {
            if(message.data !== null)
            {
                message.data.writeRoomObjectModel(model);
            }

            if(!isNaN(message.extra))
            {
                model.setString('furniture_extras', String(message.extra));
            }

            model.setNumber('furniture_state_update_time', this.lastUpdateTime);
        }
    }

    private handleHeightUpdateMessage(message: RoomObjectHeightUpdateMessage): void
    {
        const model = this.object?.getModelController();

        if(model !== null && model !== undefined)
        {
            model.setNumber('furniture_size_z', message.height);
        }
    }
}
