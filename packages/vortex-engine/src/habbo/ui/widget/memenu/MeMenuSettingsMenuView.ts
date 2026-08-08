import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {IMeMenuView} from './IMeMenuView';
import type {MeMenuWidget} from './MeMenuWidget';
import {Logger} from '@core/utils/Logger';
import {HabboWebTools} from '@habbo/utils/HabboWebTools';

const log = Logger.getLogger('habbo.ui.widget.memenu.MeMenuSettingsMenuView');

/**
 * The settings page: a choice between the web account settings and the in-client sound sliders.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/memenu/MeMenuSettingsMenuView.as
 */
export class MeMenuSettingsMenuView implements IMeMenuView
{
    // AS3: .../widget/memenu/MeMenuSettingsMenuView.as::_widget
    // Name DERIVED (`_SafeStr_4549`).
    private _widget: MeMenuWidget | null = null;

    // AS3: .../widget/memenu/MeMenuSettingsMenuView.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: .../widget/memenu/MeMenuSettingsMenuView.as::init()
    public init(widget: MeMenuWidget, name: string): void
    {
        this._widget = widget;

        this.createWindow(name);
    }

    // AS3: .../widget/memenu/MeMenuSettingsMenuView.as::get window()
    public get window(): IWindowContainer | null
    {
        return this._window;
    }

    // AS3: .../widget/memenu/MeMenuSettingsMenuView.as::updateUnseenItemCount()
    // Empty in AS3 too — this page carries no badges.
    public updateUnseenItemCount(_category: string, _count: number): void
    {
    }

    // AS3: .../widget/memenu/MeMenuSettingsMenuView.as::dispose()
    public dispose(): void
    {
        this._widget = null;

        if(this._window !== null)
        {
            this._window.dispose();
            this._window = null;
        }
    }

    /**
     * The account-settings entry is gated on `has.identity`: without it the button is disabled and
     * an explanatory line is shown; with it, that line is hidden instead. AS3 also requires
     * `ExternalInterface.available` — this port *is* the page, so only the config flag applies.
     */
    // AS3: .../widget/memenu/MeMenuSettingsMenuView.as::createWindow()
    private createWindow(name: string): void
    {
        const widget = this._widget;

        if(widget === null) return;

        this._window = widget.windowManager.buildWidgetLayout('memenu_settings_menu') as IWindowContainer | null;

        if(this._window === null || this._window === undefined)
        {
            // AS3 throws "Failed to construct settings window from XML!" here. This runs from a
            // click, and a throw would take the room UI down with it.
            log.warn('memenu_settings_menu did not build — the settings page cannot be shown');
            this._window = null;

            return;
        }

        this._window.name = name;
        this._window.procedure = this.eventHandler;

        const hasIdentity = widget.config?.getProperty('has.identity') === '1';

        if(!hasIdentity)
        {
            this._window.findChildByName('character_settings')?.disable();
        }
        else
        {
            const identityText = this._window.findChildByName('identity_text');

            if(identityText !== null) identityText.visible = false;
        }
    }

    // AS3: .../widget/memenu/MeMenuSettingsMenuView.as::eventHandler()
    private eventHandler = (event: WindowEvent, target: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        switch(target.name)
        {
            case 'character_settings':
                // Leaves the client entirely — the account settings live on the website.
                HabboWebTools.openAvatars();
                this._widget?.hide();

                break;

            case 'sound_settings':
                this._widget?.changeView('me_menu_sound_settings');

                break;

            case 'back':
                this._widget?.changeView('me_menu_top_view');

                break;
        }
    };
}
