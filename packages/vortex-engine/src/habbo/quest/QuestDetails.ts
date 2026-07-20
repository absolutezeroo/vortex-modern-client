import type {IDisposable} from '@core/runtime';
import type {IFrameWindow} from '@core/window/components/IFrameWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IWindow} from '@core/window/IWindow';
import type {IRegionWindow} from '@core/window/components/IRegionWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {WindowLinkEvent} from '@core/window/events/WindowLinkEvent';
import type {HabboQuestEngine} from './HabboQuestEngine';
import type {QuestMessageData} from '@habbo/communication/messages/parser/quest/QuestMessageData';
import {ActivateQuestMessageComposer} from '@habbo/communication/messages/outgoing/quest/ActivateQuestMessageComposer';
import {AcceptQuestMessageComposer} from '@habbo/communication/messages/outgoing/quest/AcceptQuestMessageComposer';
import {RejectQuestMessageComposer} from '@habbo/communication/messages/outgoing/quest/RejectQuestMessageComposer';
import {HabboWebTools} from '@habbo/utils/HabboWebTools';

// AS3: QuestDetails.as::_SafeStr_9914 - quest types with an in-room prompt, matching
// HabboQuestEngine.QUESTS_WITH_PROMPTS but this class only uses it to gate the catalog link.
const CATALOG_LINK_QUEST_TYPES: string[] = ['PLACE_ITEM', 'PLACE_FLOOR', 'PLACE_WALLPAPER', 'PET_DRINK', 'PET_EAT'];

const ENTRY_LOCATION = {x: 8, y: 8};

/**
 * The single-quest "read more" popup - embeds one live QuestEntry row (reusing
 * QuestsList.createListEntry()) plus a hint and a context-sensitive link
 * (catalog / navigator search / "go to quest rooms").
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/QuestDetails.as
 */
export class QuestDetails implements IDisposable
{
    private _engine: HabboQuestEngine | null;
    private _window: IFrameWindow | null = null;
    // AS3: QuestDetails.as::_SafeStr_7881 - "open details for the next quest received via onQuest()".
    private _pendingOpenForNextQuest: boolean = false;
    // AS3: QuestDetails.as::_SafeStr_4677
    private _currentQuest: QuestMessageData | null = null;
    private _msecsToRefresh: number = 0;
    // AS3: QuestDetails.as::_SafeStr_8592 - the openForNextQuest flag this popup was opened with.
    private _openedForNextQuest: boolean = false;

    // AS3: QuestDetails.as::QuestDetails()
    constructor(engine: HabboQuestEngine)
    {
        this._engine = engine;
    }

    // AS3: QuestDetails.as::dispose()
    dispose(): void
    {
        this._engine = null;
        this._currentQuest = null;

        if(this._window)
        {
            this._window.dispose();
            this._window = null;
        }
    }

    // AS3: QuestDetails.as::get disposed()
    get disposed(): boolean
    {
        return this._engine === null;
    }

    // AS3: QuestDetails.as::onQuest()
    onQuest(quest: QuestMessageData): void
    {
        if(this._pendingOpenForNextQuest)
        {
            this._pendingOpenForNextQuest = false;
            this.openDetails(quest);
        }
        else if(this._currentQuest === null)
        {
            this.close();
        }
    }

    // AS3: QuestDetails.as::onQuestCompleted()
    onQuestCompleted(quest: QuestMessageData): void
    {
        if(this._currentQuest === null || this._currentQuest.id === quest.id)
        {
            this.close();
        }
    }

    // AS3: QuestDetails.as::onQuestCancelled()
    onQuestCancelled(campaignChainCode: string): void
    {
        if(this._currentQuest === null || this._currentQuest.campaignChainCode === campaignChainCode)
        {
            this.close();
        }
    }

    // AS3: QuestDetails.as::onRoomExit()
    onRoomExit(): void
    {
        this.close();
    }

    // AS3: QuestDetails.as::close()
    private close(): void
    {
        if(this._window)
        {
            this._window.visible = false;
        }
    }

    // AS3: QuestDetails.as::showDetails()
    showDetails(quest: QuestMessageData): void
    {
        if(this._window && this._window.visible && this._currentQuest !== null && quest.id === this._currentQuest.id)
        {
            this._window.visible = false;

            return;
        }

        this.openDetails(quest);
    }

    // AS3: QuestDetails.as::openDetails()
    openDetails(quest: QuestMessageData, openedForNextQuest: boolean = false): void
    {
        const engine = this._engine;

        this._currentQuest = quest;

        if(!quest || !engine) return;

        this._openedForNextQuest = openedForNextQuest;

        if(!this._window)
        {
            this._window = engine.windowManager?.buildWidgetLayout('QuestDetails') as IFrameWindow | null;

            if(!this._window) return;

            const closeButton = this._window.findChildByTag('close');

            if(closeButton) closeButton.procedure = this.onDetailsWindowClose;

            this._window.center();

            const newEntry = engine.questController?.questsList.createListEntry(this.onAcceptQuest, this.onCancelQuest) ?? null;

            if(newEntry)
            {
                newEntry.x = ENTRY_LOCATION.x;
                newEntry.y = ENTRY_LOCATION.y;
                this._window.content.addChild(newEntry);
            }

            const linkRegion = this._window.findChildByName('link_region');

            if(linkRegion) linkRegion.procedure = this.onLinkProc;
        }

        const entry = this._window.findChildByName('entry_container') as IWindowContainer | null;

        if(!entry) return;

        engine.questController?.questsList.refreshEntryDetails(entry, quest);

        const hasDelay = quest.waitPeriodSeconds > 0;
        const hintTxt = entry.findChildByName('hint_txt') as ITextWindow | null;
        const previousHintHeight = hintTxt ? this.getTextHeight(hintTxt) : 0;

        if(hintTxt)
        {
            if(!hasDelay)
            {
                hintTxt.caption = engine.getQuestHint(quest);
                hintTxt.height = hintTxt.textHeight + 5;
                hintTxt.addEventListener(WindowLinkEvent.WE_LINK, this.onClickHtmlLink);
            }

            hintTxt.visible = !hasDelay;
        }

        const hintHeightDelta = (hintTxt ? this.getTextHeight(hintTxt) : 0) - previousHintHeight;
        const linkHeightDelta = this.setupLink('link_region', (hintTxt?.y ?? 0) + (hintTxt?.height ?? 0) + 5);

        const questContainer = entry.findChildByName('quest_container') as IWindowContainer | null;

        if(questContainer) questContainer.height = questContainer.height + (hintHeightDelta + linkHeightDelta);

        engine.questController?.questsList.setEntryHeight(entry);

        this._window.height = entry.height + 56;
        this._window.visible = true;
        this._window.activate();
    }

    // AS3: QuestDetails.as::onClickHtmlLink()
    private onClickHtmlLink = (event: WindowEvent): void =>
    {
        const linkEvent = event as WindowLinkEvent;

        if(linkEvent)
        {
            HabboWebTools.openWebPageAndMinimizeClient(linkEvent.link);
        }
    };

    // AS3: QuestDetails.as::setupLink()
    private setupLink(regionName: string, y: number): number
    {
        const showCatalog = this.hasCatalogLink();
        const showNavigator = !showCatalog && this.hasNavigatorLink();
        const showRoom = !showCatalog && !showNavigator && this.hasRoomLink();
        const showAny = showCatalog || showNavigator || showRoom;

        const region = this._window?.findChildByName(regionName) as IRegionWindow | null;

        if(!region) return 0;

        region.y = y;

        let delta = 0;

        if(showAny && !region.visible)
        {
            delta = 5 + region.height;
        }

        if(!showAny && region.visible)
        {
            delta = -5 - region.height;
        }

        region.visible = showAny;

        const catalogLink = region.findChildByName('link_catalog');
        const navigatorLink = region.findChildByName('link_navigator');
        const roomLink = region.findChildByName('link_room');

        if(catalogLink) catalogLink.visible = showCatalog;
        if(navigatorLink) navigatorLink.visible = showNavigator;
        if(roomLink) roomLink.visible = showRoom;

        return delta;
    }

    // AS3: QuestDetails.as::hasCatalogLink()
    private hasCatalogLink(): boolean
    {
        const quest = this._currentQuest;

        return !!quest && quest.waitPeriodSeconds < 1 && CATALOG_LINK_QUEST_TYPES.indexOf(quest.type) > -1;
    }

    // AS3: QuestDetails.as::hasNavigatorLink()
    private hasNavigatorLink(): boolean
    {
        const quest = this._currentQuest;
        const engine = this._engine;

        if(!quest || !engine) return false;

        // AS3 checks the same key twice (a genuine duplicate, both against the quest's own
        // localization key - the campaign-level key documented in the comment is never
        // actually read). Ported faithfully.
        const hasQuestSearchTag = engine.hasLocalizedValue(`${quest.getQuestLocalizationKey()}.searchtag`);

        return quest.waitPeriodSeconds < 1 && hasQuestSearchTag;
    }

    // AS3: QuestDetails.as::hasRoomLink()
    private hasRoomLink(): boolean
    {
        const quest = this._currentQuest;
        const engine = this._engine;

        if(!quest || !engine) return false;

        return quest.waitPeriodSeconds < 1 && engine.isSeasonalQuest(quest) && engine.hasQuestRoomsIds();
    }

    // AS3: QuestDetails.as::getTextHeight()
    private getTextHeight(text: ITextWindow): number
    {
        return text.visible ? text.height : 0;
    }

    // AS3: QuestDetails.as::onDetailsWindowClose()
    private onDetailsWindowClose = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type === WindowMouseEvent.CLICK && this._window)
        {
            this._window.visible = false;
        }
    };

    // AS3: QuestDetails.as::set openForNextQuest()
    set openForNextQuest(value: boolean)
    {
        this._pendingOpenForNextQuest = value;
    }

    // AS3: QuestDetails.as::onLinkProc()
    private onLinkProc = (event: WindowEvent, _window: IWindow | null = null): void =>
    {
        const engine = this._engine;
        const quest = this._currentQuest;

        if(event.type !== WindowMouseEvent.CLICK || !engine || !quest) return;

        if(this.hasCatalogLink())
        {
            engine.openCatalog(quest);
        }
        else if(this.hasNavigatorLink())
        {
            engine.openNavigator(quest);
        }
        else
        {
            engine.goToQuestRooms();
        }
    };

    // AS3: QuestDetails.as::update()
    update(deltaTime: number): void
    {
        if(!this._window || !this._window.visible || !this._currentQuest) return;

        this._msecsToRefresh -= deltaTime;

        if(this._msecsToRefresh > 0) return;

        this._msecsToRefresh = 1000;

        const finishedDelay = this._engine?.questController?.questsList.refreshDelay(this._window, this._currentQuest) ?? false;

        if(finishedDelay)
        {
            this.openDetails(this._currentQuest, this._openedForNextQuest);
        }
    }

    // AS3: QuestDetails.as::onAcceptQuest()
    private onAcceptQuest = (event: WindowEvent, _window: IWindow): void =>
    {
        const engine = this._engine;
        const quest = this._currentQuest;

        if(event.type !== WindowMouseEvent.CLICK || !engine || !quest) return;

        if(engine.currentlyInRoom)
        {
            engine.send(new AcceptQuestMessageComposer(quest.id));
        }
        else
        {
            engine.send(new ActivateQuestMessageComposer(quest.id));
        }

        if(this._window) this._window.visible = false;

        // TODO(AS3): AS3 also calls questController.seasonalCalendarWindow.close() here -
        // the seasonal calendar isn't ported (QuestController.seasonalCalendarWindow is a
        // documented always-null stub), so there is nothing to close.

        if(this._openedForNextQuest && engine.isSeasonalQuest(quest))
        {
            engine.goToQuestRooms();
        }
    };

    // AS3: QuestDetails.as::onCancelQuest()
    private onCancelQuest = (event: WindowEvent, _window: IWindow): void =>
    {
        const engine = this._engine;
        const quest = this._currentQuest;

        if(event.type !== WindowMouseEvent.CLICK || !engine || !quest) return;

        engine.send(new RejectQuestMessageComposer(quest.id));
    };
}
