import type {IDisposable} from '@core/runtime';
import type {IFrameWindow} from '@core/window/components/IFrameWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IWindow} from '@core/window/IWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {QuestMessageData} from '@habbo/communication/messages/parser/quest/QuestMessageData';
import {QuestsListEvent} from '../events/QuestsListEvent';
import {QuestCompletedEvent} from '../events/QuestCompletedEvent';
import type {QuestTracker} from '../QuestTracker';
import {WindowToggle} from '@habbo/utils/WindowToggle';
import type {HabboQuestEngine} from '../HabboQuestEngine';
import {Calendar} from './Calendar';
import {CatalogPromo} from './CatalogPromo';
import {RareTeaser} from './RareTeaser';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('habbo.quest.seasonalcalendar.MainWindow');

/**
 * The seasonal calendar's top-level window: opened from the quest toolbar icon in place of the
 * regular quest list whenever `seasonalQuestCalendar.enabled` is on. Owns the scrolling
 * day-by-day `Calendar` strip plus the `CatalogPromo`/`RareTeaser` footer panels.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/seasonalcalendar/MainWindow.as
 */
export class MainWindow implements IDisposable
{
    // AS3: .../MainWindow.as::_questEngine
    private _questEngine: HabboQuestEngine | null;
    // AS3: .../MainWindow.as::_window
    private _window: IFrameWindow | null = null;
    // AS3: .../MainWindow.as::_SafeStr_5307 (name DERIVED — obfuscated in every available tree).
    private _windowToggle: WindowToggle | null = null;
    // AS3: .../MainWindow.as::_calendar
    private _calendar: Calendar | null;
    // AS3: .../MainWindow.as::_SafeStr_5715 (name DERIVED — obfuscated in every available tree).
    private _catalogPromo: CatalogPromo | null;
    // AS3: .../MainWindow.as::_SafeStr_6182 (name DERIVED — obfuscated in every available tree).
    private _rareTeaser: RareTeaser | null;
    // AS3: .../MainWindow.as::_SafeStr_9219 (name DERIVED — obfuscated in every available tree).
    // Set once `update()` has requested the first seasonal-quest refresh of the day, so it only
    // fires once per session.
    private _firstLoginRequested: boolean = false;
    // AS3: .../MainWindow.as::_SafeStr_7144 (name DERIVED — obfuscated in every available tree).
    private _currentDay: number = 0;

    // AS3: .../MainWindow.as::MainWindow()
    constructor(questEngine: HabboQuestEngine)
    {
        this._questEngine = questEngine;
        this._calendar = new Calendar(questEngine, this);
        this._catalogPromo = new CatalogPromo(questEngine, this);
        this._rareTeaser = new RareTeaser(questEngine);

        questEngine.events.on(QuestsListEvent.QUESTS_SEASONAL, this.onSeasonalQuests);
        questEngine.events.on(QuestCompletedEvent.QUEST_SEASONAL, this.onSeasonalQuestCompleted);
    }

    // AS3: .../MainWindow.as::dispose()
    dispose(): void
    {
        if(this._questEngine)
        {
            this._questEngine.events.off(QuestsListEvent.QUESTS_SEASONAL, this.onSeasonalQuests);
            this._questEngine.events.off(QuestCompletedEvent.QUEST_SEASONAL, this.onSeasonalQuestCompleted);
            this._questEngine = null;
        }

        if(this._window)
        {
            this._window.dispose();
            this._window = null;
        }

        if(this._windowToggle)
        {
            this._windowToggle.dispose();
            this._windowToggle = null;
        }

        if(this._calendar)
        {
            this._calendar.close();
            this._calendar.dispose();
            this._calendar = null;
        }

        if(this._catalogPromo)
        {
            this._catalogPromo.dispose();
            this._catalogPromo = null;
        }

        if(this._rareTeaser)
        {
            this._rareTeaser.dispose();
            this._rareTeaser = null;
        }
    }

    // AS3: .../MainWindow.as::get disposed()
    get disposed(): boolean
    {
        return this._questEngine === null;
    }

    // AS3: .../MainWindow.as::isVisible()
    isVisible(): boolean
    {
        return this._window !== null && this._window.visible;
    }

    // AS3: .../MainWindow.as::close()
    close(): void
    {
        this._calendar?.close();

        if(this._window) this._window.visible = false;
    }

    // AS3: .../MainWindow.as::onRoomExit()
    onRoomExit(): void
    {
        this.close();
    }

    // AS3: .../MainWindow.as::onToolbarClick()
    onToolbarClick(): void
    {
        if(!this._window)
        {
            this._questEngine?.requestSeasonalQuests();

            return;
        }

        if(!this._windowToggle || this._windowToggle.disposed)
        {
            this._windowToggle = new WindowToggle(
                this._window,
                this._window.desktop as unknown as IWindowContainer,
                () => this._questEngine?.requestSeasonalQuests(),
                () => this.close()
            );
        }

        this._windowToggle.toggle();
    }

    // AS3: .../MainWindow.as::getCalendarImageGalleryHost()
    getCalendarImageGalleryHost(): string
    {
        const prefix = this._questEngine?.getSeasonalCampaignCodePrefix() ?? '';

        return `${this._questEngine?.getProperty('image.library.url') ?? ''}${prefix}_quest_calendar/`;
    }

    // AS3: .../MainWindow.as::onQuests()
    onQuests(quests: QuestMessageData[], openWindow: boolean): void
    {
        if(!this.isVisible() && !openWindow) return;

        this._currentDay = this.resolveCurrentDay(quests);
        this._calendar?.onQuests(quests);
        this.refresh();

        if(openWindow && this._window)
        {
            this._window.visible = true;
            this._window.activate();
        }
    }

    // AS3: .../MainWindow.as::onSeasonalQuests()
    private onSeasonalQuests = (event: QuestsListEvent): void =>
    {
        this.onQuests(event.quests as QuestMessageData[], true);
    };

    // AS3: .../MainWindow.as::onSeasonalQuestCompleted()
    private onSeasonalQuestCompleted = (event: QuestCompletedEvent): void =>
    {
        const questData = event.questData as QuestMessageData;
        const tracker: QuestTracker | null = this._questEngine?.questController?.getTracker(questData.campaignChainCode) ?? null;

        tracker?.forceWindowCloseAfterAnimationsFinished();
        this._questEngine?.requestSeasonalQuests();
    };

    // AS3: .../MainWindow.as::onActivityPoints()
    onActivityPoints(type: number, amount: number): void
    {
        this._catalogPromo?.onActivityPoints(type, amount);
    }

    // AS3: .../MainWindow.as::resolveCurrentDay()
    private resolveCurrentDay(quests: QuestMessageData[]): number
    {
        let result = 0;

        for(const quest of quests)
        {
            if(this._questEngine?.isSeasonalQuest(quest)) result = Math.max(result, quest.sortOrder);
        }

        return result;
    }

    // AS3: .../MainWindow.as::refresh()
    private refresh(): void
    {
        this.prepareWindow();

        this._calendar?.refresh();
        this._catalogPromo?.refresh();
        this._rareTeaser?.refresh();
    }

    // AS3: .../MainWindow.as::prepareWindow()
    private prepareWindow(): void
    {
        if(this._window !== null) return;

        this._window = (this._questEngine?.getXmlWindow('SeasonalCalendar') as unknown as IFrameWindow | null) ?? null;

        if(this._window === null)
        {
            log.warn('SeasonalCalendar layout could not be built');

            return;
        }

        const key = `quests.${this._questEngine?.getSeasonalCampaignCodePrefix() ?? ''}.title`;

        this._window.caption = this._questEngine?.localization?.getLocalizationWithParams(key, key) ?? key;

        const closeButton = this._window.findChildByTag('close');

        if(closeButton) closeButton.procedure = this.onWindowClose;

        this._calendar?.prepare(this._window);
        this._catalogPromo?.prepare(this._window);
        this._rareTeaser?.prepare(this._window);

        this._window.center();
    }

    // AS3: .../MainWindow.as::onWindowClose()
    private onWindowClose = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type === WindowMouseEvent.CLICK) this.close();
    };

    // AS3: .../MainWindow.as::get currentDay()
    get currentDay(): number
    {
        return this._currentDay;
    }

    // AS3: .../MainWindow.as::get catalogPromo()
    get catalogPromo(): CatalogPromo | null
    {
        return this._catalogPromo;
    }

    // AS3: .../MainWindow.as::update()
    update(_deltaTime: number): void
    {
        if(
            this._questEngine?.configuration != null &&
            this._questEngine.isFirstLoginOfDay &&
            !this._firstLoginRequested &&
            this._questEngine.isSeasonalCalendarEnabled()
        )
        {
            this._questEngine.requestSeasonalQuests();
            this._firstLoginRequested = true;
        }
    }
}
