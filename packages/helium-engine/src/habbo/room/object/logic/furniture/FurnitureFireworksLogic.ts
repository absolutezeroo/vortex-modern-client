/**
 * FurnitureFireworksLogic
 *
 * @see source_as_win63/habbo/room/object/logic/furniture/FurnitureFireworksLogic.as
 *
 * Logic for fireworks furniture (start/stop/reset via sprite tags).
 */
import type {IRoomGeometry} from '@room/utils/IRoomGeometry';
import {RoomSpriteMouseEvent} from '@room/events/RoomSpriteMouseEvent';
import {FurnitureLogic} from './FurnitureLogic';
import {RoomObjectStateChangeEvent} from '@habbo/room/events/RoomObjectStateChangeEvent';

export class FurnitureFireworksLogic extends FurnitureLogic
{
	override getEventTypes(): string[]
	{
		const types = [
			RoomObjectStateChangeEvent.ROSCE_STATE_CHANGE
		];

		return this.getAllEventTypes(super.getEventTypes(), types);
	}

	override mouseEvent(event: RoomSpriteMouseEvent, geometry: IRoomGeometry): void
	{
		if (event === null || geometry === null)
		{
			return;
		}

		if (this.object === null)
		{
			return;
		}

		let stateEvent: RoomObjectStateChangeEvent | null = null;

		if (event.type === 'doubleClick')
		{
			switch (event.spriteTag)
			{
				case 'start_stop':
					stateEvent = new RoomObjectStateChangeEvent(RoomObjectStateChangeEvent.ROSCE_STATE_CHANGE, this.object, 1);
					break;
				case 'reset':
					stateEvent = new RoomObjectStateChangeEvent(RoomObjectStateChangeEvent.ROSCE_STATE_CHANGE, this.object, 2);
					break;
			}
		}

		if (this.eventDispatcher !== null && stateEvent !== null)
		{
			this.eventDispatcher.emit(stateEvent.type, stateEvent);
		}
		else
		{
			super.mouseEvent(event, geometry);
		}
	}

	override useObject(): void
	{
		if (this.object !== null && this.eventDispatcher !== null)
		{
			const event = new RoomObjectStateChangeEvent(RoomObjectStateChangeEvent.ROSCE_STATE_CHANGE, this.object, 0);
			this.eventDispatcher.emit(event.type, event);
		}
	}

	override initialize(data: unknown): void
	{
		super.initialize(data);

		if (data === null)
		{
			return;
		}

		const config = data as { particlesystems?: string };

		if (config.particlesystems)
		{
			this.object?.getModelController()?.setString('furniture_fireworks_data', config.particlesystems);
		}
	}
}
