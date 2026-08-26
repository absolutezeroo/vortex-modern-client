import type {IDisposable} from '@core/runtime';
import type {HabboQuestEngine} from './HabboQuestEngine';
import type {QuestMessageData} from '@habbo/communication/messages/parser/quest/QuestMessageData';
import {QuestsList} from './QuestsList';
import {QuestDetails} from './QuestDetails';
import {QuestCompleted} from './QuestCompleted';
import {NextQuestTimer} from './NextQuestTimer';
import {QuestTracker} from './QuestTracker';
import {MainWindow} from './seasonalcalendar/MainWindow';

/**
 * Quest lifecycle controller.
 *
 * Owns the quest list/details/completed/next-quest-timer windows, the seasonal calendar's
 * MainWindow, and one QuestTracker per active campaign chain, and fans every quest lifecycle
 * event out to all of them - matching AS3 exactly.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/QuestController.as
 */
export class QuestController implements IDisposable
{
    // AS3: QuestController.as::_questEngine
    private _engine: HabboQuestEngine | null;
    // AS3: QuestController.as::_SafeStr_5508
    private _questsList: QuestsList | null;
    // AS3: QuestController.as::_questDetails
    private _questDetails: QuestDetails | null;
    // AS3: QuestController.as::_SafeStr_5871
    private _questCompleted: QuestCompleted | null;
    // AS3: QuestController.as::_SafeStr_5813
    private _nextQuestTimer: NextQuestTimer | null;
    // AS3: QuestController.as::_SafeStr_5435
    private _seasonalCalendarWindow: MainWindow | null;
    // AS3: QuestController.as::_questTrackers
    private _questTrackers: Map<string, QuestTracker> = new Map();

    // AS3: QuestController.as::QuestController()
    constructor(engine: HabboQuestEngine)
    {
        this._engine = engine;
        this._questsList = new QuestsList(engine);
        this._questDetails = new QuestDetails(engine);
        this._questCompleted = new QuestCompleted(engine);
        this._nextQuestTimer = new NextQuestTimer(engine);
        this._seasonalCalendarWindow = new MainWindow(engine);
    }

    private _disposed: boolean = false;

    // AS3: .../src/com/sulake/habbo/quest/QuestController.as::get disposed()
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

    // AS3: QuestController.as::get seasonalCalendarWindow()
    get seasonalCalendarWindow(): MainWindow | null
    {
        return this._seasonalCalendarWindow;
    }

    // AS3: QuestController.as::onToolbarClick()
    onToolbarClick(): void
    {
        if(this._engine?.isSeasonalCalendarEnabled())
        {
            this._seasonalCalendarWindow?.onToolbarClick();
            this._questsList?.close();
        }
        else
        {
            this._questsList?.onToolbarClick();
        }
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
        this._seasonalCalendarWindow?.onRoomExit();

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
        this._seasonalCalendarWindow?.update(deltaTime);

        this.cleanTrackers(false);
    }

    // AS3: QuestController.as::onActivityPoints()
    onActivityPoints(type: number, amount: number): void
    {
        this._seasonalCalendarWindow?.onActivityPoints(type, amount);
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

        if(this._seasonalCalendarWindow)
        {
            this._seasonalCalendarWindow.dispose();
            this._seasonalCalendarWindow = null;
        }

        this._disposed = true;
    }
}
