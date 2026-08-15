import type {IHTMLTextWindow} from '@core/window/components/IHTMLTextWindow';
import {
    TradeRequirementNode
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/trade/requirements/TradeRequirementNode';
import type {
    TradeRequirementRule
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/trade/requirements/rules/TradeRequirementRule';
import type {
    WiredTransactionSuccessContents
} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredtrading/WiredTransactionSuccessContents';
import type {PresetManager} from '../../wired_setup/uibuilder/PresetManager';
import {HtmlTextParam} from '../../wired_setup/uibuilder/params/HtmlTextParam';
import {TextParam} from '../../wired_setup/uibuilder/params/TextParam';
import type {ButtonPreset} from '../../wired_setup/uibuilder/presets/ButtonPreset';
import type {HtmlPreset} from '../../wired_setup/uibuilder/presets/HtmlPreset';
import type {TextPreset} from '../../wired_setup/uibuilder/presets/TextPreset';
import type {NodeOverviewPreset} from '../../wired_setup/uibuilder/presets/contracts/NodeOverviewPreset';
import {AbstractUbuntuWiredUI} from '../AbstractUbuntuWiredUI';
import type {RewardNotificationController} from './RewardNotificationController';

/**
 * "You won this" — a small window listing what a completed wired transaction paid out.
 *
 * The earnings line is an **HTML** preset shown only when the reward includes coins, because it
 * carries a link into the vault; a pure-furniture reward has nothing to link to and the line is
 * hidden rather than emptied.
 *
 * Clicking a chip opens the place the reward went — the vault for coins, the inventory for anything
 * else — through a link event rather than a direct call.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_trading/reward_notification/RewardNotificationView.as
 */
export class RewardNotificationView extends AbstractUbuntuWiredUI
{
    // AS3: RewardNotificationView.as::_SafeStr_5744 (name derived: the owning controller)
    private _controller: RewardNotificationController | null;

    // AS3: RewardNotificationView.as::_SafeStr_4697 (name derived: the payload being shown)
    private _contents: WiredTransactionSuccessContents | null = null;

    // AS3: RewardNotificationView.as::_SafeStr_4714 (name derived: the description line)
    private _descriptionText: TextPreset | null;

    // AS3: RewardNotificationView.as::_SafeStr_7478 (name derived: the reward chips)
    private _nodeOverview: NodeOverviewPreset | null;

    // AS3: RewardNotificationView.as::_SafeStr_6899 (name derived: the earnings line)
    private _earningsHtml: HtmlPreset | null;

    // AS3: RewardNotificationView.as::_SafeStr_8124 (name derived: the OK button)
    private _okButton: ButtonPreset | null;

    // AS3: RewardNotificationView.as::_SafeStr_4614 (name derived: this window's cascade slot)
    private _viewIndex: number = 0;

    // AS3: RewardNotificationView.as::RewardNotificationView()
    constructor(controller: RewardNotificationController, presetManager: PresetManager)
    {
        super(controller.roomEvents, presetManager);

        this._controller = controller;
        this._descriptionText = presetManager.createText('', TextParam.DEFAULT);
        this._nodeOverview = presetManager.createNodeOverviewPreset('${wiredrewards.title}', this.onClickNode);
        this._earningsHtml = presetManager.createHtml(
            this.localization?.getLocalization('wiredrewards.earnings') ?? '',
            HtmlTextParam.DEFAULT
        );

        // The link style has to be primed before the text is shown, or the anchor renders as plain
        // text — AS3 does this immediately after creating the preset.
        (this._earningsHtml.window as unknown as IHTMLTextWindow).initializeLinkStyle();

        this._okButton = presetManager.createButton('${wiredrewards.ok}', this.onClickButton);

        const listView = presetManager.createSimpleListView(true, [
            this._descriptionText,
            this._nodeOverview,
            this._earningsHtml,
            this._okButton,
        ]);

        const padded = presetManager.createPaddedContainerPreset(listView, 7, 7, 7, 7);
        const frame = presetManager.createFramePreset([padded], () => this.onCloseClicked());

        frame.resizeToWidth(276);
        frame.title = '${wiredrewards.title}';

        this.framePreset = frame;
    }

    /**
	 * TS-only in placement: AS3 has this as a private static on the class. Coins are the only reason
	 * the earnings line appears.
	 */
    // AS3: RewardNotificationView.as::hasCreditNode()
    private static hasCreditNode(rule: TradeRequirementRule | null): boolean
    {
        if(rule === null) return false;

        for(const node of rule.nodes)
        {
            if(node.type === TradeRequirementNode.TYPE_COIN) return true;
        }

        return false;
    }

    // AS3: RewardNotificationView.as::onClickNode()
    private onClickNode = (node: TradeRequirementNode | null): void =>
    {
        if(node === null) return;

        this._controller?.context.createLinkEvent(
            node.type === TradeRequirementNode.TYPE_COIN ? 'habboUI/open/vault' : 'inventory/open'
        );
    };

    // AS3: RewardNotificationView.as::onClickButton()
    private onClickButton = (): void =>
    {
        this.onCloseClicked();
    };

    /**
	 * Hiding this window *closes* it: the controller drops it from its open list and disposes it, so
	 * a reward is never merely detached and left behind.
	 */
    // AS3: RewardNotificationView.as::hideFrame()
    protected override hideFrame(): void
    {
        super.hideFrame();

        this._controller?.closeRewardView(this);
    }

    // AS3: RewardNotificationView.as::get isBoundToParentRect()
    protected override get isBoundToParentRect(): boolean
    {
        return true;
    }

    /**
	 * The offsets are applied *after* `showFrame()` has centred the window — the controller cascades
	 * several notifications by nudging each one off centre.
	 */
    // AS3: RewardNotificationView.as::show()
    show(contents: WiredTransactionSuccessContents, offsetX: number, offsetY: number, viewIndex: number): void
    {
        this._contents = contents;

        if(this._descriptionText)
        {
            this._descriptionText.text = contents.rewardText.length === 0
                ? '${wiredrewards.desc_default}'
                : contents.rewardText;
        }

        if(this._nodeOverview && contents.rewardContents !== null)
        {
            this._nodeOverview.rule = contents.rewardContents;
        }

        if(this._earningsHtml)
        {
            this._earningsHtml.visible = RewardNotificationView.hasCreditNode(contents.rewardContents);
        }

        this.showFrame();

        const window = this.window;

        if(window)
        {
            window.x += offsetX;
            window.y += offsetY;
        }

        this._viewIndex = viewIndex;
    }

    // AS3: RewardNotificationView.as::get viewIndex()
    get viewIndex(): number
    {
        return this._viewIndex;
    }

    // AS3: RewardNotificationView.as::get contents()
    get contents(): WiredTransactionSuccessContents | null
    {
        return this._contents;
    }

    /**
	 * AS3 hides first, which re-enters `hideFrame()` and therefore `closeRewardView()`; that call
	 * finds the view already gone from the list and only disposes, which this guard absorbs.
	 */
    // AS3: RewardNotificationView.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        if(this.isShowing()) this.hide();

        this._okButton = null;
        this._nodeOverview = null;
        this._descriptionText = null;
        this._earningsHtml = null;
        this._controller = null;

        super.dispose();
    }
}
