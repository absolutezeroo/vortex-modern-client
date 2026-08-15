import type {MeMenuController} from './MeMenuController';
import type {ToolbarView} from '../ToolbarView';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('habbo.toolbar.memenu.MeMenuSettingsMenuView');

/**
 * Settings menu view within the me menu
 *
 * In AS3 this creates a window with buttons for character settings, sound
 * settings, and chat settings. Opens sub-views for each category.
 *
 * **Dead in the 2026 build, and deliberately left as a shell.** `HabboToolbar` constructs
 * `BottomBarLeft`, which constructs `MeMenuNewController`; `ToolbarView` is never constructed in
 * either tree, and `MeMenuController` only by `ToolbarView`. The whole chain is the 2023 me-menu
 * design that `MeMenuNewController` replaced. Porting its window code would be porting dead code —
 * check `BottomBarLeft`/`MeMenuNewController` before adding anything here.
 *
 * @see sources/win63_version/habbo/toolbar/memenu/MeMenuSettingsMenuView.as
 */
export class MeMenuSettingsMenuView
{
    private _controller: MeMenuController | null = null;
    private _toolbarView: ToolbarView | null = null;

    constructor()
    {
        log.debug('MeMenuSettingsMenuView constructed');
    }

    private _visible: boolean = true;

    /**
	 * Whether the view is visible
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
	 * The parent controller
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/toolbar/memenu/MeMenuSettingsMenuView.as::get widget()
    get widget(): MeMenuController | null
    {
        return this._controller;
    }

    /**
	 * Initialize the settings menu view
	 *
	 * @param controller The parent me menu controller
	 * @param toolbarView The toolbar view for positioning
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/toolbar/memenu/MeMenuSettingsMenuView.as::init()
    public init(controller: MeMenuController, toolbarView: ToolbarView): void
    {
        this._controller = controller;
        this._toolbarView = toolbarView;
    }

    /**
	 * Handle a button click
	 *
	 * @param buttonName The button name
	 */
    public onButtonClick(buttonName: string): void
    {
        if(!this._controller) return;

        switch(buttonName)
        {
            case 'character_settings':
                // In AS3: HabboWebTools.openAvatars()
                break;
            case 'sound_settings':
                // Open sound settings sub-view
                this._visible = false;
                break;
            case 'chat_settings':
                // Open chat settings sub-view
                break;
            case 'back':
                // Show parent me menu controller window
                this.dispose();
                break;
        }
    }

    /**
	 * Dispose of this view
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/toolbar/memenu/MeMenuSettingsMenuView.as::dispose()
    public dispose(): void
    {
        this._controller = null;
        this._toolbarView = null;
    }
}
