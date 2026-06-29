import type {IContext} from '@core/runtime';
import {Component} from '@core/runtime';
import type {IAssetLibrary} from '@core/assets';
import type {IHabboFriendBar} from './IHabboFriendBar';
import {HabboLandingView} from './landingview/HabboLandingView';
import {IID_HabboLandingView} from '@iid/IIDHabboLandingView';

/**
 * HabboFriendBar
 *
 * Orchestrator component that attaches sub-components (landing view, friend bar view,
 * talent, etc.) to the DI context. Each sub-component manages its own dependencies
 * and lifecycle.
 *
 * Currently only the HabboLandingView is implemented. Other sub-components
 * (HabboFriendBarData, HabboFriendBarView, HabboTalent, HabboEpicPopupView,
 * GroupForumController) will be added as needed.
 *
 * @see sources/win63_version/habbo/friendbar/HabboFriendBar.as
 */
export class HabboFriendBar extends Component implements IHabboFriendBar
{
	constructor(context: IContext, flags: number = 0, assetLibrary: IAssetLibrary | null = null)
	{
		super(context, flags, assetLibrary);

		// Attach HabboLandingView sub-component
		context.attachComponent(
			new HabboLandingView(context, 0, assetLibrary),
			[IID_HabboLandingView]
		);

		// Future sub-components (not yet implemented):
		// context.attachComponent(new HabboFriendBarData(context, 0, assetLibrary), [IID_HabboFriendBarData]);
		// context.attachComponent(new HabboFriendBarView(context, 0, assetLibrary), [IID_HabboFriendBarView]);
		// context.attachComponent(new HabboTalent(context, 0, assetLibrary), [IID_HabboTalent]);
		// context.attachComponent(new HabboEpicPopupView(context, 0, assetLibrary), [IID_HabboEpicPopupView]);
		// context.attachComponent(new GroupForumController(context, 0, assetLibrary), [IID_HabboGroupForumController]);
	}

	private _visible: boolean = false;

	/**
	 * Set the visibility of the friend bar view.
	 *
	 * In AS3, this delegates to IHabboFriendBarView.
	 * Stub implementation until HabboFriendBarView is implemented.
	 *
	 * @see sources/win63_version/habbo/friendbar/HabboFriendBar.as set visible()
	 */
	get visible(): boolean
	{
		return this._visible;
	}

	set visible(value: boolean)
	{
		this._visible = value;
	}

	/**
	 * Dispose the friend bar and null references.
	 */
	override dispose(): void
	{
		if (this._disposed) return;

		super.dispose();
	}
}
