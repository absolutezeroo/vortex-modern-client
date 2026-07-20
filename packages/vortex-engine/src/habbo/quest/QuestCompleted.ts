import type {IDisposable} from '@core/runtime';
import type {IFrameWindow} from '@core/window/components/IFrameWindow';
import type {IWindow} from '@core/window/IWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {HabboQuestEngine} from './HabboQuestEngine';
import type {QuestMessageData} from '@habbo/communication/messages/parser/quest/QuestMessageData';
import {OpenQuestTrackerMessageComposer} from '@habbo/communication/messages/outgoing/quest/OpenQuestTrackerMessageComposer';
import {GetQuestsMessageComposer} from '@habbo/communication/messages/outgoing/quest/GetQuestsMessageComposer';

const PREPARE_TO_SHOW_DELAY_MS = 2000;

/**
 * The "quest completed" congratulation dialog, shown ~2s after a QUEST_COMPLETED
 * message with showDialog=true.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/QuestCompleted.as
 */
export class QuestCompleted implements IDisposable
{
    private _window: IFrameWindow | null = null;
    private _engine: HabboQuestEngine | null;
    private _currentQuest: QuestMessageData | null = null;
    // AS3: QuestCompleted.as::_SafeStr_5822 - the twinkle celebration Animation.
    // TODO(AS3): HabboQuestEngine.getTwinkleAnimation() is a documented stub (returns null) -
    // Animation/AnimationObject/Twinkle/TwinkleImages aren't ported. Dialog still shows and
    // functions correctly, just without the sparkle effect.
    private _twinkleAnimation: {restart(): void; stop(): void; update(deltaTime: number): void} | null = null;
    private _msecsUntilShow: number = 0;

    // AS3: QuestCompleted.as::QuestCompleted()
    constructor(engine: HabboQuestEngine)
    {
        this._engine = engine;
    }

    // AS3: QuestCompleted.as::dispose()
    dispose(): void
    {
        this._engine = null;
        this._currentQuest = null;

        if(this._window)
        {
            this._window.dispose();
            this._window = null;
        }

        this._twinkleAnimation = null;
    }

    // AS3: QuestCompleted.as::get disposed()
    get disposed(): boolean
    {
        return this._window === null;
    }

    // AS3: QuestCompleted.as::onQuest()
    onQuest(_quest: QuestMessageData): void
    {
        this.close();
    }

    // AS3: QuestCompleted.as::onQuestCancelled()
    onQuestCancelled(): void
    {
        this.close();
    }

    // AS3: QuestCompleted.as::onQuestCompleted()
    onQuestCompleted(quest: QuestMessageData, showDialog: boolean): void
    {
        if(showDialog)
        {
            this.prepare(quest);
            this._msecsUntilShow = PREPARE_TO_SHOW_DELAY_MS;
        }
    }

    // AS3: QuestCompleted.as::close()
    private close(): void
    {
        if(this._window)
        {
            this._window.visible = false;
        }
    }

    // AS3: QuestCompleted.as::onNextQuest()
    private onNextQuest = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type !== WindowMouseEvent.CLICK) return;

        const engine = this._engine;

        if(this._window) this._window.visible = false;

        if(engine?.questController)
        {
            engine.questController.questDetails.openForNextQuest = engine.getBoolean('questing.showDetailsForNextQuest');
        }

        engine?.send(new OpenQuestTrackerMessageComposer());
    };

    // AS3: QuestCompleted.as::onMoreQuests()
    private onMoreQuests = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type !== WindowMouseEvent.CLICK) return;

        const engine = this._engine;

        if(this._window) this._window.visible = false;

        engine?.questController?.questsList.setOpenOnQuestsEvent();
        engine?.send(new GetQuestsMessageComposer());
    };

    // AS3: QuestCompleted.as::prepare()
    prepare(quest: QuestMessageData): void
    {
        const engine = this._engine;

        this._currentQuest = quest;

        if(!engine) return;

        if(!this._window)
        {
            this._window = engine.windowManager?.buildWidgetLayout('QuestCompletedDialog') as IFrameWindow | null;

            if(!this._window) return;

            const closeButton = this._window.findChildByTag('close');
            const nextQuestButton = this._window.findChildByName('next_quest_button');
            const moreQuestsButton = this._window.findChildByName('more_quests_button');
            const catalogLinkRegion = this._window.findChildByName('catalog_link_region');

            if(closeButton) closeButton.procedure = this.onNextQuest;
            if(nextQuestButton) nextQuestButton.procedure = this.onNextQuest;
            if(moreQuestsButton) moreQuestsButton.procedure = this.onMoreQuests;
            if(catalogLinkRegion) catalogLinkRegion.procedure = this.onCatalogLink;

            this._twinkleAnimation = engine.getTwinkleAnimation(this._window);
        }

        const window = this._window;
        const currencyName = engine.catalog?.getActivityPointName(quest.activityPointType) ?? '';

        const catalogLinkTxt = window.findChildByName('catalog_link_txt');

        if(catalogLinkTxt)
        {
            catalogLinkTxt.caption = engine.localization?.getLocalizationWithParams(
                'quests.completed.cataloglink', '', 'currencyname', currencyName
            ) ?? '';
        }

        engine.localization?.registerParameter('quests.completed.reward', 'amount', quest.rewardCurrencyAmount.toString());
        engine.localization?.registerParameter('quests.completed.reward', 'currencyname', currencyName);

        const rewardTxt = window.findChildByName('reward_txt');

        if(rewardTxt)
        {
            rewardTxt.caption = engine.localization?.getLocalizationWithParams('quests.completed.reward', 'quests.completed.reward') ?? '';
            rewardTxt.visible = quest.activityPointType >= 0 && quest.rewardCurrencyAmount > 0;
        }

        window.visible = false;

        const congratsTxt = window.findChildByName('congrats_txt');

        if(congratsTxt)
        {
            const key = quest.lastQuestInCampaign ? 'quests.completed.campaign.caption' : 'quests.completed.quest.caption';

            congratsTxt.caption = engine.localization?.getLocalizationWithParams(key, key) ?? key;
        }

        this.setChildVisible(window, 'more_quests_button', quest.lastQuestInCampaign);
        this.setChildVisible(window, 'campaign_reward_icon', quest.lastQuestInCampaign);
        this.setChildVisible(window, 'catalog_link_region', !quest.lastQuestInCampaign && quest.rewardCurrencyAmount > 0);
        this.setChildVisible(window, 'next_quest_button', !quest.lastQuestInCampaign);
        this.setChildVisible(window, 'reward_icon', !quest.lastQuestInCampaign);
        this.setChildVisible(window, 'campaign_pic_bitmap', quest.lastQuestInCampaign);

        this.setWindowTitle(quest.lastQuestInCampaign ? 'quests.completed.campaign.title' : 'quests.completed.quest.title');
        engine.setupCampaignImage(window, quest, quest.lastQuestInCampaign);

        const descTxt = window.findChildByName('desc_txt') as ITextWindow | null;

        if(descTxt)
        {
            const previousHeight = descTxt.height;

            this.setDesc(`${quest.getQuestLocalizationKey()}.completed`);
            descTxt.height = Math.max(31, descTxt.textHeight + 5);
            window.height += descTxt.height - previousHeight;
        }
    }

    private setChildVisible(window: IFrameWindow, name: string, visible: boolean): void
    {
        const child = window.findChildByName(name);

        if(child) child.visible = visible;
    }

    // AS3: QuestCompleted.as::setWindowTitle()
    private setWindowTitle(key: string): void
    {
        const engine = this._engine;
        const quest = this._currentQuest;

        if(!engine || !quest || !this._window) return;

        engine.localization?.registerParameter(key, 'category', engine.getCampaignName(quest));
        this._window.caption = engine.localization?.getLocalizationWithParams(key, key) ?? key;
    }

    // AS3: QuestCompleted.as::setDesc()
    private setDesc(key: string): void
    {
        const descTxt = this._window?.findChildByName('desc_txt');

        if(descTxt) descTxt.caption = this._engine?.localization?.getLocalizationWithParams(key, key) ?? key;
    }

    // AS3: QuestCompleted.as::onCatalogLink()
    private onCatalogLink = (event: WindowEvent, _window: IWindow | null = null): void =>
    {
        if(event.type === WindowMouseEvent.CLICK && this._currentQuest)
        {
            this._engine?.openCatalog(this._currentQuest);
        }
    };

    // AS3: QuestCompleted.as::update()
    update(deltaTime: number): void
    {
        if(this._msecsUntilShow > 0)
        {
            this._msecsUntilShow -= deltaTime;

            if(this._msecsUntilShow < 1 && this._window)
            {
                this._window.center();
                this._window.visible = true;
                this._window.activate();

                if(this._currentQuest?.lastQuestInCampaign)
                {
                    this._twinkleAnimation?.restart();
                }
                else
                {
                    this._twinkleAnimation?.stop();
                }
            }
        }

        this._twinkleAnimation?.update(deltaTime);
    }
}
