import type {XmlAsset} from '@core/assets/XmlAsset';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {Logger} from '@core/utils/Logger';

import {HabboWebTools} from '@habbo/utils/HabboWebTools';
import type {HabboToolbar} from '../HabboToolbar';
import {ChatSettingsView} from './settings/ChatSettingsView';
import {SoundSettingsView} from './settings/SoundSettingsView';
import {OtherSettingsView} from './settings/OtherSettingsView';
import {WordFilterSettingsView} from './settings/WordFilterSettingsView';

const log = Logger.getLogger('habbo.toolbar.extensions.SettingsExtension');

/**
 * SettingsExtension
 *
 * The settings menu itself: a column of category buttons attached to the toolbar's
 * extension strip, hidden until the toolbar's settings icon toggles it. Each button opens
 * its own window on desktop layer 1 and closes the menu behind it.
 *
 * The menu is built once, in the constructor, and its height grows with every button
 * added — which is why the two optional entries (Discord, word filter) can be skipped
 * without leaving a gap.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/toolbar/extensions/SettingsExtension.as
 */
export class SettingsExtension
{
    /** Gap between two category buttons. */
    // AS3: .../SettingsExtension.as::SPACING
    private static readonly SPACING: number = 3;

    /** Inset around the column, applied on all four sides. */
    // AS3: .../SettingsExtension.as::PADDING
    private static readonly PADDING: number = 7;

    // AS3: .../SettingsExtension.as::_toolbar
    private _toolbar: HabboToolbar | null;

    // AS3: .../SettingsExtension.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: .../SettingsExtension.as::_SafeStr_4566
    private _buttons: IWindowContainer[] = [];

    // AS3: .../SettingsExtension.as::_disposed
    private _disposed: boolean = false;

    // AS3: .../SettingsExtension.as::SettingsExtension()
    constructor(toolbar: HabboToolbar)
    {
        this._toolbar = toolbar;

        const asset = toolbar.assets?.getAssetByName('settings_xml') as XmlAsset | null;

        if(asset === null || asset === undefined)
        {
            log.warn('Missing layout "settings_xml" - the settings menu cannot be built');

            return;
        }

        this._window = toolbar.windowManager?.buildFromXML(
            asset.content as unknown as string
        ) as IWindowContainer | null;

        if(this._window === null) return;

        this._window.procedure = this.windowProcedure;

        this.addButton('sound', this.localize('widget.memenu.settings.audio', 'Sound settings'));

        if(toolbar.getBoolean('discord.enabled'))
        {
            this.addButton('discord', this.localize('widget.memenu.settings.discord', 'Discord settings'));
        }

        this.addButton('chat', this.localize('widget.memenu.settings.chat', 'Chat settings'));
        this.addButton('other', this.localize('widget.memenu.settings.other', 'Other settings'));

        if(toolbar.getBoolean('user.custom.filter.enabled'))
        {
            this.addButton('word_filter', this.localize('word_filter.settings.title', 'Word filter'));
        }

        toolbar.extensionView?.attachExtension('settings', this._window, 1);

        this._window.visible = false;
    }

    // AS3: .../SettingsExtension.as::get window()
    get window(): IWindowContainer | null
    {
        return this._window;
    }

    // AS3: .../SettingsExtension.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    /** Each button stacks under the last, and the menu grows to fit. */
    // AS3: .../SettingsExtension.as::addButton()
    private addButton(name: string, caption: string): void
    {
        const asset = this._toolbar?.assets?.getAssetByName('setting_category_xml') as XmlAsset | null;

        if(asset === null || asset === undefined)
        {
            log.warn(`Missing layout "setting_category_xml" - the "${name}" settings button cannot be built`);

            return;
        }

        const button = this._toolbar?.windowManager?.buildFromXML(
            asset.content as unknown as string
        ) as IWindowContainer | null;

        if(button === null || button === undefined || this._window === null) return;

        this._window.addChild(button);

        const label = button.findChildByName('button_label');

        if(label) label.caption = caption;

        button.y = this._buttons.length > 0
            ? this._buttons[this._buttons.length - 1].bottom + SettingsExtension.SPACING
            : SettingsExtension.PADDING;
        button.x = SettingsExtension.PADDING;
        button.name = name;
        button.procedure = this.windowProcedure;

        this._buttons.push(button);

        this._window.height = button.bottom + SettingsExtension.PADDING;
    }

    /**
     * The settings windows all open on desktop layer 1, 200px in from the right edge —
     * clear of the toolbar strip the menu itself hangs off.
     */
    // AS3: .../SettingsExtension.as::openSoundSettingsWindow()
    private openSoundSettingsWindow(): void
    {
        if(this._toolbar === null) return;

        this.attachToDesktop(new SoundSettingsView(this._toolbar).window);
    }

    // AS3: .../SettingsExtension.as::openChatSettingsWindow()
    private openChatSettingsWindow(): void
    {
        if(this._toolbar === null) return;

        this.attachToDesktop(new ChatSettingsView(this._toolbar).window);
    }

    // AS3: .../SettingsExtension.as::openOtherSettingsWindow()
    private openOtherSettingsWindow(): void
    {
        if(this._toolbar === null) return;

        this.attachToDesktop(new OtherSettingsView(this._toolbar).window);
    }

    // AS3: .../SettingsExtension.as::openWordFilterWindow()
    private openWordFilterWindow(): void
    {
        if(this._toolbar === null) return;

        this.attachToDesktop(new WordFilterSettingsView(this._toolbar).window);
    }

    // AS3: .../SettingsExtension.as::openDiscordSettingsWindow()
    private openDiscordSettingsWindow(): void
    {
        this._toolbar?.context.createLinkEvent('discord/settings/open');
    }

    // TS-only: the three openers above share this placement, which AS3 repeats inline.
    private attachToDesktop(window: IWindowContainer | null): void
    {
        if(window === null)
        {
            log.warn('A settings view built no window - see its own port-gap marker; nothing was opened');

            return;
        }

        const desktop = this._toolbar?.windowManager?.getDesktop(1) as IWindowContainer | null;

        if(desktop === null || desktop === undefined) return;

        desktop.addChild(window);
        window.x = desktop.width - window.width - 200;
    }

    /**
     * `avatar_settings` and `privacy` are in the switch but not among the buttons built
     * above — AS3 has the same pair, left over from a menu that once carried them.
     */
    // AS3: .../SettingsExtension.as::windowProcedure()
    private windowProcedure = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        switch(window.name)
        {
            case 'avatar_settings':
                HabboWebTools.openAvatars();
                break;
            case 'privacy':
                HabboWebTools.openPrivacy();
                break;
            case 'sound':
                this.openSoundSettingsWindow();
                break;
            case 'chat':
                this.openChatSettingsWindow();
                break;
            case 'other':
                this.openOtherSettingsWindow();
                break;
            case 'word_filter':
                this.openWordFilterWindow();
                break;
            case 'discord':
                this.openDiscordSettingsWindow();
                break;
            default:
                return;
        }

        this._toolbar?.toggleSettingVisibility();
    };

    // TS-only: the localization fallback AS3 spells out at each call site.
    private localize(key: string, fallback: string): string
    {
        return this._toolbar?.localization?.getLocalization(key, fallback) ?? fallback;
    }

    /** AS3 drops the toolbar reference and leaves the window attached. */
    // AS3: .../SettingsExtension.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this._toolbar = null;
    }
}
