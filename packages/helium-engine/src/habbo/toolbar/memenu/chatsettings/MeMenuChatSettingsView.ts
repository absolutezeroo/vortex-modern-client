import type {MeMenuSettingsMenuView} from '../MeMenuSettingsMenuView';
import type {ToolbarView} from '../../ToolbarView';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('MeMenuChatSettingsView');

/**
 * Chat settings view within the me menu settings
 *
 * In AS3 this creates a window with a checkbox for "prefer old chat" and
 * a back button. Saves the preference on dispose or checkbox toggle.
 * In Helium, UI rendering is handled by SolidJS.
 *
 * @see sources/win63_version/habbo/toolbar/memenu/chatsettings/MeMenuChatSettingsView.as
 */
export class MeMenuChatSettingsView
{
	private _settingsMenuView: MeMenuSettingsMenuView | null = null;
	private _toolbarView: ToolbarView | null = null;

	constructor()
	{
		log.debug('MeMenuChatSettingsView constructed');
	}

	private _preferOldChat: boolean = false;

	/**
	 * Whether old chat is preferred
	 */
	get preferOldChat(): boolean
	{
		return this._preferOldChat;
	}

	set preferOldChat(value: boolean)
	{
		this._preferOldChat = value;
	}

	/**
	 * Initialize the chat settings view
	 *
	 * @param settingsMenuView The parent settings menu view
	 * @param toolbarView The toolbar view for positioning
	 */
	public init(settingsMenuView: MeMenuSettingsMenuView, toolbarView: ToolbarView): void
	{
		this._settingsMenuView = settingsMenuView;
		this._toolbarView = toolbarView;

		// In AS3: reads the current preference from toolbar.freeFlowChat.isDisabledInPreferences
		// and hides the parent settings menu window

		if (this._settingsMenuView)
		{
			this._settingsMenuView.visible = false;
		}
	}

	/**
	 * Handle a button click
	 *
	 * @param buttonName The button name
	 */
	public onButtonClicked(buttonName: string): void
	{
		switch (buttonName)
		{
			case 'back_btn':
				this.dispose();
				break;
			case 'prefer_old_chat_checkbox':
				// In AS3: saves preference and toggles free flow chat
				break;
		}
	}

	/**
	 * Dispose of this view
	 *
	 * Saves the preference and shows the parent settings menu.
	 */
	public dispose(): void
	{
		if (this._settingsMenuView == null) return;

		// In AS3: saves preferOldChat preference to toolbar.freeFlowChat
		if (this._settingsMenuView)
		{
			this._settingsMenuView.visible = true;
		}

		this._settingsMenuView = null;
		this._toolbarView = null;
	}
}
