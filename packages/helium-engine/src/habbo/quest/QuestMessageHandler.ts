import type {IDisposable} from '@core/runtime';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {HabboQuestEngine} from './HabboQuestEngine';
import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import type {AchievementData} from './AchievementCategory';
import {QuestCompletedEvent} from './events/QuestCompletedEvent';
import {QuestsListEvent} from './events/QuestsListEvent';
import {Logger} from '@core/utils/Logger';

// Existing message events
import {RoomEntryInfoMessageEvent} from '@habbo/communication/messages/incoming/room/engine/RoomEntryInfoMessageEvent';
import {
	CloseConnectionMessageEvent
} from '@habbo/communication/messages/incoming/room/session/CloseConnectionMessageEvent';
import {
	HabboAchievementNotificationMessageEvent
} from '@habbo/communication/messages/incoming/notifications/HabboAchievementNotificationMessageEvent';

// Quest message events (may be created concurrently by another agent)
import {QuestMessageEvent} from '@habbo/communication/messages/incoming/quest/QuestMessageEvent';
import {QuestsMessageEvent} from '@habbo/communication/messages/incoming/quest/QuestsMessageEvent';
import {SeasonalQuestsMessageEvent} from '@habbo/communication/messages/incoming/quest/SeasonalQuestsMessageEvent';
import {QuestCompletedMessageEvent} from '@habbo/communication/messages/incoming/quest/QuestCompletedMessageEvent';
import {QuestCancelledMessageEvent} from '@habbo/communication/messages/incoming/quest/QuestCancelledMessageEvent';

// Achievement message events (may be created concurrently by another agent)
import {
	AchievementsMessageEvent
} from '@habbo/communication/messages/incoming/inventory/achievements/AchievementsMessageEvent';
import {
	AchievementMessageEvent
} from '@habbo/communication/messages/incoming/inventory/achievements/AchievementMessageEvent';

// Resolution message events (may be created concurrently by another agent)
import {
	AchievementResolutionsMessageEvent
} from '@habbo/communication/messages/incoming/game/lobby/AchievementResolutionsMessageEvent';
import {
	AchievementResolutionProgressMessageEvent
} from '@habbo/communication/messages/incoming/game/lobby/AchievementResolutionProgressMessageEvent';
import {
	AchievementResolutionCompletedMessageEvent
} from '@habbo/communication/messages/incoming/game/lobby/AchievementResolutionCompletedMessageEvent';

// Competition message events (may be created concurrently by another agent)
import {
	CompetitionVotingInfoMessageEvent
} from '@habbo/communication/messages/incoming/competition/CompetitionVotingInfoMessageEvent';
import {
	CompetitionEntrySubmitResultMessageEvent
} from '@habbo/communication/messages/incoming/competition/CompetitionEntrySubmitResultMessageEvent';

// Parsers
import {QuestMessageEventParser} from '@habbo/communication/messages/parser/quest/QuestMessageEventParser';
import {QuestsMessageEventParser} from '@habbo/communication/messages/parser/quest/QuestsMessageEventParser';
import {
	SeasonalQuestsMessageEventParser
} from '@habbo/communication/messages/parser/quest/SeasonalQuestsMessageEventParser';
import {
	QuestCompletedMessageEventParser
} from '@habbo/communication/messages/parser/quest/QuestCompletedMessageEventParser';
import {
	QuestCancelledMessageEventParser
} from '@habbo/communication/messages/parser/quest/QuestCancelledMessageEventParser';
import {
	AchievementsEventParser
} from '@habbo/communication/messages/parser/inventory/achievements/AchievementsEventParser';
import {
	AchievementEventParser
} from '@habbo/communication/messages/parser/inventory/achievements/AchievementEventParser';
import {
	AchievementResolutionsMessageEventParser
} from '@habbo/communication/messages/parser/game/lobby/AchievementResolutionsMessageEventParser';
import {
	AchievementResolutionProgressMessageEventParser
} from '@habbo/communication/messages/parser/game/lobby/AchievementResolutionProgressMessageEventParser';
import {
	AchievementResolutionCompletedMessageEventParser
} from '@habbo/communication/messages/parser/game/lobby/AchievementResolutionCompletedMessageEventParser';
import {
	HabboAchievementNotificationMessageEventParser
} from '@habbo/communication/messages/parser/notifications/HabboAchievementNotificationMessageEventParser';
import {
	CompetitionVotingInfoMessageEventParser
} from '@habbo/communication/messages/parser/competition/CompetitionVotingInfoMessageEventParser';
import {
	CompetitionEntrySubmitResultMessageEventParser
} from '@habbo/communication/messages/parser/competition/CompetitionEntrySubmitResultMessageEventParser';

const log = Logger.getLogger('QuestMessageHandler');

/**
 * Central message handler/router for all quest, achievement, and competition
 * server messages. Routes parsed data to the appropriate controllers.
 *
 * @see source_as_win63/habbo/quest/class_3353.as
 */
export class QuestMessageHandler implements IDisposable
{
	private _engine: HabboQuestEngine | null;
	private _messageEvents: IMessageEvent[] = [];

	constructor(engine: HabboQuestEngine)
	{
		this._engine = engine;

		this.registerMessageEvents();
	}

	private _disposed: boolean = false;

	get disposed(): boolean
	{
		return this._disposed;
	}

	/**
	 * Dispose of this handler and remove all message events
	 */
	dispose(): void
	{
		if (this._disposed) return;

		if (this._engine)
		{
			const communication = this._engine.communicationManager;

			if (communication)
			{
				for (const event of this._messageEvents)
				{
					communication.removeMessageEvent(event);
				}
			}
		}

		this._messageEvents = [];
		this._engine = null;
		this._disposed = true;
	}

	/**
	 * Register all message event handlers with the communication manager
	 */
	private registerMessageEvents(): void
	{
		if (!this._engine) return;

		const communication = this._engine.communicationManager;

		if (!communication) return;

		// Quest events
		this.addMessageEvent(communication, new QuestMessageEvent(this.onQuest.bind(this)));
		this.addMessageEvent(communication, new QuestsMessageEvent(this.onQuests.bind(this)));
		this.addMessageEvent(communication, new SeasonalQuestsMessageEvent(this.onSeasonalQuests.bind(this)));
		this.addMessageEvent(communication, new QuestCompletedMessageEvent(this.onQuestCompleted.bind(this)));
		this.addMessageEvent(communication, new QuestCancelledMessageEvent(this.onQuestCancelled.bind(this)));

		// Achievement events
		this.addMessageEvent(communication, new AchievementsMessageEvent(this.onAchievements.bind(this)));
		this.addMessageEvent(communication, new AchievementMessageEvent(this.onAchievement.bind(this)));

		// Resolution events
		this.addMessageEvent(communication, new AchievementResolutionsMessageEvent(this.onAchievementResolutions.bind(this)));
		this.addMessageEvent(communication, new AchievementResolutionProgressMessageEvent(this.onAchievementResolutionProgress.bind(this)));
		this.addMessageEvent(communication, new AchievementResolutionCompletedMessageEvent(this.onAchievementResolutionCompleted.bind(this)));

		// Competition events
		this.addMessageEvent(communication, new CompetitionVotingInfoMessageEvent(this.onCompetitionVotingInfo.bind(this)));
		this.addMessageEvent(communication, new CompetitionEntrySubmitResultMessageEvent(this.onCompetitionEntrySubmitResult.bind(this)));

		// Room events
		this.addMessageEvent(communication, new RoomEntryInfoMessageEvent(this.onRoomEnter.bind(this)));
		this.addMessageEvent(communication, new CloseConnectionMessageEvent(this.onRoomExit.bind(this)));

		// Notification events
		this.addMessageEvent(communication, new HabboAchievementNotificationMessageEvent(this.onLevelUp.bind(this)));

		log.info('Quest message handler initialized');
	}

	/**
	 * Add a message event and track it for cleanup
	 */
	private addMessageEvent(communication: IHabboCommunicationManager, event: IMessageEvent): void
	{
		communication.addMessageEvent(event);
		this._messageEvents.push(event);
	}

	/**
	 * Handle single quest data update
	 */
	private onQuest(event: IMessageEvent): void
	{
		if (!this._engine) return;

		const parser = event.parser as QuestMessageEventParser;

		if (!parser) return;

		log.debug('Quest received');
		this._engine.questController?.onQuest(parser.quest);
	}

	/**
	 * Handle quest list
	 */
	private onQuests(event: IMessageEvent): void
	{
		if (!this._engine) return;

		const parser = event.parser as QuestsMessageEventParser;

		if (!parser) return;

		log.debug(`Quests received: count=${parser.quests?.length}, openWindow=${parser.openWindow}`);
		this._engine.events.emit(
			QuestsListEvent.QUESTS,
			new QuestsListEvent(QuestsListEvent.QUESTS, parser.quests, parser.openWindow)
		);
	}

	/**
	 * Handle seasonal quest list
	 */
	private onSeasonalQuests(event: IMessageEvent): void
	{
		if (!this._engine) return;

		const parser = event.parser as SeasonalQuestsMessageEventParser;

		if (!parser) return;

		log.debug(`Seasonal quests received: count=${parser.quests?.length}`);
		this._engine.events.emit(
			QuestsListEvent.QUESTS_SEASONAL,
			new QuestsListEvent(QuestsListEvent.QUESTS_SEASONAL, parser.quests, true)
		);
	}

	/**
	 * Handle quest completion
	 */
	private onQuestCompleted(event: IMessageEvent): void
	{
		if (!this._engine) return;

		const parser = event.parser as QuestCompletedMessageEventParser;

		if (!parser) return;

		log.info(`Quest completed: ${parser.questData?.campaignCode} quest: ${parser.questData?.id}`);
		this._engine.questController?.onQuestCompleted(parser.questData, parser.showDialog);

		// Dispatch seasonal quest completed event if applicable
		if (parser.questData)
		{
			this._engine.events.emit(
				QuestCompletedEvent.QUEST_SEASONAL,
				new QuestCompletedEvent(QuestCompletedEvent.QUEST_SEASONAL, parser.questData)
			);
		}
	}

	/**
	 * Handle quest cancellation
	 */
	private onQuestCancelled(event: IMessageEvent): void
	{
		if (!this._engine) return;

		const parser = event.parser as QuestCancelledMessageEventParser;

		if (!parser) return;

		log.debug(`Quest cancelled: ${parser.quest?.id}`);
		this._engine.questController?.onQuestCancelled(parser.quest?.campaignChainCode ?? '');
	}

	/**
	 * Handle achievement list
	 */
	private onAchievements(event: IMessageEvent): void
	{
		if (!this._engine) return;

		const parser = event.parser as AchievementsEventParser;

		if (!parser) return;

		this._engine.achievementController?.onAchievements(
			parser.achievements as AchievementData[],
			parser.defaultCategory
		);
	}

	/**
	 * Handle single achievement update
	 */
	private onAchievement(event: IMessageEvent): void
	{
		if (!this._engine) return;

		const parser = event.parser as AchievementEventParser;

		if (!parser) return;

		this._engine.achievementController?.onAchievement(parser.achievement as AchievementData);
		this._engine.achievementsResolutionController?.onAchievement(parser.achievement as AchievementData);
	}

	/**
	 * Handle resolution achievements
	 */
	private onAchievementResolutions(event: IMessageEvent): void
	{
		if (!this._engine) return;

		const parser = event.parser as AchievementResolutionsMessageEventParser;

		if (!parser) return;

		this._engine.achievementsResolutionController?.onResolutionAchievements(
			parser.stuffId,
			parser.achievements,
			parser.endTime
		);
	}

	/**
	 * Handle resolution progress
	 */
	private onAchievementResolutionProgress(event: IMessageEvent): void
	{
		if (!this._engine) return;

		const parser = event.parser as AchievementResolutionProgressMessageEventParser;

		if (!parser) return;

		this._engine.achievementsResolutionController?.onResolutionProgress(
			parser.stuffId,
			parser.achievementId,
			parser.requiredLevelBadgeCode,
			parser.userProgress,
			parser.totalProgress,
			parser.endTime
		);
	}

	/**
	 * Handle resolution completed
	 */
	private onAchievementResolutionCompleted(event: IMessageEvent): void
	{
		if (!this._engine) return;

		const parser = event.parser as AchievementResolutionCompletedMessageEventParser;

		if (!parser) return;

		this._engine.achievementsResolutionController?.onResolutionCompleted(
			parser.badgeCode,
			parser.stuffCode
		);
	}

	/**
	 * Handle competition voting info
	 */
	private onCompetitionVotingInfo(event: IMessageEvent): void
	{
		if (!this._engine) return;

		const parser = event.parser as CompetitionVotingInfoMessageEventParser;

		if (!parser) return;

		this._engine.roomCompetitionController?.onCompetitionVotingInfo(
			parser.goalId,
			parser.goalCode,
			parser.votesRemaining,
			parser.isVotingAllowedForUser
		);
	}

	/**
	 * Handle competition entry submit result
	 */
	private onCompetitionEntrySubmitResult(event: IMessageEvent): void
	{
		if (!this._engine) return;

		const parser = event.parser as CompetitionEntrySubmitResultMessageEventParser;

		if (!parser) return;

		this._engine.roomCompetitionController?.onCompetitionEntrySubmitResult(
			parser.result,
			parser.goalCode,
			parser.goalId
		);
	}

	/**
	 * Handle room entry
	 */
	private onRoomEnter(event: IMessageEvent): void
	{
		if (!this._engine) return;

		this._engine.roomCompetitionController?.onRoomEnter(0);
		this._engine.currentlyInRoom = true;
	}

	/**
	 * Handle room exit
	 */
	private onRoomExit(event: IMessageEvent): void
	{
		if (!this._engine) return;

		this._engine.questController?.onRoomExit();
		this._engine.achievementController?.onRoomExit();
		this._engine.roomCompetitionController?.onRoomExit();
		this._engine.currentlyInRoom = false;
	}

	/**
	 * Handle achievement level-up notification
	 */
	private onLevelUp(event: IMessageEvent): void
	{
		if (!this._engine) return;

		const parser = event.parser as HabboAchievementNotificationMessageEventParser;

		if (!parser) return;

		this._engine.achievementsResolutionController?.onLevelUp(parser.data);

		log.debug('Achievement level-up notification received');
	}
}
