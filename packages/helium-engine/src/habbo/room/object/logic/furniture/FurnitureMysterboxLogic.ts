/**
 * FurnitureMysterboxLogic
 *
 * @see source_as_flash/com/sulake/habbo/room/object/logic/furniture/FurnitureMysterboxLogic.as
 *
 * Logic for mystery box furniture (context menu = MYSTERY_BOX).
 */
import {FurnitureMultiStateLogic} from './FurnitureMultiStateLogic';
import {RoomObjectWidgetRequestEvent} from '@habbo/room/events/RoomObjectWidgetRequestEvent';

export class FurnitureMysterboxLogic extends FurnitureMultiStateLogic
{
	override get contextMenu(): string | null
	{
		return 'MYSTERY_BOX';
	}

	override getEventTypes(): string[]
	{
		return this.getAllEventTypes(super.getEventTypes(), [
			RoomObjectWidgetRequestEvent.ROWRE_MYSTERYBOX_OPEN_DIALOG
		]);
	}

	override useObject(): void
	{
		if (this.eventDispatcher !== null && this.object !== null)
		{
			this.eventDispatcher.emit(
				RoomObjectWidgetRequestEvent.ROWRE_MYSTERYBOX_OPEN_DIALOG,
				new RoomObjectWidgetRequestEvent(RoomObjectWidgetRequestEvent.ROWRE_MYSTERYBOX_OPEN_DIALOG, this.object)
			);
		}
	}
}
