import type {IContext} from '@core/runtime';
import {Component, ComponentDependency} from '@core/runtime';
import type {IAssetLibrary} from '@core/assets';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {ISessionDataManager} from '@habbo/session/ISessionDataManager';
import type {IAvatarRenderManager} from '@habbo/avatar/IAvatarRenderManager';
import {IID_HabboWindowManager} from '@iid/IIDHabboWindowManager';
import {IID_HabboLocalizationManager} from '@iid/IIDHabboLocalizationManager';
import {IID_SessionDataManager} from '@iid/IIDSessionDataManager';
import {IID_AvatarRenderManager} from '@iid/IIDAvatarRenderManager';

/**
 * AbstractView
 *
 * Base class for views in the Friend Bar system.
 * Provides DI-injected access to window manager, localization, session data, and avatar renderer.
 *
 * @see sources/win63_version/habbo/friendbar/view/AbstractView.as
 */
export class AbstractView extends Component
{
	protected _windowManager: IHabboWindowManager | null = null;
	protected _avatarManager: IAvatarRenderManager | null = null;
	protected _localizationManager: IHabboLocalizationManager | null = null;
	protected _sessionDataManager: ISessionDataManager | null = null;

	constructor(context: IContext, flags: number = 0, assetLibrary: IAssetLibrary | null = null)
	{
		super(context, flags, assetLibrary);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	protected override get dependencies(): Array<ComponentDependency<any>>
	{
		return [
			...super.dependencies,
			new ComponentDependency(
				IID_SessionDataManager,
				(manager: ISessionDataManager | null) =>
				{
					this._sessionDataManager = manager;
				}
			),
			new ComponentDependency(
				IID_AvatarRenderManager,
				(manager: IAvatarRenderManager | null) =>
				{
					this._avatarManager = manager;
				},
				false
			),
			new ComponentDependency(
				IID_HabboWindowManager,
				(manager: IHabboWindowManager | null) =>
				{
					this._windowManager = manager;
				}
			),
			new ComponentDependency(
				IID_HabboLocalizationManager,
				(manager: IHabboLocalizationManager | null) =>
				{
					this._localizationManager = manager;
				}
			),
		];
	}
}
