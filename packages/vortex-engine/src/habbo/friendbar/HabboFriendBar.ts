import type {IContext} from '@core/runtime';
import {Component} from '@core/runtime';
import type {IAssetLibrary} from '@core/assets';
import type {IHabboFriendBar} from './IHabboFriendBar';
import {HabboLandingView} from './landingview/HabboLandingView';
import {HabboFriendBarData} from './data/HabboFriendBarData';
import {HabboFriendBarView} from './view/HabboFriendBarView';
import {IID_HabboLandingView} from '@iid/IIDHabboLandingView';
import {IID_HabboFriendBarData} from '@iid/IIDHabboFriendBarData';
import {IID_HabboFriendBarView} from '@iid/IIDHabboFriendBarView';
import type {IHabboFriendBarView} from './view/IHabboFriendBarView';

/**
 * HabboFriendBar
 *
 * Orchestrator component that attaches sub-components (landing view, friend bar view,
 * talent, etc.) to the DI context. Each sub-component manages its own dependencies
 * and lifecycle.
 *
 * `data/` and `view/` are ported in full (30 files, 2026-07-29): the bar, its slots,
 * the request tabs and the notification tokens.
 *
 * TODO(AS3): still unported —
 *   - HabboTalent — sources/win63_version/habbo/friendbar/talent/ (citizenship/talent track).
 *   - HabboEpicPopupView, GroupForumController — sources/win63_version/habbo/friendbar/groupforums/.
 * See docs/IMPLEMENTATION_STATUS.md.
 *
 * @see sources/win63_version/habbo/friendbar/HabboFriendBar.as
 */
export class HabboFriendBar extends Component implements IHabboFriendBar
{
    constructor(context: IContext, flags: number = 0, assetLibrary: IAssetLibrary | null = null)
    {
        super(context, flags, assetLibrary);

        // Attach order is AS3's: data, then view, then landing view. The view resolves
        // IID_HabboFriendBarData as a hard dependency and subscribes to its event bus in
        // initComponent(), so the data component has to exist first.
        context.attachComponent(
            new HabboFriendBarData(context, 0, assetLibrary),
            [IID_HabboFriendBarData]
        );

        context.attachComponent(
            new HabboFriendBarView(context, 0, assetLibrary),
            [IID_HabboFriendBarView]
        );

        context.attachComponent(
            new HabboLandingView(context, 0, assetLibrary),
            [IID_HabboLandingView]
        );

        // Future sub-components (not yet implemented):
        // context.attachComponent(new HabboTalent(context, 0, assetLibrary), [IID_HabboTalent]);
        // context.attachComponent(new HabboEpicPopupView(context, 0, assetLibrary), [IID_HabboEpicPopupView]);
        // context.attachComponent(new GroupForumController(context, 0, assetLibrary), [IID_HabboGroupForumController]);
    }

    /**
	 * Forwards to the view, and releases the interface straight after — AS3 does the
	 * same, because `queueInterface()` takes a reference the caller owns.
	 *
	 * This was a stub writing into a private field nobody read ("until
	 * HabboFriendBarView is implemented"); the view exists now. Its only AS3 caller is
	 * `RoomUI`, which hides the bar on entering a game session and shows it again on
	 * leaving one — it is not what makes the bar appear normally.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/HabboFriendBar.as::set visible()
    set visible(value: boolean)
    {
        const view = this.queueInterface(IID_HabboFriendBarView) as IHabboFriendBarView | null;

        if(view !== null)
        {
            view.visible = value;
            this.release(IID_HabboFriendBarView);
        }
    }

    /**
	 * TS-only: `IHabboFriendBar` declares `visible` as a property, so the getter has to
	 * exist. AS3 declares the setter alone — nothing there reads the bar's visibility
	 * back through this component, so the read goes to the view.
	 */
    get visible(): boolean
    {
        const view = this.queueInterface(IID_HabboFriendBarView) as IHabboFriendBarView | null;

        if(view === null)
        {
            return false;
        }

        const visible = view.visible;

        this.release(IID_HabboFriendBarView);

        return visible;
    }

    /**
	 * Dispose the friend bar and null references.
	 */
    override dispose(): void
    {
        if(this._disposed) return;

        super.dispose();
    }
}
