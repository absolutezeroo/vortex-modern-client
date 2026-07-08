import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {IDisposable} from '@core/runtime/IDisposable';
import type {ILandingViewWidget} from '../interfaces/ILandingViewWidget';
import type {ISlotAwareWidget} from '../interfaces/ISlotAwareWidget';
import type {IConfigurableWidget} from '../interfaces/IConfigurableWidget';
import {HabboLandingView} from '../HabboLandingView';
import type {QuestMessageData} from '@habbo/communication/messages/parser/quest/QuestMessageData';
import type {QuestDailyMessageParser} from '@habbo/communication/messages/parser/quest/QuestDailyMessageParser';
import {QuestDailyMessageEvent} from '@habbo/communication/messages/incoming/quest/QuestDailyMessageEvent';
import {GetDailyQuestMessageComposer} from '@habbo/communication/messages/outgoing/quest/GetDailyQuestMessageComposer';
import {ActivateQuestMessageComposer} from '@habbo/communication/messages/outgoing/quest/ActivateQuestMessageComposer';
import {CancelQuestMessageComposer} from '@habbo/communication/messages/outgoing/quest/CancelQuestMessageComposer';
import {GenericWidget} from './GenericWidget';

/**
 * Current daily quest card - shows the active/next quest, accept/cancel/next
 * actions, and an easy/hard difficulty toggle.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/DailyQuestWidget.as
 */
export class DailyQuestWidget implements IDisposable, ILandingViewWidget, ISlotAwareWidget, IConfigurableWidget
{
    private _landingView: HabboLandingView | null;
    private _container: IWindowContainer | null = null;
    private _quest: QuestMessageData | null = null;
    private _easyQuestCount: number = 0;
    private _hardQuestCount: number = 0;
    private _index: number = 0;
    private _hdrLineRightEdge: number = 0;
    private _slot: number = 0;
    private _configurationCode: string = '';

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/DailyQuestWidget.as::DailyQuestWidget()
    constructor(landingView: HabboLandingView)
    {
        this._landingView = landingView;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/DailyQuestWidget.as::moveChildrenToRow()
    static moveChildrenToRow(container: IWindowContainer, spacing: number): void
    {
        let x = 0;

        for(let i = 0; i < container.numChildren; i++)
        {
            const child = container.getChildAt(i);

            if(!child) continue;

            child.x = x;
            x += child.width + spacing;
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/DailyQuestWidget.as::set configurationCode()
    set configurationCode(value: string)
    {
        this._configurationCode = value;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/DailyQuestWidget.as::set slot()
    set slot(value: number)
    {
        this._slot = value;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/DailyQuestWidget.as::get container()
    get container(): IWindow | null
    {
        return this._container;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/DailyQuestWidget.as::dispose()
    dispose(): void
    {
        this._landingView = null;
        this._container = null;
        this._quest = null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/DailyQuestWidget.as::get disposed()
    get disposed(): boolean
    {
        return this._landingView === null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/DailyQuestWidget.as::initialize()
    initialize(): void
    {
        if(!this._landingView) return;

        this._container = this._landingView.getXmlWindow('daily_quest') as IWindowContainer | null;

        if(!this._container) return;

        this._landingView.communicationManager?.addHabboConnectionMessageEvent(new QuestDailyMessageEvent(this.onDailyQuest));

        const acceptButton = this._container.findChildByName('accept_button');
        const goButton = this._container.findChildByName('go_button');
        const nextQuestRegion = this._container.findChildByName('next_quest_region');
        const cancelQuestRegion = this._container.findChildByName('cancel_quest_region');
        const easyRegion = this._container.findChildByName('easy_region');
        const hardRegion = this._container.findChildByName('hard_region');

        if(acceptButton) acceptButton.procedure = this.onAcceptButton;
        if(goButton) goButton.procedure = this.onGoButton;
        if(nextQuestRegion) nextQuestRegion.procedure = this.onNextQuest;
        if(cancelQuestRegion) cancelQuestRegion.procedure = this.onCancelQuest;
        if(easyRegion) easyRegion.procedure = this.onEasyRegion;
        if(hardRegion) hardRegion.procedure = this.onHardRegion;

        const hdrLine = this._container.findChildByName('hdr_line');

        if(hdrLine)
        {
            this._hdrLineRightEdge = hdrLine.x + hdrLine.width;
        }

        GenericWidget.configureLayout(this._landingView, this._slot, this._configurationCode, this._container);
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/DailyQuestWidget.as::refresh()
    refresh(): void
    {
        this._index = 0;
        this._landingView?.send(new GetDailyQuestMessageComposer(true, 0));
    }

    private onDailyQuest = (event: IMessageEvent): void =>
    {
        const parser = event.parser as QuestDailyMessageParser | null;

        if(!parser) return;

        this._quest = parser.quest;
        this._easyQuestCount = parser.easyQuestCount;
        this._hardQuestCount = parser.hardQuestCount;
        this.refreshContent();
    };

    private refreshContent(): void
    {
        if(!this._container || !this._landingView) return;

        const quest = this._quest;

        const captionTxt = this._container.findChildByName('caption_txt');
        const infoTxt = this._container.findChildByName('info_txt');
        const acceptButton = this._container.findChildByName('accept_button');
        const nextQuestRegion = this._container.findChildByName('next_quest_region');
        const nextQuestTxt = this._container.findChildByName('next_quest_txt');
        const titleTxt = this._container.findChildByName('title_txt');
        const cancelQuestRegion = this._container.findChildByName('cancel_quest_region');
        const currentQuestBorder = this._container.findChildByName('current_quest_border');

        if(captionTxt) captionTxt.caption = quest ? this.getChainSpecificText('chaincaption') : this.getText('landing.view.quest.currenttask.alldone.caption');
        if(infoTxt) infoTxt.caption = quest ? this.getChainSpecificText('chaininfo') : this.getText('landing.view.quest.currenttask.alldone.info');
        if(acceptButton) acceptButton.visible = !!quest && !quest.accepted;
        if(nextQuestRegion) nextQuestRegion.visible = !!quest && !quest.accepted && (quest.easy ? this._easyQuestCount : this._hardQuestCount) > 1;
        if(nextQuestTxt) nextQuestTxt.caption = this.getText('landing.view.quest.nextquest.' + (quest && quest.easy ? 'easy' : 'hard'));
        if(titleTxt) titleTxt.caption = this.getText('landing.view.quest.title.' + (quest && quest.accepted ? 'accepted' : 'notaccepted'));

        HabboLandingView.positionAfterAndStretch(this._container, 'title_txt', 'hdr_line');

        if(cancelQuestRegion) cancelQuestRegion.visible = !!quest && quest.accepted;
        if(currentQuestBorder) currentQuestBorder.visible = !!quest && quest.accepted;

        if(quest)
        {
            this._landingView.localization?.registerParameter('landing.view.quest.currenttask', 'task', this.getQuestName());
        }

        const difficultyContainer = this._container.findChildByName('difficulty_container') as IWindowContainer | null;

        if(difficultyContainer)
        {
            const rightEdge = difficultyContainer.x + difficultyContainer.width;

            difficultyContainer.visible = !!quest && !quest.accepted && this._easyQuestCount > 0 && this._hardQuestCount > 0;

            this.setupDifficultyText('easy_region', !!quest && !quest.easy);
            this.setupDifficultyText('hard_region', !!quest && quest.easy);

            DailyQuestWidget.moveChildrenToRow(difficultyContainer, 5);

            const hardRegion = difficultyContainer.findChildByName('hard_region');

            if(hardRegion)
            {
                difficultyContainer.width = hardRegion.x + hardRegion.width;
            }

            difficultyContainer.x = rightEdge - difficultyContainer.width;

            const hdrLine = this._container.findChildByName('hdr_line');

            if(hdrLine)
            {
                const boundary = difficultyContainer.visible ? difficultyContainer.x - 5 : this._hdrLineRightEdge;

                hdrLine.width = boundary - hdrLine.x;
            }
        }
    }

    private setupDifficultyText(regionName: string, underline: boolean): void
    {
        const region = this._container?.findChildByName(regionName) as IWindowContainer | null;
        const label = region?.findChildByName('label_txt') as ITextWindow | null;

        if(!region || !label) return;

        label.width = label.textWidth;
        label.underline = underline;
        region.width = label.width;
    }

    private getChainSpecificKey(key: string): string
    {
        return 'quests.' + this._quest?.campaignCode + '.' + this._quest?.chainCode + '.' + key;
    }

    private getChainSpecificText(key: string): string
    {
        return '${' + this.getChainSpecificKey(key) + '}';
    }

    private getText(key: string): string
    {
        return '${' + key + '}';
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/DailyQuestWidget.as::getQuestName()
    getQuestName(): string
    {
        if(!this._quest) return '';

        return '${' + this._quest.getQuestLocalizationKey() + '.name}';
    }

    private onGoButton = (event: WindowEvent): void =>
    {
        if(event.type === WindowMouseEvent.CLICK)
        {
            this._landingView?.goToRoom();
        }
    };

    private onEasyRegion = (event: WindowEvent): void =>
    {
        if(event.type === WindowMouseEvent.CLICK)
        {
            this.sendGetDailyQuest(true);
        }
    };

    private onHardRegion = (event: WindowEvent): void =>
    {
        if(event.type === WindowMouseEvent.CLICK)
        {
            this.sendGetDailyQuest(false);
        }
    };

    private onAcceptButton = (event: WindowEvent): void =>
    {
        if(event.type === WindowMouseEvent.CLICK && this._quest)
        {
            this._landingView?.send(new ActivateQuestMessageComposer(this._quest.id));
        }
    };

    private onNextQuest = (event: WindowEvent): void =>
    {
        if(event.type === WindowMouseEvent.CLICK)
        {
            this._index = this._index + 1;
            this.sendGetDailyQuest(!!this._quest?.easy);
        }
    };

    private onCancelQuest = (event: WindowEvent): void =>
    {
        if(event.type === WindowMouseEvent.CLICK)
        {
            this._landingView?.send(new CancelQuestMessageComposer());
        }
    };

    private sendGetDailyQuest(isEasy: boolean): void
    {
        this._landingView?.send(new GetDailyQuestMessageComposer(isEasy, this._index));
    }
}
