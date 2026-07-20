import type {IDisposable} from '@core/runtime';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IWindow} from '@core/window/IWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {HabboQuestEngine} from './HabboQuestEngine';
import type {QuestMessageData} from '@habbo/communication/messages/parser/quest/QuestMessageData';
import {FriendlyTime} from '@habbo/utils/FriendlyTime';

const REFRESH_PERIOD_IN_MSECS = 1000;
const TOOLBAR_EXTENSION_ID = 'next_quest';

/**
 * The "come back later" HUD widget for a delayed quest (waitPeriodSeconds > 0),
 * toolbar-extension-hosted like QuestTracker. Collapsed by default; expands to show
 * artwork/description and a link into QuestDetails.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/NextQuestTimer.as
 */
export class NextQuestTimer implements IDisposable
{
    private _engine: HabboQuestEngine | null;
    private _currentQuest: QuestMessageData | null = null;
    private _window: IWindowContainer | null = null;
    private _expanded: boolean = false;
    private _msecsToRefresh: number = 0;

    // AS3: NextQuestTimer.as::NextQuestTimer()
    constructor(engine: HabboQuestEngine)
    {
        this._engine = engine;
    }

    // AS3: NextQuestTimer.as::dispose()
    dispose(): void
    {
        if(this._engine)
        {
            this._engine.toolbar?.extensionView?.detachExtension(TOOLBAR_EXTENSION_ID);
        }

        this._engine = null;
        this._currentQuest = null;

        if(this._window)
        {
            this._window.dispose();
            this._window = null;
        }
    }

    // AS3: NextQuestTimer.as::get disposed()
    get disposed(): boolean
    {
        return this._engine === null;
    }

    // AS3: NextQuestTimer.as::onQuestCancelled()
    onQuestCancelled(): void
    {
        this._currentQuest = null;
        this.close();
    }

    // AS3: NextQuestTimer.as::onRoomExit()
    onRoomExit(): void
    {
        if(this._window && this._window.visible)
        {
            const moreInfoRegion = this._window.findChildByName('more_info_region');
            const moreInfoTxt = this._window.findChildByName('more_info_txt');

            if(moreInfoRegion) moreInfoRegion.visible = false;
            if(moreInfoTxt) moreInfoTxt.visible = false;
        }
    }

    // AS3: NextQuestTimer.as::onQuest()
    onQuest(quest: QuestMessageData): void
    {
        if(quest.waitPeriodSeconds < 1)
        {
            this.close();

            return;
        }

        this._currentQuest = quest;
        this.prepareWindow();
        this.refreshVisibility();

        if(this._window)
        {
            this._window.visible = true;
            this._engine?.toolbar?.extensionView?.attachExtension(TOOLBAR_EXTENSION_ID, this._window);
        }
    }

    // AS3: NextQuestTimer.as::prepareWindow()
    private prepareWindow(): void
    {
        if(this._window) return;

        const engine = this._engine;

        if(!engine) return;

        this._window = engine.windowManager?.buildWidgetLayout('NextQuestTimer') as unknown as IWindowContainer | null;

        if(!this._window) return;

        this._window.x = 0;
        this._window.y = 0;

        const moreInfoRegion = this._window.findChildByName('more_info_region');
        const expanded = this._window.findChildByName('quest_timer_expanded');
        const contracted = this._window.findChildByName('quest_timer_contracted');

        if(moreInfoRegion) moreInfoRegion.procedure = this.onMoreInfo;
        if(expanded) expanded.procedure = this.onToggleExpanded;
        if(contracted) contracted.procedure = this.onToggleExpanded;

        this.refreshVisibility();
    }

    // AS3: NextQuestTimer.as::refresh()
    private refresh(): void
    {
        const engine = this._engine;
        const quest = this._currentQuest;

        if(!engine || !quest || !this._window) return;

        const seconds = quest.waitPeriodSeconds;

        if(seconds < 1)
        {
            this.close();
            quest.waitPeriodSeconds = 0;
            engine.questController?.onQuest(quest);
        }

        const time = FriendlyTime.getFriendlyTime(seconds);
        const delayedMsgKey = `${quest.getCampaignLocalizationKey()}.delayedmsg`;

        engine.localization?.registerParameter('quests.nextquesttimer.caption.contracted', 'time', time);
        engine.localization?.registerParameter(delayedMsgKey, 'time', time);

        const headerTxt = this._window.findChildByName('quest_header_txt');

        if(headerTxt)
        {
            const key = `quests.nextquesttimer.caption.${this._expanded ? 'expanded' : 'contracted'}`;

            headerTxt.caption = engine.localization?.getLocalizationWithParams(key, key) ?? key;
        }

        const descTxt = this._window.findChildByName('desc_txt');

        if(descTxt) descTxt.caption = engine.localization?.getLocalizationWithParams(delayedMsgKey, delayedMsgKey) ?? delayedMsgKey;
    }

    // AS3: NextQuestTimer.as::refreshVisibility()
    private refreshVisibility(): void
    {
        const engine = this._engine;

        if(!this._window) return;

        this.setChildVisible('quest_timer_expanded', this._expanded);
        this.setChildVisible('quest_timer_contracted', !this._expanded);
        this.setChildVisible('more_info_txt', this._expanded && (engine?.currentlyInRoom ?? false));
        this.setChildVisible('more_info_region', this._expanded && (engine?.currentlyInRoom ?? false));
        this.setChildVisible('quest_pic_bitmap', this._expanded);
        this.setChildVisible('desc_txt', this._expanded);

        this.refresh();
    }

    private setChildVisible(name: string, visible: boolean): void
    {
        const child = this._window?.findChildByName(name);

        if(child) child.visible = visible;
    }

    // AS3: NextQuestTimer.as::onMoreInfo()
    private onMoreInfo = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type === WindowMouseEvent.CLICK && this._currentQuest)
        {
            this._engine?.questController?.questDetails.showDetails(this._currentQuest);
        }
    };

    // AS3: NextQuestTimer.as::onToggleExpanded()
    private onToggleExpanded = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type === WindowMouseEvent.CLICK)
        {
            this._expanded = !this._expanded;
            this.refreshVisibility();
        }
    };

    // AS3: NextQuestTimer.as::update()
    update(deltaTime: number): void
    {
        if(!this._window || !this._window.visible) return;

        this._msecsToRefresh -= deltaTime;

        if(this._msecsToRefresh > 0) return;

        this._msecsToRefresh = REFRESH_PERIOD_IN_MSECS;
        this.refresh();
    }

    // AS3: NextQuestTimer.as::getDefaultLocationX() - dead in AS3 too (no caller); ported for completeness.
    private getDefaultLocationX(): number
    {
        return 0;
    }

    // AS3: NextQuestTimer.as::isVisible()
    isVisible(): boolean
    {
        return !!this._window && this._window.visible;
    }

    // AS3: NextQuestTimer.as::close()
    close(): void
    {
        if(this._window && this._window.visible)
        {
            this._window.visible = false;
            this._engine?.toolbar?.extensionView?.detachExtension(TOOLBAR_EXTENSION_ID);
        }
    }

    // AS3: NextQuestTimer.as::setQuestImageVisible() - dead in AS3 too (no caller); ported for completeness.
    private setQuestImageVisible(visible: boolean): void
    {
        const bitmap = this._window?.findChildByName('quest_pic_bitmap');

        if(bitmap) bitmap.visible = visible;
    }
}
