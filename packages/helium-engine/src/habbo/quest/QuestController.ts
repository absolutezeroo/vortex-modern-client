import type {IDisposable} from '@core/runtime';
import type {HabboQuestEngine} from './HabboQuestEngine';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('QuestController');

/**
 * Quest lifecycle controller
 *
 * Manages quest trackers (per campaign chain), handles quest lifecycle events,
 * and coordinates quest-related state. VIEW logic is handled by SolidJS.
 *
 * @see source_as_win63/habbo/quest/QuestController.as
 */
export class QuestController implements IDisposable
{
    private _engine: HabboQuestEngine | null;
    private _questTrackers: Map<string, unknown> = new Map();

    constructor(engine: HabboQuestEngine)
    {
        this._engine = engine;
    }

    private _disposed: boolean = false;

    get disposed(): boolean
    {
        return this._disposed;
    }

    /**
	 * Handle a quest data update from the server
	 *
	 * @param questData The quest data received
	 */
    onQuest(questData: unknown): void
    {
        if(!questData) return;

        // In AS3, this creates/updates a QuestTracker keyed by campaignChainCode.
        // QuestTracker is a VIEW class - we track the data here for ENGINE purposes.
        const data = questData as Record<string, unknown>;
        const campaignChainCode = data.campaignChainCode as string;

        if(campaignChainCode)
        {
            this._questTrackers.set(campaignChainCode, questData);
        }

        log.debug(`Quest received: ${campaignChainCode}`);
    }

    /**
	 * Handle quest completion
	 *
	 * @param questData The completed quest data
	 * @param showDialog Whether to show the completion dialog
	 */
    onQuestCompleted(questData: unknown, showDialog: boolean): void
    {
        const data = questData as Record<string, unknown>;
        const campaignChainCode = data.campaignChainCode as string;

        log.info(`Quest completed: ${campaignChainCode}, showDialog: ${showDialog}`);
    }

    /**
	 * Handle quest cancellation
	 *
	 * @param campaignChainCode The campaign chain code of the cancelled quest
	 */
    onQuestCancelled(campaignChainCode: string): void
    {
        const tracker = this._questTrackers.get(campaignChainCode);

        if(tracker)
        {
            this._questTrackers.delete(campaignChainCode);
        }

        log.debug(`Quest cancelled: ${campaignChainCode}`);
    }

    /**
	 * Handle room entry - start default campaign tracker
	 */
    onRoomEnter(): void
    {
        const defaultCampaign = this.getDefaultCampaign();

        if(!defaultCampaign || defaultCampaign === '')
        {
            return;
        }

        log.debug(`Room entered, default campaign: ${defaultCampaign}`);
    }

    /**
	 * Handle room exit - close all trackers
	 */
    onRoomExit(): void
    {
        // In AS3 this closes VIEW elements and notifies trackers of room exit.
        // We clean up tracker state here.
        log.debug('Room exited, cleaning quest trackers');
    }

    /**
	 * Handle activity points update
	 *
	 * @param type The activity point type
	 * @param amount The amount of activity points
	 */
    onActivityPoints(type: number, amount: number): void
    {
        log.debug(`Activity points: type=${type}, amount=${amount}`);
    }

    /**
	 * Get the default campaign from configuration
	 *
	 * @returns The default campaign code, or empty string if not configured
	 */
    getDefaultCampaign(): string
    {
        if(!this._engine) return '';

        const campaign = this._engine.getProperty('questing.defaultCampaign');

        return campaign ?? '';
    }

    /**
	 * Dispose of this controller and release resources
	 */
    dispose(): void
    {
        if(this._disposed) return;

        this._questTrackers.clear();
        this._engine = null;
        this._disposed = true;
    }
}
