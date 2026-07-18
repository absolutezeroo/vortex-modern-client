import type {ILinkEventTracker} from '@core/runtime';

/**
 * Interface for the Habbo Quest Engine
 *
 * Provides access to quest and achievement management functionality.
 *
 * @see source_as_win63/habbo/quest/class_2197.as
 */
export interface IHabboQuestEngine extends ILinkEventTracker
{
    /**
	 * Ensure achievements data has been requested from the server
	 */
    ensureAchievementsInitialized(): void;

    /**
	 * Show the achievements panel
	 */
    showAchievements(): void;

    /**
	 * Show the quests panel
	 */
    showQuests(): void;

    /**
	 * Get the user's achievement level for a given category and badge
	 *
	 * @param category The achievement category code
	 * @param badge The badge identifier
	 * @returns The user's level for the achievement, or 0 if not found
	 */
    getAchievementLevel(category: string, badge: string): number;

    /**
	 * Request seasonal quests from the server
	 */
    requestSeasonalQuests(): void;

    /**
	 * Request all quests from the server
	 */
    requestQuests(): void;

    /**
	 * Activate a quest by its ID
	 *
	 * @param questId The quest ID to activate
	 */
    activateQuest(questId: number): void;

    /**
	 * Navigate to a random quest room
	 */
    goToQuestRooms(): void;

    /**
	 * Whether the current seasonal campaign has any quest room IDs configured
	 */
    hasQuestRoomsIds(): boolean;

    /**
	 * Clear the "don't show again" flag on the room-competition submission window
	 */
    reenableRoomCompetitionWindow(): void;
}
