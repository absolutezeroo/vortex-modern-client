import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {ProductIconWidget} from '@habbo/window/widgets/ProductIconWidget';
import type {DailyTaskRewardData} from '@habbo/communication/messages/parser/quest/DailyTaskRewardData';

import type {DailyTasksController} from '../DailyTasksController';
import {RewardDisplayWrapper} from './RewardDisplayWrapper';

/**
 * One reward chip inside a task row: its icon, and an "x3" badge when there is more than one.
 *
 * The window is cloned from a template the parent view detached from the layout — see
 * `DailyTasksView.rewardTemplate` — so this class never builds anything itself.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/dailytasks/tasks/DailyTaskRewardView.as
 */
export class DailyTaskRewardView
{
    // AS3: DailyTaskRewardView.as::_SafeStr_6811 (from `get reward()`)
    private _reward: DailyTaskRewardData | null;
    // AS3: DailyTaskRewardView.as::_SafeStr_4593 (the controller)
    private _controller: DailyTasksController | null;
    // AS3: DailyTaskRewardView.as::_window
    private _window: IWindowContainer | null;
    // AS3: DailyTaskRewardView.as::_disposed
    private _disposed: boolean = false;

    // AS3: DailyTaskRewardView.as::DailyTaskRewardView()
    constructor(reward: DailyTaskRewardData, controller: DailyTasksController, template: IWindowContainer)
    {
        this._reward = reward;
        this._controller = controller;
        this._window = template.clone() as IWindowContainer;

        this.initializeUI();
    }

    /**
     * AS3 re-centres the icon vertically when there is no amount badge, because the badge otherwise
     * takes the lower half of the chip. It reads `parent.height`, so the clone must already be in a
     * parent — it is: `clone()` keeps the template's parentage.
     */
    // AS3: DailyTaskRewardView.as::initializeUI()
    private initializeUI(): void
    {
        const reward = this._reward;

        if(reward === null) return;

        const border = this.rewardAmountBorder;
        const text = this.rewardAmountText;
        const widget = (this.rewardDisplayWidget?.widget ?? null) as ProductIconWidget | null;

        if(border !== null) border.visible = reward.amount > 1;

        if(text !== null) text.text = `x${reward.amount}`;

        if(widget !== null) widget.productInfo = new RewardDisplayWrapper(reward);

        const iconWindow = this.rewardDisplayWidget;

        if(border !== null && !border.visible && iconWindow !== null && iconWindow.parent !== null)
        {
            iconWindow.y = iconWindow.parent.height / 2 - iconWindow.height / 2;
        }
    }

    // AS3: DailyTaskRewardView.as::get reward()
    get reward(): DailyTaskRewardData | null
    {
        return this._reward;
    }

    // AS3: DailyTaskRewardView.as::get window()
    get window(): IWindowContainer | null
    {
        return this._window;
    }

    // AS3: DailyTaskRewardView.as::get rewardDisplayWidget()
    get rewardDisplayWidget(): IWidgetWindow | null
    {
        return this._window?.findChildByName('reward_display_widget') as IWidgetWindow | null ?? null;
    }

    // AS3: DailyTaskRewardView.as::get rewardAmountBorder()
    get rewardAmountBorder(): IWindow | null
    {
        return this._window?.findChildByName('reward_amount_border') ?? null;
    }

    // AS3: DailyTaskRewardView.as::get rewardAmountText()
    get rewardAmountText(): ITextWindow | null
    {
        return this._window?.findChildByName('reward_amount_text') as ITextWindow | null ?? null;
    }

    // AS3: DailyTaskRewardView.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: DailyTaskRewardView.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this._window?.dispose();
        this._window = null;
        this._controller = null;
        this._reward = null;
        this._disposed = true;
    }
}
