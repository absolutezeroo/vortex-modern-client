/**
 * FurnitureInternalLinkLogic
 *
 * @see source_as_flash/com/sulake/habbo/room/object/logic/furniture/FurnitureInternalLinkLogic.as
 *
 * Logic for internal link furniture (navigates to internal pages).
 */
import type {IRoomGeometry} from '@room/utils/IRoomGeometry';
import {RoomSpriteMouseEvent} from '@room/events/RoomSpriteMouseEvent';
import {FurnitureLogic} from './FurnitureLogic';
import {RoomObjectWidgetRequestEvent} from '@habbo/room/events/RoomObjectWidgetRequestEvent';
import {RoomObjectVariableEnum} from '@habbo/room/object/RoomObjectVariableEnum';

export class FurnitureInternalLinkLogic extends FurnitureLogic
{
	private _showStateOneOnceRendered: boolean = false;
	private _updateCount: number = 0;

	override initialize(data: unknown): void
	{
		super.initialize(data);

		if (data === null)
		{
			return;
		}

		const config = data as { action?: { link?: string; startState?: string } };

		if (config.action)
		{
			this.object?.getModelController()?.setString(
				RoomObjectVariableEnum.FURNITURE_INTERNAL_LINK,
				config.action.link ?? ''
			);

			if (config.action.startState === '1')
			{
				this._showStateOneOnceRendered = true;
			}
		}
	}

	override getEventTypes(): string[]
	{
		return this.getAllEventTypes(super.getEventTypes(), [
			RoomObjectWidgetRequestEvent.ROWRE_INTERNAL_LINK
		]);
	}

	override useObject(): void
	{
		if (this.eventDispatcher !== null && this.object !== null)
		{
			this.eventDispatcher.emit(
				RoomObjectWidgetRequestEvent.ROWRE_INTERNAL_LINK,
				new RoomObjectWidgetRequestEvent(RoomObjectWidgetRequestEvent.ROWRE_INTERNAL_LINK, this.object)
			);
		}
	}

	override update(time: number): void
	{
		super.update(time);

		if (!this._showStateOneOnceRendered)
		{
			return;
		}

		this._updateCount++;

		if (this._showStateOneOnceRendered && this._updateCount === 20)
		{
			this.setAutomaticStateIndex(1);
		}
	}

	override mouseEvent(event: RoomSpriteMouseEvent, geometry: IRoomGeometry): void
	{
		if (event === null)
		{
			return;
		}

		if (event.type === 'doubleClick' && this._showStateOneOnceRendered)
		{
			this.setAutomaticStateIndex(0);
		}

		super.mouseEvent(event, geometry);
	}

	private setAutomaticStateIndex(index: number): void
	{
		if (this.object === null)
		{
			return;
		}

		const model = this.object.getModelController();

		if (model !== null)
		{
			model.setNumber(RoomObjectVariableEnum.FURNITURE_AUTOMATIC_STATE_INDEX, index, false);
		}
	}
}
