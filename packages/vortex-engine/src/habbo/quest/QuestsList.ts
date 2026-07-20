import type {IDisposable} from '@core/runtime';
import type {IFrameWindow} from '@core/window/components/IFrameWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IWindow} from '@core/window/IWindow';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IScrollbarWindow} from '@core/window/components/IScrollbarWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {IAlertDialog} from '@habbo/window/utils/AlertDialog';
import type {HabboQuestEngine} from './HabboQuestEngine';
import type {QuestMessageData} from '@habbo/communication/messages/parser/quest/QuestMessageData';
import {QuestsListEvent} from './events/QuestsListEvent';
import {AcceptQuestMessageComposer} from '@habbo/communication/messages/outgoing/quest/AcceptQuestMessageComposer';
import {RejectQuestMessageComposer} from '@habbo/communication/messages/outgoing/quest/RejectQuestMessageComposer';
import {WindowToggle} from '@habbo/utils/WindowToggle';
import {FriendlyTime} from '@habbo/utils/FriendlyTime';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('QuestsList');

/**
 * The "Quests" window - lists active/available quest campaigns, one QuestEntry row per
 * quest, each composing Campaign + Quest + EntryArrows + CampaignCompleted sub-windows.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/QuestsList.as
 */
export class QuestsList implements IDisposable
{
    // AS3: QuestsList.as::_questEngine
    private _engine: HabboQuestEngine | null;
    // AS3: QuestsList.as::_window
    private _window: IFrameWindow | null = null;
    // AS3: QuestsList.as::_SafeStr_4652
    private _questList: IItemListWindow | null = null;
    // AS3: QuestsList.as::_SafeStr_7411
    private _hcInfoText: ITextWindow | null = null;
    // AS3: QuestsList.as::_SafeStr_7110
    private _getHcButton: IWindow | null = null;
    // AS3: QuestsList.as::_SafeStr_5350
    private _scroller: IScrollbarWindow | null = null;
    // AS3: QuestsList.as::_SafeStr_5307
    private _windowToggle: WindowToggle | null = null;

    // AS3: QuestsList.as::_SafeStr_8063 - reset false the first time the window is toggled;
    // gates the "reject notification" welcome screen so it shows at most once per session.
    private _canShowRejectWelcome: boolean = true;
    // AS3: QuestsList.as::_SafeStr_7837 - whether any quest in the last onQuests() batch was accepted.
    private _hasAcceptedQuest: boolean = false;
    // AS3: QuestsList.as::_SafeStr_5897 - the non-seasonal subset of the last received quest list.
    private _quests: QuestMessageData[] = [];
    // AS3: QuestsList.as::_msecsToRefresh
    private _msecsToRefresh: number = 1000;
    // AS3: QuestsList.as::_SafeStr_8073
    private _openOnQuestsEvent: boolean = false;

    // AS3: QuestsList.as::QuestsList()
    constructor(engine: HabboQuestEngine)
    {
        this._engine = engine;
        this._engine.events.on(QuestsListEvent.QUESTS, this.onQuestsEvent);
    }

    // AS3: QuestsList.as::dispose()
    dispose(): void
    {
        if(this._engine)
        {
            this._engine.events.off(QuestsListEvent.QUESTS, this.onQuestsEvent);
            this._engine = null;
        }

        this._windowToggle?.dispose();
        this._windowToggle = null;

        if(this._window)
        {
            this._window.dispose();
            this._window = null;
        }

        this._questList = null;
        this._scroller = null;
        this._hcInfoText = null;
        this._getHcButton = null;
    }

    // AS3: QuestsList.as::get disposed()
    get disposed(): boolean
    {
        return this._engine === null;
    }

    // AS3: QuestsList.as::isVisible()
    isVisible(): boolean
    {
        return this._window !== null && this._window.visible;
    }

    // AS3: QuestsList.as::close()
    close(): void
    {
        if(this._window)
        {
            this._window.visible = false;
        }
    }

    // AS3: QuestsList.as::onRoomExit()
    onRoomExit(): void
    {
        this.close();
    }

    // AS3: QuestsList.as::setOpenOnQuestsEvent()
    setOpenOnQuestsEvent(): void
    {
        this._openOnQuestsEvent = true;
    }

    // AS3: QuestsList.as::onToolbarClick()
    onToolbarClick(): void
    {
        this.setOpenOnQuestsEvent();

        if(!this._window)
        {
            this._engine?.requestQuests();

            return;
        }

        if(!this._windowToggle || this._windowToggle.disposed)
        {
            this._windowToggle = new WindowToggle(
                this._window,
                this._window.desktop as unknown as IWindowContainer,
                () => this._engine?.requestQuests(),
                () => this.close()
            );
        }

        this._windowToggle.toggle();
        this._canShowRejectWelcome = false;
    }

    // AS3: QuestsList.as::onQuestsEvent()
    private onQuestsEvent = (event: QuestsListEvent): void =>
    {
        const wasPending = this._openOnQuestsEvent;

        this._openOnQuestsEvent = false;
        this.onQuests(event.quests as QuestMessageData[], wasPending);
    };

    // AS3: QuestsList.as::onQuests()
    private onQuests(quests: QuestMessageData[], openWindow: boolean): void
    {
        const engine = this._engine;

        this._quests = quests.filter((quest) => !engine?.isSeasonalQuest(quest));

        if(!this.isVisible() && !openWindow)
        {
            return;
        }

        this.refresh(false);

        if(this._window)
        {
            this._window.visible = true;
            this._window.activate();
        }

        this._hasAcceptedQuest = quests.some((quest) => quest.accepted);
    }

    // AS3: QuestsList.as::refresh()
    private refresh(isDelay: boolean): void
    {
        this.prepareWindow();

        if(!this._questList) return;

        this._questList.autoArrangeItems = false;

        let index = 0;

        while(true)
        {
            if(index < this._quests.length)
            {
                this.refreshEntry(true, index, this._quests[index], isDelay);
            }
            else if(this.refreshEntry(false, index, null, isDelay))
            {
                break;
            }

            index++;
        }

        this._questList.autoArrangeItems = true;
    }

    // AS3: QuestsList.as::prepareWindow()
    private prepareWindow(): void
    {
        if(this._window) return;

        const engine = this._engine;

        if(!engine) return;

        this._window = engine.windowManager?.buildWidgetLayout('Quests') as IFrameWindow | null;

        if(!this._window)
        {
            log.warn('Quests layout could not be built');

            return;
        }

        const closeButton = this._window.findChildByTag('close');

        if(closeButton) closeButton.procedure = this.onWindowClose;

        this._questList = this._window.findChildByName('quest_list') as IItemListWindow | null;
        this._scroller = this._window.findChildByName('scroller') as IScrollbarWindow | null;
        this._hcInfoText = this._window.findChildByName('hc_info_text') as ITextWindow | null;
        this._getHcButton = this._window.findChildByName('get_hc_btn');

        this._window.center();

        if(this._questList) this._questList.spacing = 10;

        this.setupHcDoubleDucketsInfo();
    }

    // AS3: QuestsList.as::setupHcDoubleDucketsInfo()
    private setupHcDoubleDucketsInfo(): void
    {
        const engine = this._engine;

        if(!engine || !this._hcInfoText) return;

        const hasClub = engine.sessionDataManager?.hasClub ?? false;
        const key = hasClub ? 'hc.has.double_duckets.info' : 'hc.get.double_duckets.info';
        const fallback = hasClub
            ? 'You get double duckets as you are an HC member!'
            : 'Get HC membership to gain double duckets!';

        this._hcInfoText.text = engine.localization?.getLocalizationWithParams(key, fallback) ?? fallback;

        if(this._getHcButton)
        {
            this._getHcButton.visible = !hasClub;
            this._getHcButton.addEventListener(WindowMouseEvent.CLICK, this.onClickGetHc);
        }
    }

    // AS3: QuestsList.as::refreshEntry()
    private refreshEntry(hasData: boolean, index: number, quest: QuestMessageData | null, isDelay: boolean): boolean
    {
        if(!this._questList) return true;

        let entry = this._questList.getListItemAt(index) as IWindowContainer | null;

        if(!entry)
        {
            if(!hasData) return true;

            entry = this.createListEntry(this.onAcceptQuest, this.onCancelQuest);
            this._questList.addListItem(entry);
        }

        if(hasData && quest)
        {
            if(isDelay)
            {
                this.refreshDelay(entry, quest);
            }
            else
            {
                this.refreshEntryDetails(entry, quest);
            }

            if(quest.isSeasonal)
            {
                const stillTimeLeft = this.refreshTimeLeft(entry, quest);

                if(!stillTimeLeft && quest.accepted)
                {
                    this._engine?.send(new RejectQuestMessageComposer(quest.id));
                }

                entry.visible = stillTimeLeft;
            }
            else
            {
                entry.visible = true;
            }
        }
        else
        {
            entry.visible = false;
        }

        return false;
    }

    // AS3: QuestsList.as::createListEntry()
    createListEntry(onAccept: (event: WindowEvent, window: IWindow) => void, onCancel: (event: WindowEvent, window: IWindow) => void): IWindowContainer
    {
        const windowManager = this._engine?.windowManager ?? null;

        const entry = windowManager?.buildWidgetLayout('QuestEntry') as unknown as IWindowContainer;
        const campaign = windowManager?.buildWidgetLayout('Campaign') as unknown as IWindowContainer;
        const quest = windowManager?.buildWidgetLayout('Quest') as unknown as IWindowContainer;
        const arrows = windowManager?.buildWidgetLayout('EntryArrows') as unknown as IWindowContainer;
        const campaignCompleted = windowManager?.buildWidgetLayout('CampaignCompleted') as unknown as IWindowContainer;

        entry.addChild(campaign);
        entry.addChild(quest);
        entry.addChild(campaignCompleted);
        entry.addChild(arrows);

        const acceptButton = quest.findChildByName('accept_button');
        const cancelRegion = quest.findChildByName('cancel_region');

        if(acceptButton) acceptButton.procedure = onAccept;
        if(cancelRegion) cancelRegion.procedure = onCancel;

        const hintTxt = entry.findChildByName('hint_txt');
        const linkRegion = entry.findChildByName('link_region');

        if(hintTxt) hintTxt.visible = false;
        if(linkRegion) linkRegion.visible = false;

        const cancelTxt = quest.findChildByName('cancel_txt');

        if(cancelRegion && cancelTxt)
        {
            cancelRegion.width = cancelTxt.width;
            cancelRegion.x = quest.width - cancelRegion.width - 10;
        }

        quest.x = campaign.x + campaign.width + 5;
        entry.width = quest.x + quest.width;
        campaignCompleted.x = quest.x;

        this.setEntryHeight(entry);

        return entry;
    }

    // AS3: QuestsList.as::setEntryHeight()
    setEntryHeight(entry: IWindowContainer): void
    {
        const campaignContainer = entry.findChildByName('campaign_container') as IWindowContainer | null;
        const questContainer = entry.findChildByName('quest_container') as IWindowContainer | null;
        const arrowsContainer = entry.findChildByName('entry_arrows_cont') as IWindowContainer | null;

        if(!campaignContainer || !questContainer || !arrowsContainer) return;

        campaignContainer.height = questContainer.height;
        entry.height = questContainer.height;
        arrowsContainer.x = campaignContainer.x + campaignContainer.width - 2;
        arrowsContainer.y = Math.floor((campaignContainer.height - arrowsContainer.height) / 2) + 1;

        const completionTxt = campaignContainer.findChildByName('completion_txt');

        if(completionTxt) completionTxt.y = campaignContainer.height - 30;

        const bgBottom = campaignContainer.findChildByName('bg_bottom');

        if(bgBottom)
        {
            bgBottom.height = Math.floor((campaignContainer.height - 2 * 2) / 2);
            bgBottom.y = 2 + bgBottom.height;
        }
    }

    // AS3: QuestsList.as::refreshEntryDetails()
    refreshEntryDetails(entry: IWindowContainer, quest: QuestMessageData): void
    {
        const engine = this._engine;

        if(!engine) return;

        const header = entry.findChildByName('campaign_header_txt') as ITextWindow | null;

        if(header)
        {
            header.caption = engine.getCampaignName(quest);
            header.y = header.height <= 17 ? 12 : 2;
        }

        const completionTxt = entry.findChildByName('completion_txt');

        if(completionTxt) completionTxt.caption = `${quest.completedQuestsInCampaign}/${quest.questCountInCampaign}`;

        engine.setupCampaignImage(entry, quest, true);

        this.setColor(entry, 'bg', quest.accepted, 4290944315, 4284769380);
        this.setColor(entry, 'bg_top', quest.accepted, 4294956936, 4290427578);
        this.setColor(entry, 'bg_bottom', quest.accepted, 4294952792, 4289440683);

        this.setChildVisible(entry, 'completion_bg_red_bitmap', !quest.completedCampaign && quest.completedQuestsInCampaign < 1);
        this.setChildVisible(entry, 'completion_bg_blue_bitmap', !quest.completedCampaign && quest.completedQuestsInCampaign > 0);
        this.setChildVisible(entry, 'completion_bg_green_bitmap', quest.completedCampaign);
        this.setChildVisible(entry, 'arrow_0', !quest.accepted);
        this.setChildVisible(entry, 'arrow_1', quest.accepted);
        this.setChildVisible(entry, 'quest_container', !quest.completedCampaign);
        this.setChildVisible(entry, 'campaign_completed_container', quest.completedCampaign);

        if(!quest.completedCampaign)
        {
            const questContainer = entry.findChildByName('quest_container') as IWindowContainer | null;

            if(questContainer) this.refreshEntryQuestDetails(questContainer, quest);

            this.refreshDelay(entry, quest);
        }
    }

    // AS3: QuestsList.as::refreshEntryQuestDetails()
    private refreshEntryQuestDetails(container: IWindowContainer, quest: QuestMessageData): void
    {
        const engine = this._engine;

        if(!engine) return;

        const headerTxt = container.findChildByName('quest_header_txt');

        if(headerTxt) headerTxt.caption = engine.getQuestRowTitle(quest);

        const descTxt = container.findChildByName('desc_txt');

        if(descTxt) descTxt.caption = engine.getQuestDesc(quest);

        this.setChildVisible(container, 'timeleft_txt', quest.isSeasonal);
        this.setChildVisible(container, 'hourglass_icon', quest.isSeasonal);

        if(quest.isSeasonal)
        {
            const timeleftTxt = container.findChildByName('timeleft_txt');

            if(timeleftTxt)
            {
                timeleftTxt.caption = FriendlyTime.getFriendlyTime(quest.secondsLeft, '.short', 3);
            }

            this.initHourglassIcon(container);
        }

        this.setChildVisible(container, 'cancel_txt', quest.accepted);

        const cancelRegion = container.findChildByName('cancel_region');

        if(cancelRegion)
        {
            cancelRegion.visible = quest.accepted;
            cancelRegion.id = quest.id;
        }

        const acceptButton = container.findChildByName('accept_button');

        if(acceptButton)
        {
            acceptButton.visible = !quest.accepted;
            acceptButton.id = quest.id;
        }

        this.setColor(container, null, quest.accepted, 15982264, 13158600);
        this.setColor(container, 'quest_header', quest.accepted, 15577658, 9276813);

        const headerText = container.findChildByName('quest_header_txt') as ITextWindow | null;
        const timeleftText = container.findChildByName('timeleft_txt') as ITextWindow | null;

        if(headerText) headerText.textColor = quest.accepted ? 4294967295 : 4281808695;
        if(timeleftText) timeleftText.textColor = quest.accepted ? 4294967295 : 4281808695;

        engine.setupQuestImage(container, quest);
        engine.refreshReward(quest.waitPeriodSeconds < 1, container, quest.activityPointType, quest.rewardCurrencyAmount);

        this.setChildVisible(container, 'delay_desc_txt', quest.waitPeriodSeconds > 0);
        this.setChildVisible(container, 'delay_txt', quest.waitPeriodSeconds > 0);
        this.setChildVisible(container, 'desc_txt', quest.waitPeriodSeconds < 1);
    }

    // AS3: QuestsList.as::initHourglassIcon()
    private initHourglassIcon(container: IWindowContainer): void
    {
        const icon = container.findChildByName('hourglass_icon') as unknown as IStaticBitmapWrapperWindow | null;

        if(!icon || icon.assetUri) return;

        icon.assetUri = 'icon_hourglass_png';
    }

    // AS3: QuestsList.as::refreshDelay()
    refreshDelay(entry: IWindowContainer, quest: QuestMessageData): boolean
    {
        const delayDescTxt = entry.findChildByName('delay_desc_txt');

        if(delayDescTxt?.visible)
        {
            const seconds = quest.waitPeriodSeconds;

            if(seconds <= 0)
            {
                const questContainer = entry.findChildByName('quest_container') as IWindowContainer | null ?? entry;

                this.refreshEntryQuestDetails(questContainer, quest);

                return true;
            }

            const delayTxt = entry.findChildByName('delay_txt');

            if(delayTxt)
            {
                delayTxt.caption = FriendlyTime.getFriendlyTime(seconds);
            }
        }

        return false;
    }

    // AS3: QuestsList.as::refreshTimeLeft()
    refreshTimeLeft(entry: IWindowContainer, quest: QuestMessageData): boolean
    {
        const timeleftTxt = entry.findChildByName('timeleft_txt');

        if(timeleftTxt?.visible)
        {
            const seconds = quest.secondsLeft;

            if(seconds < 0) return false;

            timeleftTxt.caption = FriendlyTime.getFriendlyTime(seconds, '.short', 3);
        }

        return true;
    }

    // AS3: QuestsList.as::onWindowClose()
    private onWindowClose = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type !== WindowMouseEvent.CLICK) return;

        this.close();

        const isNewIdentity = (this._engine?.getInteger('new.identity', 0) ?? 0) > 0;

        if(isNewIdentity && this._canShowRejectWelcome && !this._hasAcceptedQuest)
        {
            this._canShowRejectWelcome = false;
            this._engine?.habboHelp?.showWelcomeScreen('HTIE_ICON_PROGRESSION', 'quests.rejectnotification', 0);
        }
    };

    // AS3: QuestsList.as::onAcceptQuest()
    private onAcceptQuest = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type !== WindowMouseEvent.CLICK) return;

        const questId = window.id;

        log.debug(`Accept quest: ${questId}`);
        this._engine?.send(new AcceptQuestMessageComposer(questId));
    };

    // AS3: QuestsList.as::onCancelQuest()
    private onCancelQuest = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type !== WindowMouseEvent.CLICK) return;

        const questId = window.id;

        log.debug(`Reject quest: ${questId}`);
        this._engine?.send(new RejectQuestMessageComposer(questId));
    };

    // AS3: QuestsList.as::onClickGetHc()
    private onClickGetHc = (_event: WindowEvent): void =>
    {
        this._engine?.catalog?.openCatalogPage('hc_membership', 'NORMAL');
    };

    // AS3: QuestsList.as::setColor()
    private setColor(entry: IWindowContainer, childName: string | null, condition: boolean, colorIfTrue: number, colorIfFalse: number): void
    {
        const target = childName === null ? entry : entry.findChildByName(childName);

        if(target) target.color = condition ? colorIfTrue : colorIfFalse;
    }

    // TS-only helper (AS3 inlines `param1.findChildByName(name).visible = ...` at each call site).
    private setChildVisible(container: IWindowContainer, name: string, visible: boolean): void
    {
        const child = container.findChildByName(name);

        if(child) child.visible = visible;
    }

    // AS3: QuestsList.as::onAlert()
    onAlert(dialog: IAlertDialog, event: WindowEvent): void
    {
        if(event.type === WindowEvent.WE_OK || event.type === WindowEvent.WE_CANCEL)
        {
            dialog.dispose();
        }
    }

    // AS3: QuestsList.as::update()
    update(deltaTime: number): void
    {
        if(!this._window || !this._window.visible) return;

        this._msecsToRefresh -= deltaTime;

        if(this._msecsToRefresh > 0) return;

        this._msecsToRefresh = 1000;
        this.refresh(true);
    }
}
