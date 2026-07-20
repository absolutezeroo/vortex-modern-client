import type {IDisposable} from '@core/runtime';
import type {HabboQuestEngine} from './HabboQuestEngine';
import type {QuestMessageData} from '@habbo/communication/messages/parser/quest/QuestMessageData';
import {QuestsList} from './QuestsList';
import {QuestDetails} from './QuestDetails';
import {QuestCompleted} from './QuestCompleted';
import {NextQuestTimer} from './NextQuestTimer';
import {QuestTracker} from './QuestTracker';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('QuestController');

/**
 * Quest lifecycle controller.
 *
 * Owns the quest list/details/completed/next-quest-timer windows and one QuestTracker
 * per active campaign chain, and fans every quest lifecycle event out to all of them -
 * matching AS3 exactly.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/QuestController.as
 */
export class QuestController implements IDisposable
{
    private _engine: HabboQuestEngine | null;
    private _questsList: QuestsList | null;
    private _questDetails: QuestDetails | null;
    private _questCompleted: QuestCompleted | null;
    private _nextQuestTimer: NextQuestTimer | null;
    private _questTrackers: Map<string, QuestTracker> = new Map();

    // AS3: QuestController.as::QuestController()
    constructor(engine: HabboQuestEngine)
    {
        this._engine = engine;
        this._questsList = new QuestsList(engine);
        this._questDetails = new QuestDetails(engine);
        this._questCompleted = new QuestCompleted(engine);
        this._nextQuestTimer = new NextQuestTimer(engine);

        // TODO(AS3): AS3 also constructs seasonalcalendar.MainWindow here
        // (com.sulake.habbo.quest.seasonalcalendar) - the entire seasonal-calendar
        // subsystem (MainWindow/Calendar/CalendarArrowButton/CatalogPromo/RareTeaser) is
        // out of scope for this pass; only CalendarEntityStateEnums.ts exists so far. See
        // onToolbarClick()/seasonalCalendarWindow below for the safe-default fallback.
    }

    private _disposed: boolean = false;

    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: QuestController.as::get questsList()
    get questsList(): QuestsList
    {
        return this._questsList!;
    }

    // AS3: QuestController.as::get questDetails()
    get questDetails(): QuestDetails
    {
        return this._questDetails!;
    }

    /**
	 * TODO(AS3): AS3's seasonalcalendar.MainWindow isn't ported (see the constructor's own
	 * TODO) - always null here, matching the safe default other unported-subsystem getters
	 * in this codebase use.
	 */
    // AS3: QuestController.as::get seasonalCalendarWindow()
    get seasonalCalendarWindow(): null
    {
        return null;
    }

    // AS3: QuestController.as::onToolbarClick()
    onToolbarClick(): void
    {
        if(this._engine?.isSeasonalCalendarEnabled())
        {
            // TODO(AS3): AS3 opens seasonalcalendar.MainWindow and closes questsList here -
            // the calendar window isn't ported (see constructor's TODO), so fall back to the
            // regular quest list rather than silently doing nothing.
            log.debug('Seasonal calendar enabled but not ported - falling back to the regular quest list');
        }

        this._questsList?.onToolbarClick();
    }

    // AS3: QuestController.as::getOrCreateTracker()
    private getOrCreateTracker(campaignChainCode: string, create: boolean = true): QuestTracker | null
    {
        let tracker = this._questTrackers.get(campaignChainCode) ?? null;

        if(tracker === null && create && this._engine)
        {
            tracker = new QuestTracker(this._engine);
            this._questTrackers.set(campaignChainCode, tracker);
        }

        return tracker;
    }

    // AS3: QuestController.as::getTracker()
    getTracker(campaignChainCode: string): QuestTracker | null
    {
        return this.getOrCreateTracker(campaignChainCode, false);
    }

    // AS3: QuestController.as::cleanTrackers()
    private cleanTrackers(forceAll: boolean): void
    {
        const toRemove: string[] = [];

        for(const [key, tracker] of this._questTrackers)
        {
            if(tracker.canBeDisposed || forceAll)
            {
                tracker.dispose();
                toRemove.push(key);
            }
        }

        for(const key of toRemove)
        {
            this._questTrackers.delete(key);
        }
    }

    // AS3: QuestController.as::onQuest()
    onQuest(quest: QuestMessageData): void
    {
        const tracker = this.getOrCreateTracker(quest.campaignChainCode);

        tracker?.onQuest(quest);

        if(tracker?.campaignChainCode === null)
        {
            this._questTrackers.delete(quest.campaignChainCode);
        }

        this._questDetails?.onQuest(quest);
        this._questCompleted?.onQuest(quest);
        this._nextQuestTimer?.onQuest(quest);
    }

    // AS3: QuestController.as::onQuestCompleted()
    onQuestCompleted(quest: QuestMessageData, showDialog: boolean): void
    {
        const tracker = this.getOrCreateTracker(quest.campaignChainCode);

        tracker?.onQuestCompleted(quest, showDialog);
        this._questDetails?.onQuestCompleted(quest);
        this._questCompleted?.onQuestCompleted(quest, showDialog);
    }

    // AS3: QuestController.as::onQuestCancelled()
    onQuestCancelled(campaignChainCode: string): void
    {
        const tracker = this.getOrCreateTracker(campaignChainCode, false);

        tracker?.onQuestCancelled();
        this._questDetails?.onQuestCancelled(campaignChainCode);
        this._questCompleted?.onQuestCancelled();
        this._nextQuestTimer?.onQuestCancelled();
    }

    // AS3: QuestController.as::onRoomEnter()
    onRoomEnter(): void
    {
        const defaultCampaign = this.getDefaultCampaign();

        if(!defaultCampaign || defaultCampaign === '')
        {
            return;
        }

        this.getOrCreateTracker(defaultCampaign)?.startDefaultCampaign(defaultCampaign);
    }

    // AS3: QuestController.as::onRoomExit()
    onRoomExit(): void
    {
        this._questsList?.onRoomExit();
        // TODO(AS3): seasonalCalendarWindow.onRoomExit() - not ported, see class-level TODOs.

        for(const tracker of this._questTrackers.values())
        {
            tracker.onRoomExit();
        }

        this._questDetails?.onRoomExit();
        this._nextQuestTimer?.onRoomExit();
    }

    // AS3: QuestController.as::update()
    update(deltaTime: number): void
    {
        this._questCompleted?.update(deltaTime);

        for(const tracker of this._questTrackers.values())
        {
            tracker.update(deltaTime);
        }

        this._nextQuestTimer?.update(deltaTime);
        this._questsList?.update(deltaTime);
        this._questDetails?.update(deltaTime);
        // TODO(AS3): seasonalCalendarWindow.update(deltaTime) - not ported, see class-level TODOs.

        this.cleanTrackers(false);
    }

    // AS3: QuestController.as::onActivityPoints()
    onActivityPoints(_type: number, _amount: number): void
    {
        // TODO(AS3): forwards to seasonalCalendarWindow.onActivityPoints() - not ported, see
        // class-level TODOs. No-op until the seasonal calendar exists.
    }

    // AS3: QuestController.as::getDefaultCampaign()
    getDefaultCampaign(): string
    {
        const campaign = this._engine?.getProperty('questing.defaultCampaign') ?? '';

        return campaign;
    }

    // AS3: QuestController.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this._engine = null;

        if(this._questsList)
        {
            this._questsList.dispose();
            this._questsList = null;
        }

        this.cleanTrackers(true);
        this._questTrackers.clear();

        if(this._questDetails)
        {
            this._questDetails.dispose();
            this._questDetails = null;
        }

        if(this._questCompleted)
        {
            this._questCompleted.dispose();
            this._questCompleted = null;
        }

        if(this._nextQuestTimer)
        {
            this._nextQuestTimer.dispose();
            this._nextQuestTimer = null;
        }

        this._disposed = true;
    }
}
