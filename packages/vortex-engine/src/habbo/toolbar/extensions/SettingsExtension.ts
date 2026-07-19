import type {HabboToolbar} from '../HabboToolbar';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('SettingsExtension');

/**
 * Settings panel extension for the toolbar
 *
 * In AS3 this creates a window with setting category buttons (avatar settings,
 * sound, chat/other) and opens corresponding settings views on click.
 * In Vortex, the UI rendering is handled by SolidJS.
 *
 * @see sources/win63_version/habbo/toolbar/extensions/SettingsExtension.as
 */
export class SettingsExtension
{
    private static readonly SPACING: number = 3;
    private static readonly PADDING: number = 7;

    private _toolbar: HabboToolbar | null;

    constructor(toolbar: HabboToolbar)
    {
        this._toolbar = toolbar;

        this._buttons.push('avatar_settings');
        this._buttons.push('sound');
        this._buttons.push('chat');

        this._visible = false;

        log.debug('SettingsExtension constructed');
    }

    private _disposed: boolean = false;

    /**
	 * Whether the extension is disposed
	 */
    get disposed(): boolean
    {
        return this._disposed;
    }

    private _visible: boolean = false;

    /**
	 * Whether the settings panel is visible
	 */
    get visible(): boolean
    {
        return this._visible;
    }

    set visible(value: boolean)
    {
        this._visible = value;
    }

    private _buttons: string[] = [];

    /**
	 * The list of button identifiers
	 */
    get buttons(): string[]
    {
        return this._buttons;
    }

    /**
	 * Handle a button click
	 *
	 * @param buttonName The name of the clicked button
	 */
    public onButtonClick(buttonName: string): void
    {
        switch(buttonName)
        {
            case 'avatar_settings':
                // Open avatar settings
                break;
            case 'sound':
                // Open sound settings
                break;
            case 'chat':
                // Open other/chat settings
                break;
        }
    }

    /**
	 * Dispose of this extension
	 */
    public dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;
        this._toolbar = null;
    }
}
