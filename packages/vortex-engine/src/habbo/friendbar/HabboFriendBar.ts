import type {IContext} from '@core/runtime';
import {Component} from '@core/runtime';
import type {IAssetLibrary} from '@core/assets';
import type {IHabboFriendBar} from './IHabboFriendBar';
import {HabboLandingView} from './landingview/HabboLandingView';
import {HabboFriendBarData} from './data/HabboFriendBarData';
import {HabboFriendBarView} from './view/HabboFriendBarView';
import {GroupForumController} from './groupforums/GroupForumController';
import {HabboTalent} from './talent/HabboTalent';
import {HabboEpicPopupView} from './popup/HabboEpicPopupView';
import {IID_HabboEpicPopupView} from '@iid/IIDHabboEpicPopupView';
import {IID_HabboGroupForumController} from '@iid/IIDHabboGroupForumController';
import {IID_HabboTalent} from '@iid/IIDHabboTalent';
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
 * the request tabs and the notification tokens. `groupforums/` followed (17 files, 2026-08-10).
 *
 * `talent/` and `popup/` followed. All six of AS3's sub-components are attached below; the note
 * that used to stand here filed HabboTalent, HabboEpicPopupView and GroupForumController under
 * `groupforums/`, and only the last one was ever there.
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

        context.attachComponent(
            new GroupForumController(context, 0, assetLibrary),
            [IID_HabboGroupForumController]
        );

        // AS3 attaches this from the same constructor (HabboFriendBar.as:29). The component
        // switches itself off when `talent.track.enabled` is unset, so attaching it costs nothing
        // on a hotel that does not run talent tracks.
        context.attachComponent(
            new HabboTalent(context, 0, assetLibrary),
            [IID_HabboTalent]
        );

        // AS3 attaches this last but one (HabboFriendBar.as:30). It builds no window until an
        // `EpicPopup` message arrives, so attaching it costs a message subscription and nothing else.
        context.attachComponent(
            new HabboEpicPopupView(context, 0, assetLibrary),
            [IID_HabboEpicPopupView]
        );
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
