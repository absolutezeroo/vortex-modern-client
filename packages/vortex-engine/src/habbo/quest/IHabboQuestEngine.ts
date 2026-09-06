import type {ILinkEventTracker} from '@core/runtime';
import type {IRewardTrackController} from './rewardtrack/IRewardTrackController';

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
    // AS3: .../src/com/sulake/habbo/quest/HabboQuestEngine.as::ensureAchievementsInitialized()
    ensureAchievementsInitialized(): void;

    /**
	 * Show the achievements panel
	 */
    // AS3: .../src/com/sulake/habbo/quest/HabboQuestEngine.as::showAchievements()
    showAchievements(): void;

    /**
	 * The reward-track controller, which owns the tracks the server sent and the one currently
	 * selected. The toolbar needs it to open the active track rather than a hardcoded id.
	 */
    // AS3: .../src/com/sulake/habbo/quest/HabboQuestEngine.as::get rewardTrack()
    readonly rewardTrack: IRewardTrackController | null;

    /**
	 * Show the quests panel
	 */
    // AS3: .../src/com/sulake/habbo/quest/HabboQuestEngine.as::showQuests()
    showQuests(): void;

    /**
	 * Get the user's achievement level for a given category and badge
	 *
	 * @param category The achievement category code
	 * @param badge The badge identifier
	 * @returns The user's level for the achievement, or 0 if not found
	 */
    // AS3: .../src/com/sulake/habbo/quest/HabboQuestEngine.as::getAchievementLevel()
    getAchievementLevel(category: string, badge: string): number;

    /**
	 * Request seasonal quests from the server
	 */
    // AS3: .../src/com/sulake/habbo/quest/HabboQuestEngine.as::requestSeasonalQuests()
    requestSeasonalQuests(): void;

    /**
	 * Request all quests from the server
	 */
    // AS3: .../src/com/sulake/habbo/quest/HabboQuestEngine.as::requestQuests()
    requestQuests(): void;

    /**
	 * Activate a quest by its ID
	 *
	 * @param questId The quest ID to activate
	 */
    // AS3: .../src/com/sulake/habbo/quest/HabboQuestEngine.as::activateQuest()
    activateQuest(questId: number): void;

    /**
	 * Navigate to a random quest room
	 */
    // AS3: .../src/com/sulake/habbo/quest/HabboQuestEngine.as::goToQuestRooms()
    goToQuestRooms(): void;

    /**
	 * Whether the current seasonal campaign has any quest room IDs configured
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/HabboQuestEngine.as::hasQuestRoomsIds()
    hasQuestRoomsIds(): boolean;

    /**
	 * Clear the "don't show again" flag on the room-competition submission window
	 */
    // AS3: .../src/com/sulake/habbo/quest/HabboQuestEngine.as::reenableRoomCompetitionWindow()
    reenableRoomCompetitionWindow(): void;
}
