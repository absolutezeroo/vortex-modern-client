import type {Bot} from './Bot';

/**
 * Interface for BotsModel
 *
 * Based on AS3 com.sulake.habbo.inventory.bots.BotsModel (ENGINE only)
 */
export interface IBotsModel
{
    readonly disposed: boolean;
    readonly isListInitialized: boolean;
    readonly bots: Map<number, Bot>;

    dispose(): void;

    /**
	 * Add a single bot
	 * Returns true if added (new), false if already exists
	 */
    addBot(bot: Bot): boolean;

    /**
	 * Update bots from full list
	 * Returns info about what changed
	 */
    updateBots(bots: Map<number, Bot>): {
        added: number[];
        removed: number[];
    };

    /**
	 * Remove a bot by ID
	 * Returns the removed bot or null
	 */
    removeBot(id: number): Bot | null;

    /**
	 * Get bot by ID
	 */
    getBotById(id: number): Bot | null;

    /**
	 * Get all bots as array
	 */
    getBotsArray(): Bot[];

    /**
	 * Get selected bot
	 */
    getSelectedBot(): Bot | null;

    /**
	 * Select bot by ID
	 */
    selectBot(id: number): void;

    /**
	 * Remove all selections
	 */
    removeSelections(): void;

    /**
	 * Reset unseen flags
	 * Returns IDs that were marked as unseen
	 */
    resetUnseenItems(): number[];

    /**
	 * Mark bots as unseen based on IDs
	 */
    updateUnseenItems(unseenIds: number[]): void;

    /**
	 * Check if bot is unseen
	 */
    isUnseen(id: number): boolean;

    // AS3: sources/win63_version/habbo/inventory/bots/BotsModel.as::updateView()
    updateView(): void;
}
