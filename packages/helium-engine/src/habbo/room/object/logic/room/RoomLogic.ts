/**
 * RoomLogic
 *
 * @see source_as_win63/habbo/room/object/logic/room/RoomLogic.as
 *
 * Logic for the room object itself. Handles room update messages that change
 * floor/wall types, masks, visibility, colors, and floor holes.
 * Also dispatches mouse events for tile and wall interaction.
 */
import {ObjectLogicBase} from '@room/object/logic/ObjectLogicBase';
import type {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';
import type {IRoomObjectModelController} from '@room/object/IRoomObjectModelController';
import type {RoomSpriteMouseEvent} from '@room/events/RoomSpriteMouseEvent';
import type {IRoomGeometry} from '@room/utils/IRoomGeometry';
import {RoomObjectMouseEvent} from '@room/events/RoomObjectMouseEvent';
import {RoomObjectRoomUpdateMessage} from '@habbo/room/messages/RoomObjectRoomUpdateMessage';
import {RoomObjectRoomMaskUpdateMessage} from '@habbo/room/messages/RoomObjectRoomMaskUpdateMessage';
import {
	RoomObjectRoomPlaneVisibilityUpdateMessage
} from '@habbo/room/messages/RoomObjectRoomPlaneVisibilityUpdateMessage';
import {RoomObjectRoomPlanePropertyUpdateMessage} from '@habbo/room/messages/RoomObjectRoomPlanePropertyUpdateMessage';
import {RoomObjectRoomFloorHoleUpdateMessage} from '@habbo/room/messages/RoomObjectRoomFloorHoleUpdateMessage';
import {RoomObjectRoomColorUpdateMessage} from '@habbo/room/messages/RoomObjectRoomColorUpdateMessage';
import {RoomPlaneBitmapMaskParser} from '@habbo/room/object/RoomPlaneBitmapMaskParser';
import {RoomPlaneParser} from '@habbo/room/object/RoomPlaneParser';
import {RoomPlaneData} from '@habbo/room/object/RoomPlaneData';
import {RoomObjectVariableEnum} from '@habbo/room/object/RoomObjectVariableEnum';
import {RoomObjectTileMouseEvent} from '@habbo/room/events/RoomObjectTileMouseEvent';
import {RoomObjectWallMouseEvent} from '@habbo/room/events/RoomObjectWallMouseEvent';

export class RoomLogic extends ObjectLogicBase
{
	private _planeParser: RoomPlaneParser;
	private _planeMaskParser: RoomPlaneBitmapMaskParser;
	private _needsFloorHoleUpdate: boolean = false;
	private _colorTransitionTarget: number = 0xFFFFFF;
	private _colorTransitionCurrent: number = 0xFFFFFF;
	private _colorTransitionStart: number = 0;
	private _colorTransitionDuration: number = 500;
	private _isTransitioning: boolean = false;

	/**
	 * @see sources/win63_version/habbo/room/object/logic/room/RoomLogic.as lines 28-33
	 */
	constructor()
	{
		super();
		this._planeParser = new RoomPlaneParser();
		this._planeMaskParser = new RoomPlaneBitmapMaskParser();
	}

	override getEventTypes(): string[]
	{
		const types = ['ROE_MOUSE_MOVE', 'ROE_MOUSE_CLICK'];
		return this.getAllEventTypes(super.getEventTypes(), types);
	}

	/**
	 * Initialize room logic.
	 * AS3: initialize(xml) calls _planeParser.initializeFromXML(xml)
	 * and sets default model values.
	 *
	 * @param data - RoomPlaneParser with plane data (equivalent of AS3 XML param)
	 * @see sources/win63_version/habbo/room/object/logic/room/RoomLogic.as lines 57-72
	 */
	override initialize(data: unknown): void
	{
		if (this.object === null)
		{
			return;
		}

		// AS3: _planeParser.initializeFromXML(param1)
		if (data instanceof RoomPlaneParser)
		{
			this._planeParser = data;
		}

		const model = this.object.getModelController();

		if (model)
		{
			model.setNumber(RoomObjectVariableEnum.ROOM_BACKGROUND_COLOR, 0xFFFFFF);
			model.setNumber(RoomObjectVariableEnum.ROOM_FLOOR_VISIBILITY, 1);
			model.setNumber(RoomObjectVariableEnum.ROOM_WALL_VISIBILITY, 1);
			model.setNumber(RoomObjectVariableEnum.ROOM_LANDSCAPE_VISIBILITY, 1);
		}
	}

	/**
	 * Periodic update. Handles background color transitions and floor hole updates.
	 * Based on AS3 RoomLogic.update()
	 */
	override update(time: number): void
	{
		super.update(time);
		this.updateBackgroundColor(time);

		// Floor hole update: regenerate plane XML when holes change
		if (this._needsFloorHoleUpdate)
		{
			if (this.object !== null && this._planeParser !== null)
			{
				const model = this.object.getModelController();

				if (model)
				{
					model.setNumber(RoomObjectVariableEnum.ROOM_FLOOR_HOLE_UPDATE_TIME, time);
				}
			}

			this._needsFloorHoleUpdate = false;
		}
	}

	/**
	 * Process room-specific update messages.
	 * Routes to specific handlers based on message type.
	 * Based on AS3 RoomLogic.processUpdateMessage() lines 93-130
	 */
	override processUpdateMessage(message: RoomObjectUpdateMessage): void
	{
		if (message === null || this.object === null)
		{
			return;
		}

		const model = this.object.getModelController();

		if (model === null)
		{
			return;
		}

		// Room type updates (floor/wall/landscape textures)
		if (message instanceof RoomObjectRoomUpdateMessage)
		{
			this.updatePlaneTypes(message, model);
			return;
		}

		// Mask updates (door/window masks)
		if (message instanceof RoomObjectRoomMaskUpdateMessage)
		{
			this.updatePlaneMasks(message, model);
			return;
		}

		// Plane visibility updates
		if (message instanceof RoomObjectRoomPlaneVisibilityUpdateMessage)
		{
			this.updatePlaneVisibilities(message, model);
			return;
		}

		// Plane property updates (thickness)
		if (message instanceof RoomObjectRoomPlanePropertyUpdateMessage)
		{
			this.updatePlaneProperties(message, model);
			return;
		}

		// Floor hole updates
		if (message instanceof RoomObjectRoomFloorHoleUpdateMessage)
		{
			this.updateFloorHoles(message);
		}

		// Color/lighting updates
		if (message instanceof RoomObjectRoomColorUpdateMessage)
		{
			this.updateColors(message, model);
		}

		// Fall through to base class for location/direction updates
		super.processUpdateMessage(message);
	}

	/**
	 * Handle mouse events on the room object.
	 * Parses sprite tag for plane index, computes tile coordinates,
	 * and dispatches RoomObjectTileMouseEvent or RoomObjectWallMouseEvent.
	 * Based on AS3 RoomLogic.mouseEvent()
	 */
	override mouseEvent(event: RoomSpriteMouseEvent, geometry: IRoomGeometry): void
	{
		if (!event || !this.object)
		{
			return;
		}

		const roomModel = this.object.getModel();
		const modelPlaneParser = roomModel.getObject(RoomObjectVariableEnum.ROOM_PLANE_PARSER) as RoomPlaneParser | null;
		const planeParser = (modelPlaneParser !== null && modelPlaneParser.planeCount > 0) ? modelPlaneParser : this._planeParser;

		if (planeParser === null || planeParser.planeCount <= 0)
		{
			return;
		}

		// Extract plane index from sprite tag (format: "<name>@<planeIndex>")
		const spriteTag = event.spriteTag;
		let planeIndex = -1;

		if (spriteTag && spriteTag.indexOf('@') >= 0)
		{
			planeIndex = parseInt(spriteTag.substring(spriteTag.indexOf('@') + 1));
		}

		if (planeIndex < 1 || planeIndex > planeParser.planeCount)
		{
			// Handle rollOut: clear selected plane
			if (event.type === 'rollOut')
			{
				const model = this.object.getModelController();

				if (model)
				{
					model.setNumber(RoomObjectVariableEnum.ROOM_SELECTED_PLANE, 0);
				}
			}

			return;
		}

		// Convert to 0-based
		planeIndex--;

		const planeLoc = planeParser.getPlaneLocation(planeIndex);
		const planeLeftSide = planeParser.getPlaneLeftSide(planeIndex);
		const planeRightSide = planeParser.getPlaneRightSide(planeIndex);
		const planeType = planeParser.getPlaneType(planeIndex);

		if (!planeLoc || !planeLeftSide || !planeRightSide)
		{
			return;
		}

		const leftLength = Math.sqrt(
			planeLeftSide.x * planeLeftSide.x +
			planeLeftSide.y * planeLeftSide.y +
			planeLeftSide.z * planeLeftSide.z
		);
		const rightLength = Math.sqrt(
			planeRightSide.x * planeRightSide.x +
			planeRightSide.y * planeRightSide.y +
			planeRightSide.z * planeRightSide.z
		);

		if (leftLength === 0 || rightLength === 0)
		{
			return;
		}

		// Convert screen coordinates to plane-local coordinates
		const screenPoint = {x: event.screenX, y: event.screenY};
		const planePoint = geometry.getPlanePosition(screenPoint, planeLoc, planeLeftSide, planeRightSide);

		if (!planePoint)
		{
			const model = this.object.getModelController();

			if (model)
			{
				model.setNumber(RoomObjectVariableEnum.ROOM_SELECTED_PLANE, 0);
			}

			return;
		}

		const tileX = planeLoc.x + (planeLeftSide.x * planePoint.x / leftLength) + (planeRightSide.x * planePoint.y / rightLength);
		const tileY = planeLoc.y + (planeLeftSide.y * planePoint.x / leftLength) + (planeRightSide.y * planePoint.y / rightLength);
		const tileZ = planeLoc.z + (planeLeftSide.z * planePoint.x / leftLength) + (planeRightSide.z * planePoint.y / rightLength);

		if (planePoint.x < 0 || planePoint.x >= leftLength || planePoint.y < 0 || planePoint.y >= rightLength)
		{
			const model = this.object.getModelController();

			if (model)
			{
				model.setNumber(RoomObjectVariableEnum.ROOM_SELECTED_PLANE, 0);
			}

			return;
		}

		// Determine event type
		let eventType: string;

		if (event.type === 'mouseMove' || event.type === 'rollOver')
		{
			eventType = RoomObjectMouseEvent.ROE_MOUSE_MOVE;
		}
		else if (event.type === 'click')
		{
			eventType = RoomObjectMouseEvent.ROE_MOUSE_CLICK;
		}
		else if (event.type === 'mouseDown')
		{
			eventType = RoomObjectMouseEvent.ROE_MOUSE_DOWN;
		}
		else
		{
			return;
		}

		const model = this.object.getModelController();

		if (model)
		{
			model.setNumber(RoomObjectVariableEnum.ROOM_SELECTED_X, tileX);
			model.setNumber(RoomObjectVariableEnum.ROOM_SELECTED_Y, tileY);
			model.setNumber(RoomObjectVariableEnum.ROOM_SELECTED_Z, tileZ);
			model.setNumber(RoomObjectVariableEnum.ROOM_SELECTED_PLANE, planeIndex + 1);
		}

		// Dispatch appropriate event based on plane type
		if (this.eventDispatcher)
		{
			if (planeType === RoomPlaneData.PLANE_FLOOR)
			{
				const tileEvent = new RoomObjectTileMouseEvent(
					eventType, this.object, event.eventId,
					tileX, tileY, tileZ,
					event.altKey, event.ctrlKey, event.shiftKey, event.buttonDown
				);

				this.eventDispatcher.emit(eventType, tileEvent);
			}
			else if (planeType === RoomPlaneData.PLANE_WALL || planeType === RoomPlaneData.PLANE_LANDSCAPE)
			{
				// Direction: 90 for left-facing walls, 180 for right-facing
				const direction = (planeLeftSide.x === 0) ? 90 : 180;

				const wallEvent = new RoomObjectWallMouseEvent(
					eventType, this.object, event.eventId,
					planeLoc, planeLeftSide, planeRightSide,
					planeLeftSide.length * planePoint.x / leftLength,
					planeRightSide.length * planePoint.y / rightLength,
					direction,
					event.altKey, event.ctrlKey, event.shiftKey, event.buttonDown
				);

				this.eventDispatcher.emit(eventType, wallEvent);
			}
		}

	}

	/**
	 * @see sources/win63_version/habbo/room/object/logic/room/RoomLogic.as lines 44-55
	 */
	override dispose(): void
	{
		if (this._planeParser)
		{
			this._planeParser.dispose();
			(this as any)._planeParser = null;
		}

		if (this._planeMaskParser)
		{
			this._planeMaskParser.dispose();
		}

		super.dispose();
	}

	/**
	 * Handle background color smooth transitions.
	 * Based on AS3 RoomLogic.updateBackgroundColor()
	 */
	private updateBackgroundColor(time: number): void
	{
		if (!this._isTransitioning || this.object === null)
		{
			return;
		}

		const elapsed = time - this._colorTransitionStart;
		const progress = Math.min(1, elapsed / this._colorTransitionDuration);

		if (progress >= 1)
		{
			this._colorTransitionCurrent = this._colorTransitionTarget;
			this._isTransitioning = false;
		}
		else
		{
			// Interpolate color channels
			const srcR = (this._colorTransitionCurrent >> 16) & 0xFF;
			const srcG = (this._colorTransitionCurrent >> 8) & 0xFF;
			const srcB = this._colorTransitionCurrent & 0xFF;
			const dstR = (this._colorTransitionTarget >> 16) & 0xFF;
			const dstG = (this._colorTransitionTarget >> 8) & 0xFF;
			const dstB = this._colorTransitionTarget & 0xFF;

			const r = Math.round(srcR + (dstR - srcR) * progress);
			const g = Math.round(srcG + (dstG - srcG) * progress);
			const b = Math.round(srcB + (dstB - srcB) * progress);

			this._colorTransitionCurrent = (r << 16) | (g << 8) | b;
		}

		const model = this.object.getModelController();

		if (model)
		{
			model.setNumber(RoomObjectVariableEnum.ROOM_BACKGROUND_COLOR, this._colorTransitionCurrent);
		}
	}

	/**
	 * Update floor/wall/landscape texture types.
	 * Based on AS3 RoomLogic.updatePlaneTypes() lines 251-262
	 */
	private updatePlaneTypes(message: RoomObjectRoomUpdateMessage, model: IRoomObjectModelController): void
	{
		switch (message.type)
		{
			case RoomObjectRoomUpdateMessage.ROOM_FLOOR_UPDATE:
				model.setString(RoomObjectVariableEnum.ROOM_FLOOR_TYPE, message.value);
				break;
			case RoomObjectRoomUpdateMessage.ROOM_WALL_UPDATE:
				model.setString(RoomObjectVariableEnum.ROOM_WALL_TYPE, message.value);
				break;
			case RoomObjectRoomUpdateMessage.ROOM_LANDSCAPE_UPDATE:
				model.setString(RoomObjectVariableEnum.ROOM_LANDSCAPE_TYPE, message.value);
				break;
		}
	}

	/**
	 * Update plane masks (add/remove doors, windows).
	 * Based on AS3 RoomLogic.updatePlaneMasks() lines 264-286
	 */
	private updatePlaneMasks(message: RoomObjectRoomMaskUpdateMessage, model: IRoomObjectModelController): void
	{
		let changed = false;

		switch (message.type)
		{
			case RoomObjectRoomMaskUpdateMessage.ADD_MASK:
			{
				const category = message.maskCategory === 'hole' ? 'hole' : 'window';

				if (message.maskType !== null && message.maskLocation !== null)
				{
					this._planeMaskParser.addMask(message.maskId, message.maskType, message.maskLocation, category);
					changed = true;
				}
				break;
			}
			case RoomObjectRoomMaskUpdateMessage.REMOVE_MASK:
				changed = this._planeMaskParser.removeMask(message.maskId);
				break;
		}

		if (changed)
		{
			const xml = this._planeMaskParser.getXML();
			model.setString(RoomObjectVariableEnum.ROOM_PLANE_MASK_XML, xml);
		}
	}

	/**
	 * Update floor/wall/landscape visibility.
	 * Based on AS3 RoomLogic.updatePlaneVisibilities() lines 288-301
	 */
	private updatePlaneVisibilities(message: RoomObjectRoomPlaneVisibilityUpdateMessage, model: IRoomObjectModelController): void
	{
		const value = message.visible ? 1 : 0;

		switch (message.type)
		{
			case RoomObjectRoomPlaneVisibilityUpdateMessage.FLOOR_VISIBILITY:
				model.setNumber(RoomObjectVariableEnum.ROOM_FLOOR_VISIBILITY, value);
				break;
			case RoomObjectRoomPlaneVisibilityUpdateMessage.WALL_VISIBILITY:
				model.setNumber(RoomObjectVariableEnum.ROOM_WALL_VISIBILITY, value);
				model.setNumber(RoomObjectVariableEnum.ROOM_LANDSCAPE_VISIBILITY, value);
				break;
		}
	}

	/**
	 * Update plane properties (thickness).
	 * Based on AS3 RoomLogic.updatePlaneProperties() lines 303-311
	 */
	private updatePlaneProperties(message: RoomObjectRoomPlanePropertyUpdateMessage, model: IRoomObjectModelController): void
	{
		switch (message.type)
		{
			case RoomObjectRoomPlanePropertyUpdateMessage.FLOOR_THICKNESS:
				model.setNumber(RoomObjectVariableEnum.ROOM_FLOOR_THICKNESS_MULTIPLIER, message.value);
				break;
			case RoomObjectRoomPlanePropertyUpdateMessage.WALL_THICKNESS:
				model.setNumber(RoomObjectVariableEnum.ROOM_WALL_THICKNESS_MULTIPLIER, message.value);
				break;
		}
	}

	/**
	 * Update floor holes (add/remove).
	 * Based on AS3 RoomLogic.updateFloorHoles() lines 313-323
	 */
	private updateFloorHoles(message: RoomObjectRoomFloorHoleUpdateMessage): void
	{
		if (this._planeParser === null) return;

		switch (message.type)
		{
			case RoomObjectRoomFloorHoleUpdateMessage.ADD_HOLE:
				this._planeParser.addFloorHole(message.id, message.x, message.y, message.width, message.height, message.invert);
				this._needsFloorHoleUpdate = true;
				break;
			case RoomObjectRoomFloorHoleUpdateMessage.REMOVE_HOLE:
				this._planeParser.removeFloorHole(message.id);
				this._needsFloorHoleUpdate = true;
				break;
		}
	}

	/**
	 * Update room colors/lighting.
	 * Based on AS3 RoomLogic.updateColors() lines 325-341
	 */
	private updateColors(message: RoomObjectRoomColorUpdateMessage, model: IRoomObjectModelController): void
	{
		let targetColor: number;
		let targetLight: number;

		model.setNumber('room_colorize_bg_only', message.bgOnly ? 1 : 0);

		if (message.bgOnly)
		{
			targetColor = message.color;
			targetLight = message.light;
		}
		else
		{
			targetColor = 0xFFFFFF;
			targetLight = 255;
		}

		// Apply light as a multiplier to the color
		const r = Math.round(((targetColor >> 16) & 0xFF) * targetLight / 255);
		const g = Math.round(((targetColor >> 8) & 0xFF) * targetLight / 255);
		const b = Math.round((targetColor & 0xFF) * targetLight / 255);

		this._colorTransitionTarget = (r << 16) | (g << 8) | b;
		this._colorTransitionStart = performance.now();
		this._isTransitioning = true;
	}
}
