import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IRegionWindow} from '@core/window/components/IRegionWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {WindowMouseEvent as WindowMouseEventClass} from '@core/window/events/WindowMouseEvent';
import {DailyTaskData} from '@habbo/communication/messages/parser/quest/DailyTaskData';

import {ProgressBar} from '../../ProgressBar';
import type {DailyTasksController} from '../DailyTasksController';
import {DailyTaskRewardView} from './DailyTaskRewardView';

/**
 * One task row: title, description, image, its reward chips, and either a progress bar or a claim
 * button depending on status.
 *
 * The three colour triples are AS3's, and which one applies is decided in two places: a *bonus*
 * task is yellow and stays yellow (set once in `initializeUI()` and never overwritten, because
 * every later branch is guarded by `!isBonus`), while an ordinary task flips between orange while
 * running and green once finished.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/dailytasks/tasks/DailyTaskView.as
 */
export class DailyTaskView
{
    /**
     * The task image is fetched from the hotel's image library, not the asset bundle:
     * `<base><taskCode><imageVersion>.png`. The base is a localization placeholder the window
     * system resolves.
     */
    // AS3: DailyTaskView.as::_SafeStr_10407
    private static readonly IMAGE_LIBRARY_URL: string = '${image.library.dailytasks.url}';

    // AS3: DailyTaskView.as::BACKGROUND_GREEN
    private static readonly BACKGROUND_GREEN: number = 13033652;
    // AS3: DailyTaskView.as::_SafeStr_10378 (name DERIVED: the green sibling of TITLE_ORANGE)
    private static readonly TITLE_GREEN: number = 4960837;
    // AS3: DailyTaskView.as::REWARD_GREEN
    private static readonly REWARD_GREEN: number = 10931858;
    // AS3: DailyTaskView.as::BACKGROUND_ORANGE
    private static readonly BACKGROUND_ORANGE: number = 15916471;
    // AS3: DailyTaskView.as::TITLE_ORANGE
    private static readonly TITLE_ORANGE: number = 15511865;
    // AS3: DailyTaskView.as::REWARD_ORANGE
    private static readonly REWARD_ORANGE: number = 15714445;
    // AS3: DailyTaskView.as::BACKGROUND_YELLOW
    private static readonly BACKGROUND_YELLOW: number = 15725493;
    // AS3: DailyTaskView.as::_SafeStr_10440 (name DERIVED: the yellow sibling of TITLE_ORANGE)
    private static readonly TITLE_YELLOW: number = 14208611;
    // AS3: DailyTaskView.as::REWARD_YELLOW
    private static readonly REWARD_YELLOW: number = 14804370;

    // AS3: DailyTaskView.as::_SafeStr_4798 (from `get dailyTask()`)
    private _dailyTask: DailyTaskData | null;
    // AS3: DailyTaskView.as::_SafeStr_4593 (the controller)
    private _controller: DailyTasksController | null;
    // AS3: DailyTaskView.as::_window
    private _window: IWindowContainer | null;
    // AS3: DailyTaskView.as::_SafeStr_6977 (the reward chips)
    private _rewardViews: DailyTaskRewardView[] = [];
    // AS3: DailyTaskView.as::_SafeStr_5984
    private _progressBar: ProgressBar | null = null;
    /**
     * Set while the bar is animating to "full" after a completion, so `update()` can re-run the
     * status UI once the animation lands — otherwise the row would flip to its claim button before
     * the player saw the bar fill.
     */
    // AS3: DailyTaskView.as::_SafeStr_8331 (name DERIVED from the two places that read it)
    private _awaitingProgressAnimation: boolean = false;
    // AS3: DailyTaskView.as::_disposed
    private _disposed: boolean = false;

    // AS3: DailyTaskView.as::DailyTaskView()
    constructor(task: DailyTaskData, controller: DailyTasksController, template: IWindowContainer, rewardTemplate: IWindowContainer | null)
    {
        this._dailyTask = task;
        this._controller = controller;
        this._window = template.clone() as IWindowContainer;

        const progressContainer = this.progressBarContainer;

        if(progressContainer !== null)
        {
            this._progressBar = new ProgressBar(
                controller.questEngine,
                progressContainer,
                progressContainer.width - 8,
                'quests.tracker.progress',
                true,
                {x: 0, y: 0},
                true
            );
        }

        if(rewardTemplate !== null)
        {
            for(const reward of task.rewards)
            {
                const view = new DailyTaskRewardView(reward, controller, rewardTemplate);

                this._rewardViews.push(view);

                if(view.window !== null) this.rewardsList?.addListItem(view.window);
            }
        }

        this.claimButton?.addEventListener(WindowMouseEventClass.CLICK, this.onClaimClicked as unknown as (...args: unknown[]) => void);

        this.initializeUI();
    }

    // AS3: DailyTaskView.as::initializeUI()
    private initializeUI(): void
    {
        const task = this._dailyTask;

        if(task === null || this._window === null) return;

        const title = this.taskTitleTxt;
        const desc = this.taskDescTxt;
        const hover = this.infoHoverRegion;

        if(title !== null) title.text = this.localize(task.nameLocalizationKey);

        if(desc !== null) desc.text = this.localize(task.descriptionLocalizationKey);

        if(hover !== null) hover.toolTipCaption = this.localize(task.hintLocalizationKey);

        if(task.isBonus)
        {
            this._window.color = DailyTaskView.BACKGROUND_YELLOW;

            const rewardBorder = this.rewardTitleBorder;
            const nameBorder = this.taskNameBorder;

            if(rewardBorder !== null) rewardBorder.color = DailyTaskView.REWARD_YELLOW;
            if(nameBorder !== null) nameBorder.color = DailyTaskView.TITLE_YELLOW;
        }

        const bitmap = this.taskImageStaticBitmap;

        if(bitmap !== null) bitmap.assetUri = this.imageUrl;

        this.updateStatusAndRepeatsUI();
    }

    /**
     * The early return is the animation hand-off: a task that has just *become* completed fills its
     * bar to 100% and stops, leaving `_awaitingProgressAnimation` set. `update()` calls back in with
     * `animate = false` once the bar settles, and only then does the row switch to its claim button.
     */
    // AS3: DailyTaskView.as::updateStatusAndRepeatsUI()
    updateStatusAndRepeatsUI(animate: boolean = true): void
    {
        const task = this._dailyTask;

        if(task === null || this._window === null) return;

        const progressContainer = this.progressBarContainer;

        if(task.status === DailyTaskData.STATUS_COMPLETED && progressContainer?.visible === true && animate)
        {
            this._progressBar?.refresh(task.requiredRepeats, task.requiredRepeats, task.taskId, 0);
            this._awaitingProgressAnimation = true;

            return;
        }

        const rewardBorder = this.rewardTitleBorder;
        const nameBorder = this.taskNameBorder;
        const completion = this.completionContainer;
        const claimContainer = this.claimButtonContainer;

        if(task.status === DailyTaskData.STATUS_ACTIVE)
        {
            if(!task.isBonus)
            {
                this._window.color = DailyTaskView.BACKGROUND_ORANGE;

                if(rewardBorder !== null) rewardBorder.color = DailyTaskView.REWARD_ORANGE;
                if(nameBorder !== null) nameBorder.color = DailyTaskView.TITLE_ORANGE;
            }

            if(completion !== null) completion.visible = false;
            if(claimContainer !== null) claimContainer.visible = false;
            if(progressContainer !== null) progressContainer.visible = true;

            this._progressBar?.refresh(task.repeats, task.requiredRepeats, task.taskId, 0);

            return;
        }

        if(!task.isBonus)
        {
            this._window.color = DailyTaskView.BACKGROUND_GREEN;

            if(rewardBorder !== null) rewardBorder.color = DailyTaskView.REWARD_GREEN;
            if(nameBorder !== null) nameBorder.color = DailyTaskView.TITLE_GREEN;
        }

        if(completion !== null) completion.visible = true;
        if(claimContainer !== null) claimContainer.visible = true;

        const claimButton = this.claimButton;
        const claimText = this.claimButtonText;

        if(task.status === DailyTaskData.STATUS_CLAIMED)
        {
            claimButton?.disable();

            if(claimText !== null) claimText.text = this.localize('dailytasks.claimed');
        }
        else
        {
            claimButton?.enable();

            if(claimText !== null) claimText.text = this.localize('dailytasks.claim');
        }

        if(progressContainer !== null) progressContainer.visible = false;
    }

    /**
     * The button is disabled immediately, before the server answers — a claim cannot be sent twice
     * while the reply is in flight, and the reply re-enables or re-labels it.
     */
    // AS3: DailyTaskView.as::onClaimClicked()
    private onClaimClicked = (_event: WindowMouseEvent): void =>
    {
        if(this._dailyTask === null) return;

        this.claimButton?.disable();
        this._controller?.claimTask(this._dailyTask.taskId);
    };

    // AS3: DailyTaskView.as::get imageUrl()
    private get imageUrl(): string
    {
        const task = this._dailyTask;

        if(task === null) return '';

        return `${DailyTaskView.IMAGE_LIBRARY_URL}${task.taskCode}${task.imageVersion}.png`;
    }

    // AS3: DailyTaskView.as::get dailyTask()
    get dailyTask(): DailyTaskData | null
    {
        return this._dailyTask;
    }

    // AS3: DailyTaskView.as::localize()
    private localize(key: string): string
    {
        // AS3 passes the key as its own default, so a missing key renders as the key itself rather
        // than as an empty row.
        return this._controller?.localizationManager?.getLocalization(key, key) ?? key;
    }

    // AS3: DailyTaskView.as::update()
    update(elapsedMs: number): void
    {
        if(this.progressBarContainer?.visible === true)
        {
            this._progressBar?.updateView(elapsedMs);
        }

        if(this._awaitingProgressAnimation && this._progressBar?.isUpdating === false)
        {
            this._awaitingProgressAnimation = false;
            this.updateStatusAndRepeatsUI(false);
        }
    }

    // AS3: DailyTaskView.as::get window()
    get window(): IWindowContainer | null
    {
        return this._window;
    }

    // AS3: DailyTaskView.as::get taskNameBorder()
    get taskNameBorder(): IWindow | null
    {
        return this._window?.findChildByName('task_name_cont') ?? null;
    }

    // AS3: DailyTaskView.as::get rewardTitleBorder()
    get rewardTitleBorder(): IWindow | null
    {
        return this._window?.findChildByName('reward_title_border') ?? null;
    }

    // AS3: DailyTaskView.as::get taskTitleTxt()
    get taskTitleTxt(): ITextWindow | null
    {
        return this._window?.findChildByName('task_title_txt') as ITextWindow | null ?? null;
    }

    // AS3: DailyTaskView.as::get taskDescTxt()
    get taskDescTxt(): ITextWindow | null
    {
        return this._window?.findChildByName('task_desc_txt') as ITextWindow | null ?? null;
    }

    // AS3: DailyTaskView.as::get infoHoverRegion()
    get infoHoverRegion(): IRegionWindow | null
    {
        return this._window?.findChildByName('info_hover_region') as IRegionWindow | null ?? null;
    }

    // AS3: DailyTaskView.as::get taskImageStaticBitmap()
    get taskImageStaticBitmap(): IStaticBitmapWrapperWindow | null
    {
        return this._window?.findChildByName('task_static_bitmap') as IStaticBitmapWrapperWindow | null ?? null;
    }

    // AS3: DailyTaskView.as::get completionContainer()
    get completionContainer(): IWindowContainer | null
    {
        return this._window?.findChildByName('completion_cont') as IWindowContainer | null ?? null;
    }

    // AS3: DailyTaskView.as::get rewardsList()
    get rewardsList(): IItemListWindow | null
    {
        return this._window?.findChildByName('rewards_list') as IItemListWindow | null ?? null;
    }

    // AS3: DailyTaskView.as::get claimButtonContainer()
    get claimButtonContainer(): IWindowContainer | null
    {
        return this._window?.findChildByName('claim_button_container') as IWindowContainer | null ?? null;
    }

    // AS3: DailyTaskView.as::get claimButtonText()
    get claimButtonText(): ITextWindow | null
    {
        return this._window?.findChildByName('claim_txt') as ITextWindow | null ?? null;
    }

    // AS3: DailyTaskView.as::get claimButton()
    get claimButton(): IWindow | null
    {
        return this._window?.findChildByName('claim_button') ?? null;
    }

    // AS3: DailyTaskView.as::get progressBarContainer()
    get progressBarContainer(): IWindowContainer | null
    {
        return this._window?.findChildByName('progress_bar_wrapper') as IWindowContainer | null ?? null;
    }

    // AS3: DailyTaskView.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: DailyTaskView.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this.claimButton?.removeEventListener(WindowMouseEventClass.CLICK, this.onClaimClicked as unknown as (...args: unknown[]) => void);

        for(const view of this._rewardViews) view.dispose();

        this._rewardViews = [];

        this._progressBar?.dispose();
        this._progressBar = null;

        this._window?.dispose();
        this._window = null;
        this._controller = null;
        this._dailyTask = null;
        this._disposed = true;
    }
}
