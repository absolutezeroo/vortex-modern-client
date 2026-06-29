/**
 * FurnitureAchievementResolutionLogic
 *
 * @see source_as_flash/com/sulake/habbo/room/object/logic/furniture/FurnitureAchievementResolutionLogic.as
 *
 * Logic for achievement resolution furniture (not started / in progress / achieved / failed).
 */
import type {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';
import {FurnitureBadgeDisplayLogic} from './FurnitureBadgeDisplayLogic';
import {RoomObjectWidgetRequestEvent} from '@habbo/room/events/RoomObjectWidgetRequestEvent';
import {RoomObjectBadgeAssetEvent} from '@habbo/room/events/RoomObjectBadgeAssetEvent';
import type {RoomObjectGroupBadgeUpdateMessage} from '@habbo/room/messages/RoomObjectGroupBadgeUpdateMessage';
import type {RoomObjectSelectedMessage} from '@habbo/room/messages/RoomObjectSelectedMessage';
import {RoomObjectVariableEnum} from '@habbo/room/object/RoomObjectVariableEnum';

export class FurnitureAchievementResolutionLogic extends FurnitureBadgeDisplayLogic
{
	public static readonly STATE_RESOLUTION_NOT_STARTED = 0;
	public static readonly STATE_RESOLUTION_IN_PROGRESS = 1;
	public static readonly STATE_RESOLUTION_ACHIEVED = 2;
	public static readonly STATE_RESOLUTION_FAILED = 3;

	private static readonly ACH_NOT_SET = 'ACH_0';
	private static readonly BADGE_VISIBLE_IN_STATE = 2;

	override getEventTypes(): string[]
	{
		const types = [
			RoomObjectWidgetRequestEvent.ROWRE_ACHIEVEMENT_RESOLUTION_OPEN,
			RoomObjectWidgetRequestEvent.ROWRE_ACHIEVEMENT_RESOLUTION_ENGRAVING,
			RoomObjectWidgetRequestEvent.ROWRE_ACHIEVEMENT_RESOLUTION_FAILED,
			RoomObjectBadgeAssetEvent.LOAD_BADGE
		];

		return this.getAllEventTypes(super.getEventTypes(), types);
	}

	override processUpdateMessage(message: RoomObjectUpdateMessage): void
	{
		super.processUpdateMessage(message);

		const badgeMessage = message as unknown as RoomObjectGroupBadgeUpdateMessage;

		if ('assetName' in message && 'badgeId' in message)
		{
			if (badgeMessage.assetName !== 'loading_icon')
			{
				this.object?.getModelController()?.setNumber(
					RoomObjectVariableEnum.FURNITURE_BADGE_VISIBLE_IN_STATE,
					FurnitureAchievementResolutionLogic.BADGE_VISIBLE_IN_STATE
				);
			}
		}

		const selectedMessage = message as unknown as RoomObjectSelectedMessage;

		if ('selected' in message)
		{
			if (this.eventDispatcher !== null && this.object !== null && !selectedMessage.selected)
			{
				this.eventDispatcher.emit(
					RoomObjectWidgetRequestEvent.ROWRE_CLOSE_FURNI_CONTEXT_MENU,
					new RoomObjectWidgetRequestEvent(RoomObjectWidgetRequestEvent.ROWRE_CLOSE_FURNI_CONTEXT_MENU, this.object)
				);
			}
		}
	}

	override useObject(): void
	{
		if (this.eventDispatcher !== null && this.object !== null)
		{
			const state = this.object.getState(0);

			switch (state)
			{
				case FurnitureAchievementResolutionLogic.STATE_RESOLUTION_NOT_STARTED:
				case FurnitureAchievementResolutionLogic.STATE_RESOLUTION_IN_PROGRESS:
					this.eventDispatcher.emit(
						RoomObjectWidgetRequestEvent.ROWRE_ACHIEVEMENT_RESOLUTION_OPEN,
						new RoomObjectWidgetRequestEvent(RoomObjectWidgetRequestEvent.ROWRE_ACHIEVEMENT_RESOLUTION_OPEN, this.object)
					);
					break;

				case FurnitureAchievementResolutionLogic.STATE_RESOLUTION_ACHIEVED:
					this.eventDispatcher.emit(
						RoomObjectWidgetRequestEvent.ROWRE_ACHIEVEMENT_RESOLUTION_ENGRAVING,
						new RoomObjectWidgetRequestEvent(RoomObjectWidgetRequestEvent.ROWRE_ACHIEVEMENT_RESOLUTION_ENGRAVING, this.object)
					);
					break;

				case FurnitureAchievementResolutionLogic.STATE_RESOLUTION_FAILED:
					this.eventDispatcher.emit(
						RoomObjectWidgetRequestEvent.ROWRE_ACHIEVEMENT_RESOLUTION_FAILED,
						new RoomObjectWidgetRequestEvent(RoomObjectWidgetRequestEvent.ROWRE_ACHIEVEMENT_RESOLUTION_FAILED, this.object)
					);
					break;
			}
		}
	}

	protected override updateBadge(badgeId: string): void
	{
		if (badgeId !== FurnitureAchievementResolutionLogic.ACH_NOT_SET)
		{
			super.updateBadge(badgeId);
		}
	}
}
