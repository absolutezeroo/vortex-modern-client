import type {MeMenuSettingsMenuView} from '../MeMenuSettingsMenuView';
import type {ToolbarView} from '../../ToolbarView';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('habbo.toolbar.memenu.chatsettings.MeMenuChatSettingsView');

/**
 * Chat settings view within the me menu settings
 *
 * In AS3 this creates a window with a checkbox for "prefer old chat" and
 * a back button. Saves the preference on dispose or checkbox toggle.
 *
 * **Dead in the 2026 build, and deliberately left as a shell.** `HabboToolbar` constructs
 * `BottomBarLeft`, which constructs `MeMenuNewController`; `ToolbarView` is never constructed in
 * either tree, and `MeMenuController` only by `ToolbarView`. The whole chain is the 2023 me-menu
 * design that `MeMenuNewController` replaced. Porting its window code would be porting dead code —
 * check `BottomBarLeft`/`MeMenuNewController` before adding anything here.
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
    // AS3: sources/win63_version/habbo/toolbar/memenu/chatsettings/MeMenuChatSettingsView.as::init()
    public init(settingsMenuView: MeMenuSettingsMenuView, toolbarView: ToolbarView): void
    {
        this._settingsMenuView = settingsMenuView;
        this._toolbarView = toolbarView;

        // In AS3: reads the current preference from toolbar.freeFlowChat.isDisabledInPreferences
        // and hides the parent settings menu window

        if(this._settingsMenuView)
        {
            this._settingsMenuView.visible = false;
        }
    }

    /**
	 * Handle a button click
	 *
	 * @param buttonName The button name
	 */
    // AS3: sources/win63_version/habbo/toolbar/memenu/chatsettings/MeMenuChatSettingsView.as::onButtonClicked()
    public onButtonClicked(buttonName: string): void
    {
        switch(buttonName)
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
    // AS3: sources/win63_version/habbo/toolbar/memenu/chatsettings/MeMenuChatSettingsView.as::dispose()
    public dispose(): void
    {
        if(this._settingsMenuView == null) return;

        // In AS3: saves preferOldChat preference to toolbar.freeFlowChat
        if(this._settingsMenuView)
        {
            this._settingsMenuView.visible = true;
        }

        this._settingsMenuView = null;
        this._toolbarView = null;
    }
}
