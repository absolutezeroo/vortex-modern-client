import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IDisposable} from '@core/runtime/IDisposable';
import type {HabboLandingView} from '../../HabboLandingView';
import type {GenericWidget} from '../GenericWidget';
import type {IElementHandler} from '../../interfaces/elements/IElementHandler';
import type {IFloatableElementHandler} from '../../interfaces/elements/IFloatableElementHandler';
import type {QuestMessageData} from '@habbo/communication/messages/parser/quest/QuestMessageData';
import type {QuestDailyMessageParser} from '@habbo/communication/messages/parser/quest/QuestDailyMessageParser';
import {QuestDailyMessageEvent} from '@habbo/communication/messages/incoming/quest/QuestDailyMessageEvent';
import {GetDailyQuestMessageComposer} from '@habbo/communication/messages/outgoing/quest/GetDailyQuestMessageComposer';
import {ActivateQuestMessageComposer} from '@habbo/communication/messages/outgoing/quest/ActivateQuestMessageComposer';
import {CancelQuestMessageComposer} from '@habbo/communication/messages/outgoing/quest/CancelQuestMessageComposer';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {WindowEvent} from '@core/window/events/WindowEvent';

/**
 * Current daily quest card - accept/cancel/next-quest/difficulty-toggle
 * actions, chain-specific localization keys.
 *
 * AS3 identifier recovered from sources/win63_version/habbo/friendbar/landingview/widget/elements/class_4147.as
 * (obfuscated as `_SafeCls_4543` in the primary source).
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4543.as
 */
export class DailyQuestElementHandler implements IElementHandler, IFloatableElementHandler, IDisposable
{
    private _landingView: HabboLandingView | null = null;
    private _container: IWindowContainer | null = null;
    private _quest: QuestMessageData | null = null;
    private _easyQuestCount: number = 0;
    private _hardQuestCount: number = 0;
    private _index: number = 0;
    private _isFloating: boolean = false;
    private _disposed: boolean = false;
    private _campaignCode: string = '';
    private _chainCode: string = '';

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4543.as::moveChildrenToRow()
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

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4543.as::initialize()
    initialize(landingView: HabboLandingView, window: IWindow, params: string[], _ownerWidget: GenericWidget): void
    {
        this._landingView = landingView;

        if(params.length > 2)
        {
            this._isFloating = params[2] === 'true';
        }

        if(params.length > 3)
        {
            window.x = parseInt(params[3], 10);
        }

        if(params.length > 4)
        {
            window.y = parseInt(params[4], 10);
        }

        if(params.length > 5)
        {
            this._campaignCode = params[5];
        }

        if(params.length > 6)
        {
            this._chainCode = params[6];
        }

        landingView.communicationManager?.addHabboConnectionMessageEvent(new QuestDailyMessageEvent(this.onDailyQuest));

        this._container = window as IWindowContainer;

        this.bind('accept_button', this.onAcceptButton);
        this.bind('go_button', this.onGoButton);
        this.bind('next_quest_region', this.onNextQuest);
        this.bind('cancel_quest_region', this.onCancelQuest);
        this.bind('easy_region', this.onEasyRegion);
        this.bind('hard_region', this.onHardRegion);
    }

    private bind(name: string, handler: (event: WindowEvent, window: IWindow) => void): void
    {
        const child = this._container?.findChildByName(name);

        if(child)
        {
            child.procedure = handler;
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4543.as::dispose()
    dispose(): void
    {
        this._landingView = null;
        this._disposed = true;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4543.as::isFloating()
    isFloating(_value: boolean): boolean
    {
        return this._isFloating;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4543.as::refresh()
    refresh(): void
    {
        this._index = 0;
        this._landingView?.send(new GetDailyQuestMessageComposer(true, 0));
    }

    get disposed(): boolean
    {
        return this._disposed;
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
        if(!this._container) return;

        const quest = this._quest;

        this.setCaption('caption_txt', quest ? this.getChainSpecificText('chaincaption') : this.getText('landing.view.quest.currenttask.alldone.caption'));
        this.setVisible('accept_button', !!quest && !quest.accepted);
        this.setVisible('next_quest_region', !!quest && !quest.accepted && (quest.easy ? this._easyQuestCount : this._hardQuestCount) > 1);
        this.setCaption('next_quest_txt', this.getText('landing.view.quest.nextquest.' + (quest && quest.easy ? 'easy' : 'hard')));
        this.setVisible('cancel_quest_region', !!quest && quest.accepted);
        this.setVisible('current_quest_border', !!quest && quest.accepted);

        if(quest)
        {
            this._landingView?.localization?.registerParameter('landing.view.quest.currenttask', 'task', this.getQuestName());
        }

        const difficultyContainer = this._container.findChildByName('difficulty_container') as IWindowContainer | null;

        if(difficultyContainer)
        {
            const originalRight = difficultyContainer.x + difficultyContainer.width;

            difficultyContainer.visible = !!quest && !quest.accepted && this._easyQuestCount > 0 && this._hardQuestCount > 0;

            this.setupDifficultyText(difficultyContainer, 'easy_region', !!quest && !quest.easy);
            this.setupDifficultyText(difficultyContainer, 'hard_region', !!quest && quest.easy);

            DailyQuestElementHandler.moveChildrenToRow(difficultyContainer, 5);

            const hardRegion = difficultyContainer.findChildByName('hard_region');

            if(hardRegion)
            {
                difficultyContainer.width = hardRegion.x + hardRegion.width;
            }

            difficultyContainer.x = originalRight - difficultyContainer.width;
        }
    }

    private setupDifficultyText(difficultyContainer: IWindowContainer, name: string, underline: boolean): void
    {
        const region = difficultyContainer.findChildByName(name) as IWindowContainer | null;
        const label = region?.findChildByName('label_txt') as ITextWindow | null;

        if(!region || !label) return;

        label.width = label.textWidth;
        label.underline = underline;
        region.width = label.width;
    }

    private setCaption(name: string, caption: string): void
    {
        const child = this._container?.findChildByName(name);

        if(child)
        {
            child.caption = caption;
        }
    }

    private setVisible(name: string, visible: boolean): void
    {
        const child = this._container?.findChildByName(name);

        if(child)
        {
            child.visible = visible;
        }
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

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4543.as::getQuestName()
    getQuestName(): string
    {
        return '${' + this._quest?.getQuestLocalizationKey() + '.name}';
    }

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

    private sendGetDailyQuest(easy: boolean): void
    {
        this._landingView?.send(new GetDailyQuestMessageComposer(easy, this._index));
    }
}
